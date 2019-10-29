#!/bin/sh -ex

if [ "${CIRCLECI}" = "true" ]; then
  exit 0
else
  _scripts/install_all.sh
fi
