#!/bin/bash -e

DIR=$(dirname "$0")
cd "$DIR"

mkdir -p ../artifacts

echo "Building fxa-node image..."
time (< ../_dev/docker/node/Dockerfile docker build -t fxa-node:latest - &> "../artifacts/fxa-node.log")
