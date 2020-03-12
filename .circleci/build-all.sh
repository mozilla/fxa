#!/bin/bash -e

DIR=$(dirname "$0")
cd "$DIR"

./create-version-json.sh

for d in ../packages/*/ ; do
  ./build.sh "$(basename "$d")"
done
