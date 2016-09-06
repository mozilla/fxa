/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Ensure the CSP headers are only added to the appropriate requests

define([
  'intern!object',
  'intern/chai!assert',
  'intern/dojo/node!../../server/lib/csp',
  'intern/dojo/node!../../server/lib/csp/blocking',
], function (registerSuite, assert, csp, blockingRules) {

  var suite = {
    name: 'csp'
  };

  suite['isCspRequired'] = function () {
    assert.isFalse(csp.isCspRequired({ method: 'POST', path: '/csp_report' }));
    assert.isFalse(csp.isCspRequired({ method: 'GET', path: '/tests/index.html'}));
    assert.isFalse(csp.isCspRequired({ method: 'GET', path: '/lib/router.js' }));
    assert.isFalse(csp.isCspRequired({ method: 'GET', path: '/images/firefox.png' }));
    assert.isFalse(csp.isCspRequired({ method: 'GET', path: '/fonts/clearsans.woff' }));

    assert.isTrue(csp.isCspRequired({ method: 'GET', path: '/404.html' }));
    assert.isTrue(csp.isCspRequired({ method: 'GET', path: '/' }));
    assert.isTrue(csp.isCspRequired({ method: 'GET', path: '/confirm' }));
  };

  registerSuite(suite);
});

