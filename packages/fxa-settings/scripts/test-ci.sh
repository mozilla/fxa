#!/bin/bash -ex

DIR=$(dirname "$0")

cd $DIR/../../fxa-components
npm ci

cd ../fxa-settings
npm ci

PUBLIC_URL=/ INLINE_RUNTIME_CHUNK=false CI=false npm run build
CI=yes npm test
