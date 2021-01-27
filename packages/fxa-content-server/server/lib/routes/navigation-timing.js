/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const URL = require('url').URL;
const {
  navigationTimingSchema,
} = require('fxa-shared/metrics/navigation-timing-validation');

module.exports = (config, statsd) => ({
  method: 'post',
  path: '/navigation-timing',
  validate: { body: navigationTimingSchema },
  preProcess: (_, res, next) => {
    if (!config.get('statsd').enabled) {
      res.status(200).end();
    } else {
      next();
    }
  },
  process: (request, response) => {
    try {
      const nt = request.body;
      const url = new URL(nt.name);
      const path = url.pathname
        .split('/')
        .filter((x) => !!x)
        .join('_');
      const tags = { path };

      statsd.timing(
        'nt.network',
        nt.responseStart - nt.domainLookupStart,
        tags
      );
      statsd.timing('nt.request', nt.responseStart - nt.requestStart, tags);
      statsd.timing('nt.response', nt.responseEnd - nt.responseStart, tags);
      statsd.timing('nt.dom', nt.domComplete - nt.domInteractive, tags);
      statsd.timing('nt.load', nt.loadEventEnd - nt.loadEventStart, tags);
      statsd.timing('nt.total', nt.loadEventEnd - nt.redirectStart, tags);
    } catch (e) {
      // NOOP
    }

    response.status(200).end();
  },
});
