#!/bin/bash -ex

DIR=$(dirname "$0")

cd "$DIR/../../../"

npx lerna bootstrap \
  --scope fxa-shared \
  --scope fxa-react

cd packages/fxa-react
CI=yes npm test
