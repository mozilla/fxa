#!/bin/bash -ex

DIR=$(dirname "$0")

printf '{"version":{"hash":"%s","version":"%s","source":"https://github.com/%s/%s","build":"%s"}}\n' \
  "$CIRCLE_SHA1" \
  "$CIRCLE_TAG" \
  "$CIRCLE_PROJECT_USERNAME" \
  "$CIRCLE_PROJECT_REPONAME" \
  "$CIRCLE_BUILD_URL" \
  | tee $DIR/../packages/version.json
