#!/bin/bash -e

DIR=$(dirname "$0")

printf '{"version":{"hash":"%s","version":"%s","source":"https://github.com/%s/%s","build":"%s"}}\n' \
  "${CIRCLE_SHA1:-$(git rev-parse HEAD)}" \
  "${CIRCLE_TAG:-$(git rev-parse --abbrev-ref HEAD)}" \
  "${CIRCLE_PROJECT_USERNAME:-mozilla}" \
  "${CIRCLE_PROJECT_REPONAME:-fxa}" \
  "${CIRCLE_BUILD_URL}" \
  | tee "$DIR/../packages/version.json"
