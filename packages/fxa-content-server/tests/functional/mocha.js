/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'intern/chai!assert',
  'intern/dojo/node!../../server/lib/configuration',
  'require'
], function (intern, registerSuite, assert, config, require) {
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
        .setFindTimeout(intern.config.pageLoadTimeout)
        // wait for the tests to complete
        .findById('total-failures')
        .end()
        //
        // Save the body text in case there are any errors
        .findByCssSelector('body')
        .getVisibleText()
          .then(function (text) {
            bodyText = text;
          })
        .end()

        // Check for any failures, if there is a failure, print the
        // test log and fail.
        .findById('total-failures')
        .getVisibleText()
          .then(function (text) {
            if (text !== '0') {
              console.log(bodyText);
            }
            assert.equal(text, '0');
          })
        .end()

        // check for code coverage now.


        // check for the grand total
        .findByCssSelector('.grand-total .rs')
        .getVisibleText()
          .then(function (text) {
            text = text.replace('%', '').trim();
            var covered = parseFloat(text);
            assert.ok(covered > config.get('tests.coverage.globalThreshold'),
                'code coverage is insufficient at ' + text + '%');
          })
        .end()

        // any individual failures?
        .findByCssSelector('.bl-error .bl-file a')
        .then(
          function() {
            throw new Error('Blanket.js Errors');
          },
          function(err) {
            // No Blanket.js errors
            assert.strictEqual(err.name, 'NoSuchElement');
          }
        )
        .end();

    }
  });
});
