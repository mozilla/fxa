#!/bin/bash -e

DIR=$(dirname "$0")
cd "$DIR"

./create-version-json.sh

mkdir -p ../artifacts

build_args=()

if [ -n "${DOCKER_BUILD_NETWORK}" ]; then
    build_args+=("--network" "${DOCKER_BUILD_NETWORK}")
fi

while read fxa_arg; do
    echo "Adding docker build arg: $fxa_arg"
    build_args+=("--build-arg" "$fxa_arg")
done < <(env | sed -n -E 's/^(RM_FXA_|(FXA_))([a-zA-Z0-9_]+=.*)/\2\3/p' | sort)

echo "Building fxa-builder image..."
time (cd .. && docker build -f _dev/docker/builder/Dockerfile -t fxa-builder:latest "${build_args[@]}" . &> "artifacts/fxa-builder.log")
