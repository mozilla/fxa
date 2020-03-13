#!/bin/bash -e

# In order to save time this script pulls the latest docker image and compares
# it to the current source. If there are no changes the build is skipped.

DIR=$(dirname "$0")

cd "$DIR/.."

docker pull mozilla/fxa-email-service:latest

./scripts/hash-source.sh > .sourcehash
ID=$(docker create mozilla/fxa-email-service:latest)
docker cp "$ID":/app/.sourcehash /tmp

if diff .sourcehash /tmp/.sourcehash ; then
  echo "The source is unchanged. Tagging latest as build"
  docker tag mozilla/fxa-email-service:latest fxa-email-service:build
else
  docker build -t fxa-email-service:build .
fi
docker rm -v "$ID"
