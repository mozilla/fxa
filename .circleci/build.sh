#!/bin/bash -e

MODULE=$1
DIR=$(dirname "$0")

if grep -e "$MODULE" -e 'all' "$DIR/../packages/test.list" > /dev/null; then

  cd "$DIR/../packages/$MODULE"

  echo -e "\n################################"
  echo "# building $MODULE"
  echo -e "################################\n"

  # Place version.json so it is available as `/app/version.json` in the
  # container, and also as `/app/config/version.json`, creating /app/config
  # if needed.
  cp ../version.json .
  mkdir -p config
  cp ../version.json config

  mkdir -p ../../artifacts

  ODDBALLS=("fxa-auth-server" "fxa-content-server" "fxa-profile-server" "fxa-payments-server")

  if [[ -x scripts/build-ci.sh ]]; then
    time ./scripts/build-ci.sh
  elif [[ "${ODDBALLS[*]}" =~ ${MODULE} ]]; then
    cd ..
    time docker build --progress=plain -f "${MODULE}/Dockerfile" -t "${MODULE}:build" . > "../artifacts/${MODULE}.log"
  elif [[ -r Dockerfile ]]; then
    time docker build --progress=plain -t "${MODULE}:build" . > "../../artifacts/${MODULE}.log"
  fi

  # for debugging:
  # docker run --rm -it ${MODULE}:build npm ls --production
  # docker save -o "../${MODULE}.tar" ${MODULE}:build
else
  exit 0;
fi
