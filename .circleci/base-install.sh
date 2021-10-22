#!/bin/bash -ex

MODULE=$1
DIR=$(dirname "$0")
cd "$DIR/.."

yarn install --immutable
node .circleci/modules-to-test.js | tee packages/test.list
if ([[ "$MODULE" == "many" ]] && grep -e '.' packages/test.list > /dev/null) ||
    grep -e "$MODULE" -e 'all' packages/test.list > /dev/null; then
  ./.circleci/assert-branch.sh
  ./_scripts/create-version-json.sh
fi
