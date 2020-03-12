#!/bin/bash -ex

MODULE=$1
DIR=$(dirname "$0")
cd "$DIR/.."

# npm install just enough to run these scripts
npm ci --ignore-scripts --no-optional --only=prod
node .circleci/modules-to-test.js | tee packages/test.list
./.circleci/assert-branch.sh
./.circleci/create-version-json.sh

# only run a full npm install if required
if [[ "$MODULE" == "all" ]] || grep -e "$MODULE" -e 'all' packages/test.list > /dev/null; then
  npm ci
fi
