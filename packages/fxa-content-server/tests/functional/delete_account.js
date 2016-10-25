/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'intern/browser_modules/dojo/node!xmlhttprequest',
  'app/bower_components/fxa-js-client/fxa-client',
  'tests/lib/helpers',
  'tests/functional/lib/helpers'
], function (intern, registerSuite, nodeXMLHttpRequest,
      FxaClient, TestHelpers, FunctionalHelpers)  {
  var config = intern.config;
  var AUTH_SERVER_ROOT = config.fxaAuthRoot;

  var PASSWORD = 'password';
  var email;
  var client;

  registerSuite({
    name: 'delete_account',

    beforeEach: function () {
      email = TestHelpers.createEmail();

      client = new FxaClient(AUTH_SERVER_ROOT, {
        xhr: nodeXMLHttpRequest.XMLHttpRequest
      });

      var self = this;
      return client.signUp(email, PASSWORD, { preVerified: true })
        .then(function () {
          return FunctionalHelpers.clearBrowserState(self);
        });
    },

    afterEach: function () {
      return FunctionalHelpers.clearBrowserState(this);
    },

    'sign in, delete account': function () {
      var self = this;
      return FunctionalHelpers.fillOutSignIn(this, email, PASSWORD)
        .findById('fxa-settings-header')
        .end()

        // Go to delete account screen
        .findByCssSelector('#delete-account .settings-unit-toggle')
          .click()
        .end()

        // success is going to the delete account page
        .then(FunctionalHelpers.visibleByQSA('#delete-account'))

        .then(function () {
          return FunctionalHelpers.fillOutDeleteAccount(self, PASSWORD);
        })

        // success is going to the signup page
        .findById('fxa-signup-header')
        .end()

        .then(FunctionalHelpers.testSuccessWasShown(self));
    },

    'sign in, cancel delete account': function () {
      return FunctionalHelpers.fillOutSignIn(this, email, PASSWORD)
        .findById('fxa-settings-header')
        .end()

        // Go to delete account screen
        .findByCssSelector('#delete-account .settings-unit-toggle')
          .click()
        .end()

        // success is going to the delete account page
        .then(FunctionalHelpers.visibleByQSA('#delete-account'))

        .findByCssSelector('#delete-account .cancel')
          .click()
        .end()

        // success is going to the signup page
        .findById('fxa-settings-header')
        .end();
    }
  });
});
