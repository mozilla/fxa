/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// middleware to take care of CSP. CSP headers are only sent in development
// mode, and are not sent if the user is running the unit tests.

'use strict';

var url = require('url');
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
  // only send CSP headers in development mode
  if (config.get('env') !== 'development') {
    return false;
  }

  // is the user running tests? No CSP.
  // The url is parsed to allow for query parameters.
  try {
    if (url.parse(req.url).pathname === '/tests/index.html') {
      return false;
    }
  } catch(e) {
    // If req.url is invalid, url.parse will except. ignore the error.
  }

  // Everyone else gets CSP.
  return true;
}
