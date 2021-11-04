#!/bin/bash -ex

DIR=$(dirname "$0")
cd "$DIR/.."

yarn install --immutable
node .circleci/modules-to-test.js | tee packages/test.list
./_scripts/create-version-json.sh
