#!/bin/bash -ex

MODULE=$1
DIR=$(dirname "$0")

if grep -e "$MODULE" -e 'all' $DIR/../packages/test.list; then
  docker -v

  # Place version.json so it is available as `/app/version.json` in the
  # container, and also as `/app/config/version.json` if `/app/config` is a
  # directory.
  cp $DIR/../packages/version.json .
  if [[ -d config ]]; then
    cp $DIR/../packages/version.json config
  fi

  if [ "${MODULE}" == "fxa-auth-server" ]; then
    "$DIR/../_scripts/clone-authdb.sh"
  fi

  if [ "${MODULE}" == 'fxa-oauth-server' ]; then
    cp $DIR/../packages/version.json fxa-oauth-server/config
    docker build -f Dockerfile-oauth-build -t ${MODULE}:build .
  elif [[ -e Dockerfile ]]; then
    docker build -f Dockerfile -t ${MODULE}:build .
    # docker run --rm -it ${MODULE}:build npm ls --production
  elif [[ -e Dockerfile-build ]]; then
    docker build -f Dockerfile-build -t ${MODULE}:build .
    # docker run --rm -it ${MODULE}:build npm ls --production
  fi

  # docker save -o "../${MODULE}.tar" ${MODULE}:build
else
  exit 0;
fi
