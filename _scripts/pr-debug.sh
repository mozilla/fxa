#! /bin/bash
#
# Drive the FxA stack for a branch in CircleCI: boot it, tunnel its ports to
# localhost, or open a shell on it.
#
# Usage: CIRCLECI_TOKEN=<token> yarn pr-debug [--tunnel | --ssh] [pr-number | branch]
#
#   yarn pr-debug           Boots the stack in CI and returns once it is up. Reports
#                           the job instead if one is already running.
#   yarn pr-debug --tunnel  Forwards the service ports to localhost and holds
#                           them until Ctrl-C. Closes any tunnel this script
#                           opened before, so switching between PR stacks is
#                           one command. Non-interactive: your key must be in
#                           ssh-agent.
#   yarn pr-debug --ssh     Opens a shell in ~/project. Binds no ports, so it
#                           sits beside a tunnel (for `yarn pm2 log`, say), and
#                           connects even if a CI step failed.
#
# Defaults to the current branch. Needs a personal API token (project tokens
# cannot trigger or rerun pipelines): https://app.circleci.com/settings/user/tokens
# Falls back to CIRCLECI_CLI_TOKEN. Also needs jq and nc; `gh` only when given
# a PR number.
#
# How the boot works:
#   1. Triggers the `stack` workflow on the branch, or reuses one already run
#      for the same commit.
#   2. Cancels that run as soon as its job starts, then reruns the job with SSH
#      enabled. CircleCI only enables SSH on the rerun of a finished workflow,
#      so a throwaway first pass is the price of scripting this.
#   3. Waits for the stack to boot, then prints how to connect.
#
# The job holds the stack up for PR_DEBUG_MINUTES (default 30) after it boots,
# connected or not, then shuts down about ten minutes after the last SSH
# session closes (CircleCI's rule; two hours per job at most). Tunnel and shell
# sessions are capped at the same number of minutes; reconnect by rerunning.

set -euo pipefail

slug="github/mozilla/fxa"
api="https://circleci.com/api/v2"
api_v1="https://circleci.com/api/v1.1/project/gh/mozilla/fxa"
workflow_name="stack"
job_name="Stack (SSH)"
# Same-number forwards: the services advertise localhost:<port> URLs. Redis is
# included because the Playwright fixtures reset rate limits through it.
ports=(3030 3000 9000 9001 1111 1112 8080 8091 8095 9130 9160 6379)
minutes="${PR_DEBUG_MINUTES:-30}"
[[ "${minutes}" =~ ^[0-9]+$ ]] || { echo "PR_DEBUG_MINUTES must be a whole number." >&2; exit 1; }
# Passed as $0 to the remote shell, so it shows up in the local ssh argv and
# `--tunnel` can find (and close) tunnels opened by earlier runs.
tunnel_marker="fxa-pr-debug-tunnel"
shell_marker="fxa-pr-debug-shell"

token="${CIRCLECI_TOKEN:-${CIRCLECI_CLI_TOKEN:-}}"
: "${token:?set CIRCLECI_TOKEN (https://app.circleci.com/settings/user/tokens)}"
auth=(-H "Circle-Token: ${token}")

log() { printf '\033[1;34m[pr-debug]\033[0m %s\n' "$*" >&2; }
die() { printf '\033[1;31m[pr-debug]\033[0m %s\n' "$*" >&2; exit 1; }
get() { curl -fsS "${auth[@]}" "$@"; }
post() { curl -fsS "${auth[@]}" -X POST -H "Content-Type: application/json" "$@"; }
job_url() { echo "https://app.circleci.com/jobs/${slug}/$1"; }

# Calls a function every 10s until it prints something, then echoes that.
poll() { # <timeout-seconds> <description> <function> [args...]
  local deadline=$(( $(date +%s) + $1 )) desc="$2" out
  shift 2
  while :; do
    out=$("$@" 2>/dev/null || true)
    if [[ -n "${out}" ]]; then
      printf '%s\n' "${out}"
      return 0
    fi
    (( $(date +%s) < deadline )) || die "Timed out waiting for ${desc}."
    sleep 10
  done
}

is_terminal() { [[ "$1" =~ ^(success|failed|error|canceled|unauthorized)$ ]]; }

# --- CircleCI lookups -------------------------------------------------------

stack_job() { # <workflow-id> -> job json, or nothing
  get "${api}/workflow/$1/job" \
    | jq -c --arg n "${job_name}" '[.items[] | select(.name == $n)] | .[0] // empty'
}

has_ssh() { # <job-number>
  [[ -n "$(get "${api_v1}/$1" | jq -r '.ssh_users[0].login // empty')" ]]
}

