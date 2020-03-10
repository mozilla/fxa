#!/bin/bash -e

MODULE=$1
DIR=$(dirname "$0")

if grep -e "$MODULE" -e 'all' $DIR/../packages/test.list > /dev/null; then

  cd $DIR/../packages/$MODULE

  echo -e "\n################################"
  echo "# building" $MODULE
  echo -e "################################\n"

  # Place version.json so it is available as `/app/version.json` in the
  # container, and also as `/app/config/version.json`, creating /app/config
  # if needed.
  cp ../version.json .
  mkdir -p config
  cp ../version.json config

  if [[ -e scripts/build-ci.sh ]]; then
    ./scripts/build-ci.sh
  elif [ "${MODULE}" == 'fxa-auth-server' ]; then
    cd ..
    docker build -f fxa-auth-server/Dockerfile-build -t ${MODULE}:build .
  elif [ "${MODULE}" == 'fxa-content-server' ]; then
    cd ..
    docker build -f fxa-content-server/Dockerfile-build -t ${MODULE}:build .
  elif [ "${MODULE}" == 'fxa-profile-server' ]; then
    cd ..
    docker build -f fxa-profile-server/Dockerfile-build -t ${MODULE}:build .
  elif [ "${MODULE}" == 'fxa-payments-server' ]; then
    cd ..
    docker build -f fxa-payments-server/Dockerfile -t ${MODULE}:build .
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
