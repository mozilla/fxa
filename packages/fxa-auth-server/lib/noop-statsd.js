/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

/**
 * No-op StatsD client used when metrics collection is disabled.
 * Must implement every method invoked via optional chaining on the
 * metrics object (e.g. redis histogram calls).
 */
function createNoopStatsd() {
  return {
    increment: () => {},
    timing: () => {},
    histogram: () => {},
    close: () => {},
  };
}

module.exports = { createNoopStatsd };
