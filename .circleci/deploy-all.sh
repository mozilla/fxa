#!/bin/bash -e

DIR=$(dirname "$0")
cd "$DIR"

docker images

for d in ../packages/*/ ; do
  ./deploy.sh "$(basename "$d")"
done
