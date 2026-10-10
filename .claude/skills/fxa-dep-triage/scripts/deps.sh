#!/usr/bin/env bash
# FxA dependency-bot triage toolkit — reliable primitives for the fxa-dep-triage skill.
# Targets mozilla/fxa only. Covers PRs from dependabot and mozilla-blender.
# Read-only:       list | status | report | faillog <pr>
# CircleCI action: gate <pr>   (approve functional-test gate; no local git changes)
#
# Never merges and never touches your working tree — conflicts and code fixes
# are reported for a human, not applied.
# API calls fail fast: a failed gh/CircleCI request is reported, never disguised
# as "nothing to do". Secrets (CircleCI token) are read into a var, never printed.
set -uo pipefail

REPO="mozilla/fxa"
PROJECT_SLUG="gh/mozilla/fxa"
API="https://circleci.com/api/v2"
API1="https://circleci.com/api/v1.1/project/gh/mozilla/fxa"
# Bot authors whose dependency PRs we triage.
AUTHORS="${FXA_PR_AUTHORS:-app/dependabot app/mozilla-blender}"
# check names that are cosmetic / non-required (storybook GH Action) — never block on these
COSMETIC='Deploy to GitHub Pages|Prepare Storybooks for Deployment|Build Storybooks'

TOK=""
_tok()  { grep '^token:' "$HOME/.circleci/cli.yml" 2>/dev/null | awk '{print $2}'; }
_enc()  { python3 -c "import urllib.parse,sys;print(urllib.parse.quote(sys.argv[1],safe=''))" "$1"; }
_branch(){ gh pr view "$1" --repo "$REPO" --json headRefName --jq .headRefName 2>/dev/null; }
# CircleCI GET that fails on HTTP errors (pipefail makes the caller's `|| ...` fire).
_cget() { curl -fsS -H "Circle-Token: $TOK" "$@"; }
# Set TOK or return nonzero. Call at the top of any CircleCI function.
_need_tok() { TOK=$(_tok); [ -n "$TOK" ] && return 0; echo "no CircleCI token in ~/.circleci/cli.yml" >&2; return 1; }

# List open bot PR numbers. Returns nonzero if any author query failed, so the
# caller can mark the report incomplete instead of trusting a short list.
list() {
  local a out all="" rc=0
  for a in $AUTHORS; do
    if out=$(gh pr list --repo "$REPO" --author "$a" --state open --limit 100 --json number --jq '.[].number' 2>/dev/null); then
      all+="$out"$'\n'
    else
      echo "list: query failed for author $a" >&2; rc=1
    fi
  done
  printf '%s' "$all" | sort -nu | sed '/^$/d'
  return $rc
}

