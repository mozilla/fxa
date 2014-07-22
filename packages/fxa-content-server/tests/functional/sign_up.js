/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'intern/chai!assert',
  'require',
  'intern/node_modules/dojo/node!xmlhttprequest',
  'intern/node_modules/dojo/node!leadfoot/helpers/pollUntil',
  'app/bower_components/fxa-js-client/fxa-client',
  'tests/lib/helpers',
  'tests/functional/lib/helpers'
], function (intern, registerSuite, assert, require, nodeXMLHttpRequest, pollUntil, FxaClient, TestHelpers, FunctionalHelpers) {
  'use strict';

  var config = intern.config;
  var AUTH_SERVER_ROOT = config.fxaAuthRoot;
  var PAGE_URL = config.fxaContentRoot + 'signup';

  var TOO_YOUNG_YEAR = new Date().getFullYear() - 13;

  registerSuite({
    name: 'sign_up',

    beforeEach: function () {
      return FunctionalHelpers.clearBrowserState(this);
    },

    teardown: function () {
      return FunctionalHelpers.clearBrowserState(this);
    },

    'sign up': function () {
      var email = TestHelpers.createEmail();
      var password = '12345678';

      return this.get('remote')
        .get(require.toUrl(PAGE_URL))
        .setFindTimeout(intern.config.pageLoadTimeout)
        .findByCssSelector('form input.email')
          .click()
          .type(email)
        .end()

        .findByCssSelector('form input.password')
          .click()
          .type(password)
        .end()

        .findByCssSelector('#fxa-age-year')
          .click()
        .end()

        .findById('fxa-' + (TOO_YOUNG_YEAR - 1))
          .pressMouseButton()
          .releaseMouseButton()
          .click()
        .end()

        .findByCssSelector('button[type="submit"]')
          .click()
        .end()

        // Being pushed to the confirmation screen is success.
        .findByCssSelector('.verification-email-message')
          .getVisibleText()
          .then(function (resultText) {
            // check the email address was written
            assert.ok(resultText.indexOf(email) > -1);
          })
        .end();
    },

    'select an age that is too young': function () {
      var email = TestHelpers.createEmail();
      var password = '12345678';

      return this.get('remote')
        .get(require.toUrl(PAGE_URL))
        .findByCssSelector('form input.email')
          .click()
          .type(email)
        .end()

        .findByCssSelector('form input.password')
          .click()
          .type(password)
        .end()

        .findByCssSelector('#fxa-age-year')
          .click()
        .end()

        .findById('fxa-' + TOO_YOUNG_YEAR)
          .pressMouseButton()
          .releaseMouseButton()
          .click()
        .end()

        .findByCssSelector('button[type="submit"]')
          .click()
        .end()

        // Success is being redirected to the cannot create screen.
        .findById('fxa-cannot-create-account-header')
        .end();
    },

    'choose option to customize sync': function () {
      var urlForSync = PAGE_URL + '?service=sync';

      var email = TestHelpers.createEmail();
      var password = '12345678';

      return this.get('remote')
        .get(require.toUrl(urlForSync))
        .findByCssSelector('form input.email')
          .click()
          .type(email)
        .end()

        .findByCssSelector('form input.password')
          .click()
          .type(password)
        .end()

        .findByCssSelector('#fxa-age-year')
          .click()
        .end()

        .findById('fxa-' + (TOO_YOUNG_YEAR - 1))
          .pressMouseButton()
          .releaseMouseButton()
          .click()
        .end()

        .findByCssSelector('form input.customize-sync')
          .click()
        .end()

        .findByCssSelector('button[type="submit"]')
          .click()
        .end()

        // Being pushed to the confirmation screen is success.
        .findById('fxa-confirm-header')
        .end();
    },

    'sign up with a verified account forces the user to sign in': function () {

      var self = this;
      var email = TestHelpers.createEmail();
      var password = '12345678';

      var client = new FxaClient(AUTH_SERVER_ROOT, {
        xhr: nodeXMLHttpRequest.XMLHttpRequest
      });

      return client.signUp(email, password, { preVerified: true })
        .then(function () {
          return self.get('remote')
            .get(require.toUrl(PAGE_URL))
            .findByCssSelector('input[type=email]')
              .click()
              .clearValue()
              .type(email)
            .end()

            .findByCssSelector('input[type=password]')
              .click()
              .type(password)
            .end()

            .findByCssSelector('#fxa-age-year')
              .click()
            .end()

            .findById('fxa-' + (TOO_YOUNG_YEAR - 1))
              .pressMouseButton()
              .releaseMouseButton()
              .click()
            .end()

            .findByCssSelector('button[type="submit"]')
              .click()
            .end()

            // The error area shows a link to /signin
            .findByCssSelector('.error a[href="/signin"]')
              .click()
            .end()

            .findByCssSelector('input[type=email]')
              .getAttribute('value')
              .then(function (resultText) {
                // check the email address carried over.
                assert.equal(resultText, email);
              })
            .end()

            .findByCssSelector('input[type=password]')
              .getAttribute('value')
              .then(function (resultText) {
                // check the password carried over.
                assert.equal(resultText, password);
              })
            .end();
        });
    },

    'sign up with an unverified account and different password re-signs up user': function () {

      var self = this;
      var email = TestHelpers.createEmail();
      var password = '12345678';

      var client = new FxaClient(AUTH_SERVER_ROOT, {
        xhr: nodeXMLHttpRequest.XMLHttpRequest
      });

      return client.signUp(email, password)
        .then(function () {
          return self.get('remote')
            .get(require.toUrl(PAGE_URL))
            .findByCssSelector('input[type=email]')
              .click()
              .type(email)
            .end()

            .findByCssSelector('input[type=password]')
              .click()
              .type('different_password')
            .end()

            .findByCssSelector('#fxa-age-year')
              .click()
            .end()

            .findById('fxa-' + (TOO_YOUNG_YEAR - 1))
              .pressMouseButton()
              .releaseMouseButton()
              .click()
            .end()

            .findByCssSelector('button[type="submit"]')
              .click()
            .end()

            // Being pushed to the confirmation screen is success.
            .findByCssSelector('.verification-email-message')
              .getVisibleText()
              .then(function (resultText) {
                // check the email address was written
                assert.ok(resultText.indexOf(email) > -1);
              })
            .end();
        });
    },

    'visiting the tos/pp links saves information for return': function () {
      var self = this;
      return testRepopulateFields.call(self, '/legal/terms', 'fxa-tos-header')
              .then(function () {
                return testRepopulateFields.call(self, '/legal/privacy', 'fxa-pp-header');
              });
    }
  });

  function testRepopulateFields(dest, header) {
    /*jshint validthis: true*/
    var self = this;
    var email = TestHelpers.createEmail();
    var password = '12345678';
    var year = TOO_YOUNG_YEAR - 1;

    return self.get('remote')
      .get(require.toUrl(PAGE_URL))
      .findByCssSelector('input[type=email]')
        .clearValue()
        .click()
        .type(email)
      .end()

      .findByCssSelector('input[type=password]')
        .clearValue()
        .click()
        .type(password)
      .end()

      .findByCssSelector('#fxa-age-year')
        .click()
      .end()

      .findById('fxa-' + year)
        .pressMouseButton()
        .releaseMouseButton()
        .click()
      .end()

      .findByCssSelector('a[href="' + dest + '"]')
        .click()
      .end()

      .findById(header)
      .end()

      .findByCssSelector('.back')
        .click()
      .end()

      .findByCssSelector('input[type=email]')
        .getProperty('value')
        .then(function (resultText) {
          // check the email address was re-populated
          assert.equal(resultText, email);
        })
      .end()

      .findByCssSelector('input[type=password]')
        .getProperty('value')
        .then(function (resultText) {
          // check the email address was re-populated
          assert.equal(resultText, password);
        })
      .end()

      .findByCssSelector('#fxa-age-year')
        .getProperty('value')
        .then(function (resultText) {
          // check the email address was re-populated
          assert.equal(resultText, year);
        })
      .end();
  }
});
