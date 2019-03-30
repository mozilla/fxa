#!/bin/sh

# Update all projects

git pull

# Migration
docker network create fxa-net || true # Don't error out in case the network already exists

docker pull mozilla/syncserver || echo "syncserver update failed"

docker pull mozilla/channelserver || echo "channelserver update failed"
