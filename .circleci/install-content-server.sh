#!/bin/bash -ex

DIR=$(dirname "$0")

if grep -e "fxa-content-server" -e 'all' $DIR/../packages/test.list; then
  mkdir -p config
  cp ../version.json ./
  cp ../version.json config
  cd $DIR/..
  SKIP_DOCKER=true npm install
else
  exit 0;
fi
