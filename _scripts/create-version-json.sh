#!/bin/bash -e

DIR=$(dirname "$0")

if [[ "${CIRCLECI}" == "true" ]]; then
  printf '{"version":{"hash":"%s","version":"%s","source":"https://github.com/%s/%s","build":"%s"}}\n' \
    "${CIRCLE_SHA1:-$(git rev-parse HEAD)}" \
    "${CIRCLE_TAG:-$(git rev-parse --abbrev-ref HEAD)}" \
    "${CIRCLE_PROJECT_USERNAME:-mozilla}" \
    "${CIRCLE_PROJECT_REPONAME:-fxa}" \
    "${CIRCLE_BUILD_URL}" \
    | tee "$DIR/../packages/version.json"
elif [[ "${GITHUB_ACTIONS}" == "true" ]]; then
  printf '{"version":{"hash":"%s","version":"%s","source":"https://github.com/%s","build":"%s/%s/actions/runs/%s"}}\n' \
    "${GITHUB_SHA}" \
    "${GIT_TAG}" \
    "${GITHUB_REPOSITORY}" \
    "${GITHUB_SERVER_URL}" \
    "${GITHUB_REPOSITORY}" \
    "${GITHUB_RUN_ID}" \
    | tee "$DIR/../packages/version.json"
else
  printf '{"version":{"hash":"%s","version":"%s","source":"https://github.com/mozilla/fxa","build":""}}\n' \
    "$(git rev-parse HEAD)" \
    "$(git rev-parse --abbrev-ref HEAD)" \
    | tee "$DIR/../packages/version.json"
fi
