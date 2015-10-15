/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Route to report CSP Violations to metrics
 */

var DEFAULT_SAMPLE_RATE = 10;

module.exports = function (options) {
  options = options || {};

  /**
   * 'sampleRate' % of messages.
   * @param sampleRate
   * @returns {boolean}
   */
  function isSampledUser(sampleRate) {
    var rateLimit = sampleRate;
    // rate limit can be 0
    if (typeof sampleRate === 'undefined') {
      rateLimit = DEFAULT_SAMPLE_RATE;
    }

    // random between 0 and 100, inclusive
    var rand = Math.floor(Math.random() * (100 + 1));
    return rand <= rateLimit;
  }

  return {
    method: 'post',
    path: '/_/csp-violation',
    process: function (req, res) {
      res.json({result: 'ok'});

      // TODO: This is a temporary measure
      // Not sure how many CSP errors we will get, for now we rate limit this.
      // To avoid overflowing Heka logs rate limit the logging
      if (! isSampledUser(options.sampleRate)) {
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
