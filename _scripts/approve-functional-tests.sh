#! /bin/bash
#
# Approve the on-hold "Approve Functional Tests (PR)" job for the latest
# CircleCI pipeline on a PR branch.
#
# Usage: CIRCLECI_TOKEN=<token> ./_scripts/approve-functional-tests.sh [branch]
#
# Personal API token required (project tokens don't work for v2 approvals):
# https://app.circleci.com/settings/user/tokens. Falls back to CIRCLECI_CLI_TOKEN.

set -euo pipefail

branch="${1:-$(git rev-parse --abbrev-ref HEAD)}"
if [[ "${branch}" == "main" || "${branch}" == "HEAD" ]]; then
  echo "ERROR: refusing to approve on '${branch}'." >&2
  exit 1
fi

token="${CIRCLECI_TOKEN:-${CIRCLECI_CLI_TOKEN:-}}"
: "${token:?set CIRCLECI_TOKEN (https://app.circleci.com/settings/user/tokens)}"

slug="github/mozilla/fxa"
api="https://circleci.com/api/v2"
auth=(-H "Circle-Token: ${token}")

pipeline=$(curl -fsS "${auth[@]}" --get \
  --data-urlencode "branch=${branch}" \
  "${api}/project/${slug}/pipeline")

pipeline_id=$(echo "${pipeline}" | jq -r '.items[0].id // empty')
pipeline_number=$(echo "${pipeline}" | jq -r '.items[0].number // empty')
pipeline_revision=$(echo "${pipeline}" | jq -r '.items[0].vcs.revision // empty')

if [[ -z "${pipeline_id}" ]]; then
  echo "ERROR: no pipelines on '${branch}'. Push a commit first." >&2
  exit 1
fi

# Refuse to approve a stale pipeline. When no branch arg is passed, compare
# against HEAD so worktrees with the branch checked out elsewhere see their
# own working state rather than the other worktree's.
if [[ -n "${1:-}" ]]; then
  local_revision=$(git rev-parse "refs/heads/${branch}" 2>/dev/null || true)
else
  local_revision=$(git rev-parse HEAD 2>/dev/null || true)
fi
if [[ -n "${local_revision}" && "${pipeline_revision}" != "${local_revision}" ]]; then
  echo "ERROR: latest pipeline is for ${pipeline_revision:0:7}, branch is at ${local_revision:0:7}." >&2
  echo "Wait for CI to pick up the new commit and retry." >&2
  exit 1
fi

workflow_id=$(curl -fsS "${auth[@]}" "${api}/pipeline/${pipeline_id}/workflow" \
  | jq -r '[.items[] | select(.name == "test_pull_request")] | .[0].id // empty')

if [[ -z "${workflow_id}" ]]; then
  echo "Functional tests not on hold yet (workflow not visible). Try again soon." >&2
  exit 1
fi

job=$(curl -fsS "${auth[@]}" "${api}/workflow/${workflow_id}/job" \
  | jq -c '[.items[] | select(.name == "Approve Functional Tests (PR)")] | .[0] // empty')

if [[ -z "${job}" ]]; then
  echo "Functional tests not on hold yet (approval job not visible). Try again soon." >&2
  exit 1
fi

status=$(echo "${job}" | jq -r '.status')
case "${status}" in
  on_hold) ;;
  success)
    echo "Already approved on this pipeline."
    echo "https://app.circleci.com/pipelines/${slug}/${pipeline_number}"
    exit 0
    ;;
  blocked)
    echo "Build (PR) hasn't finished yet — wait and retry." >&2
    exit 1
    ;;
  *)
    echo "Approval job status is '${status}', not on hold." >&2
    exit 1
    ;;
esac

approval_id=$(echo "${job}" | jq -r '.approval_request_id')
curl -fsS -X POST "${auth[@]}" \
  "${api}/workflow/${workflow_id}/approve/${approval_id}" >/dev/null

echo "Approved functional tests on '${branch}'."
echo "https://app.circleci.com/pipelines/${slug}/${pipeline_number}"
