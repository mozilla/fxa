#/bin/bash -ex

LIST=$1

if [[ $LIST == "" ]]; then
  echo "Missing list argument! Supply an argument. e.g. report-converage.sh packages/unit-test-includes.list"
  exit 1
fi

if [ ! -f $LIST ]; then
  echo "List isn't a valid file: $LIST"
  exit 1
fi

# Executes the command in the LIST file in parallel. Some notes on options
# Setting --load let's us wait for a heavy test suite to finish before starting another one
# Setting --ungroup makes the output stream better, although it is then interlaced
# Setting --joblog preserves the output in a log file.
parallel --load 75% --halt 0 --ungroup --joblog .list/$LIST.log < $LIST
