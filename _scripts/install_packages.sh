#!/bin/sh -ex
_scripts/check.sh

# Set ulimit, need it for npm
ulimit -S -n 2048 || echo "Setting ulimit failed"

npm run npm-ci-all
ln -sf node_modules/.bin/pm2 pm2
