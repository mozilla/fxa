#!/bin/sh -ex

if [ "${SKIP_PACKAGES}" != "true" ]; then
  _scripts/install_packages.sh
fi

if [ "${SKIP_DOCKER}" != "true" ]; then
  _scripts/install_docker.sh
fi
