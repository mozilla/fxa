/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'intern/chai!assert',
  'require',
  'intern/node_modules/dojo/node!xmlhttprequest',
  'app/bower_components/fxa-js-client/fxa-client',
  'tests/lib/restmail',
  'tests/lib/helpers',
  'tests/functional/lib/helpers'
], function (intern, registerSuite, assert, require, nodeXMLHttpRequest, FxaClient, restmail, TestHelpers, FunctionalHelpers) {
  'use strict';

  var config = intern.config;
  var AUTH_SERVER_ROOT = config.fxaAuthRoot;
  var EMAIL_SERVER_ROOT = config.fxaEmailRoot;
  var PAGE_URL = config.fxaContentRoot + 'signin';
  var PASSWORD = 'password';
  var user;
  var email;
  var accountData;
  var client;

  registerSuite({
    name: 'sign_in',

    setup: function () {
      email = TestHelpers.createEmail();
      user = TestHelpers.emailToUser(email);
      client = new FxaClient(AUTH_SERVER_ROOT, {
        xhr: nodeXMLHttpRequest.XMLHttpRequest
      });
      var self = this;
      return client.signUp(email, PASSWORD)
        .then(function (result) {
          accountData = result;
          return result;
        })
        .then(function () {
          // clear localStorage to avoid pollution from other tests.
          return FunctionalHelpers.clearBrowserState(self);
        });
    },

    beforeEach: function () {
      return FunctionalHelpers.clearBrowserState(this);
    },

    teardown: function () {
      // clear localStorage to avoid polluting other tests.
      // Without the clear, /signup tests fail because of the info stored
      // in prefillEmail
      return FunctionalHelpers.clearBrowserState(this);
    },

    'sign in unverified': function () {
      return this.get('remote')
        .get(require.toUrl(PAGE_URL))
        .setFindTimeout(intern.config.pageLoadTimeout)
        .findByCssSelector('form input.email')
          .click()
          .type(email)
        .end()

        .findByCssSelector('form input.password')
          .click()
          .type(PASSWORD)
        .end()

        .findByCssSelector('button[type="submit"]')
          .click()
        .end()

        .findByCssSelector('.verification-email-message')
          .getVisibleText()
          .then(function (resultText) {
            // check the email address was written
            assert.ok(resultText.indexOf(email) > -1);
          })
        .end();
    },

    'sign in verified with correct password': function () {
      var self = this;
      return restmail(EMAIL_SERVER_ROOT + '/mail/' + user)
        .then(function (emails) {
          var code = emails[0].html.match(/code=([A-Za-z0-9]+)/)[1];
          return client.verifyCode(accountData.uid, code);
        })
        .then(function () {
          return self.get('remote')
            .get(require.toUrl(PAGE_URL))
            .findByCssSelector('form input.email')
              .clearValue()
              .click()
              .type(email)
            .end()

            .findByCssSelector('form input.password')
              .clearValue()
              .click()
              .type(PASSWORD)
            .end()

            .findByCssSelector('button[type="submit"]')
              .click()
            .end()

            // success is seeing the sign-in-complete screen.
            .findById('fxa-settings-header')
            .end();
        });
    },

    'sign in verified with incorrect password, click `forgot password?`': function () {
      var self = this;
      return restmail(EMAIL_SERVER_ROOT + '/mail/' + user)
        .then(function (emails) {
          var code = emails[0].html.match(/code=([A-Za-z0-9]+)/)[1];
          return client.verifyCode(accountData.uid, code);
        })
        .then(function () {
          return self.get('remote')
            .get(require.toUrl(PAGE_URL))
            .findByCssSelector('form input.email')
              .clearValue()
              .click()
              .type(email)
            .end()

            .findByCssSelector('form input.password')
              .clearValue()
              .click()
              .type('incorrect password')
            .end()

            .findByCssSelector('button[type="submit"]')
              .click()
            .end()

            // success is seeing the error message.
            .findByClassName('error')
            .end()

            // If user clicks on "forgot your password?",
            // begin the reset password flow.
            .findByCssSelector('a[href="/reset_password"]')
              .click()
            .end()

            .findById('fxa-reset-password-header')
            .end();
        });
    },

    'sign in with an unknown account allows the user to sign up': function () {
      var self = this;
      email = TestHelpers.createEmail();
      user = TestHelpers.emailToUser(email);

      return self.get('remote')
        .get(require.toUrl(PAGE_URL))
        .findByCssSelector('input[type=email]')
          .click()
          .clearValue()
          .type(email)
        .end()

        .findByCssSelector('input[type=password]')
          .click()
          .type(PASSWORD)
        .end()

        .findByCssSelector('button[type="submit"]')
          .click()
        .end()

        // The error area shows a link to /signup
        .then(FunctionalHelpers.visibleByQSA('.error a[href="/signup"]'))
        .findByCssSelector('.error a[href="/signup"]')
          .moveMouseTo()
          .click()
        .end()

        .findByCssSelector('input[type=email]')
          .getAttribute('value')
          .then(function (resultText) {
            // check the email address was written
            assert.equal(resultText, email);
          })
        .end()

        .findByCssSelector('input[type=password]')
          .getAttribute('value')
          .then(function (resultText) {
            // check the password carried over.
            assert.equal(resultText, PASSWORD);
          })
        .end();
    },

    'click `forgot password?` link with no email redirects to /forgot_password': function () {
      var self = this;

      return self.get('remote')
        .get(require.toUrl(PAGE_URL))
        .findByCssSelector('input[type=email]')
          .click()
          .clearValue()
        .end()

        .findByCssSelector('a[href="/reset_password"]')
          .click()
        .end()

        .findById('fxa-reset-password-header');
    },

    'click `forgot password?` link with invalid email redirects to /forgot_password and prefills partial email': function () {
      var self = this;
      email = 'partial';

      return self.get('remote')
        .get(require.toUrl(PAGE_URL))
        .findByCssSelector('input[type=email]')
          .click()
          .clearValue()
          .type(email)
        .end()

        .findByCssSelector('a[href="/reset_password"]')
          .click()
        .end()

        .findById('fxa-reset-password-header')
        .end()

        .findByCssSelector('input[type=email]')
          .getAttribute('value')
          .then(function (resultText) {
            // check the email address was written
            assert.equal(resultText, email);
          })
        .end();
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
      .end();
  }
});
