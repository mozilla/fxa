#!/bin/bash -ex

DIR=$(dirname "$0")

if grep -e "fxa-content-server" -e 'all' $DIR/../packages/test.list; then
  echo "installing graphicsmagick..."
  sudo apt-get install -y graphicsmagick
  echo "done."
  mkdir -p config
  cp ../version.json ./
  cp ../version.json config
  cd $DIR/..
  CIRCLECI=false SKIP_DOCKER=true npm install
else
  echo "not installing graphicsmagick."
  exit 0;
fi
