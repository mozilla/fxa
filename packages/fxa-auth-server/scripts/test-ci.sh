#!/bin/bash -ex

DIR=$(dirname "$0")

cd "$DIR/../../../"

npx lerna bootstrap \
  --scope fxa-shared \
  --scope fxa-geodb \
  --scope fxa-auth-db-mysql \
  --scope fxa-auth-server \
  --concurrency 2

cd packages/fxa-auth-server
npm run test-ci
