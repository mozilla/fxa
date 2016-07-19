/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'tests/lib/helpers',
  'tests/functional/lib/helpers'
], function (intern, registerSuite, TestHelpers, FunctionalHelpers) {
  var thenify = FunctionalHelpers.thenify;

  var click = FunctionalHelpers.click;
  var clearBrowserState = thenify(FunctionalHelpers.clearBrowserState);
  var createUser = FunctionalHelpers.createUser;
  var fillOutChangePassword = thenify(FunctionalHelpers.fillOutChangePassword);
  var fillOutDeleteAccount = thenify(FunctionalHelpers.fillOutDeleteAccount);
  var fillOutSignIn = thenify(FunctionalHelpers.fillOutSignIn);
  var noSuchElement = FunctionalHelpers.noSuchElement;
  var openPage = thenify(FunctionalHelpers.openPage);
  var openVerificationLinkDifferentBrowser = thenify(FunctionalHelpers.openVerificationLinkDifferentBrowser);
  var respondToWebChannelMessage = FunctionalHelpers.respondToWebChannelMessage;
  var testElementExists = FunctionalHelpers.testElementExists;
  var testIsBrowserNotified = FunctionalHelpers.testIsBrowserNotified;
  var visibleByQSA = FunctionalHelpers.visibleByQSA;

  var config = intern.config;
  var SIGNIN_URL = config.fxaContentRoot + 'signin?context=fx_fennec_v1&service=sync&forceAboutAccounts=true';
  var SETTINGS_URL = config.fxaContentRoot + 'settings?context=fx_fennec_v1&service=sync&forceAboutAccounts=true';

  var FIRST_PASSWORD = 'password';
  var SECOND_PASSWORD = 'new_password';
  var email;


  registerSuite({
    name: 'Firefox Fennec Sync v1 settings',

    beforeEach: function () {
      email = TestHelpers.createEmail('sync{id}');

      return this.remote
        .then(createUser(email, FIRST_PASSWORD, { preVerified: true }))
        .then(clearBrowserState(this))
        .then(openPage(this, SIGNIN_URL, '#fxa-signin-header'))
        .then(respondToWebChannelMessage(this, 'fxaccounts:can_link_account', { ok: true } ))
        .then(fillOutSignIn(this, email, FIRST_PASSWORD))
        .then(testIsBrowserNotified(this, 'fxaccounts:can_link_account'))
        .then(testIsBrowserNotified(this, 'fxaccounts:login'))

        // User must confirm their Sync signin
        .then(openVerificationLinkDifferentBrowser(email))
        .then(testElementExists('#fxa-sign-in-complete-header'))

        // wait until account data is in localstorage before redirecting
        .then(FunctionalHelpers.pollUntil(function () {
          var accounts = Object.keys(JSON.parse(localStorage.getItem('__fxa_storage.accounts')) || {});
          return accounts.length === 1 ? true : null;
        }, [], 10000))

        .then(openPage(this, SETTINGS_URL, '#fxa-settings-header'));
    },


    'sign in, change the password': function () {
      return this.remote
        .then(click('#change-password .settings-unit-toggle'))
        .then(visibleByQSA('#change-password .settings-unit-details'))

        .then(fillOutChangePassword(this, FIRST_PASSWORD, SECOND_PASSWORD))
        .then(testIsBrowserNotified(this, 'fxaccounts:change_password'));
    },

    'sign in, delete the account': function () {
      return this.remote
        .then(click('#delete-account .settings-unit-toggle'))
        .then(visibleByQSA('#delete-account .settings-unit-details'))

        .then(fillOutDeleteAccount(this, FIRST_PASSWORD))
        // Fx desktop requires fxaccounts:delete, Fennec requires
        // fxaccounts:delete_account
        .then(testIsBrowserNotified(this, 'fxaccounts:delete_account'))

        .then(testElementExists('#fxa-signup-header'));
    },

    'sign in, no way to sign out': function () {
      return this.remote
        // make sure the sign out element doesn't exist
        .then(noSuchElement(this, '#signout'));
    }
  });
});
