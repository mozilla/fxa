/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const joi = require('joi');
const URL = require('url').URL;

const TIMESTAMP_MS = joi.number().required();
// Validate the subset of PerformanceNavgationTiming properties used here.
// (Ref: https://www.w3.org/TR/navigation-timing-2/#dom-performancenavigationtiming)
const navigationTimingSchema = joi.object().keys({
  domainLookupStart: TIMESTAMP_MS.min(0),
  domComplete: TIMESTAMP_MS.min(joi.ref('domInteractive')),
  domInteractive: TIMESTAMP_MS.min(joi.ref('responseEnd')),
  loadEventEnd: TIMESTAMP_MS.min(joi.ref('loadEventStart')),
  loadEventStart: TIMESTAMP_MS.min(joi.ref('domComplete')),
  name: joi.string().uri().required(),
  redirectStart: TIMESTAMP_MS,
  requestStart: TIMESTAMP_MS.min(joi.ref('domainLookupStart')),
  responseEnd: TIMESTAMP_MS.min(joi.ref('responseStart')),
  responseStart: TIMESTAMP_MS.min(joi.ref('requestStart')),
});

module.exports = (statsd) => ({
  method: 'post',
  path: '/navigation-timing',
  validate: { body: navigationTimingSchema },
  preProcess: function (req, res, next) {
    // convert text/plain to JSON
    if (req.get('content-type').startsWith('text/plain')) {
      try {
        req.body = JSON.parse(req.body);
      } catch (error) {
        req.body = {};
      }
    }

    next();
  },
  process(request, response) {
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
