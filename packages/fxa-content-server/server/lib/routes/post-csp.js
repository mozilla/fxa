/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Route to report CSP Violations to metrics
 */

var url = require('url');

module.exports = function (options) {
  options = options || {};

  return {
    method: 'post',
    path: options.path,
    process: function (req, res) {
      res.json({result: 'ok'});

      if (! req.body || ! req.body['csp-report'] || ! Object.keys(req.body['csp-report']).length) {
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

      options.write(entry);

      return true;
    }
  };
};

function stripPIIFromUrl(urlToScrub) {
  if (! urlToScrub) {
    return '';
  }
  var parsedUrl = url.parse(urlToScrub, true);

  if (! parsedUrl.query.email && ! parsedUrl.query.uid) {
    return urlToScrub;
  }

  delete parsedUrl.query.email;
  delete parsedUrl.query.uid;

  // delete parsedUrl.search or else format returns the old querystring.
  delete parsedUrl.search;

  return url.format(parsedUrl);
}
