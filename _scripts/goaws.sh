#!/bin/sh -ex

DIR=$(dirname "$0")
cd "$DIR/../_dev/goaws"

docker run --rm --name goaws -p 4100:4100 -v "$(pwd)":/conf admiralpiett/goaws:latest
