#!/bin/sh -ex
_scripts/check.sh

# Set ulimit, need it for npm
ulimit -S -n 2048 || echo "Setting ulimit failed"

if [ "${CI}" = "true" ]; then
  # it seems the filesystem on circleci can't handle full concurrency
  npx lerna exec --concurrency 2 -- npm ci
else
  npm run npm-ci-all
fi

ln -sf node_modules/.bin/pm2 pm2
