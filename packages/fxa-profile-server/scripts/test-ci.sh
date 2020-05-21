#!/bin/bash -ex

DIR=$(dirname "$0")

cp "$DIR/../../version.json" "$DIR/../config"
yarn workspaces focus fxa-profile-server
yarn workspace fxa-shared run build
yarn test
