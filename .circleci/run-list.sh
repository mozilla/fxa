#!/bin/bash -e

# Check for required list argument
if [[ $1 == "" ]]; then
  echo "Missing list argument! Supply an argument. e.g. run-list-parallel.sh unit-test.list"
  exit 1
fi
if [[ ! -f .lists/$1 ]]; then
  echo "List isn't a valid file: $LIST"
  exit 1
fi

LIST=$1
JOBLOG="--joblog artifacts/tests/$LIST.log"

if [[ $2 == "" ]]; then
  GREP=".*"
else
  GREP=$2
fi

cat .lists/$LIST | grep $GREP > .lists/$LIST.filtered

mkdir -p artifacts/tests

while read line; do
  echo "==========================================================================================="
  echo "Executing: $line"
  echo "==========================================================================================="
  result=$($line)
  if [[ $result != 0]]; then
    echo "Command not successful. Exit code: $result";
    exit $result
  fi
done < .lists/$LIST.filtered
