#!/bin/bash


# Always grab the latest and greatest from l10n when switching branches
_scripts/l10n/clone.sh

IFS=' '
read -ra G_PARAMS <<< "$HUSKY_GIT_PARAMS"
PREV=${G_PARAMS[0]}
NEXT=${G_PARAMS[1]}
if [ "$PREV" != "$NEXT" ]; then
  if [[ "$FXA_AUTO_INSTALL" == 0 ]] || git diff --quiet "$PREV" "$NEXT" yarn.lock; then
    exit 0
  elif [[ "$FXA_AUTO_INSTALL" == 1 ]]; then
    echo "yarn.lock changed, running 'yarn install'"
    yarn install
  else
    echo -e "\nyarn.lock changed. You may want to run 'yarn install'.\n"
    echo -e "To auto install next time set FXA_AUTO_INSTALL=1 or to 0 to disable this check.\n"
  fi
fi