# Newest stack workflow built from this commit, as "<workflow-id> <status>".
find_existing_workflow() {
  local pid
  for pid in $(get --get --data-urlencode "branch=${branch}" "${api}/project/${slug}/pipeline" \
      | jq -r --arg rev "${remote_rev}" '.items[] | select(.vcs.revision == $rev) | .id'); do
    get "${api}/pipeline/${pid}/workflow" \
      | jq -r --arg n "${workflow_name}" \
          '[.items[] | select(.name == $n)] | sort_by(.created_at) | last // empty | "\(.id) \(.status)"'
  done | grep . | head -1
}

# Newest running SSH-enabled stack job on the branch, any commit, as
# "<job-number> <revision>". Checks the ten most recent pipelines.
find_ssh_job() {
  local pid rev wf num
  while read -r pid rev; do
    for wf in $(get "${api}/pipeline/${pid}/workflow" \
        | jq -r --arg n "${workflow_name}" \
            '[.items[] | select(.name == $n)] | sort_by(.created_at) | reverse | .[].id'); do
      num=$(stack_job "${wf}" | jq -r 'select(.status == "running") | .job_number // empty')
      [[ -n "${num}" ]] && has_ssh "${num}" || continue
      echo "${num} ${rev}"
      return 0
    done
  done < <(get --get --data-urlencode "branch=${branch}" "${api}/project/${slug}/pipeline" \
             | jq -r '.items[:10][] | "\(.id) \(.vcs.revision)"')
  return 1
}

workflow_id_in_pipeline() { # <pipeline-id>
  get "${api}/pipeline/$1/workflow" \
    | jq -r --arg n "${workflow_name}" '.items[] | select(.name == $n) | .id' | head -1
}

running_job_number() { stack_job "$1" | jq -r 'select(.status == "running") | .job_number'; }
any_job_number()     { stack_job "$1" | jq -r 'select(.job_number != null) | .job_number'; }
terminal_status() {
  local s
  s=$(get "${api}/workflow/$1" | jq -r .status)
  is_terminal "${s}" && echo "${s}" || true
}

# "<port> <host> <ed25519-fingerprint>" once the Enable SSH step has printed
# the connection line. The fingerprint lets us pin the host key without
# trusting the first connection.
ssh_endpoint() { # <job-number>
  local step out
  step=$(get "${api_v1}/$1" \
    | jq -r '.steps[] | select(.name == "Enable SSH") | .actions[0] | select(.has_output) | .step' | head -1)
  [[ -n "${step}" ]] || return 0
  out=$(get "${api_v1}/$1/output/${step}/0" | jq -r '.[].message')
  local endpoint fp
  endpoint=$(grep -oE 'ssh -p [0-9]+ [0-9.]+' <<<"${out}" | awk '{print $3, $4}' | head -1)
  fp=$(grep -oE 'SHA256:[A-Za-z0-9+/=]+ \(ED25519\)' <<<"${out}" | awk '{print $1}' | head -1)
  [[ -n "${endpoint}" && -n "${fp}" ]] && echo "${endpoint} ${fp}"
}

# Blocks until `Start services` has succeeded on the job. A failed step is
# fatal unless <lenient> is set, in which case it returns 1 so the caller can
# connect anyway.
wait_for_stack() { # <job-number> [lenient]
  local job="$1" lenient="${2:-}" deadline last="" steps failed current
  log "Waiting for the stack (install, build, start; about seven minutes cold)..."
  deadline=$(( $(date +%s) + 30 * 60 ))
  while :; do
    steps=$(get "${api_v1}/${job}" | jq -c '[.steps[] | {name, status: .actions[0].status}]')
    failed=$(jq -r '[.[] | select(.status == "failed") | .name] | join(", ")' <<<"${steps}")
    if [[ -n "${failed}" ]]; then
      [[ -n "${lenient}" ]] || die "Step failed: ${failed}. $(job_url "${job}")"
      log "Step failed: ${failed}. Connecting anyway so you can look around."
      return 1
    fi
    if jq -e '.[] | select(.name == "Start services" and .status == "success")' <<<"${steps}" >/dev/null; then
      return 0
    fi
    current=$(jq -r '[.[] | select(.status == "running") | .name] | last // "starting"' <<<"${steps}")
    if [[ "${current}" != "${last}" ]]; then
      log "  ${current}"
      last="${current}"
    fi
    (( $(date +%s) < deadline )) || die "Timed out waiting for the stack. $(job_url "${job}")"
    sleep 10
  done
}

