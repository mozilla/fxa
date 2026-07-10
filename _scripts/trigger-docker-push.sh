#! /bin/bash
#
# Trigger the GitHub Actions docker.yml workflow to build and push the
# fxa-mono image at a given git tag.
#
# Usage:
#   ./_scripts/trigger-docker-push.sh <tag>
#
# Examples:
#   ./_scripts/trigger-docker-push.sh v1.2.3
#   ./_scripts/trigger-docker-push.sh v1.2.3-rc4
#
# Requires the `gh` CLI authenticated (run `gh auth status` to check).

set -euo pipefail

tag="${1:-}"

if [[ -z "${tag}" ]]; then
  echo "Usage: ${0} <tag>" >&2
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

repo="mozilla/fxa"

if ! gh api "repos/${repo}/git/refs/tags/${tag}" --silent >/dev/null 2>&1; then
  echo "ERROR: tag '${tag}' does not exist on github.com/${repo}." >&2
  exit 1
fi

gh workflow run docker.yml --repo "${repo}" -f "git_tag=${tag}"

echo "Triggered docker build for tag ${tag}"
echo "https://github.com/${repo}/actions/workflows/docker.yml"
