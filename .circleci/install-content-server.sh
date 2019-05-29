#!/bin/bash -ex

DIR=$(dirname "$0")

if grep -e "fxa-content-server" -e 'all' $DIR/../packages/test.list; then
  CLOUD_SDK_REPO="cloud-sdk-$(grep VERSION_CODENAME /etc/os-release | cut -d '=' -f 2)"
  echo "deb http://packages.cloud.google.com/apt $CLOUD_SDK_REPO main" | tee -a /etc/apt/sources.list.d/google-cloud-sdk.list
  curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo apt-key add -
  sudo apt-get update -y && sudo apt-get install google-cloud-sdk -y
  sudo apt-get install -y graphicsmagick
  mkdir -p config
  cp ../version.json ./
  cp ../version.json config
  cd $DIR/..
  CIRCLECI=false npm install
  npx pm2 kill
else
  exit 0;
fi
