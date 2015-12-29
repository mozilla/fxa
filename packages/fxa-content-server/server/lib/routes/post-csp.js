/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Route to report CSP Violations to metrics
 */

module.exports = function (options) {
  options = options || {};

  return {
    method: 'post',
    path: options.path,
    process: function (req, res) {
      res.json({result: 'ok'});

      if (! req.body || ! req.body['csp-report']) {
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
        referrer: report['referrer'],
        sample: report['script-sample'],
        source: report['source-file'],
        time: today.toISOString(),
        violated: report['violated-directive'],
      };

      process.stderr.write(JSON.stringify(entry) + '\n');
      return true;
    }
  };
};
