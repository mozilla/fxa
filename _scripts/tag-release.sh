#! /bin/bash
#
# Tag a patch release on the current train branch and push it to origin.
# Pushing the tag is what kicks off the docker.yml build via
# `yarn trigger:docker-push <tag>`.
#
# Usage:
#   ./_scripts/tag-release.sh <tag>
#
# Examples:
#   ./_scripts/tag-release.sh v1.100.5
#   ./_scripts/tag-release.sh v1.100.0-rc1
#
# Pre-flight checklist (run yourself before invoking):
#   - Patch has been merged into the train branch locally
#   - You've run the server and tests to verify the patch behaves correctly

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

minor="${BASH_REMATCH[2]}"
branch="train-${minor}"
remote="origin"

echo "Fetching latest tags from ${remote}..."
git fetch "${remote}" --tags

current_branch=$(git rev-parse --abbrev-ref HEAD)
if [[ "${current_branch}" != "${branch}" ]]; then
  echo "ERROR: current branch is '${current_branch}', expected '${branch}'." >&2
  echo "Switch to ${branch} before tagging: git checkout ${branch}" >&2
  exit 1
fi

if git rev-parse "${tag}" >/dev/null 2>&1; then
  echo "ERROR: tag '${tag}' already exists locally." >&2
  exit 1
fi

if git ls-remote --tags --exit-code "${remote}" "refs/tags/${tag}" >/dev/null 2>&1; then
  echo "ERROR: tag '${tag}' already exists on ${remote}." >&2
  exit 1
fi

echo "About to:"
echo "  1. push ${branch} to ${remote}"
echo "  2. create tag ${tag} at HEAD ($(git rev-parse --short HEAD))"
echo "  3. push tag ${tag} to ${remote}"
echo
read -p "Proceed? (y/N): " confirm
if [[ ! "${confirm}" =~ ^[yY]([eE][sS])?$ ]]; then
  echo "Aborted."
  exit 1
fi

git push "${remote}" "${branch}"
git tag -a "${tag}" -m "Train release ${tag}"
git push "${remote}" "${tag}"

echo
echo "Tagged ${tag}. Kick off the docker build with:"
echo "  yarn trigger:docker-push ${tag}"