# Classify one PR -> TSV: pr  STATE  mergeState  gate(0/1)  title  fails
#   STATE in CONFLICT|FAIL|GATE_HOLD|RUNNING|GREEN
#   mergeState is GitHub's mergeStateStatus: CLEAN|UNSTABLE|BLOCKED|BEHIND|DIRTY|DRAFT|UNKNOWN
status_one() {
  local pr="$1" d
  d=$(gh pr view "$pr" --repo "$REPO" --json title,mergeable,mergeStateStatus,statusCheckRollup 2>/dev/null) || return 1
  # GitHub computes mergeability lazily; the first read often returns UNKNOWN.
  if [ "$(printf '%s' "$d" | jq -r .mergeable)" = "UNKNOWN" ]; then
    d=$(gh pr view "$pr" --repo "$REPO" --json title,mergeable,mergeStateStatus,statusCheckRollup 2>/dev/null) || return 1
  fi
  # A check counts as failing unless it completed SUCCESS/NEUTRAL/SKIPPED — so
  # CANCELLED, TIMED_OUT, ACTION_REQUIRED, STARTUP_FAILURE (and ERROR status
  # contexts) are failures, not silently GREEN. Cosmetic checks never block, in
  # either the failing or the pending bucket.
  printf '%s\n' "$d" | jq -r --arg pr "$pr" --arg cos "$COSMETIC" '
    .statusCheckRollup as $c
    | ([ $c[] | select(.__typename=="CheckRun" and .status=="COMPLETED" and ((.conclusion=="SUCCESS" or .conclusion=="NEUTRAL" or .conclusion=="SKIPPED") | not)) | select(.name|test($cos)|not) | .name ]
       + [ $c[] | select(.__typename=="StatusContext" and (.state=="FAILURE" or .state=="ERROR")) | .context ]) as $fails
    | ([ $c[] | select(.__typename=="CheckRun" and .status!="COMPLETED") | select(.name|test($cos)|not) | .name ]
       + [ $c[] | select(.__typename=="StatusContext" and .state=="PENDING") | .context ]) as $pending
    | ([ $c[] | select(.__typename=="StatusContext" and .state=="PENDING" and (.context|test("Approve Functional"))) ] | length > 0) as $gate
    | (if .mergeable=="CONFLICTING" then "CONFLICT"
       elif ($fails|length>0) then "FAIL"
       elif $gate then "GATE_HOLD"
       elif ($pending|length>0) then "RUNNING"
       else "GREEN" end) as $state
    | [$pr,$state,(.mergeStateStatus // "UNKNOWN"),(if $gate then "1" else "0" end),(.title[0:46]),($fails|join(", "))]|@tsv'
}

status() {
  local pr rc=0
  for pr in $(list); do status_one "$pr" || { echo "status: could not classify PR #$pr" >&2; rc=1; }; done
  return $rc
}

# Package name from either title form: "bump X from A to B" or "bump X to B".
pkg_of() { printf '%s' "$1" | sed -E 's/.*bump ([^ ]+) (from|to) .*/\1/I'; }

# Old major of the bumped package, for titles with no "from A" part (BLEnder).
# Reads the removed resolution line from the PR diff. Prints "" when unknown.
# On several removed majors, takes the lowest — the conservative direction.
old_major() {
  local pr="$1" pkg="$2"
  [ -z "$pkg" ] && return 0
  gh pr diff "$pr" --repo "$REPO" 2>/dev/null \
    | grep -E "^-[[:space:]]*resolution: \"${pkg}@npm:[0-9]" \
    | sed -E 's/.*@npm:([0-9]+)\..*/\1/' | sort -un | head -1
}

# SCOPE risk label from PR title -> LOW|MED|HIGH. Measures production/runtime
# blast radius only (NOT merge-safety — see migration_flag for that).
risk_of() {
  local title="$1" ov="${2:-}" pkg maj_old maj_new base="LOW"
  local devonly='esbuild|webpack|storybook|@storybook|eslint|stylelint|postcss|autoprefixer|cssnano|sass|prettier|jest|ts-jest|typescript|@types/|nx|@nx/|playwright|babel|rollup|vite|chromatic|husky|lint-staged'
  local ghaction='codeql|actions/|docker/|github/'   # SHA-pinned actions
  local sensitive='hapi|@hapi|grpc|@grpc|mysql|knex|redis|ioredis|jose|jsonwebtoken|node-forge|stripe|paypal|otplib|speakeasy|bcrypt|scrypt|passport|oauth'
  pkg=$(pkg_of "$title")
  # Match the parsed package, and classify dev-only/actions (incl. @types/*)
  # BEFORE sensitive names, so e.g. @types/jsonwebtoken stays LOW.
  if printf '%s' "$pkg" | grep -qiE "$devonly|$ghaction"; then base="LOW"
  elif printf '%s' "$pkg" | grep -qiE "$sensitive"; then base="HIGH"
  else base="MED"; fi
  # Major bump escalates RUNTIME scope (MED->HIGH). Dev-only stays LOW —
  # its blast radius is still dev-only; migration_flag flags the verify need.
  maj_old=$(printf '%s' "$title" | sed -E 's/.* from ([0-9]+)\..*/\1/'); [ -n "$ov" ] && maj_old="$ov"
  maj_new=$(printf '%s' "$title" | sed -E 's/.* to ([0-9]+)\..*/\1/')
  if [[ "$maj_old" =~ ^[0-9]+$ && "$maj_new" =~ ^[0-9]+$ && "$maj_old" != "$maj_new" ]]; then
    case "$base" in MED) base="HIGH";; esac
  fi
  printf '%s' "$base"
}

# Merge-safety signal, orthogonal to scope. A major-version bump may be an
# incomplete migration (peer-dep skew, config compat) that a green CI misses —
# especially for tools run only at pre-commit, not in CI. Returns a note or "".
migration_flag() {
  local title="$1" ov="${2:-}" maj_old maj_new
  maj_old=$(printf '%s' "$title" | sed -E 's/.* from ([0-9]+)\..*/\1/'); [ -n "$ov" ] && maj_old="$ov"
  maj_new=$(printf '%s' "$title" | sed -E 's/.* to ([0-9]+)\..*/\1/')
  if [[ "$maj_old" =~ ^[0-9]+$ && "$maj_new" =~ ^[0-9]+$ && "$maj_old" != "$maj_new" ]]; then
    printf 'major %s→%s — verify migration (peer-deps/config; CI may not exercise it)' "$maj_old" "$maj_new"
  fi
}

report() {
  local pr state merge gate title fails t risk ov mig prs st n_want n_got list_rc
  prs=$(list); list_rc=$?
  n_want=$(printf '%s\n' "$prs" | grep -c .)
  # Capture status output and validate before printing, so a gh/API error that
  # drops a PR surfaces as an explicit INCOMPLETE warning, not a silent omission.
  st=$(status); n_got=$(printf '%s\n' "$st" | grep -c $'\t')
  echo "### FxA dependency-bot triage — ${n_want} open PR(s)"
  echo ""
  if [ "$list_rc" -ne 0 ] || [ "$n_got" -lt "$n_want" ]; then
    printf '⚠ WARNING: PR list/classification incomplete (listed %s, classified %s; a gh/API call failed). Report is INCOMPLETE.\n\n' "$n_want" "$n_got"
  fi
  [ -z "$st" ] && return 0
  while IFS=$'\t' read -r pr state merge gate title fails; do
    [ -z "${pr:-}" ] && continue
    t=$(gh pr view "$pr" --repo "$REPO" --json title --jq .title 2>/dev/null)
    ov=""; printf '%s' "$t" | grep -qiE ' from [0-9]' || ov=$(old_major "$pr" "$(pkg_of "$t")")
    risk=$(risk_of "$t" "$ov"); mig=$(migration_flag "$t" "$ov")
    printf '#%s  [%s]  risk=%s  %s\n' "$pr" "$state" "$risk" "$title"
    if [ -n "$fails" ]; then printf '        fails: %s\n' "$fails"; fi
    case "$merge" in
      DIRTY)   printf '        merge: conflict — rebase needed (report to human)\n' ;;
      BEHIND)  printf '        merge: behind main — needs update before merge\n' ;;
      BLOCKED) printf '        merge: blocked — required review or check outstanding\n' ;;
      DRAFT)   printf '        merge: draft — cannot merge\n' ;;
      UNKNOWN) printf '        merge: mergeability not computed by GitHub yet\n' ;;
    esac
    if [ -n "$mig" ]; then printf '        ⚠ %s\n' "$mig"; fi
  done <<< "$st"
  return 0
}

