/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Wrapper for Helment HPKP middleware. Instead of using Helmet directly,
 * we can add some extra logic checks if needed. This follows similar pattern as CSP.
 */

'use strict';
const helmet = require('helmet');

module.exports = function (config) {
  const hpkpMiddleware = helmet.hpkp({
    includeSubdomains: config.get('hpkp.includeSubDomains'),
    maxAge: config.get('hpkp.maxAge'), // param is now seconds since Helmet 3
    reportOnly: config.get('hpkp.reportOnly'),
    reportUri: config.get('hpkp.reportUri'),
    sha256s: config.get('hpkp.sha256s')
  });

  return function (req, res, next) {
    if (! config.get('hpkp.enabled')) {
      return next();
    }

    hpkpMiddleware(req, res, next);
  };
};
