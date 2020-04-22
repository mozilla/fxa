#!/bin/bash -ex

DIR=$(dirname "$0")

cd "$DIR/../../../"

npx lerna bootstrap \
  --scope fxa-components \
  --scope fxa-admin-panel

cd packages/fxa-admin-panel

PUBLIC_URL=/ INLINE_RUNTIME_CHUNK=false CI=false npm run build
CI=yes npm test
