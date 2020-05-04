#!/bin/bash -ex

DIR=$(dirname "$0")

cd "$DIR/../../../"

npx lerna bootstrap \
  --scope fxa-shared \
  --scope fxa-components

cd packages/fxa-components
CI=yes npm test
