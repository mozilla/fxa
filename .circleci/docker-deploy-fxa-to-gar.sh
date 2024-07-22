#!/bin/bash -e

TAG=$1
if [[ -z "${TAG}" ]]; then
  echo "No tag specified! Exiting..."
  exit 1
fi

MODULE=fxa-mono
DOCKER_USER=DOCKER_USER_${MODULE//-/_}
DOCKER_PASS=DOCKER_PASS_${MODULE//-/_}
DOCKERHUB_REPO=mozilla/${MODULE}

GAR_REPO=us-docker.pkg.dev/moz-fx-fxa-prod/fxa-prod/fxa-mono
gcloud auth configure-docker us-docker.pkg.dev

DIR=$(dirname "$0")
cd "$DIR"

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

  echo "${!DOCKER_PASS}" | docker login -u "${!DOCKER_USER}" --password-stdin

  # see if tag was pushed, not all packages create docker images
  if docker manifest inspect $DOCKERHUB_REPO:$TAG > /dev/null ; then
    echo "##################################################"
    echo "pulling ${DOCKERHUB_REPO}:${TAG}"
    echo "pushing to ${DOCKERHUB_REPO}:${DOCKER_TAG}"
    echo "##################################################"
    echo ""

    docker pull "${DOCKERHUB_REPO}:${TAG}"
    docker tag "${DOCKERHUB_REPO}:${TAG}" "${GAR_REPO}:${DOCKER_TAG}"
    docker push "${GAR_REPO}:${DOCKER_TAG}"
    docker rmi "${DOCKERHUB_REPO}:${TAG}" "${GAR_REPO}:${DOCKER_TAG}"
  else
    echo "--------------------------------------------------"
    echo "skipping $MODULE ($DOCKERHUB_REPO:$TAG not found)"
    echo "--------------------------------------------------"
    echo ""
    exit 0
  fi
fi
