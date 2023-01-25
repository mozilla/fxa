#!/bin/bash

# Starts the container and stores its ID. This assumes an image has a
CONTAINERID=$(docker create $1)
echo "Created Container: $CONTAINERID"

# Just to be safe, ensure .yarn folders
mkdir -p .yarn
mkdir -p ../.yarn

# Extract cached files from containers
docker cp $CONTAINERID:/home/circleci/.yarn ../. &
docker cp $CONTAINERID:/home/circleci/project/.yarn . &
wait

# Clean up running container
docker rm $CONTAINERID
