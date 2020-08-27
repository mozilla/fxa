#!/bin/bash -e

DIR=$(dirname "$0")
cd "$DIR"

mkdir -p ../artifacts

echo "Building fxa-mono image..."
time (< ../_dev/docker/mono/Dockerfile docker build -t fxa-mono:build - &> "../artifacts/fxa-mono.log")
