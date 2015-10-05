/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'intern/chai!assert',
  'intern/node_modules/dojo/node!xmlhttprequest',
  'app/bower_components/fxa-js-client/fxa-client',
  'tests/lib/helpers',
  'tests/functional/lib/helpers'
], function (intern, registerSuite, assert, nodeXMLHttpRequest, FxaClient,
  TestHelpers, FunctionalHelpers) {
  var config = intern.config;
  var AUTH_SERVER_ROOT = config.fxaAuthRoot;
  var FORCE_AUTH_URL = config.fxaContentRoot + 'force_auth';

  var PASSWORD = 'password';
  var email;
  var client;

  function openFxa(context, email) {
    var url = FORCE_AUTH_URL + '?email=' + encodeURIComponent(email);
    return FunctionalHelpers.openPage(context, url, '#fxa-force-auth-header');
  }

  registerSuite({
    name: 'force_auth with an existing user',

    beforeEach: function () {
      email = TestHelpers.createEmail();
      client = new FxaClient(AUTH_SERVER_ROOT, {
        xhr: nodeXMLHttpRequest.XMLHttpRequest
      });
      var self = this;
      return client.signUp(email, PASSWORD, { preVerified: true })
        .then(function () {
          // clear localStorage to avoid polluting other tests.
          return FunctionalHelpers.clearBrowserState(self);
        });
    },

    'sign in via force_auth': function () {
      var self = this;
      return openFxa(self, email)

        .then(function () {
          return FunctionalHelpers.fillOutForceAuth(self, PASSWORD);
        })

        .findById('fxa-settings-header')
        .end();
    },

    'forgot password flow via force-auth goes directly to confirm email screen': function () {
      var self = this;
      return openFxa(self, email)
        .findByCssSelector('.reset-password')
          .click()
        .end()

        .findById('fxa-confirm-reset-password-header')
        .end()

        // user remembers her password, clicks the "sign in" link. They
        // should go back to the /force_auth screen.
        .findByClassName('sign-in')
          .click()
        .end()

        .findById('fxa-force-auth-header');
    },

    'visiting the tos/pp links saves information for return': function () {
      var self = this;
      return testRepopulateFields.call(self, '/legal/terms', 'fxa-tos-header')
        .then(function () {
          return testRepopulateFields.call(self, '/legal/privacy', 'fxa-pp-header');
        });
    },

    'form prefill information is cleared after sign in->sign out': function () {
      var self = this;
      return openFxa(self, email)

        .then(function () {
          return FunctionalHelpers.fillOutForceAuth(self, PASSWORD);
        })

        .findById('fxa-settings-header')
        .end()

        .findByCssSelector('#signout')
          .click()
        .end()

        .findByCssSelector('#fxa-signin-header')
        .end()

        .findByCssSelector('input[type=password]')
          .getProperty('value')
          .then(function (resultText) {
            // check the password address was cleared
            assert.equal(resultText, '');
          })
        .end();
    }
  });

  registerSuite({
    name: 'force_auth with an unregistered user',

    beforeEach: function () {
      email = TestHelpers.createEmail();
      // clear localStorage to avoid polluting other tests.
      return FunctionalHelpers.clearBrowserState(this);
    },

    'sign in shows an error message': function () {
      var self = this;
      return openFxa(self, email)

        .then(function () {
          return FunctionalHelpers.fillOutForceAuth(self, PASSWORD);
        })

        .then(FunctionalHelpers.visibleByQSA('.error'))
        .end();
    },

    'reset password shows an error message': function () {
      var self = this;
      return openFxa(self, email)
        .findByCssSelector('a[href="/confirm_reset_password"]')
          .click()
        .end()

        .then(FunctionalHelpers.visibleByQSA('.error'))
        .end();
    }
  });


  function testRepopulateFields(dest, header) {
    var self = this;

    return openFxa(self, email)

      .findByCssSelector('input[type=password]')
        .clearValue()
        .click()
        .type(PASSWORD)
      .end()

      .findByCssSelector('a[href="' + dest + '"]')
        .click()
      .end()

      .findById(header)
      .end()

      .findByCssSelector('.back')
        .click()
      .end()

      .findById('fxa-force-auth-header')
      .end()

      .findByCssSelector('input[type=password]')
        .getProperty('value')
        .then(function (resultText) {
          // check the email address was re-populated
          assert.equal(resultText, PASSWORD);
        })
      .end();
  }
});
