#!/bin/bash -e

DIR=$(dirname "$0")
cd "$DIR"

./create-version-json.sh

mkdir -p ../artifacts

echo "Building fxa-builder image..."
time (cd .. && docker build -f _dev/docker/builder/Dockerfile -t fxa-builder:latest . &> "artifacts/fxa-builder.log")
