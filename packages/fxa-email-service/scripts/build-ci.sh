#!/bin/bash -e

# In order to save time this script pulls the latest docker image and compares
# it to the current source. If there are no changes the build is skipped.

DIR=$(dirname "$0")

cd "$DIR/.."

docker pull -q mozilla/fxa-email-service:latest

./scripts/hash-source.sh > .sourcehash
ID=$(docker create mozilla/fxa-email-service:latest)
docker cp "$ID":/app/.sourcehash /tmp

if diff .sourcehash /tmp/.sourcehash ; then
  echo "The source is unchanged. Skipping build"
  # tag latest as build so that deploy.sh will be able to push it as a tagged release, i.e. v1.451.9
  docker image tag mozilla/fxa-email-service:latest fxa-email-service:build
else
  cp ../version.json .
  docker build --progress=plain -t fxa-email-service:build . > ../../artifacts/fxa-email-service.log
fi
docker rm -v "$ID"
