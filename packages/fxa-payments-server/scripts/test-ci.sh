#!/bin/bash -ex

DIR=$(dirname "$0")

cd "$DIR/../../../"

npx lerna bootstrap \
  --scope fxa-shared \
  --scope fxa-geodb \
  --scope fxa-settings \
  --scope fxa-content-server \
  --scope fxa-payments-server \
  --concurrency 2

cd packages/fxa-payments-server

cd ../fxa-react
npm ci

cd ../fxa-payments-server
npm ci

# TODO rm the CI=false
PUBLIC_URL=/ INLINE_RUNTIME_CHUNK=false CI=false npm run build
CI=yes npm test
