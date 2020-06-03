#!/bin/bash -e

DIR=$(dirname "$0")
COMMAND=$1
cd "$DIR/.."

echo "${COMMAND} fxa services..."
yarn workspaces foreach --topological-dev --verbose --exclude fxa-dev-launcher --exclude fxa run "$COMMAND" > /dev/null
pm2 ls
