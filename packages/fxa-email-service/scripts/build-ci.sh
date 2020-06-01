#!/bin/bash -e

# In order to save time this script pulls the latest docker image and compares
# it to the current source. If there are no changes the build is skipped.

#DIR=$(dirname "$0")
#
#cd "$DIR/.."
#
#docker pull -q mozilla/fxa-email-service:latest
#
#./scripts/hash-source.sh > .sourcehash
#ID=$(docker create mozilla/fxa-email-service:latest)
#docker cp "$ID":/app/.sourcehash /tmp
#
#if diff .sourcehash /tmp/.sourcehash ; then
#  echo "The source is unchanged. Skipping build"
#else
#  cp ../version.json .
#  docker build --progress=plain -t fxa-email-service:build . > ../../artifacts/fxa-email-service.log
#fi
#docker rm -v "$ID"
