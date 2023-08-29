#!/bin/bash -e

MODULE=$1
TEST=$2
DIR=$(dirname "$0")

if grep -e "$MODULE" -e 'all' "$DIR/../packages/test.list" > /dev/null; then
  cd "$DIR/../packages/$MODULE"
  echo -e "\n###################################"
  echo "# testing $MODULE"
  echo -e "###################################\n"

  echo -e "TRACING_SERVICE_NAME=$TRACING_SERVICE_NAME"
  echo -e "TRACING_CONSOLE_EXPORTER_ENABLED=$TRACING_CONSOLE_EXPORTER_ENABLED"

  if [[ -x scripts/test-ci.sh ]]; then
    time ./scripts/test-ci.sh
  else
    # default action
    time (NODE_ENV=test npx nx run $MODULE:$TEST)
  fi
else
  echo -e "\n###################################"
  echo "# skipping $MODULE"
  echo -e "###################################\n"
  exit 0
fi
