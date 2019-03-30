#!/bin/bash -ex

MODULE=$1
DIR=$(dirname "$0")

if grep -e "$MODULE" -e 'all' $DIR/../packages/test.list; then
  if [ "${CIRCLE_BRANCH}" == "master" ]; then
    DOCKER_TAG="latest"
  fi

  if [[ "${CIRCLE_BRANCH}" == feature* ]] || [[ "${CIRCLE_BRANCH}" == dockerpush* ]]; then
    DOCKER_TAG="${CIRCLE_BRANCH}"
  fi

  if [ -n "${CIRCLE_TAG}" ]; then
    DOCKER_TAG="$CIRCLE_TAG"
  fi

  if [ -n "${DOCKER_TAG}" ] && [ -n "${DOCKER_PASS}" ] && [ -n "${DOCKER_USER}"] && [ -n "${DOCKERHUB_REPO}"]; then
    echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
    echo ${DOCKERHUB_REPO}:${DOCKER_TAG}
    docker tag ${MODULE}:build ${DOCKERHUB_REPO}:${DOCKER_TAG}
    docker images
    docker push ${DOCKERHUB_REPO}:${DOCKER_TAG}
  fi
else
  exit 0;
fi
