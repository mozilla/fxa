/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const TestHelpers = require('../lib/helpers');
const FunctionalHelpers = require('./lib/helpers');
const selectors = require('./lib/selectors');

const {
  click,
  clearBrowserState,
  createUser,
  fillOutChangePassword,
  fillOutDeleteAccount,
  fillOutEmailFirstSignIn,
  noSuchBrowserNotification,
  noSuchElement,
  openPage,
  openVerificationLinkInDifferentBrowser,
  respondToWebChannelMessage,
  testElementExists,
  testIsBrowserNotified,
  visibleByQSA,
} = FunctionalHelpers;

const config = intern._config;
const ENTER_EMAIL_URL =
  config.fxaContentRoot +
  '?context=fx_desktop_v3&service=sync&forceAboutAccounts=true';
const SETTINGS_URL =
  config.fxaContentRoot +
  'settings?context=fx_desktop_v3&service=sync&forceAboutAccounts=true';
const SETTINGS_NOCONTEXT_URL = config.fxaContentRoot + 'settings';

const FIRST_PASSWORD = 'password';
const SECOND_PASSWORD = 'new_password';
let email;

registerSuite('Firefox Desktop Sync v3 settings', {
  beforeEach: function() {
    email = TestHelpers.createEmail('sync{id}');

    return (
      this.remote
        .then(createUser(email, FIRST_PASSWORD, { preVerified: true }))
        .then(clearBrowserState())
        .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
        .then(
          respondToWebChannelMessage('fxaccounts:can_link_account', {
            ok: true,
          })
        )
        .then(fillOutEmailFirstSignIn(email, FIRST_PASSWORD))

        .then(testElementExists(selectors.CONFIRM_SIGNIN.HEADER))
        .then(testIsBrowserNotified('fxaccounts:can_link_account'))
        .then(testIsBrowserNotified('fxaccounts:login'))
        .then(openVerificationLinkInDifferentBrowser(email))

        // wait until account data is in localstorage before redirecting
        .then(
          FunctionalHelpers.pollUntil(
            function() {
              const accounts = Object.keys(
                JSON.parse(localStorage.getItem('__fxa_storage.accounts')) || {}
              );
              return accounts.length === 1 ? true : null;
            },
            [],
            10000
          )
        )

        .then(openPage(SETTINGS_URL, selectors.SETTINGS.HEADER))
    );
  },
  tests: {
    'sign in, change the password': function() {
      return this.remote
        .then(click(selectors.CHANGE_PASSWORD.MENU_BUTTON))
        .then(visibleByQSA(selectors.CHANGE_PASSWORD.DETAILS))

        .then(fillOutChangePassword(FIRST_PASSWORD, SECOND_PASSWORD));
    },

    'sign in, change the password by browsing directly to settings': function() {
      return this.remote
        .then(openPage(SETTINGS_NOCONTEXT_URL, selectors.SETTINGS.HEADER))
        .then(click(selectors.CHANGE_PASSWORD.MENU_BUTTON))
        .then(visibleByQSA(selectors.CHANGE_PASSWORD.DETAILS))
        .then(noSuchBrowserNotification('fxaccounts:change_password'))

        .then(fillOutChangePassword(FIRST_PASSWORD, SECOND_PASSWORD));
    },

    'sign in, delete the account': function() {
      return this.remote
        .then(click(selectors.SETTINGS_DELETE_ACCOUNT.MENU_BUTTON))
        .then(visibleByQSA(selectors.SETTINGS_DELETE_ACCOUNT.DETAILS))

        .then(fillOutDeleteAccount(FIRST_PASSWORD))
        .then(testIsBrowserNotified('fxaccounts:delete'))

        .then(testElementExists(selectors.ENTER_EMAIL.HEADER));
    },

    'sign in, no way to sign out': function() {
      return (
        this.remote
          // make sure the sign out element doesn't exist
          .then(noSuchElement(selectors.SETTINGS.SIGNOUT))
      );
    },
  },
});
