#!/bin/bash -e

MODULE=$1
DIR=$(dirname "$0")

if grep -e "$MODULE" -e 'all' "$DIR/../packages/test.list" > /dev/null; then

  cd "$DIR/../packages/$MODULE"

  echo -e "\n################################"
  echo "# building $MODULE"
  echo -e "################################\n"

  mkdir -p ../../artifacts

  if [[ -x scripts/build-ci.sh ]]; then
    time ./scripts/build-ci.sh
  elif [[ -r Dockerfile ]]; then
    # send Dockerfile over stdin to exclude local context
    # https://docs.docker.com/develop/develop-images/dockerfile_best-practices/#pipe-dockerfile-through-stdin
    time (< Dockerfile docker build --progress=plain -t "${MODULE}:build" - &> "../../artifacts/${MODULE}.log")
  elif [[ -r pm2.config.js ]]; then
    # Build a default image with the contents of MODULE at /app
    time (echo -e "FROM fxa-node:latest\nUSER root\nRUN ln -sF /fxa/packages/${MODULE} /app\nUSER app\nWORKDIR /app" | \
    docker build --progress=plain -t "${MODULE}:build" - &> "../../artifacts/${MODULE}.log")
  fi

  # for debugging:
  # docker run --rm -it ${MODULE}:build npm ls --production
  # docker save -o "../${MODULE}.tar" ${MODULE}:build
else
  exit 0;
fi
