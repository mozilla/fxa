/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { assert } = require('chai');
const config = require('../../lib/config').getProperties();

function assertSecurityHeaders(res, expect = {}) {
  expect = {
    'strict-transport-security': 'max-age=31536000; includeSubDomains',
    'x-content-type-options': 'nosniff',
    'x-xss-protection': '1; mode=block',
    'x-frame-options': 'DENY',
    'cache-control': config.cacheControl,
    ...expect,
  };

  Object.keys(expect).forEach(function(header) {
    assert.equal(res.headers[header], expect[header]);
  });
}

module.exports = {
  assertSecurityHeaders: assertSecurityHeaders,
};
