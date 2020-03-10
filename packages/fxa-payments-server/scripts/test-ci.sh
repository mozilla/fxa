#!/bin/bash -ex

DIR=$(dirname "$0")

cd $DIR/../../fxa-content-server
npm ci

cd ../fxa-geodb
npm ci

cd ../fxa-shared
npm ci

cd ../fxa-payments-server
npm ci
# TODO rm the CI=false
PUBLIC_URL=/ INLINE_RUNTIME_CHUNK=false CI=false npm run build
CI=yes npm test
