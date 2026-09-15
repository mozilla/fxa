#!/usr/bin/env bash
# FxA dependency-bot triage toolkit — reliable primitives for the /fxa-dependabot skill.
# Covers PRs from dependabot and mozilla-blender (BLEnder security bumps).
# Read-only:  list | status | report | faillog <pr>
# Mutating:   gate <pr> | rerun <pr> | rebase <pr>
#
# Never merges. Only auto-resolves yarn.lock-only conflicts. Reruns are bounded.
# Secrets (CircleCI token) are read into a var, never printed.
set -uo pipefail

REPO="${FXA_REPO:-mozilla/fxa}"
PROJECT_SLUG="gh/mozilla/fxa"
API="https://circleci.com/api/v2"
API1="https://circleci.com/api/v1.1/project/gh/mozilla/fxa"
RR_DIR="${TMPDIR:-/tmp}/fxa-dependabot-rr"
# Bot authors whose dependency PRs we triage.
AUTHORS="${FXA_PR_AUTHORS:-app/dependabot app/mozilla-blender}"
MAX_RERUN="${FXA_MAX_RERUN:-2}"
# check names that are cosmetic / non-required (storybook GH Action) — never block on these
COSMETIC='Deploy to GitHub Pages|Prepare Storybooks for Deployment|Build Storybooks'

mkdir -p "$RR_DIR"

_tok()  { grep '^token:' "$HOME/.circleci/cli.yml" | awk '{print $2}'; }
_enc()  { python3 -c "import urllib.parse,sys;print(urllib.parse.quote(sys.argv[1],safe=''))" "$1"; }
_quiet(){ grep -viE 'l10n|husky|hook|clon|destination path|vulnerabilit|GitHub found|^remote:' || true; }
_branch(){ gh pr view "$1" --repo "$REPO" --json headRefName --jq .headRefName; }
_repo_root(){ git rev-parse --show-toplevel 2>/dev/null; }
_rebasing(){ [ -d "$(git rev-parse --git-path rebase-merge)" ] || [ -d "$(git rev-parse --git-path rebase-apply)" ]; }

list() {
  local a
  for a in $AUTHORS; do
    gh pr list --repo "$REPO" --author "$a" --state open --json number --jq '.[].number' 2>/dev/null
  done | sort -nu
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
  printf '%s\n' "$d" | jq -r --arg pr "$pr" --arg cos "$COSMETIC" '
    .statusCheckRollup as $c
    | ([ $c[] | select(.__typename=="CheckRun" and .conclusion=="FAILURE") | select(.name|test($cos)|not) | .name ]
       + [ $c[] | select(.__typename=="StatusContext" and .state=="FAILURE") | .context ]) as $fails
    | ([ $c[] | select(.__typename=="CheckRun" and .status!="COMPLETED") | .name ]
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
  local pr
  for pr in $(list); do status_one "$pr"; done
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
  if printf '%s' "$title" | grep -qiE "$sensitive"; then base="HIGH"
  elif printf '%s' "$title" | grep -qiE "$devonly|$ghaction"; then base="LOW"
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
  local pr state merge gate title fails t risk ov
  echo "### FxA dependency-bot triage — $(list | wc -l | tr -d ' ') open PR(s)"
  echo ""
  while IFS=$'\t' read -r pr state merge gate title fails; do
    [ -z "${pr:-}" ] && continue
    t=$(gh pr view "$pr" --repo "$REPO" --json title --jq .title 2>/dev/null)
    ov=""; printf '%s' "$t" | grep -qiE ' from [0-9]' || ov=$(old_major "$pr" "$(pkg_of "$t")")
    risk=$(risk_of "$t" "$ov"); mig=$(migration_flag "$t" "$ov")
    printf '#%s  [%s]  risk=%s  %s\n' "$pr" "$state" "$risk" "$title"
    if [ -n "$fails" ]; then printf '        fails: %s\n' "$fails"; fi
    case "$merge" in
      DIRTY)   printf '        merge: conflict — rebase needed\n' ;;
      BEHIND)  printf '        merge: behind main — needs update before merge\n' ;;
      BLOCKED) printf '        merge: blocked — required review or check outstanding\n' ;;
      DRAFT)   printf '        merge: draft — cannot merge\n' ;;
      UNKNOWN) printf '        merge: mergeability not computed by GitHub yet\n' ;;
    esac
    if [ -n "$mig" ]; then printf '        ⚠ %s\n' "$mig"; fi
  done < <(status)
  return 0
}

