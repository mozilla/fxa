#!/bin/sh -ex

if [ "${CIRCLECI}" = "true" ]; then
  exit 0
else
  if [ "${SKIP_DOCKER}" = "true" ]; then
    _scripts/install_packages.sh
    exit 0
  fi
  _scripts/install_all.sh
  pm2 delete servers.json && pm2 start servers.json
  echo "Use './pm2 kill' to stop all the servers"
fi
