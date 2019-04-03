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
# Usage: scripts/metrics-perf.sh <load-test path> <metrics.conf path>
#
# Example: scripts/metrics-perf.sh ~/code/fxa-auth-server/test/load ~/fxa-metrics.conf
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
  AGGREGATE_REQUESTS=
  AGGREGATE_REQUESTS_PER_SECOND=
  AGGREGATE_REQUEST_TIME=

  cd "$TEST_DIR"

  while [ $INDEX -lt $COUNT ]
  do
    BENCHMARK=`make bench`
    REQUESTS=`echo "$BENCHMARK" | grep 'Hits:' | cut -d ' ' -s -f 2`
    REQUESTS_PER_SECOND=`echo "$BENCHMARK" | grep 'Approximate Average RPS:' | cut -d ' ' -s -f 4`
    REQUEST_TIME=`echo "$BENCHMARK" | grep 'Average request time:' | sed -n '1p' | cut -d ' ' -s -f 4`

    if [ "$AGGREGATE_REQUESTS" = '' ]
    then
      AGGREGATE_REQUESTS=$REQUESTS
      AGGREGATE_REQUESTS_PER_SECOND=$REQUESTS_PER_SECOND
      AGGREGATE_REQUEST_TIME=$REQUEST_TIME
    else
      AGGREGATE_REQUESTS="$AGGREGATE_REQUESTS $REQUESTS"
      AGGREGATE_REQUESTS_PER_SECOND="$AGGREGATE_REQUESTS_PER_SECOND $REQUESTS_PER_SECOND"
      AGGREGATE_REQUEST_TIME="$AGGREGATE_REQUEST_TIME $REQUEST_TIME"
    fi

    INDEX=`expr $INDEX + 1`
  done

  cd "$THIS_DIR"

  echo "$1 number of requests: $AGGREGATE_REQUESTS"
  echo "$1 requests per second: $AGGREGATE_REQUESTS_PER_SECOND"
  echo "$1 request time: $AGGREGATE_REQUEST_TIME"
}

run_tests "Benchmark"

if [ "$2" = '' ]
then
  echo 'No metrics.conf path specified. Run the metrics loop separately,'
  read -rsp 'then press any key to continue...' -n 1 key
  echo
else
  "`dirname $0`/metrics-loop.sh" "$2" &
  METRICS_PID=$!
fi

run_tests "  Metrics"

if [ "$2" = '' ]
then
  echo 'You may now kill your metrics loop.'
else
  kill -15 $METRICS_PID
fi