# Approve the on_hold "Approve Functional Tests" gate for a PR (idempotent).
# Fails (nonzero) on any API error rather than reporting a false "nothing to do".
gate() {
  local pr="$1" br pid wf wfid st arid msg
  _need_tok || return 1
  br=$(_branch "$pr"); [ -z "$br" ] && { echo "#$pr gate: cannot resolve branch" >&2; return 1; }
  pid=$(_cget "$API/project/$PROJECT_SLUG/pipeline?branch=$(_enc "$br")" | jq -r '.items[0].id // empty') \
    || { echo "#$pr gate: pipeline query failed" >&2; return 1; }
  [ -z "$pid" ] && { echo "#$pr gate: no pipeline for branch $br" >&2; return 1; }
  wf=$(_cget "$API/pipeline/$pid/workflow" | jq -c '.items[0] // empty') \
    || { echo "#$pr gate: workflow query failed" >&2; return 1; }
  [ -z "$wf" ] && { echo "#$pr gate: no workflow on latest pipeline" >&2; return 1; }
  wfid=$(printf '%s' "$wf" | jq -r '.id'); st=$(printf '%s' "$wf" | jq -r '.status')
  if [ "$st" != "on_hold" ]; then echo "#$pr gate: workflow=$st (nothing to approve)"; return 0; fi
  arid=$(_cget "$API/workflow/$wfid/job" | jq -r '.items[]|select(.type=="approval" and .status=="on_hold")|.approval_request_id' | head -1) \
    || { echo "#$pr gate: job query failed" >&2; return 1; }
  { [ -z "$arid" ] || [ "$arid" = null ]; } && { echo "#$pr gate: no on_hold approval job"; return 0; }
  msg=$(curl -fsS -X POST -H "Circle-Token: $TOK" "$API/workflow/$wfid/approve/$arid" | jq -r '.message // "OK"') \
    || { echo "#$pr gate: approve request failed" >&2; return 1; }
  echo "#$pr gate approve -> $msg"
}

