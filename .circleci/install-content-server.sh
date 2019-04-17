#!/bin/bash -ex

DIR=$(dirname "$0")

if grep -e "fxa-content-server" -e 'all' $DIR/../packages/test.list; then
  sudo apt-get install -y graphicsmagick
  mkdir -p server/config
  cp ../version.json ./
  cp ../version.json server/config
  cd $DIR/..
  CIRCLECI=false npm install
  npx pm2 kill
else
  exit 0;
fi