# --- 1. arguments and the commit CI will build ------------------------------

mode=up # up: boot and return; tunnel: forwards only; ssh: shell only
target=""
for arg in "$@"; do
  case "${arg}" in
    --tunnel) mode=tunnel ;;
    --ssh) mode=ssh ;;
    -*) die "Unknown option '${arg}'. Usage: yarn pr-debug [--tunnel | --ssh] [pr-number | branch]" ;;
    *) target="${arg}" ;;
  esac
done

if [[ "${target}" =~ ^[0-9]+$ ]]; then
  branch=$(gh pr view "${target}" --repo mozilla/fxa --json headRefName --jq .headRefName)
elif [[ -n "${target}" ]]; then
  branch="${target}"
else
  branch=$(git rev-parse --abbrev-ref HEAD)
  [[ "${branch}" != "HEAD" ]] || die "Detached HEAD; pass a branch or PR number."
fi

remote_rev=$(git ls-remote --heads "https://github.com/mozilla/fxa" "${branch}" | cut -f1)
[[ -n "${remote_rev}" ]] || die "'${branch}' is not on github.com/mozilla/fxa. Push it first."
local_rev=$(git rev-parse --verify --quiet "refs/heads/${branch}" || true)
if [[ -n "${local_rev}" && "${local_rev}" != "${remote_rev}" ]]; then
  log "WARNING: local ${branch} is ${local_rev:0:7}, origin is ${remote_rev:0:7}. CI builds origin."
fi
log "${branch} @ ${remote_rev:0:7}"

# --- 2. boot ----------------------------------------------------------------

if [[ "${mode}" == up ]]; then
  ssh_job=""
  existing=$(find_existing_workflow || true)
  wf_id="${existing%% *}"

  if [[ -n "${wf_id}" ]]; then
    job=$(stack_job "${wf_id}")
    status=$(jq -r .status <<<"${job}")
    num=$(jq -r '.job_number // empty' <<<"${job}")
    case "${status}" in
      running)
        if has_ssh "${num}"; then
          log "Stack already running as job #${num}."
          ssh_job="${num}"
        else
          log "Canceling non-SSH run #${num} so it can be rerun with SSH."
          post "${api}/workflow/${wf_id}/cancel" >/dev/null
        fi
        ;;
      success|failed|canceled|error)
        log "Reusing the ${status} run from this commit."
        ;;
      *)
        num=$(poll 300 "job to start" running_job_number "${wf_id}")
        log "Canceling queued run #${num} so it can be rerun with SSH."
        post "${api}/workflow/${wf_id}/cancel" >/dev/null
        ;;
    esac
  else
    log "Triggering ${workflow_name} on ${branch}..."
    payload=$(jq -n --arg branch "${branch}" --argjson minutes "${minutes}" '{
      branch: $branch,
      parameters: {
        run_stack: true,
        stack_minutes: $minutes,
        enable_test_pull_request: false,
        enable_test_and_deploy_tag: false,
        enable_deploy_packages: false,
        enable_deploy_ci_images: false,
        enable_nightly: false
      }
    }')
    pipeline_id=$(post -d "${payload}" "${api}/project/${slug}/pipeline" | jq -r '.id // empty')
    [[ -n "${pipeline_id}" ]] || die "Pipeline trigger failed."
    wf_id=$(poll 120 "the workflow to appear" workflow_id_in_pipeline "${pipeline_id}")
    # Cancel as soon as the job is running. CircleCI reruns canceled jobs fine,
    # but only ones that got far enough to be assigned a number.
    num=$(poll 300 "the job to start" running_job_number "${wf_id}")
    log "Canceling first pass #${num}; SSH can only be enabled on a rerun."
    post "${api}/workflow/${wf_id}/cancel" >/dev/null
  fi

  if [[ -z "${ssh_job}" ]]; then
    poll 300 "the workflow to finish" terminal_status "${wf_id}" >/dev/null
    job_id=$(stack_job "${wf_id}" | jq -r .id)
    new_wf=$(post -d "{\"enable_ssh\": true, \"jobs\": [\"${job_id}\"]}" \
      "${api}/workflow/${wf_id}/rerun" | jq -r '.workflow_id // empty')
    [[ -n "${new_wf}" ]] || die "Rerun with SSH failed."
    ssh_job=$(poll 300 "the SSH job to start" any_job_number "${new_wf}")
  fi
  log "Job #${ssh_job}: $(job_url "${ssh_job}")"

  wait_for_stack "${ssh_job}"
  hint="${target:+ ${target}}"
  log "Stack for ${branch} is up. It stays up ${minutes} minutes, longer while a session is open."
  log "  yarn pr-debug --tunnel${hint}   forward its ports; http://localhost:3030 becomes this stack"
  log "  yarn pr-debug --ssh${hint}      shell on the box, e.g. yarn pm2 log"
  exit 0
