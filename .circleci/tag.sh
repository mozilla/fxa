#!/bin/bash -e

MODULE=$1
DIR=$(dirname "$0")

if grep -e "$MODULE" -e 'all' $DIR/../packages/test.list; then
  docker -v

  # Place version.json so it is available as `/app/version.json` in the
  # container, and also as `/app/config/version.json`, creating /app/config
  # if needed.
  cp $DIR/../packages/version.json .
  mkdir -p config
  cp $DIR/../packages/version.json config

  if [[ -e Dockerfile-tag ]]; then
    docker build -f Dockerfile-tag -t ${MODULE}:build .
    # docker run --rm -it ${MODULE}:build npm ls --production
  else
    exit 0;
  fi

  if [ "${CIRCLE_BRANCH}" == "master" ]; then
    DOCKER_TAG="latest"
  fi

  if [[ "${CIRCLE_BRANCH}" == feature* ]] || [[ "${CIRCLE_BRANCH}" == dockerpush* ]]; then
    DOCKER_TAG="${CIRCLE_BRANCH}"
  fi

  if [ -n "${CIRCLE_TAG}" ]; then
    DOCKER_TAG="$CIRCLE_TAG"
  fi

  if [ "$MODULE_SUFFIX" = "" ]; then
    MODULE_QUALIFIED="$MODULE"
  else
    MODULE_QUALIFIED="${MODULE}-${MODULE_SUFFIX}"
  fi

  REPO=$(echo ${MODULE} | sed 's/-/_/g')
  DOCKER_USER=DOCKER_USER_${REPO}
  DOCKER_PASS=DOCKER_PASS_${REPO}
  DOCKERHUB_REPO=mozilla/${MODULE_QUALIFIED}

  if [ -n "${DOCKER_TAG}" ] && [ -n "${!DOCKER_PASS}" ] && [ -n "${!DOCKER_USER}" ]; then
    echo "${!DOCKER_PASS}" | docker login -u "${!DOCKER_USER}" --password-stdin
    echo ${DOCKERHUB_REPO}:${DOCKER_TAG}
    docker tag ${MODULE}:build ${DOCKERHUB_REPO}:${DOCKER_TAG}
    docker images
    docker push ${DOCKERHUB_REPO}:${DOCKER_TAG}
  fi
else
  exit 0;
fi
