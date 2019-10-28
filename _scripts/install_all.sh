#!/bin/sh -ex
_scripts/install_packages.sh

if [ "${SKIP_DOCKER}" = "true" ]; then
  exit 0
fi

_scripts/install_docker.sh
