#!/bin/bash
#
# Tests for trigger-docker-push.sh and trigger-smoke-tests.sh. Stub gh, git and
# curl commands come first on PATH and record their arguments, so no request
# leaves the machine.
#
# Usage:
#   bash _scripts/trigger-scripts.test.sh

set -uo pipefail

scripts_dir="$(cd "$(dirname "${0}")" && pwd)"
tmp="$(mktemp -d)"
trap 'rm -rf "${tmp}"' EXIT
mkdir -p "${tmp}/bin"
calls="${tmp}/calls.log"

cat >"${tmp}/bin/gh" <<'EOF'
#!/bin/bash
echo "gh $*" >>"${STUB_CALLS}"
case "$*" in
  *git/refs/tags/*) [[ -z "${STUB_TAG_MISSING:-}" ]] ;;
  # Real gh applies --jq only to a JSON body, so an empty body prints nothing.
  *dispatches*) if [[ -n "${STUB_DISPATCH_BODY:-}" ]]; then jq -r "${!#}" <<<"${STUB_DISPATCH_BODY}"; fi ;;
  *--jq\ .default_branch*) echo "main" ;;
esac
EOF

cat >"${tmp}/bin/git" <<'EOF'
#!/bin/bash
echo "git $*" >>"${STUB_CALLS}"
echo "https://github.com/mozilla/fxa.git"
EOF

cat >"${tmp}/bin/curl" <<'EOF'
#!/bin/bash
echo "curl $*" >>"${STUB_CALLS}"
printf '%s' "${STUB_CURL_BODY:-}"
EOF

chmod +x "${tmp}/bin/"*
export PATH="${tmp}/bin:${PATH}"
export STUB_CALLS="${calls}"
unset FXA_DOCKER_REF FXA_REMOTE CIRCLECI_PROJECT GITHUB_OUTPUT STUB_TAG_MISSING STUB_DISPATCH_BODY STUB_CURL_BODY

failures=0
status=0
out="${tmp}/out.log"
gh_output="${tmp}/github_output"

# Callers set env vars as a prefix: VAR=x run <script> <args>.
run() {
  local script="${1}"
  shift
  : >"${calls}"
  : >"${gh_output}"
  bash "${scripts_dir}/${script}" "${@}" >"${out}" 2>&1
  status=$?
}

pass() { echo "ok   - ${1}"; }
fail() {
  echo "FAIL - ${1}"
  failures=$((failures + 1))
}

expect_status() {
  if [[ "${status}" == "${1}" ]]; then pass "${2}"; else fail "${2} (exit ${status}, want ${1})"; fi
}
expect_in() {
  if grep -qF -- "${2}" "${1}"; then pass "${3}"; else fail "${3} ('${2}' not in $(basename "${1}"))"; fi
}
expect_not_in() {
  if ! grep -qF -- "${2}" "${1}"; then pass "${3}"; else fail "${3} ('${2}' found in $(basename "${1}"))"; fi
}

echo "# trigger-docker-push.sh"

run trigger-docker-push.sh v1.350.1
expect_status 0 "unset FXA_DOCKER_REF exits 0"
expect_in "${calls}" "-f ref=main" "unset FXA_DOCKER_REF dispatches on the default branch"
expect_in "${calls}" "-f inputs[git_tag]=v1.350.1" "the dispatch sends the tag as git_tag"
expect_in "${calls}" "-F return_run_details=true" "the dispatch asks for run details"
expect_in "${calls}" "repos/mozilla/fxa/git/refs/tags/v1.350.1" "the tag check uses the tag"
expect_in "${out}" "Triggered docker build for tag v1.350.1" "the message is unchanged"
expect_in "${out}" "https://github.com/mozilla/fxa/actions/workflows/docker.yml" "no response body prints the workflow URL"

FXA_DOCKER_REF=fix-x run trigger-docker-push.sh v1.350.1
expect_in "${calls}" "-f ref=fix-x" "FXA_DOCKER_REF=fix-x dispatches on fix-x"
expect_not_in "${calls}" "--jq .default_branch" "FXA_DOCKER_REF skips the default-branch lookup"
expect_in "${calls}" "repos/mozilla/fxa/git/refs/tags/v1.350.1" "the tag check still uses the tag"

STUB_DISPATCH_BODY='{"workflow_run_id":123}' GITHUB_OUTPUT="${gh_output}" run trigger-docker-push.sh v1.350.1
expect_in "${out}" "https://github.com/mozilla/fxa/actions/runs/123" "workflow_run_id 123 prints the run URL"
expect_not_in "${out}" "workflows/docker.yml" "the run URL replaces the workflow URL"
expect_in "${gh_output}" "run_id=123" "GITHUB_OUTPUT gets run_id=123"

STUB_DISPATCH_BODY='{"workflow_run_id":123}' run trigger-docker-push.sh v1.350.1
expect_status 0 "unset GITHUB_OUTPUT exits 0"
expect_in "${out}" "https://github.com/mozilla/fxa/actions/runs/123" "unset GITHUB_OUTPUT still prints the run URL"

GITHUB_OUTPUT="${gh_output}" run trigger-docker-push.sh v1.350.1
expect_not_in "${gh_output}" "run_id=" "no run ID writes nothing to GITHUB_OUTPUT"

run trigger-docker-push.sh 1.350.1
expect_status 1 "a bad tag format exits 1"
expect_in "${out}" "ERROR: '1.350.1' does not match the expected format (vMAJOR.MINOR.PATCH[-rcN])." "the bad-format message is unchanged"
expect_not_in "${calls}" "dispatches" "a bad tag format does not dispatch"

STUB_TAG_MISSING=1 run trigger-docker-push.sh v1.350.1
expect_status 1 "a missing tag exits 1"
expect_in "${out}" "ERROR: tag 'v1.350.1' does not exist on github.com/mozilla/fxa." "the missing-tag message is unchanged"
expect_not_in "${calls}" "dispatches" "a missing tag does not dispatch"

echo "# trigger-smoke-tests.sh"

pipeline='{"id":"abc-123","number":42}'
token=test-token-not-real

CIRCLECI_TOKEN="${token}" STUB_CURL_BODY="${pipeline}" run trigger-smoke-tests.sh stage v1.350.1
expect_status 0 "a tag ref exits 0"
expect_in "${calls}" '"tag": "v1.350.1"' "a tag ref is sent as tag"
expect_not_in "${calls}" '"branch":' "a tag ref is not sent as branch"
expect_in "${calls}" '"enable_stage_smoke_tests": true' "stage turns on the stage smoke tests"
expect_in "${calls}" "https://circleci.com/api/v2/project/github/mozilla/fxa/pipeline" "unset CIRCLECI_PROJECT uses github/mozilla/fxa"
expect_in "${out}" "https://app.circleci.com/pipelines/github/mozilla/fxa/42" "the pipeline URL is printed"
expect_not_in "${out}" "${token}" "the token is not printed"

CIRCLECI_TOKEN="${token}" STUB_CURL_BODY="${pipeline}" run trigger-smoke-tests.sh stage v1.350.1-rc2
expect_in "${calls}" '"tag": "v1.350.1-rc2"' "an rc tag ref is sent as tag"

CIRCLECI_TOKEN="${token}" STUB_CURL_BODY="${pipeline}" run trigger-smoke-tests.sh production train-350
expect_in "${calls}" '"branch": "train-350"' "a branch ref is sent as branch"
expect_not_in "${calls}" '"tag":' "a branch ref is not sent as tag"
expect_in "${calls}" '"enable_production_smoke_tests": true' "production turns on the production smoke tests"

CIRCLECI_TOKEN="${token}" STUB_CURL_BODY="${pipeline}" CIRCLECI_PROJECT=github/example/repo run trigger-smoke-tests.sh stage train-350
expect_in "${calls}" "https://circleci.com/api/v2/project/github/example/repo/pipeline" "CIRCLECI_PROJECT changes the POST URL"
expect_in "${out}" "https://app.circleci.com/pipelines/github/example/repo/42" "CIRCLECI_PROJECT changes the pipeline URL"

CIRCLECI_TOKEN="${token}" STUB_CURL_BODY="${pipeline}" GITHUB_OUTPUT="${gh_output}" run trigger-smoke-tests.sh stage train-350
expect_in "${gh_output}" "pipeline_id=abc-123" "GITHUB_OUTPUT gets pipeline_id"
expect_in "${gh_output}" "pipeline_number=42" "GITHUB_OUTPUT gets pipeline_number"

CIRCLECI_TOKEN="${token}" STUB_CURL_BODY="${pipeline}" run trigger-smoke-tests.sh stage train-350
expect_status 0 "unset GITHUB_OUTPUT exits 0"

CIRCLECI_TOKEN="${token}" STUB_CURL_BODY='{"message":"Not Found"}' GITHUB_OUTPUT="${gh_output}" run trigger-smoke-tests.sh stage train-350
expect_status 1 "a failed trigger exits 1"
expect_in "${out}" "ERROR: Failed to trigger pipeline. Response:" "the failed-trigger message is unchanged"
expect_in "${out}" '{"message":"Not Found"}' "the failed trigger prints the response"
expect_not_in "${gh_output}" "pipeline_" "a failed trigger writes nothing to GITHUB_OUTPUT"

if [[ "${failures}" -gt 0 ]]; then
  echo "${failures} check(s) failed"
  exit 1
fi
echo "all checks passed"
