/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern!object',
  'intern/chai!assert',
  'require'
], function (registerSuite, assert, require) {
  'use strict';

  var url = 'http://localhost:3030/tests/index.html';
  var bodyText;

  registerSuite({
    name: 'mocha tests',

    'run the mocha tests': function () {

      return this.get('remote')
        .get(require.toUrl(url))
        // wait for the tests to complete
        .waitForElementById('total-failures')
        //
        // Save the body text in case there are any errors
        .elementsByCssSelector('body')
        .text()
          .then(function (text) {
            bodyText = text;
          })
        .end()

        // Check for any failures, if there is a failure, print the
        // test log and fail.
        .elementById('total-failures')
        .text()
          .then(function (text) {
            if (text !== '0') {
              console.log(bodyText);
            }
            assert.equal(text, '0');
          })
        .end();

    }
  });
});
