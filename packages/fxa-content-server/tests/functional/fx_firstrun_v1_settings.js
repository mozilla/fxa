/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const TestHelpers = require('../lib/helpers');
const FunctionalHelpers = require('./lib/helpers');
const {
  click,
  clearBrowserState,
  createUser,
  fillOutChangePassword,
  fillOutSignIn,
  openPage,
  openVerificationLinkInDifferentBrowser,
  respondToWebChannelMessage,
  testElementExists,
  testIsBrowserNotified,
  visibleByQSA,
} = FunctionalHelpers;

const config = intern._config;
const SIGNIN_URL = config.fxaContentRoot + 'signin?context=iframe&service=sync';
const SETTINGS_URL = config.fxaContentRoot + 'settings?context=iframe&service=sync';
const SETTINGS_NOCONTEXT_URL = config.fxaContentRoot + 'settings';

const FIRST_PASSWORD = 'password';
const SECOND_PASSWORD = 'new_password';
let email;

registerSuite('Firstrun Sync v1 settings', {
  beforeEach: function () {
    email = TestHelpers.createEmail('sync{id}');

    return this.remote
      .then(createUser(email, FIRST_PASSWORD, { preVerified: true }))
      .then(clearBrowserState())
      .then(openPage(SIGNIN_URL, '#fxa-signin-header'))
      .then(respondToWebChannelMessage('fxaccounts:can_link_account', { ok: true } ))
      .then(fillOutSignIn(email, FIRST_PASSWORD))

      .then(testElementExists('#fxa-confirm-signin-header'))
      .then(testIsBrowserNotified('fxaccounts:can_link_account'))
      .then(testIsBrowserNotified('fxaccounts:login'))
      .then(openVerificationLinkInDifferentBrowser(email))

      // wait until account data is in localstorage before redirecting
      .then(FunctionalHelpers.pollUntil(function () {
        const accounts = Object.keys(JSON.parse(localStorage.getItem('__fxa_storage.accounts')) || {});
        return accounts.length === 1 ? true : null;
      }, [], 10000))

      .then(openPage(SETTINGS_URL, '#fxa-settings-header'));
  },
  tests: {
    'sign in, change the password': function () {
      return this.remote
        .then(click('#change-password .settings-unit-toggle'))
        .then(visibleByQSA('#change-password .settings-unit-details'))

        .then(fillOutChangePassword(FIRST_PASSWORD, SECOND_PASSWORD));
    },

    'sign in, change the password by browsing directly to settings': function () {
      return this.remote
        .then(openPage(SETTINGS_NOCONTEXT_URL, '#fxa-settings-header'))
        .then(click('#change-password .settings-unit-toggle'))
        .then(visibleByQSA('#change-password .settings-unit-details'))

        .then(fillOutChangePassword(FIRST_PASSWORD, SECOND_PASSWORD));
    }
  }
});
