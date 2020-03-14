#!/bin/bash -e

DIR=$(dirname "$0")
cd "$DIR"

./create-version-json.sh

if [[ -n "${CIRCLECI}" ]]; then
  echo "Docker logs are located in the CircleCI build artifacts"
fi

for d in ../packages/*/ ; do
  ./build.sh "$(basename "$d")"
done
