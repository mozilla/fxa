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
  var clearBrowserState = FunctionalHelpers.clearBrowserState;
  var createUser = FunctionalHelpers.createUser;
  var fillOutChangePassword = thenify(FunctionalHelpers.fillOutChangePassword);
  var fillOutSignIn = thenify(FunctionalHelpers.fillOutSignIn);
  var openPage = thenify(FunctionalHelpers.openPage);
  var openVerificationLinkDifferentBrowser = thenify(FunctionalHelpers.openVerificationLinkDifferentBrowser);
  var respondToWebChannelMessage = FunctionalHelpers.respondToWebChannelMessage;
  var testElementExists = FunctionalHelpers.testElementExists;
  var testIsBrowserNotified = FunctionalHelpers.testIsBrowserNotified;
  var visibleByQSA = FunctionalHelpers.visibleByQSA;

  var config = intern.config;
  var SIGNIN_URL = config.fxaContentRoot + 'signin?context=iframe&service=sync';
  var SETTINGS_URL = config.fxaContentRoot + 'settings?context=iframe&service=sync';
  var SETTINGS_NOCONTEXT_URL = config.fxaContentRoot + 'settings';

  var FIRST_PASSWORD = 'password';
  var SECOND_PASSWORD = 'new_password';
  var email;


  registerSuite({
    name: 'Firstrun Sync v1 settings',

    beforeEach: function () {
      email = TestHelpers.createEmail('sync{id}');

      return this.remote
        .then(createUser(email, FIRST_PASSWORD, { preVerified: true }))
        .then(clearBrowserState())
        .then(openPage(this, SIGNIN_URL, '#fxa-signin-header'))
        .then(respondToWebChannelMessage(this, 'fxaccounts:can_link_account', { ok: true } ))
        .then(fillOutSignIn(this, email, FIRST_PASSWORD))
        .then(testIsBrowserNotified(this, 'fxaccounts:can_link_account'))
        .then(testIsBrowserNotified(this, 'fxaccounts:login'))

        .then(testElementExists('#fxa-confirm-signin-header'))
        .then(openVerificationLinkDifferentBrowser(email))

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

    'sign in, change the password by browsing directly to settings': function () {
      return this.remote
        .then(openPage(this, SETTINGS_NOCONTEXT_URL, '#fxa-settings-header'))
        .then(click('#change-password .settings-unit-toggle'))
        .then(visibleByQSA('#change-password .settings-unit-details'))

        .then(fillOutChangePassword(this, FIRST_PASSWORD, SECOND_PASSWORD))
        .then(testIsBrowserNotified(this, 'fxaccounts:change_password'));
    }
  });
});
