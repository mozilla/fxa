#!/bin/bash -e

if [ "${SKIP_PACKAGES}" != "true" ]; then
  # Set ulimit, need it for npm
  ulimit -S -n 2048 || echo "Setting ulimit failed"

  if [ "${CI}" = "true" ]; then
    # it seems the filesystem on circleci can't handle full concurrency
    npx lerna bootstrap --hoist pm2 --concurrency 6 --ignore fxa-amplitude-send
  else
    npx lerna bootstrap --ci --hoist pm2
  fi

  ln -sf node_modules/.bin/pm2 pm2
fi
