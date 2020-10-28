#!/bin/bash -e

DIR=$(dirname "$0")
cd "$DIR"

if [[ -n "${CIRCLECI}" ]]; then
  echo "Docker logs are located in the CircleCI build artifacts"
  if [ "${DOCKER_USER}" == "" ] || [ "${DOCKER_PASS}" == "" ]; then
      echo "Skipping Login to Dockerhub, credentials not available."
  else
      echo "${DOCKER_PASS}" | docker login -u="${DOCKER_USER}" --password-stdin
  fi
fi

../_scripts/build-builder.sh
../_scripts/build-fxa-mono.sh

for d in ../packages/*/ ; do
  ./build.sh "$(basename "$d")"
done
