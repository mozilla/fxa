#!/bin/bash -ex

MODULE=$(basename $(pwd))
DIR=$(dirname "$0")

if grep -e "$MODULE" -e 'all' $DIR/../packages/test.list; then
  sudo apt-get install -y default-jre
  # for some reason js-client tests fail if we cache node_modules
  npm install
  npx grunt sjcl
  node_modules/.bin/grunt eslint
  npm test
else
  exit 0;
fi
