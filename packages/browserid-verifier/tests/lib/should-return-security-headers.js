/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var should = require('should');

function shouldReturnSecurityHeaders(res) {
  var expect = {
    'strict-transport-security': 'max-age=15552000',
    'x-content-type-options': 'nosniff',
    'x-xss-protection': '1; mode=block',
    'x-frame-options': 'DENY',
    'cache-control': 'private, no-cache, no-store, must-revalidate, max-age=0',
    'content-security-policy':
      "default-src 'none'; frame-ancestors 'none'; report-uri /__cspreport__",
  };

  Object.keys(expect).forEach(function(header) {
    should.exist(res.headers[header]);
    res.headers[header].should.equal(expect[header]);
  });
}

module.exports = shouldReturnSecurityHeaders;
