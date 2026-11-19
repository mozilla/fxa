#! /bin/bash
#
# Trigger the GitHub Actions docker.yml workflow to build and push the
# fxa-mono image at a given git tag. The GitHub repo is read from the URL of
# a git remote. Defaults to 'origin'.
#
# Usage:
#   ./_scripts/trigger-docker-push.sh <tag>
#   FXA_REMOTE=<remote> ./_scripts/trigger-docker-push.sh <tag>
#   FXA_DOCKER_REF=<ref> ./_scripts/trigger-docker-push.sh <tag>
#
# Environment variables:
#   FXA_REMOTE      Git remote whose GitHub repo hosts the tag (default: origin).
#   FXA_DOCKER_REF  Branch or tag whose docker.yml runs (default: the repo's default branch).
#   GITHUB_OUTPUT   When set and the run ID is known, the script appends run_id=<id> to it.
#
# Examples:
#   ./_scripts/trigger-docker-push.sh v1.2.3
#   ./_scripts/trigger-docker-push.sh v1.2.3-rc4
#   FXA_REMOTE=private ./_scripts/trigger-docker-push.sh v1.2.3
#   FXA_DOCKER_REF=train-350 ./_scripts/trigger-docker-push.sh v1.350.1
#
# Requires the `gh` CLI authenticated (run `gh auth status` to check).

set -euo pipefail

tag="${1:-}"

if [[ -z "${tag}" ]]; then
  echo "Usage: [FXA_REMOTE=<remote>] ${0} <tag>" >&2
  echo "  FXA_REMOTE  Git remote whose GitHub repo hosts the tag (default: origin)." >&2
  exit 1
fi

if [[ ! "${tag}" =~ ^v(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)(-rc[0-9]+)?$ ]]; then
  echo "ERROR: '${tag}' does not match the expected format (vMAJOR.MINOR.PATCH[-rcN])." >&2
  exit 1
fi

if ! command -v gh >/dev/null 2>&1; then
  echo "ERROR: the 'gh' CLI is not installed (https://cli.github.com)." >&2
  exit 1
fi

remote="${FXA_REMOTE:-origin}"
remote_url=$(git remote get-url "${remote}")
# Accept both https://github.com/OWNER/REPO(.git) and git@github.com:OWNER/REPO(.git).
repo=$(sed -E 's#^.*github\.com[:/]##; s#\.git$##' <<<"${remote_url}")

if [[ ! "${repo}" =~ ^[^/]+/[^/]+$ ]]; then
  echo "ERROR: could not derive a GitHub OWNER/REPO from remote '${remote}' (${remote_url})." >&2
  exit 1
fi

if ! gh api "repos/${repo}/git/refs/tags/${tag}" --silent >/dev/null 2>&1; then
  echo "ERROR: tag '${tag}' does not exist on github.com/${repo}." >&2
  exit 1
fi

ref="${FXA_DOCKER_REF:-$(gh api "repos/${repo}" --jq .default_branch)}"

run_id=$(gh api -X POST "repos/${repo}/actions/workflows/docker.yml/dispatches" \
  -f "ref=${ref}" \
  -f "inputs[git_tag]=${tag}" \
  -F return_run_details=true \
  --jq '.workflow_run_id // empty')

echo "Triggered docker build for tag ${tag}"
if [[ -n "${run_id}" ]]; then
  echo "https://github.com/${repo}/actions/runs/${run_id}"
  if [[ -n "${GITHUB_OUTPUT:-}" ]]; then
    echo "run_id=${run_id}" >>"${GITHUB_OUTPUT}"
  fi
else
  echo "https://github.com/${repo}/actions/workflows/docker.yml"
fi