# Concise failure summary for a PR's failed CircleCI jobs, plus an advisory
# flaky-vs-real HINT (name-based; confirm from the output before acting).
# Fails (nonzero) if diagnostics can't be fetched, so a failing PR is never
# reported as "no failed jobs" by mistake.
faillog() {
  local pr="$1" br pid wfid jobs flaky=1 jn name url
  _need_tok || return 1
  br=$(_branch "$pr"); [ -z "$br" ] && { echo "#$pr faillog: cannot resolve branch" >&2; return 1; }
  pid=$(_cget "$API/project/$PROJECT_SLUG/pipeline?branch=$(_enc "$br")" | jq -r '.items[0].id // empty') \
    || { echo "#$pr faillog: pipeline query failed" >&2; return 1; }
  [ -z "$pid" ] && { echo "#$pr faillog: no pipeline for branch $br" >&2; return 1; }
  wfid=$(_cget "$API/pipeline/$pid/workflow" | jq -r '.items[0].id // empty') \
    || { echo "#$pr faillog: workflow query failed" >&2; return 1; }
  [ -z "$wfid" ] && { echo "#$pr faillog: no workflow on latest pipeline" >&2; return 1; }
  jobs=$(_cget "$API/workflow/$wfid/job" | jq -r '.items[]|select(.status=="failed")|"\(.job_number)\t\(.name)"') \
    || { echo "#$pr faillog: job query failed" >&2; return 1; }
  [ -z "$jobs" ] && { echo "#$pr: no failed CircleCI jobs"; return 0; }
  while IFS=$'\t' read -r jn name; do
    [ -z "$jn" ] && continue
    echo "== #$pr failed job: $name (#$jn) =="
    url=$(_cget "$API1/$jn" | jq -r '.steps[].actions[]|select(.status=="failed")|.output_url' | head -1) || url=""
    if [ -n "$url" ] && [ "$url" != null ]; then
      curl -fsS "$url" | jq -r '.[].message' 2>/dev/null | tr -d '\r' \
        | grep -iE 'failing|Error:|AssertionError|Timeout|Exceeded timeout|onModuleDestroy|ECONN|TS[0-9]{3,}|Cannot find|configuration file for version' \
        | grep -ivE '^\s*✓' | head -15 || true
    fi
    # real-failure signatures (not the flaky teardown pattern)
    echo "$name" | grep -qiE 'Build|Lint|Unit' && flaky=0
  done <<< "$jobs"
  if echo "$jobs" | grep -qiE 'Firefox Functional|Integration Test' && [ "$flaky" = 1 ]; then
    echo "HINT: functional/integration-only failure — often flaky, but confirm from the output above before any rerun."
  else
    echo "HINT: likely REAL (build/lint/unit) — needs a human."
  fi
}

cmd="${1:-report}"; shift || true
case "$cmd" in
  list)    list ;;
  status)  status ;;
  report)  report ;;
  gate)    gate "$@" ;;
  faillog) faillog "$@" ;;
  *) echo "usage: deps.sh {list|status|report|gate <pr>|faillog <pr>}" >&2; exit 2 ;;
esac
