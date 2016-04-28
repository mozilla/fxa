/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Middleware to take care of CSP. CSP headers are not sent unless config
// option 'csp.enabled' is set (default true in development), with a special
// exception for the /tests/index.html path, which are the frontend unit
// tests.

var helmet = require('helmet');

function isCspRequired(req) {
  if (req.method !== 'GET') {
    return false;
  }

  var path = req.path;
  // is the user running tests? No CSP.
  if (path === '/tests/index.html') {
    return false;
  }

  // Only HTML files need CSP headers. Our convention is either .html
  // extensions or extensionless requests are HTML files. We can't check
  // the response's Content-Type header yet because the response
  // hasn't yet been rendered.
  return /\.html$/.test(path) || ! /\.[a-zA-Z0-9]+$/.test(path);
}

module.exports = function (config) {
  var cspMiddleware = helmet.csp(config.rules);

  return function (req, res, next) {
    if (! isCspRequired(req)) {
      return next();
    }

    cspMiddleware(req, res, next);
  };
};

module.exports.isCspRequired = isCspRequired;
