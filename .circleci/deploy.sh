#!/bin/bash -e

MODULE=$1

if [[ "$(docker images -q "$MODULE")" == "" ]]; then
  # not all packages create docker images
  echo -e "\n--------------------------------------------------"
  echo "- skipping $MODULE"
  echo -e "--------------------------------------------------\n"
  exit 0
fi

if [ "${CIRCLE_BRANCH}" == "main" ]; then
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

REPO="${MODULE//-/_}"
DOCKER_USER=DOCKER_USER_${REPO}
DOCKER_PASS=DOCKER_PASS_${REPO}
DOCKERHUB_REPO=mozilla/${MODULE_QUALIFIED}

if [ -n "${DOCKER_TAG}" ] && [ -n "${!DOCKER_PASS}" ] && [ -n "${!DOCKER_USER}" ]; then
  echo -e "\n##################################################"
  echo "# pushing ${DOCKERHUB_REPO}:${DOCKER_TAG}"
  echo -e "##################################################\n"
  echo "${!DOCKER_PASS}" | docker login -u "${!DOCKER_USER}" --password-stdin
  docker tag "${MODULE}:build" "${DOCKERHUB_REPO}:${DOCKER_TAG}"
  time docker push "${DOCKERHUB_REPO}:${DOCKER_TAG}"
fi
