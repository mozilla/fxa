#!/bin/bash

if [[ "$FXA_AUTO_INSTALL" == 0 ]] || git diff --quiet ORIG_HEAD HEAD yarn.lock; then
  exit 0
elif [[ "$FXA_AUTO_INSTALL" == 1 ]]; then
  echo "yarn.lock changed, running 'yarn install'"
  yarn install
else
  echo -e "\nyarn.lock changed. You may want to run 'yarn install'.\n"
  echo -e "To auto install next time set FXA_AUTO_INSTALL=1 or to 0 to disable this check.\n"
fi
