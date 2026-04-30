#! /bin/bash
#
# Trigger CircleCI smoke tests for stage or production.
#
# Usage:
#   CIRCLECI_TOKEN=<token> ./_scripts/trigger-smoke-tests.sh <stage|production> <branch>
#
# Requires a CIRCLECI_TOKEN! Get a personal API token at https://app.circleci.com/settings/user/tokens.
# Project tokens do not work for v2 pipeline triggers.
#
# The branch argument is required - specify the train or tag that you intend to deploy. main may
# have a different test state than your train branch.

set -euo pipefail

env="${1:-}"
branch="${2:-}"

case "${env}" in
  stage|production) ;;
  *)
    echo "Usage: ${0} <stage|production> <branch>" >&2
    exit 1
    ;;
esac

if [[ -z "${branch}" ]]; then
  echo "ERROR: branch argument is required." >&2
  echo "Usage: ${0} <stage|production> <branch>" >&2
  exit 1
fi

if [[ -z "${CIRCLECI_TOKEN:-}" ]]; then
  echo "ERROR: CIRCLECI_TOKEN env var is not set." >&2
  echo "Get a personal token at https://app.circleci.com/settings/user/tokens" >&2
  exit 1
fi

parameter_name="enable_${env}_smoke_tests"
project_slug="github/mozilla/fxa"

payload=$(jq -n \
  --arg branch "${branch}" \
  --arg param "${parameter_name}" \
  '{
    branch: $branch,
    parameters: {
      enable_test_pull_request: false,
      enable_test_and_deploy_tag: false,
      enable_deploy_packages: false,
      enable_deploy_ci_images: false,
      enable_nightly: false
    } | .[$param] = true
  }')

response=$(curl -sS -X POST \
  -H "Circle-Token: ${CIRCLECI_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "${payload}" \
  "https://circleci.com/api/v2/project/${project_slug}/pipeline")

pipeline_number=$(echo "${response}" | jq -r '.number // empty')

if [[ -z "${pipeline_number}" ]]; then
  echo "ERROR: Failed to trigger pipeline. Response:" >&2
  echo "${response}" >&2
  exit 1
fi

echo "Triggered ${env} smoke tests (branch: ${branch})"
echo "https://app.circleci.com/pipelines/${project_slug}/${pipeline_number}"
