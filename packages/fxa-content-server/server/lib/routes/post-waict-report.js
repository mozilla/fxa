/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Collect WAICT integrity violation reports.
 *
 * In report mode the browser does not block anything; it sends `waict-violation`
 * reports here via the Reporting API so we can find scripts whose hashes are
 * missing from, or do not match, the manifest. The Reporting API delivers a
 * JSON array of reports with content-type `application/reports+json`.
 */

'use strict';
const logger = require('../logging/log')();
const url = require('url');

function stripPIIFromUrl(urlToScrub) {
  if (!urlToScrub || typeof urlToScrub !== 'string') {
    return '';
  }

  let parsedUrl;
  try {
    parsedUrl = url.parse(urlToScrub, true);
  } catch (e) {
    return '';
  }

  if (!parsedUrl.query.email && !parsedUrl.query.uid) {
    return urlToScrub;
  }

  delete parsedUrl.query.email;
  delete parsedUrl.query.uid;
  delete parsedUrl.search;

  return url.format(parsedUrl);
}

module.exports = function (options = {}) {
  const statsd = options.statsd;

  return {
    method: 'post',
    path: options.path,
    process: function (req, res) {
      // Acknowledge immediately; reports are best-effort telemetry.
      res.json({ success: true });

      // The Reporting API sends an array of reports; older/other delivery may
      // send a single object. Normalize to an array.
      const reports = Array.isArray(req.body) ? req.body : [req.body];

      reports.forEach((report) => {
        if (!report || typeof report !== 'object') {
          return;
        }

        const body = report.body || {};

        // Emit an operational counter so violations are alertable as a
        // time-series, tagged by reason (missing_from_manifest,
        // no_manifest_match, invalid_manifest).
        if (statsd) {
          statsd.increment('waict.violation', 1, {
            reason: body.reason || 'unknown',
          });
        }

        logger.info(options.op, {
          agent: req.get('User-Agent'),
          type: report.type,
          // The resource that failed integrity and the reason (e.g.
          // missing_from_manifest, no_manifest_match, invalid_manifest).
          reason: body.reason,
          blocked: stripPIIFromUrl(body.blockedURL || body.blocked_url),
          documentURL: stripPIIFromUrl(
            body.documentURL || body.documentURI || report.url
          ),
          destination: body.destination,
        });
      });
    },
  };
};
