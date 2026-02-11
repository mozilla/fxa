/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';
const config = require('./configuration').get('statsd');
const log = require('./logging/log')('server.statsd');
const NOOP = () => {};
const StatsD = require('hot-shots');

const noopStatsd = () => {
  const mock = {};
  Object.keys(StatsD.prototype).forEach((x) => {
    if (typeof StatsD.prototype[x] === 'function') {
      mock[x] = NOOP;
    }
  });
  return mock;
};

const statsd = config.enabled
  ? new StatsD({
      ...config,
      errorHandler: (err) => {
        // eslint-disable-next-line no-use-before-define
        log.error('statsd.error', err);
      },
    })
  : noopStatsd();

module.exports = statsd;
