/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Middleware to take care of CSP. CSP headers are not sent unless config
// option 'csp.enabled' is set (default true).

'use strict';
const helmet = require('helmet');
const htmlOnly = require('./html-middleware');

module.exports = function(config) {
  const cspMiddleware = helmet.contentSecurityPolicy(config.rules);

  return htmlOnly((req, res, next) => {
    cspMiddleware(req, res, next);
  });
};
