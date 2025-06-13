#!/bin/bash -ex

DIR=$(dirname "$0")

# Copy version info
cp "$DIR/../../version.json" "$DIR/../config"

NODE_ENV=test npx nx fxa-profile-server:test
