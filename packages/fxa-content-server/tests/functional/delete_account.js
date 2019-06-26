/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const TestHelpers = require('../lib/helpers');
const FunctionalHelpers = require('./lib/helpers');
var PASSWORD = 'password';
var email;

var clearBrowserState = FunctionalHelpers.clearBrowserState;
var createUser = FunctionalHelpers.createUser;
var fillOutDeleteAccount = FunctionalHelpers.fillOutDeleteAccount;
var fillOutSignIn = FunctionalHelpers.fillOutSignIn;
var testSuccessWasShown = FunctionalHelpers.testSuccessWasShown;

registerSuite('delete_account', {
  beforeEach: function() {
    email = TestHelpers.createEmail();

    return this.remote
      .then(clearBrowserState())
      .then(createUser(email, PASSWORD, { preVerified: true }));
  },

  afterEach: function() {
    return this.remote.then(clearBrowserState());
  },
  tests: {
    'sign in, delete account': function() {
      return (
        this.remote
          .then(fillOutSignIn(email, PASSWORD))
          .findById('fxa-settings-header')
          .end()

          // Go to delete account screen
          .findByCssSelector('#delete-account .settings-unit-toggle')
          .click()
          .end()

          // success is going to the delete account page
          .then(FunctionalHelpers.visibleByQSA('#delete-account'))

          .then(fillOutDeleteAccount(PASSWORD))

          // success is going to the signup page
          .findById('fxa-signup-header')
          .end()

          .then(testSuccessWasShown())
      );
    },

    'sign in, cancel delete account': function() {
      return (
        this.remote
          .then(fillOutSignIn(email, PASSWORD))
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
          .end()
      );
    },
  },
});
