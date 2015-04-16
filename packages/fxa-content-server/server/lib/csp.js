/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Middleware to take care of CSP. CSP headers are not sent unless config
// option 'csp.enabled' is set (default true in development), with a special
// exception for the /tests/index.html path, which are the frontend unit
// tests.

'use strict';

var helmet = require('helmet');
var config = require('./configuration');
var url = require('url');

var SELF = "'self'";
var DATA = 'data:';
var GRAVATAR = 'https://secure.gravatar.com';

function getOrigin(link) {
  var parsed = url.parse(link);
  return parsed.protocol + '//' + parsed.host;
}

var cspMiddleware = helmet.csp({
  defaultSrc: [
    SELF
  ],

  connectSrc: [
    SELF,
    getOrigin(config.get('fxaccount_url')),
    config.get('oauth_url'),
    config.get('profile_url')
  ],

  imgSrc: [
    SELF,
    DATA,
    GRAVATAR,
    config.get('profile_images_url')
  ],

  reportUri: config.get('csp.reportUri'),
  reportOnly: config.get('csp.reportOnly')
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
