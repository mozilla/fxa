#!/bin/sh

# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

# This script runs the auth-server load tests in two sets of five.
# The first set are presented as benchmark times. The second set are
# executed concurrently with the (serially-repeated) metrics queries.
# The sets are of five so that we can discard outliers and compare
# the median value from each. You should bump up the value of COUNT
# to a bigger odd number if it looks like the distribution of results
# warrants it.
#
# Usage: bin/metrics-perf.sh <load-test path> <metrics.conf path>
#
# Example: bin/metrics-perf.sh ~/code/fxa-auth-server/test/load ~/fxa-metrics.conf
#
# For the format of metrics.conf, see:
#
# https://github.com/mozilla-services/puppet-config/blob/master/fxa/modules/fxa_admin/templates/gather_basic_metrics.conf.erb

if [ "$1" = '' ]
then
  echo 'You must specify the path to the auth-server load-testing directory.'
  exit 1
fi

COUNT=5
THIS_DIR="`pwd`"
TEST_DIR="$1"

run_tests()
{
  INDEX=0
  TIMINGS=

  cd "$TEST_DIR"

  while [ $INDEX -lt $COUNT ]
  do
    TIMING=`make bench 2>&1 | grep Duration | cut -d ' ' -s -f 2`

    if [ "$TIMINGS" = '' ]
    then
      TIMINGS=$TIMING
    else
      TIMINGS="$TIMINGS $TIMING"
    fi

    INDEX=`expr $INDEX + 1`
  done

  cd "$THIS_DIR"

  echo "$1 times (seconds): $TIMINGS"
}

run_tests "Benchmark"

if [ "$2" = '' ]
then
  echo 'No metrics.conf path specified. Run the metrics loop separately,'
  read -rsp 'then press any key to continue...' -n 1 key
  echo
else
  "`dirname $0`/metrics-loop.sh" "$2" &
  FXA_METRICS_LOOP_PID=$!
fi

run_tests "  Metrics"

if [ "$2" = '' ]
then
  echo 'You may now kill your metrics loop.'
else
  kill -15 $METRICS_PID
fi

