#!/bin/bash -ex

DIR=$(dirname "$0")

cd $DIR/..
npm ci
npm run lint
npm test
npm run build
mkdir artifacts
#mv fxa-email-event-proxy.zip artifacts/fxa-email-event-proxy.$CIRCLE_TAG.zip
