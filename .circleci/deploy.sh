#!/bin/bash -e

MODULE=$1
TAG=$2

DOCKER_USER=DOCKER_USER_${MODULE//-/_}
DOCKER_PASS=DOCKER_PASS_${MODULE//-/_}
DOCKERHUB_REPO=mozilla/${MODULE}

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

if [ -n "${DOCKER_TAG}" ] && [ -n "${!DOCKER_PASS}" ] && [ -n "${!DOCKER_USER}" ]; then
  echo -e "\n##################################################"
  echo "# pushing ${DOCKERHUB_REPO}:${DOCKER_TAG}"
  echo -e "##################################################\n"
  echo "${!DOCKER_PASS}" | docker login -u "${!DOCKER_USER}" --password-stdin

  echo "pulling ${DOCKERHUB_REPO}:${TAG}"
  time docker pull "${DOCKERHUB_REPO}:${TAG}"

  echo "pushing ${DOCKERHUB_REPO}:${DOCKER_TAG} "
  docker tag "${DOCKERHUB_REPO}:${TAG}" "${DOCKERHUB_REPO}:${DOCKER_TAG}"
  time docker push "${DOCKERHUB_REPO}:${DOCKER_TAG}"

  echo "removing  ${DOCKERHUB_REPO}:${TAG}"
  docker rmi "${DOCKERHUB_REPO}:${TAG}"
fi
