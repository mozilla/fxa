#!/bin/bash -e

LIST=$1
MAX_JOBS=$2

if [[ $1 == "" || $2 == "" ]]; then
   echo "Missing arguments! Invocation should be, run-list-parallel.sh \$LIST \$MAX_JOBS \$GROUP. i.e. run-list-parallel.sh unit-test.list -1 3/4"
   exit 1
fi

if [[ ! -f .lists/$LIST ]]; then
  echo "List isn't a valid file: $LIST"
  exit 1
fi

if [[ ! -s .lists/$LIST ]]; then
  echo "$LIST contains no operations. Exiting early!"
  exit 0
fi

JOBLOG="--joblog artifacts/tests/$LIST.log"

if [[ $MAX_JOBS == "NONE" ]]; then
  MAX_JOBS=""
else
  MAX_JOBS="-j $2"
fi

GROUP=$3
if [[ $GROUP == "" ]]; then
  INDEX=0
  TOTAL=1
else
  arr=(${GROUP//:/ })
  INDEX=$((${arr[0]}))
  TOTAL=$((${arr[1]}))
fi


# Quick integrity check on total / index
if [[ "$TOTAL" -gt "24" ]]; then
  echo "Invalid GROUP argument - $GROUP. Total groups must be be less than 24."
  exit 1
fi
if [[ "$INDEX" -lt "0" || "$INDEX" -ge "$TOTAL" ]]; then
  echo "Invalid GROUP argument - $GROUP. INDEX must be positive and less than total."
  exit 1
fi

# Determine the total number of operaitons in the list file
TOTAL_OPERATIONS=$(cat .lists/$LIST | wc -l | sed -e 's/ //g' )

# Divide the total operations by the total parts requrested to get group size
GROUP_SIZE=$(echo "$TOTAL_OPERATIONS $TOTAL" | awk '{print $1/$2}')
FLOOR_GROUP_SIZE=$(echo "$TOTAL_OPERATIONS $TOTAL" | awk '{print int($1/$2)}')
if [[ $GROUP_SIZE != $FLOOR_GROUP_SIZE ]]; then
  echo "$TOTAL groups were requested and there are $TOTAL_OPERATIONS operations. Rounding group size up to ensure no operations are lost!"
  GROUP_SIZE=$(($FLOOR_GROUP_SIZE+1))
fi

# Split file into N parts, which will produce files like $name-aa, $name-ab, etc...
# Next determine split files postfix. 97 is the ascii character code for 'a', by adding
# our current index to this value we will get the correct postfix of the file we want
# to target.
#
# Note that we limit the value of TOTAL to 24, which ensures no more than xaa - xaz
# file parts are created.
#
split -l $GROUP_SIZE .lists/$LIST .lists/$LIST-
SPLIT_FILE=a$(printf "\x$(printf %x $((97+$INDEX)))")
echo "Running operations in parallel"
echo " - Group: $((INDEX+1)) of $TOTAL."
echo " - Operation Count: $GROUP_SIZE"
echo " - Operation list: .lists/$LIST-$SPLIT_FILE"
echo " - Max Parallelization: ${MAX_JOBS}"


# Make sure the test folder exists in the artifacts dir
mkdir -p artifacts/tests

if [[ -f .lists/$LIST-$SPLIT_FILE ]]; then

  # Provide some info about what is being run. This can be helpful in the event an operation hangs.
  echo " - Conducting the following operations: "
  cat .lists/$LIST-$SPLIT_FILE

  # This controls whether parallels writes to standard out immediately, or collects output and prints
  # it all at once. When our max parallel jobs is set to 1, there is no reason to group output, and
  # it's better to stream to stdout in real time. When our max parallel jobs are greater than 1, then
  # streaming out results in interleaved output that is difficult to read. Another downside of group
  # is that we may never see the output if a process crashes.
  if [[ "$MAX_JOBS" == "-j 1" ]]; then
    GROUP_ARG="--ungroup"
  fi

  # Executes the command in the LIST file in parallel. Some notes on options
  # Setting --load let's us wait for a heavy test suite to finish before starting another one
  # Setting --joblog preserves the output in a log file.
  parallel $MAX_JOBS $GROUP_ARG --load 50% --halt 0 --joblog artifacts/tests/$LIST-$SPLIT_FILE.log < .lists/$LIST-$SPLIT_FILE
else
  # If there weren't enough commands to split up, then the file might not be present. For example, if there
  # is just one operation to run, and we've requested to split operations into two groups, then second group
  # will have zero operations and therefore nothing to run.
  echo "Split test file, $LIST-$SPLIT_FILE, does not exist. Exiting early!"
fi
