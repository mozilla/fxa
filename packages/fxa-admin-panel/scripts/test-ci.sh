#!/bin/bash -ex

DIR=$(dirname "$0")

cd $DIR/..
npm ci

PUBLIC_URL=/ INLINE_RUNTIME_CHUNK=false CI=false npm run build
CI=yes npm test
