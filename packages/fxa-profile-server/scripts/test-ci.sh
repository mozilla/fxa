#!/bin/bash -ex

DIR=$(dirname "$0")

# make sure var/public exists
mkdir -p var/public

# Copy version info
cp "$DIR/../../version.json" "$DIR/../config"

# Should not be necessary
# yarn workspaces focus fxa-profile-server

NODE_ENV=test yarn test
