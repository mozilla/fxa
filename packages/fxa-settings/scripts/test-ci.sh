#!/bin/bash -ex

DIR=$(dirname "$0")

cd "$DIR/../../../"

npx lerna bootstrap \
  --scope fxa-shared \
  --scope fxa-components \
  --scope fxa-settings

cd packages/fxa-settings

PUBLIC_URL=/ INLINE_RUNTIME_CHUNK=false CI=false npm run build
CI=yes npm test
