#!/bin/bash -ex

# In order to save time this script pulls the latest docker image and compares
# it to the current Dockerfile. If there are no changes the build is skipped.

DIR=$(dirname "$0")

cd $DIR/..

docker pull mozilla/fxa-circleci:latest

if docker run --rm -it mozilla/fxa-circleci:latest cat /Dockerfile | diff -b -q Dockerfile - ; then
  echo "The source is unchanged. Tagging latest as build"
  docker tag mozilla/fxa-circleci:latest fxa-circleci:build
else
  docker build -t fxa-circleci:build .
fi
