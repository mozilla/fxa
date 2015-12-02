/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Route to report CSP Violations to metrics
 */

module.exports = function (options) {
  options = options || {};

  /**
   * 'reportSampleRate' % of messages.
   * @param reportSampleRate
   * @returns {boolean}
   */
  function isSampledUser() {
    // random between 0 and 100, inclusive
    var rand = Math.floor(Math.random() * (100 + 1));
    return rand < options.reportSampleRate;
  }

  return {
    method: 'post',
    path: options.path,
    process: function (req, res) {
      res.json({result: 'ok'});

      // TODO: This is a temporary measure
      // Not sure how many CSP errors we will get, for now we rate limit this.
      // To avoid overflowing Heka logs rate limit the logging
      if (! isSampledUser()) {
        return false;
      }

      if (! req.body || ! req.body['csp-report']) {
        return false;
      }

      var today = new Date();
      today.setMinutes(0, 0, 0);
      var report = req.body['csp-report'];

      var entry = {
        blocked: report['blocked-uri'],
        op: 'server.csp',
        referrer: report['referrer'],
        time: today.toISOString(),
        violated: report['violated-directive']
      };

      process.stderr.write(JSON.stringify(entry) + '\n');
      return true;
    }
  };
};
