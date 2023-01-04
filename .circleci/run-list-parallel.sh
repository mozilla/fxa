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
  MAX_JOBS=""
else
  MAX_JOBS="-j $2"
fi

mkdir -p artifacts/tests

# Executes the command in the LIST file in parallel. Some notes on options
# Setting --load let's us wait for a heavy test suite to finish before starting another one
# Setting --joblog preserves the output in a log file.
parallel $MAX_JOBS --load 50% --halt 0 --joblog artifacts/tests/$LIST.log < .lists/$LIST
