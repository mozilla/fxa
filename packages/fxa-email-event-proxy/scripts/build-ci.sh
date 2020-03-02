#!/bin/bash -ex

DIR=$(dirname "$0")

cd $DIR/..
npm ci
npm run build

if [ -n "${CIRCLE_TAG}" ]; then
  ZIP_PATH="../../artifacts/fxa-email-event-proxy.$CIRCLE_TAG.zip"
else
  ZIP_PATH="../../artifacts/"
fi
mkdir -p ../../artifacts
mv fxa-email-event-proxy.zip $ZIP_PATH
