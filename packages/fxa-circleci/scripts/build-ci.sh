#!/bin/bash -e

# In order to save time this script pulls the latest docker image and compares
# it to the current Dockerfile. If there are no changes the build is skipped.

DIR=$(dirname "$0")

cd "$DIR/.."

docker pull -q mozilla/fxa-circleci:latest
ID=$(docker create mozilla/fxa-circleci:latest)
docker cp "$ID":Dockerfile /tmp

if diff Dockerfile /tmp/Dockerfile; then
  echo "The source is unchanged. Skipping build"
else
  docker build --progress=plain -t fxa-circleci:build . > ../../artifacts/fxa-circleci.log
fi
docker rm -v "$ID"
