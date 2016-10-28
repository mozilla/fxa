/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern!object',
  'tests/lib/helpers',
  'tests/functional/lib/helpers'
], function (registerSuite, TestHelpers, FunctionalHelpers)  {
  var PASSWORD = 'password';
  var email;

  var clearBrowserState = FunctionalHelpers.clearBrowserState;
  var createUser = FunctionalHelpers.createUser;

  registerSuite({
    name: 'delete_account',

    beforeEach: function () {
      email = TestHelpers.createEmail();

      return this.remote
        .then(clearBrowserState())
        .then(createUser(email, PASSWORD, { preVerified: true }));
    },

    afterEach: function () {
      return this.remote.then(clearBrowserState());
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
