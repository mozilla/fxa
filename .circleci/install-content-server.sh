#!/bin/bash -ex

DIR=$(dirname "$0")

if grep -e "fxa-content-server" -e 'all' $DIR/../packages/test.list; then
  curl -O https://dl.google.com/dl/cloudsdk/channels/rapid/downloads/google-cloud-sdk-248.0.0-linux-x86_64.tar.gz
  tar zxvf google-cloud-sdk-248.0.0-linux-x86_64.tar.gz google-cloud-sdk
  CLOUDSDK_CORE_DISABLE_PROMPTS=1 ./google-cloud-sdk/install.sh
  source google-cloud-sdk/path.bash.inc
  sudo apt-get install -y graphicsmagick
  mkdir -p config
  cp ../version.json ./
  cp ../version.json config
  cd $DIR/..
  CIRCLECI=false npm install
  echo "pwd ${PWD} cwd ${CWD} dir ${DIR}"
  "$DIR/clone-js-client.sh"
  npx pm2 kill
else
  exit 0;
fi
