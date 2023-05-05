#!/bin/bash -e

DIR=$(dirname "$0")
cd "$DIR"

# The circle tag often represents a version number. If the tag is present and
# its format looks like a semver, ie v1.2.3, then this version will be applied
# across all package.json files.
if [ -n "${CIRCLE_TAG}" ]; then
  VERSION="$CIRCLE_TAG"
fi

./create-version-json.sh

mkdir -p ../artifacts

echo "Building fxa-builder image..."
time (cd .. && docker build -f _dev/docker/builder/Dockerfile --build-arg VERSION=$VERSION -t fxa-builder:latest . &> "artifacts/fxa-builder.log")
