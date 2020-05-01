#!/bin/bash -ex

DIR=$(dirname "$0")

cd "$DIR/../_dev/docker/circleci"

mkdir -p ../../artifacts

echo "building fxa-circleci"
time (docker build --progress=plain -t "mozilla/fxa-circleci:latest" . &> "../../artifacts/fxa-circleci.log")

if [[ -n "${DOCKER_PASS_fxa_circleci}" ]] && [[ -n "${DOCKER_USER_fxa_circleci}" ]]; then
  echo "deploying fxa-circleci"
  echo "${DOCKER_PASS_fxa_circleci}" | docker login -u "${DOCKER_USER_fxa_circleci}" --password-stdin
  time docker push "mozilla/fxa-circleci:latest"
fi
