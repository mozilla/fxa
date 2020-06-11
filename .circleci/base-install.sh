#!/bin/bash -ex

MODULE=$1
DIR=$(dirname "$0")
cd "$DIR/.."

# npm install just enough to run these scripts
npm i --ignore-scripts --no-optional --only=prod --no-package-lock
node .circleci/modules-to-test.js | tee packages/test.list
if ([[ "$MODULE" == "many" ]] && grep -e '.' packages/test.list > /dev/null) ||
    grep -e "$MODULE" -e 'all' packages/test.list > /dev/null; then
  ./.circleci/assert-branch.sh
  ./_scripts/create-version-json.sh

  sudo apt-get install -y graphicsmagick

  yarn install --immutable
  yarn workspace fxa-shared run build
fi