# Approve the on_hold "Approve Functional Tests" gate for a PR (idempotent).
gate() {
  local pr="$1" tok br pid wf wfid st arid
  tok=$(_tok); br=$(_branch "$pr")
  pid=$(curl -s -H "Circle-Token: $tok" "$API/project/$PROJECT_SLUG/pipeline?branch=$(_enc "$br")" | jq -r '.items[0].id')
  wf=$(curl -s -H "Circle-Token: $tok" "$API/pipeline/$pid/workflow" | jq -r '.items[0]')
  wfid=$(printf '%s' "$wf" | jq -r '.id'); st=$(printf '%s' "$wf" | jq -r '.status')
  if [ "$st" != "on_hold" ]; then echo "#$pr gate: workflow=$st (nothing to approve)"; return 0; fi
  arid=$(curl -s -H "Circle-Token: $tok" "$API/workflow/$wfid/job" | jq -r '.items[]|select(.type=="approval" and .status=="on_hold")|.id' | head -1)
  [ -z "$arid" ] || [ "$arid" = null ] && { echo "#$pr gate: no on_hold approval job"; return 0; }
  echo "#$pr gate approve -> $(curl -s -X POST -H "Circle-Token: $tok" "$API/workflow/$wfid/approve/$arid" | jq -r '.message // "OK"')"
}

# Fetch a concise failure summary for a PR's failed CircleCI jobs; also guesses flaky vs real.
faillog() {
  local pr="$1" tok br pid wfid jobs
  tok=$(_tok); br=$(_branch "$pr")
  pid=$(curl -s -H "Circle-Token: $tok" "$API/project/$PROJECT_SLUG/pipeline?branch=$(_enc "$br")" | jq -r '.items[0].id')
  wfid=$(curl -s -H "Circle-Token: $tok" "$API/pipeline/$pid/workflow" | jq -r '.items[0].id')
  jobs=$(curl -s -H "Circle-Token: $tok" "$API/workflow/$wfid/job" | jq -r '.items[]|select(.status=="failed")|"\(.job_number)\t\(.name)"')
  [ -z "$jobs" ] && { echo "#$pr: no failed CircleCI jobs"; return 0; }
  local flaky=1
  while IFS=$'\t' read -r jn name; do
    [ -z "$jn" ] && continue
    echo "== #$pr failed job: $name (#$jn) =="
    local url; url=$(curl -s -H "Circle-Token: $tok" "$API1/$jn" | jq -r '.steps[].actions[]|select(.status=="failed")|.output_url' | head -1)
    if [ -n "$url" ] && [ "$url" != null ]; then
      curl -s "$url" | jq -r '.[].message' 2>/dev/null | tr -d '\r' \
        | grep -iE 'failing|Error:|AssertionError|Timeout|Exceeded timeout|onModuleDestroy|ECONN|TS[0-9]{3,}|Cannot find|configuration file for version' \
        | grep -ivE '^\s*✓' | head -15
    fi
    # real-failure signatures (not the flaky teardown pattern)
    echo "$name" | grep -qiE 'Build|Lint|Unit' && flaky=0
  done <<< "$jobs"
  if echo "$jobs" | grep -qiE 'Firefox Functional|Integration Test' && [ "$flaky" = 1 ]; then
    echo "VERDICT: likely FLAKY (functional/integration only) — safe to rerun"
  else
    echo "VERDICT: likely REAL — inspect before rerunning"
  fi
}

