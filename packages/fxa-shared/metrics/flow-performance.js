/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const MAX_DATA_LENGTH = 100;
const VERSION = 1;
const PERFORMANCE_TIMINGS = [
  // These timings are only an approximation, to be used as extra signals
  // when looking for correlations in the flow data. They're not perfect
  // representations, for instance:
  //
  //   * `network` includes fetching from the browser cache.
  //   * `server` includes some network time.
  //   * `client` is only a subset of the client-side processing time.
  //
  // Bear this in mind when looking at the data. The main `flow.performance`
  // event represents our best approximation of overall, user-perceived
  // performance.
  {
    event: 'network',
    timings: [
      { from: 'redirectStart', until: 'redirectEnd' },
      { from: 'domainLookupStart', until: 'domainLookupEnd' },
      { from: 'connectStart', until: 'connectEnd' },
      { from: 'responseStart', until: 'responseEnd' },
    ],
  },
  {
    event: 'server',
    timings: [{ from: 'requestStart', until: 'responseStart' }],
  },
  {
    event: 'client',
    timings: [{ from: 'domLoading', until: 'domComplete' }],
  },
];

function limitLength(data) {
  if (data && data.length > MAX_DATA_LENGTH) {
    return data.substr(0, MAX_DATA_LENGTH);
  }

  return data;
}

function isValidTime(time, requestReceivedTime, expiry) {
  if (typeof time !== 'number') {
    return false;
  }

  const age = requestReceivedTime - time;
  if (age > expiry || age < 0 || isNaN(age)) {
    return false;
  }

  return true;
}

module.exports = {
  VERSION,
  PERFORMANCE_TIMINGS,
  limitLength,
  isValidTime,
};
