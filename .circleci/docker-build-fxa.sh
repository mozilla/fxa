#!/bin/bash -e

TAG=$1

if [[ -z "${TAG}" ]]; then
  echo "Usage: $1 <TAG>"
  exit 1
fi

if [[ -n "${CIRCLECI}" ]]; then
  echo "Docker logs are located in the CircleCI build artifacts"
fi

MODULE="fxa-mono"
DOCKER_USER=DOCKER_USER_${MODULE//-/_}
DOCKER_PASS=DOCKER_PASS_${MODULE//-/_}
DOCKERHUB_REPO=mozilla/${MODULE}
DIR=$(dirname "$0")

cd "$DIR/.."

# Build fxa-mono image
echo "Building ${MODULE} image..."
docker build -f _dev/docker/mono/Dockerfile . -t "${DOCKERHUB_REPO}:${TAG}"

# Login to docker hub
echo "${!DOCKER_PASS}" | docker login -u "${!DOCKER_USER}" --password-stdin



# Push temporary tag of fxa-mono to docker hub
echo "Pushing temporary ${DOCKERHUB_REPO}:${TAG} to docker hub..."
docker push "${DOCKERHUB_REPO}:${TAG}"
