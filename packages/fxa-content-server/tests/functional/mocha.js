/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'intern/chai!assert',
  'require'
], function (intern, registerSuite, assert, require) {
  'use strict';

  var url = intern.config.fxaContentRoot + 'tests/index.html?coverage';
  var bodyText;

  registerSuite({
    name: 'mocha tests',

    'run the mocha tests': function () {
      // timeout after 200 seconds
      this.timeout = 200000;

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
        .end()

        // check for code coverage now.


        // check for the grand total
        .waitForElementByCssSelector('.grand-total .rs')
        .elementByCssSelector('.grand-total .rs')
        .text()
          .then(function (text) {
            text = text.replace('%', '').trim();
            var covered = parseFloat(text);
            assert.ok(covered > 90, 'not enough code coverage!');
          })
        .end()

        // any individual failures?
        .elementsByCssSelector('.bl-error .bl-file a')
        .then(function(elements) {
          assert.equal(elements.length, 0, 'all modules have sufficient coverage');
        })
        .end();

    }
  });
});
