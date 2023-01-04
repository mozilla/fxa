#!/bin/bash -e

LIST=$1

if [[ $LIST == "" ]]; then
  echo "Missing list argument! Supply an argument. e.g. report-converage.sh packages/unit-test-includes.list"
  exit 1
fi

if [ ! -f $LIST ]; then
  echo "List isn't a valid file: $LIST"
  exit 1
fi

yarn workspaces foreach \
  -piv
  $(cat $LIST) \
  exec '../../_scripts/report-coverage.sh $npm_package_name'
