/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Ensure the headers to prevent indexing are only added to the appropriate requests

define([
  'intern!object',
  'intern/chai!assert',
  'intern/dojo/node!../../server/lib/noindex',
], function (registerSuite, assert, noindex) {

  var suite = {
    name: 'noindex'
  };

  suite['isRobotsTagRequried'] = function () {
    assert.isFalse(noindex.isRobotsTagRequired({ path: '/lib/router.js' }));
    assert.isFalse(noindex.isRobotsTagRequired({ path: '/images/firefox.png' }));
    assert.isFalse(noindex.isRobotsTagRequired({ path: '/fonts/clearsans.woff' }));

    assert.isTrue(noindex.isRobotsTagRequired({ path: '/tests/index.html' }));
    assert.isTrue(noindex.isRobotsTagRequired({ path: '/404.html' }));
    assert.isTrue(noindex.isRobotsTagRequired({ path: '/' }));
    assert.isTrue(noindex.isRobotsTagRequired({ path: '/confirm' }));
  };

  registerSuite(suite);
});

