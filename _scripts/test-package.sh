#!/bin/bash -e
PACKAGE=$1
help="
Usage: npm test [all|<package-name>*]

examples:

npm test fxa-shared
npm test all
"

workspaces=""
for workspace in "$@"
do
  workspaces="$workspaces --include $workspace"
done

if [[ -z "$PACKAGE" ]]; then
  >&2 echo "$help"
  exit 1
elif [[ "$PACKAGE" == "all" ]]; then
  yarn stop && yarn start infrastructure && \
  yarn workspaces foreach --topological-dev -v -p --exclude '*fxa-content-server*' --exclude '*functional-tests*' run test
else
  echo "$workspaces run test" | xargs yarn workspaces foreach --topological-dev
fi
