/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern!object',
  'intern/chai!assert',
  'require'
], function (registerSuite, assert, require) {
  'use strict';

  var url = 'http://localhost:3030/robots.txt';

  registerSuite({
    name: 'robots.txt',

    'should disallow root': function () {

      return this.get('remote')
        .get(require.toUrl(url))
        .text()
        .then(function(source) {
          assert.isTrue(/Disallow: \//g.test(source));
        })
        .end();
    }

  });
});
