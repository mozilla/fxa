#!/bin/bash -e

DIR=$(dirname "$0")
cd "$DIR"

if [[ -n "${CIRCLECI}" ]]; then
  echo "Docker logs are located in the CircleCI build artifacts"
fi

../_scripts/build-builder.sh
../_scripts/build-fxa-node.sh

for d in ../packages/*/ ; do
  ./build.sh "$(basename "$d")"
done