fi

# --- 3. connect (tunnel / ssh) ----------------------------------------------

read -r ssh_job job_rev < <(find_ssh_job || true)
[[ -n "${ssh_job:-}" ]] \
  || die "No stack is running for ${branch}. Boot one with: yarn pr-debug${target:+ ${target}}"
if [[ "${job_rev}" != "${remote_rev}" ]]; then
  log "WARNING: the running stack is built from ${job_rev:0:7}; origin/${branch} is now ${remote_rev:0:7}."
fi
log "Job #${ssh_job}: $(job_url "${ssh_job}")"

if [[ "${mode}" == tunnel ]]; then
  # Replace, rather than stack up, tunnels: only one can hold the ports.
  old=$(pgrep -f "${tunnel_marker}" || true)
  if [[ -n "${old}" ]]; then
    log "Closing the existing tunnel (pid ${old//$'\n'/, })."
    # shellcheck disable=SC2086
    kill ${old} 2>/dev/null || true
    for _ in $(seq 20); do pgrep -f "${tunnel_marker}" >/dev/null || break; sleep 0.5; done
    pkill -9 -f "${tunnel_marker}" 2>/dev/null || true
  fi
  # Anything else on the ports is usually a local `yarn start`.
  busy=()
  for p in "${ports[@]}"; do
    nc -z -w1 127.0.0.1 "${p}" 2>/dev/null && busy+=("${p}")
  done
  if (( ${#busy[@]} )); then
    die "Local ports in use: ${busy[*]}. Stop whatever holds them (a local stack: yarn stop) and retry."
  fi
  wait_for_stack "${ssh_job}"
else
  wait_for_stack "${ssh_job}" lenient || true
fi

read -r port host fingerprint < <(poll 300 "the SSH endpoint" ssh_endpoint "${ssh_job}")
[[ -n "${port:-}" && -n "${host:-}" ]] || die "Could not read the SSH endpoint."
log "SSH endpoint ${host}:${port}"

# Pin the host key CircleCI reported for this job instead of trusting the
# first connection. Every job has a fresh key, so nothing goes in ~/.ssh.
known_hosts=$(mktemp)
trap 'rm -f "${known_hosts}"' EXIT
ssh-keyscan -p "${port}" -t ed25519 "${host}" 2>/dev/null > "${known_hosts}"
scanned=$(ssh-keygen -lf "${known_hosts}" 2>/dev/null | awk '{print $2}')
[[ "${scanned}" == "${fingerprint}" ]] \
  || die "Host key mismatch for ${host}:${port} (got ${scanned:-nothing}, CircleCI reports ${fingerprint})."

ssh_opts=(-p "${port}" "${host}"
  -o UserKnownHostsFile="${known_hosts}" -o StrictHostKeyChecking=yes -o LogLevel=ERROR
  -o ServerAliveInterval=30 -o ExitOnForwardFailure=yes)

# CircleCI runs the remote command without a shell, so wrap it in one; the
# inner quotes survive to the remote and keep it a single argument. The marker
# lands in $0 of that shell. Interactive bash ignores SIGTERM, hence -k to
# follow up with SIGKILL.
set +e
if [[ "${mode}" == tunnel ]]; then
  for p in "${ports[@]}"; do ssh_opts+=(-L "${p}:127.0.0.1:${p}"); done
  log "Tunnel open; http://localhost:3030 is the ${branch} stack. Cap ${minutes} minutes; Ctrl-C to stop."
  ssh "${ssh_opts[@]}" -o BatchMode=yes \
    "bash -lc \"exec timeout -k 5 ${minutes}m sleep infinity\" ${tunnel_marker}"
else
  log "Opening a shell on job #${ssh_job}, no forwards. Cap ${minutes} minutes."
  ssh "${ssh_opts[@]}" -t \
    "bash -lc \"cd ~/project && exec timeout --foreground -k 5 ${minutes}m bash\" ${shell_marker}"
fi
status=$?
set -e

case "${status}" in
  124) log "Session cap of ${minutes} minutes reached. Rerun to reconnect while the stack is up." ;;
  143) log "Tunnel closed by another yarn pr-debug --tunnel." ;;
  255) log "Connection dropped. Rerun to reconnect while the stack is up."; exit 1 ;;
  *) log "Disconnected. Rerun to reconnect while the stack is up." ;;
esac
