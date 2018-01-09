/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const TestHelpers = require('../lib/helpers');
const FunctionalHelpers = require('./lib/helpers');
const FxDesktopHelpers = require('./lib/fx-desktop');
var config = intern._config;

var PAGE_URL = config.fxaContentRoot + 'reset_password?context=fx_desktop_v1&service=sync';
var PASSWORD = 'password';

var email;

const {
  clearBrowserState,
  click,
  closeCurrentWindow,
  createUser,
  fillOutCompleteResetPassword,
  fillOutResetPassword,
  openExternalSite,
  openPage,
  openPasswordResetLinkInDifferentBrowser,
  openVerificationLinkInNewTab,
  openVerificationLinkInSameTab,
  switchToWindow,
  testElementExists,
  testSuccessWasShown,
  type,
} = FunctionalHelpers;

const {
  listenForFxaCommands,
  testIsBrowserNotifiedOfLogin,
} = FxDesktopHelpers;

registerSuite('Firefox Desktop Sync v1 reset_password', {
  beforeEach: function () {
    // timeout after 90 seconds
    this.timeout = 90000;

    email = TestHelpers.createEmail('sync{id}');

    return this.remote
      .then(createUser(email, PASSWORD, { preVerified: true }))
      .then(clearBrowserState());
  },
  tests: {
    'reset password, verify same browser': function () {
      // verify account
      return this.remote
        .then(openPage(PAGE_URL, '#fxa-reset-password-header'))
        .execute(listenForFxaCommands)
        .then(fillOutResetPassword(email))

        .then(testElementExists('#fxa-confirm-reset-password-header'))

        .then(openVerificationLinkInNewTab(email, 0))
        .then(switchToWindow(1))

        .then(testElementExists('#fxa-complete-reset-password-header'))
        .then(fillOutCompleteResetPassword(PASSWORD, PASSWORD))

        .then(testElementExists('#fxa-reset-password-complete-header'))
        .then(testElementExists('.account-ready-service'))
        .then(closeCurrentWindow())

        .then(testSuccessWasShown())
        .then(testIsBrowserNotifiedOfLogin(email, {expectVerified: true}));
    },

    'reset password, verify same browser with original tab closed': function () {
      return this.remote
        .then(openPage(PAGE_URL, '#fxa-reset-password-header'))
        .execute(listenForFxaCommands)
        .then(fillOutResetPassword(email))

        .then(testElementExists('#fxa-confirm-reset-password-header'))

        // user browses to another site.
        .then(openExternalSite())
        .then(openVerificationLinkInNewTab(email, 0))
        .then(switchToWindow(1))

        .then(fillOutCompleteResetPassword(PASSWORD, PASSWORD))
        .then(testElementExists('#fxa-reset-password-complete-header'))

        .then(closeCurrentWindow());
    },

    'reset password, verify same browser by replacing the original tab': function () {
      return this.remote
        .then(openPage(PAGE_URL, '#fxa-reset-password-header'))
        .execute(listenForFxaCommands)
        .then(fillOutResetPassword(email))

        .then(testElementExists('#fxa-confirm-reset-password-header'))

        .then(openVerificationLinkInSameTab(email, 0))
        .then(fillOutCompleteResetPassword(PASSWORD, PASSWORD))
        .then(testElementExists('#fxa-reset-password-complete-header'));
    },

    'reset password, verify different browser - from original tab\'s P.O.V.': function () {
      // verify account
      return this.remote
        .then(openPage(PAGE_URL, '#fxa-reset-password-header'))
        .execute(listenForFxaCommands)
        .then(fillOutResetPassword(email))
        .then(testElementExists('#fxa-confirm-reset-password-header'))

        .then(openPasswordResetLinkInDifferentBrowser(email, PASSWORD))

        .then(testElementExists('#fxa-signin-header'))
        .then(testSuccessWasShown())

        .then(type('#password', PASSWORD))
        .then(click('button[type=submit]'))

        .then(testIsBrowserNotifiedOfLogin(email, {expectVerified: false}))

        // user verified the reset password in another browser, they must
        // re-verify they want to sign in on this device to avoid
        // opening up an attack vector.
        .then(testElementExists('#fxa-confirm-signin-header'));
    },

    'reset password, verify different browser - from new browser\'s P.O.V.': function () {

      // verify account
      return this.remote
        .then(openPage(PAGE_URL, '#fxa-reset-password-header'))
        .execute(listenForFxaCommands)
        .then(fillOutResetPassword(email))
        .then(testElementExists('#fxa-confirm-reset-password-header'))

        // clear all browser state, simulate opening in a new
        // browser
        .then(clearBrowserState())
        .then(openVerificationLinkInSameTab(email, 0))
        .then(testElementExists('#fxa-complete-reset-password-header'))
        .then(fillOutCompleteResetPassword(PASSWORD, PASSWORD))

        .then(testElementExists('#fxa-reset-password-complete-header'))
        .then(testElementExists('.account-ready-service'));
    }
  }
});
