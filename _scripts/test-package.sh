#!/bin/bash -e
PACKAGE=$1
help="
Usage: npm test [all|<package-name>*]

examples:

npm test fxa-shared
npm test fxa-auth-db-mysql fxa-auth-server
npm test all
"

scopes=""
for scope in "$@"
do
  scopes="$scopes --scope $scope"
done

if [[ -z "$PACKAGE" ]]; then
  >&2 echo "$help"
  exit 1
elif [[ "$PACKAGE" == "all" ]]; then
  lerna run test --stream --no-prefix --loglevel success --concurrency 1 --ignore fxa-amplitude-send
else
  echo "$scopes" | xargs lerna run test --stream --no-prefix --loglevel success --concurrency 1
fi
