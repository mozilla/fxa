/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Route to report CSP Violations to metrics
 */

var _ = require('lodash');
var url = require('url');

module.exports = function (options) {
  options = options || {};

  var write = options.write || function (entry) {
    process.stderr.write(JSON.stringify(entry) + '\n');
  };

  return {
    method: 'post',
    path: options.path,
    process: function (req, res) {
      res.json({result: 'ok'});

      if (! isValidCspReportRequest(req)) {
        return false;
      }

      var today = new Date();
      today.setMinutes(0, 0, 0);
      var report = req.body['csp-report'];

      var entry = {
        agent: req.get('User-Agent'),
        blocked: report['blocked-uri'],
        column: report['column-number'],
        line: report['line-number'],
        op: 'server.csp',
        referrer: stripPIIFromUrl(report['referrer']),
        sample: report['script-sample'],
        source: stripPIIFromUrl(report['source-file']),
        time: today.toISOString(),
        violated: report['violated-directive'],
      };

      write(entry);

      return true;
    }
  };
};

function isValidCspReportRequest(req) {
  return req.body &&
         req.body['csp-report'] &&
         Object.keys(req.body['csp-report']).length;
}

function stripPIIFromUrl(urlToScrub) {
  if (! urlToScrub || ! _.isString(urlToScrub)) {
    return '';
  }

  var parsedUrl;

  try {
    parsedUrl = url.parse(urlToScrub, true);
  } catch(e) {
    // failed to parse the given url
    return '';
  }

  if (! parsedUrl.query.email && ! parsedUrl.query.uid) {
    return urlToScrub;
  }

  delete parsedUrl.query.email;
  delete parsedUrl.query.uid;

  // delete parsedUrl.search or else format returns the old querystring.
  delete parsedUrl.search;

  return url.format(parsedUrl);
}