# Bounded rerun-from-failed. Counts per PR+headSHA; refuses past MAX_RERUN.
rerun() {
  local pr="$1" tok br sha pid wfid rf n
  tok=$(_tok); br=$(_branch "$pr")
  sha=$(gh pr view "$pr" --repo "$REPO" --json headRefOid --jq .headRefOid)
  rf="$RR_DIR/${pr}_${sha:0:12}"; n=$(cat "$rf" 2>/dev/null || echo 0)
  if [ "$n" -ge "$MAX_RERUN" ]; then echo "#$pr rerun: budget exhausted ($n/$MAX_RERUN for $sha) — flag for human"; return 2; fi
  pid=$(curl -s -H "Circle-Token: $tok" "$API/project/$PROJECT_SLUG/pipeline?branch=$(_enc "$br")" | jq -r '.items[0].id')
  wfid=$(curl -s -H "Circle-Token: $tok" "$API/pipeline/$pid/workflow" | jq -r '.items[0].id')
  local resp; resp=$(curl -s -X POST -H "Circle-Token: $tok" -H "Content-Type: application/json" -d '{"from_failed":true}' "$API/workflow/$wfid/rerun")
  echo $((n+1)) > "$rf"
  echo "#$pr rerun-from-failed #$((n+1)) -> $(printf '%s' "$resp" | jq -r '.workflow_id // .message // "?"')"
}

# Union-merge a package.json conflict confined to the resolutions blocks.
# Every BLEnder bump pins its version there, so two of them always collide on
# that object even though the edits are independent. Args: base ours theirs out.
# Refuses (exit 2) if either side changed anything else, or if the two sides pin
# the same package to different versions.
_merge_resolutions() {
  python3 - "$@" <<'PYEOF'
import json, re, sys
base, ours, theirs, out = (json.load(open(p)) if i < 3 else p
                           for i, p in enumerate(sys.argv[1:5]))
KEYS = ('resolutions', 'resolutionComments')

for k in set(base) | set(theirs):
    if base.get(k) != theirs.get(k) and k not in KEYS:
        print(f'package.json: {k} also changed', file=sys.stderr); sys.exit(2)

text = open(sys.argv[2]).read()
for key in KEYS:
    added = {k: v for k, v in theirs.get(key, {}).items()
             if base.get(key, {}).get(k) != v}
    for k, v in added.items():
        if k in ours.get(key, {}) and ours[key][k] != v:
            print(f'package.json: {key}.{k} pinned differently on both sides',
                  file=sys.stderr); sys.exit(2)
        if ours.get(key, {}).get(k) == v:
            continue
        m = re.search(r'^(\s*)"%s": \{\n' % re.escape(key), text, re.M)
        if not m:
            print(f'package.json: no {key} block to merge into', file=sys.stderr); sys.exit(2)
        entry = f'{m.group(1)}  {json.dumps(k)}: {json.dumps(v)},\n'
        text = text[:m.end()] + entry + text[m.end():]

json.loads(text)
open(out, 'w').write(text)
PYEOF
}

