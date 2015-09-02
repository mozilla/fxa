#!/bin/sh

# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

# This script should not be run directly. It is invoked by metrics-perf.sh
# to repeatedly and serially execute the metrics queries in a background
# process.

while :
do
  "`dirname $0`/../bin/metrics.js" "$1" > /dev/null 2>&1
done

