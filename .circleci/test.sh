#!/bin/bash -ex

MODULE=$1
TEST=$2
DIR=$(dirname "$0")

if grep -e "$MODULE" -e 'all' $DIR/../packages/test.list; then
  if [ "${MODULE}" == 'fxa-oauth-server' ]; then
    docker build -f Dockerfile-oauth-test -t ${MODULE}:test .
    docker run --net="host" -e DB="mysql" ${MODULE}:test npm run test-oauth
  elif [[ -e Dockerfile-test ]]; then
    docker build -f Dockerfile-test -t ${MODULE}:test .

    docker run --net="host" ${MODULE}:test npm run ${TEST:-test}

    if grep eslint "$DIR/../packages/$MODULE/Gruntfile.js"; then
      docker run --net="host" ${MODULE}:test /app/node_modules/.bin/grunt eslint
    elif grep '"eslint"' "$DIR/../packages/$MODULE/package.json"; then
      docker run --net="host" ${MODULE}:test npm run lint
    elif grep '"tslint"' "$DIR/../packages/$MODULE/package.json"; then
      docker run --net="host" ${MODULE}:test npm run lint
    fi
  fi
else
  exit 0;
fi
