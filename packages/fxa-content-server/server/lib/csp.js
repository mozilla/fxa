/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// middleware to take care of CSP. CSP headers are only sent in development
// mode, and are not sent if the user is running the unit tests.

'use strict';

var helmet = require('helmet');
var config = require('./configuration');

var cspMiddleware = helmet.csp({'default-src': ['\'self\''],
                    'connect-src': ['\'self\'',
                          config.get('fxaccount_url'),
                          config.get('oauth_url')
                    ],
                    'report-uri': '/_/csp-violation'
                   });

module.exports = function (req, res, next) {
  if (! requiresCsp(req)) {
    return next();
  }

  cspMiddleware(req, res, next);
};

function requiresCsp(req) {
  // is the user running tests? No CSP.
  return req.path !== '/tests/index.html';
}
