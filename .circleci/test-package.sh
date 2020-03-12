#!/bin/bash -e

MODULE=$1
DIR=$(dirname "$0")

if grep -e "$MODULE" -e 'all' "$DIR/../packages/test.list" > /dev/null; then
  cd "$DIR/../packages/$MODULE"
  echo -e "\n###################################"
  echo "# testing $MODULE"
  echo -e "###################################\n"
  if [[ -x scripts/test-ci.sh ]]; then
    time ./scripts/test-ci.sh
  else
    # default action
    time (npm ci && npm test)
  fi
else
  echo -e "\n###################################"
  echo "# skipping $MODULE"
  echo -e "###################################\n"
  exit 0
fi
