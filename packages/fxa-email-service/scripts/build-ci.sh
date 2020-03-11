#!/bin/bash -ex

# In order to save time this script pulls the latest docker image and compares
# it to the current source. If there are no changes the build is skipped.

DIR=$(dirname "$0")

docker pull mozilla/fxa-email-service:latest
DOCKER_HASH="$( docker run --rm -it mozilla/fxa-email-service:latest cat /app/bin/SOURCEHASH || echo "none")"
LOCAL_HASH="$( $DIR/hash-source.sh )"

if [[ "${DOCKER_HASH::64}" == "${LOCAL_HASH::64}" ]]; then
  echo "The source is unchanged. Tagging latest as build"
  docker tag mozilla/fxa-email-service:latest fxa-email-service:build
else
  docker build -f $DIR/../Dockerfile -t fxa-email-service:build $DIR/..
fi
