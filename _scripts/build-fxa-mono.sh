#!/bin/bash -e

TAG=$1

MODULE="fxa-mono"
DOCKER_USER=DOCKER_USER_${MODULE//-/_}
DOCKER_PASS=DOCKER_PASS_${MODULE//-/_}
DOCKERHUB_REPO=mozilla/${MODULE}

DIR=$(dirname "$0")
cd "$DIR"

# Login to docker hub
echo "${!DOCKER_PASS}" | docker login -u "${!DOCKER_USER}" --password-stdin

# Ensure artifacts directory exists
mkdir -p ../artifacts

# Build fxa-mono image
echo "Building ${MODULE} image..."
time (< ../_dev/docker/mono/Dockerfile docker build -t "${DOCKERHUB_REPO}:${TAG}" - &> "../artifacts/fxa-mono.log")

# push temporary tag of fxa-mono to docker hub
echo "Pushing temporary ${DOCKERHUB_REPO}:${TAG} to docker hub..."
docker push "${DOCKERHUB_REPO}:${TAG}"
