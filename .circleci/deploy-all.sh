#!/bin/bash -e

TAG=$1
if [[ -z "${TAG}" ]]; then
  echo "No tag specified! Exiting..."
  exit 1
fi

DIR=$(dirname "$0")
cd "$DIR"

docker images

./deploy.sh "fxa-mono" "${TAG}"

for d in ../packages/*/ ; do
  ./deploy.sh "$(basename "$d")" "${TAG}"
done
