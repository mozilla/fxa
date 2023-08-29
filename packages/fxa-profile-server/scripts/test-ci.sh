#!/bin/bash -ex

DIR=$(dirname "$0")

# make sure var/public exists
mkdir -p var/public

# Copy version info
cp "$DIR/../../version.json" "$DIR/../config"

NODE_ENV=test npx nx fxa-profile-server:test
