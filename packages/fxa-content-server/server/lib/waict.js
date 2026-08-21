/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Middleware that emits the WAICT (Web Application Integrity, Consistency and
// Transparency) `Integrity-Policy-WAICT-v1` response header in *report* mode.

'use strict';
const htmlOnly = require('./html-middleware');

// The report endpoint is advertised under this name in both the
// `Reporting-Endpoints` header and the WAICT header's `endpoints` parameter.
// Must be `default` - the Reporting API's reserved fallback endpoint, which is
// where WAICT violation reports are delivered.
const REPORT_ENDPOINT_NAME = 'default';

/**
 * Build the `Integrity-Policy-WAICT-v1` structured-field header value.
 *
 * @param {Object} config waict configuration
 * @returns {String}
 */
function buildHeaderValue(config) {
  // `blocked-destinations` is a structured-field inner list of tokens, e.g.
  // `(script style)`. Scoping to `script` limits coverage to JavaScript.
  const destinations = config.blockedDestinations.join(' ');

  // `manifest` is an sf-string and must be quoted. `mode=report` is what makes
  // this non-blocking. `max-age` of 0 means downgrade protection is not pinned,
  // which is appropriate while iterating in report mode.
  return [
    `max-age=${config.maxAge}`,
    'mode=report',
    `blocked-destinations=(${destinations})`,
    `endpoints=(${REPORT_ENDPOINT_NAME})`,
    `manifest="${config.manifestPath}"`,
  ].join(', ');
}

module.exports = function (config) {
  const headerValue = buildHeaderValue(config);
  const reportingEndpoints = `${REPORT_ENDPOINT_NAME}="${config.reportUri}"`;
  const statsd = config.statsd;

  return htmlOnly((req, res, next) => {
    // `Reporting-Endpoints` maps the `endpoints` name to a collection URL so
    // the browser knows where to POST `waict-violation` reports.
    res.setHeader('Reporting-Endpoints', reportingEndpoints);
    res.setHeader('Integrity-Policy-WAICT-v1', headerValue);

    // Count every WAICT-protected document served.
    if (statsd) {
      statsd.increment('waict.document_served');
    }

    next();
  });
};

module.exports.buildHeaderValue = buildHeaderValue;
module.exports.REPORT_ENDPOINT_NAME = REPORT_ENDPOINT_NAME;
