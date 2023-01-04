#!/bin/bash -e

# Check for required list argument
if [[ $1 == "" ]]; then
  echo "Missing list argument! Supply an argument. e.g. run-list-parallel.sh unit-test.list 2GB"
  exit 1
fi
if [[ ! -f .lists/$1 ]]; then
  echo "List isn't a valid file: $LIST"
  exit 1
fi

# Check for memory limit argument
if [[ $2 == "" ]]; then
  echo "Missing max memory argument! Supply an second argument that puts in upper bound on memory. e.g. run-list-parallel.sh unit-test.list 2GB"
  exit 1
fi

LIST=$1
JOBLOG="--joblog artifacts/tests/$LIST.log"
MEM_MAX=$2

mkdir -p artifacts/tests

# Executes the command in the LIST file in parallel. Some notes on options
# Setting --load let's us wait for a heavy test suite to finish before starting another one
# Setting --ungroup makes the output stream better, although it is then interlaced
# Setting --joblog preserves the output in a log file.
parallel --load 75% --halt 0 --joblog artifacts/tests/$LIST.log ----memfree $MEM_MAX --retires 1 < .lists/$LIST
