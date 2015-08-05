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
  'tests/lib/helpers',
  'tests/functional/lib/helpers'
], function (intern, registerSuite, assert, require, nodeXMLHttpRequest, FxaClient, TestHelpers, FunctionalHelpers) {
  var config = intern.config;
  var AUTH_SERVER_ROOT = config.fxaAuthRoot;
  var PAGE_URL = config.fxaContentRoot + 'signin';
  var AVATAR_URL = config.fxaContentRoot + 'settings/avatar/change';
  var PASSWORD = 'password';
  var email;
  var accountData;
  var client;

  function verifyUser(user, index) {
    return FunctionalHelpers.getVerificationHeaders(user, index)
      .then(function (headers) {
        var code = headers['x-verify-code'];
        return client.verifyCode(accountData.uid, code);
      });
  }

  function fillOutSignIn(context, email, password) {
    return FunctionalHelpers.fillOutSignIn(context, email, password);
  }

  registerSuite({
    name: 'sign_in',

    beforeEach: function () {
      email = TestHelpers.createEmail();
      client = new FxaClient(AUTH_SERVER_ROOT, {
        xhr: nodeXMLHttpRequest.XMLHttpRequest
      });

      return FunctionalHelpers.clearBrowserState(this)
        .then(function () {
          return client.signUp(email, PASSWORD);
        })
        .then(function (result) {
          accountData = result;
        });
    },

    afterEach: function () {
      return FunctionalHelpers.clearBrowserState(this);
    },

    'sign in unverified': function () {
      return fillOutSignIn(this, email, PASSWORD)
        .findByCssSelector('.verification-email-message')
          .getVisibleText()
          .then(function (resultText) {
            // check the email address was written
            assert.ok(resultText.indexOf(email) > -1);
          })
        .end();
    },

    'redirect to requested page after sign in verified with correct password': function () {
      var self = this;
      return verifyUser(email, 0)
        .then(function () {
          return FunctionalHelpers.openPage(self, AVATAR_URL, '#fxa-signin-header');
        })
        .then(function () {
          return fillOutSignIn(self, email, PASSWORD)
            .findById('fxa-avatar-change-header')
            .end();
        });
    },

    'sign in verified with correct password': function () {
      var self = this;
      return verifyUser(email, 0)
        .then(function () {
          return fillOutSignIn(self, email, PASSWORD)
            // success is seeing the sign-in-complete screen.
            .findById('fxa-settings-header')
            .end();
        });
    },

    'sign in verified with incorrect password, click `forgot password?`': function () {
      var self = this;
      return verifyUser(email, 0)
        .then(function () {
          return fillOutSignIn(self, email, 'incorrect password')
            // success is seeing the error message.
            .then(FunctionalHelpers.visibleByQSA('.error'))

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
      var email = TestHelpers.createEmail();
      return fillOutSignIn(this, email, PASSWORD)
        // The error area shows a link to /signup
        .then(FunctionalHelpers.visibleByQSA('.error a[href="/signup"]'))
        .findByCssSelector('.error a[href="/signup"]')
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

    'sign in with email with leading space strips space': function () {
      var self = this;
      return verifyUser(email, 0)
        .then(function () {
          return fillOutSignIn(self, '   ' + email, PASSWORD)
            // success is seeing the sign-in-complete screen.
            .findById('fxa-settings-header')
            .end();
        });
    },

    'sign in with email with trailing space strips space': function () {
      var self = this;

      return verifyUser(email, 0)
        .then(function () {
          return fillOutSignIn(self, email + '   ', PASSWORD)
            // success is seeing the sign-in-complete screen.
            .findById('fxa-settings-header')
            .end();
        });
    },

    'sign in verified with password that incorrectly has leading whitespace': function () {
      var self = this;
      return verifyUser(email, 0)
        .then(function () {
          return fillOutSignIn(self, email, '  ' + PASSWORD)

            // success is seeing the error message.
           .then(FunctionalHelpers.visibleByQSA('.error'))
           .end()

           .findByCssSelector('.error')
             .getVisibleText()
             .then(function (text) {
               assert.isTrue(/password/i.test(text));
             })
           .end();
        });
    },

    'visiting the pp links saves information for return': function () {
      return testRepopulateFields.call(this, '/legal/terms', 'fxa-tos-header');
    },

    'visiting the tos links saves information for return': function () {
      return testRepopulateFields.call(this, '/legal/privacy', 'fxa-pp-header');
    }
  });

  function testRepopulateFields(dest, header) {
    var self = this;
    var email = TestHelpers.createEmail();
    var password = '12345678';

    return self.remote
      .get(require.toUrl(PAGE_URL))
      .setFindTimeout(intern.config.pageLoadTimeout)

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