# Safe rebase onto origin/main, then force-push-with-lease. Auto-resolves only a
# yarn.lock conflict (regenerate) and a package.json resolutions conflict (union).
# Refuses (and flags) if any other file conflicts.
rebase() {
  local pr="$1" root br tmp before after steps=0
  root=$(_repo_root); [ -z "$root" ] && { echo "#$pr rebase: not in a git repo"; return 1; }
  cd "$root" || return 1
  if _rebasing; then echo "#$pr rebase: a rebase is already in progress here -> NEEDS HUMAN"; return 2; fi
  br=$(_branch "$pr"); tmp="ddb-rebase-$pr"
  git fetch origin --quiet 2>&1 | _quiet
  git checkout -B "$tmp" "origin/$br" 2>&1 | _quiet
  before=$(git rev-parse HEAD)
  git rebase origin/main >/dev/null 2>&1
  # A rebase stops once per conflicted commit, so resolve in a loop.
  while _rebasing; do
    steps=$((steps+1))
    if [ "$steps" -gt 20 ]; then
      echo "#$pr rebase: too many conflicted steps -> NEEDS HUMAN"
      git rebase --abort 2>&1 | _quiet; return 2
    fi
    local conflicted unexpected; conflicted=$(git diff --name-only --diff-filter=U)
    unexpected=$(printf '%s\n' "$conflicted" | grep -vxE 'yarn.lock|package.json')
    if [ -n "$unexpected" ] || [ -z "$conflicted" ]; then
      echo "#$pr rebase: unmergeable conflict -> NEEDS HUMAN: $(printf '%s' "${conflicted:-<none; rebase failed>}" | tr '\n' ' ')"
      git rebase --abort 2>&1 | _quiet; return 2
    fi
    if printf '%s\n' "$conflicted" | grep -qx 'package.json'; then
      local d; d=$(mktemp -d)
      git show :1:package.json > "$d/base" 2>/dev/null || echo '{}' > "$d/base"
      git show :2:package.json > "$d/ours"
      git show :3:package.json > "$d/theirs"
      if ! _merge_resolutions "$d/base" "$d/ours" "$d/theirs" package.json; then
        echo "#$pr rebase: package.json conflict beyond resolutions -> NEEDS HUMAN"
        rm -rf "$d"; git rebase --abort 2>&1 | _quiet; return 2
      fi
      rm -rf "$d"; git add package.json
    fi
    # The bump pins its version in package.json, so regenerating from main's
    # lockfile still resolves to the bumped version.
    git checkout origin/main -- yarn.lock
    YARN_ENABLE_IMMUTABLE_INSTALLS=false yarn install >/dev/null 2>&1
    if ! yarn install --immutable >/dev/null 2>&1; then
      echo "#$pr rebase: lockfile still not immutable-clean -> NEEDS HUMAN"
      git rebase --abort 2>&1 | _quiet; return 2
    fi
    git add yarn.lock
    GIT_EDITOR=true git rebase --continue >/dev/null 2>&1
  done
  if [ "$(git rev-list --left-right --count "origin/main...HEAD" | awk '{print $1}')" != "0" ]; then
    echo "#$pr rebase: still behind main after rebase -> NEEDS HUMAN"; return 2
  fi
  after=$(git rev-parse HEAD)
  if [ "$before" = "$after" ]; then echo "#$pr rebase: nothing to do (already on main)"; return 0; fi
  if ! git push --force-with-lease "origin" "$tmp:$br" 2>&1 | _quiet | tail -2; then
    echo "#$pr rebase: push rejected -> NEEDS HUMAN"; return 2
  fi
  echo "#$pr rebase: pushed $(git rev-parse --short "$before") -> $(git rev-parse --short "$after") (lockfile regenerated, immutable-clean)"
}

# Local verification gate for a code/test fix. verify <project> [targets...]
# Runs the given nx targets (default: build lint test-unit) and reports PASS/FAIL.
# A fix is only allowed to push if this returns 0.
verify() {
  local proj="${1:-}"; shift || true
  [ -z "$proj" ] && { echo "usage: deps.sh verify <project> [targets...]" >&2; return 2; }
  local root; root=$(_repo_root); [ -z "$root" ] && { echo "verify: not in a git repo"; return 1; }
  cd "$root" || return 1
  local targets=("$@"); [ ${#targets[@]} -eq 0 ] && targets=(build lint test-unit)
  local fail=0 t log
  for t in "${targets[@]}"; do
    log="${TMPDIR:-/tmp}/fxa-verify-${proj}-${t}.log"
    printf 'verify: nx %s %s ... ' "$t" "$proj"
    if npx nx "$t" "$proj" >"$log" 2>&1; then echo PASS; else echo "FAIL (see $log)"; fail=1; fi
  done
  return $fail
}

cmd="${1:-report}"; shift || true
case "$cmd" in
  list)    list ;;
  status)  status ;;
  report)  report ;;
  gate)    gate "$@" ;;
  rerun)   rerun "$@" ;;
  rebase)  rebase "$@" ;;
  faillog) faillog "$@" ;;
  verify)  verify "$@" ;;
  *) echo "usage: deps.sh {list|status|report|gate <pr>|rerun <pr>|rebase <pr>|faillog <pr>|verify <project> [targets...]}" >&2; exit 2 ;;
esac
