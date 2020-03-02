#!/bin/bash -e

MODULE=$1
DIR=$(dirname "$0")

if grep -e "$MODULE" -e 'all' $DIR/../packages/test.list > /dev/null; then
  if [[ "$(docker images -q $MODULE)" == "" ]]; then
    # not all packages create docker images
    echo "skipping" $MODULE
    exit 0
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
