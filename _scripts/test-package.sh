#!/bin/bash -e
PACKAGE=$1
help="
Usage: npm test [all|<package-name>*]

examples:

npm test fxa-shared
npm test fxa-auth-db-mysql fxa-auth-server
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
  yarn workspaces foreach --topological-dev run test
else
  echo "$workspaces run test" | xargs yarn workspaces foreach --topological-dev
fi
