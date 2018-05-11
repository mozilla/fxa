/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const {registerSuite} = intern.getInterface('object');
const TestHelpers = require('../lib/helpers');
const FunctionalHelpers = require('./lib/helpers');
const selectors = require('./lib/selectors');

const config = intern._config;

const SIGNUP_URL = `${config.fxaContentRoot}signup`;
const SETTINGS_URL = `${config.fxaContentRoot}settings?showTwoStepAuthentication=true`;
const PASSWORD = 'password';
const SYNC_SIGNIN_URL = `${config.fxaContentRoot}signin?context=fx_desktop_v3&service=sync`;
const SIGNIN_URL = `${config.fxaContentRoot}signin?showTwoStepAuthentication=true`;

const SUCCESS_MESSAGE_DELAY_MS = 5000;

let email;
let secret;

const {
  confirmTotpCode,
  clearBrowserState,
  click,
  closeCurrentWindow,
  createUser,
  fillOutDeleteAccount,
  fillOutSignUp,
  fillOutSignIn,
  generateTotpCode,
  openPage,
  noSuchElement,
  openVerificationLinkInDifferentBrowser,
  openVerificationLinkInNewTab,
  openVerificationLinkInSameTab,
  switchToWindow,
  testElementExists,
  testElementTextInclude,
  testIsBrowserNotified,
  testSuccessWasShown,

  type,
  visibleByQSA,
} = FunctionalHelpers;

registerSuite('TOTP', {
  beforeEach: function () {
    email = TestHelpers.createEmail();
    return this.remote.then(clearBrowserState())
      .then(openPage(SIGNUP_URL, selectors.SIGNUP.HEADER))
      .then(fillOutSignUp(email, PASSWORD))
      .then(testElementExists(selectors.CONFIRM_SIGNUP.HEADER))
      .then(openVerificationLinkInSameTab(email, 0))
      .then(testElementExists(selectors.SETTINGS.HEADER))

      .then(openPage(SETTINGS_URL, selectors.SETTINGS.HEADER))
      .then(testElementExists(selectors.SETTINGS.HEADER))
      .then(testElementExists(selectors.TOTP.MENU_BUTTON))

      .then(click(selectors.TOTP.MENU_BUTTON))

      .then(testElementExists(selectors.TOTP.QR_CODE))
      .then(testElementExists(selectors.TOTP.SHOW_CODE_LINK))

      .then(click(selectors.TOTP.SHOW_CODE_LINK))
      .then(testElementExists(selectors.TOTP.MANUAL_CODE))

      // Store the secret key to recalculate the code later
      .findByCssSelector(selectors.TOTP.MANUAL_CODE)
      .getVisibleText()
      .then((secretKey) => {
        secret = secretKey;
      })
      .end();
  },

  afterEach: function () {
    return this.remote.then(clearBrowserState());
  },
  tests: {
    'does not show panel when query `showTwoStepAuthentication` is not set': function () {
      return this.remote
        .then(openPage(config.fxaContentRoot + 'settings', selectors.SETTINGS.HEADER))
        .then(testElementExists(selectors.SETTINGS.HEADER))
        .then(noSuchElement(selectors.TOTP.MENU_BUTTON));
    },

    'can add TOTP to account and confirm web signin': function () {
      return this.remote
      // Show's tool tip for invalid codes on setup
        .then(type(selectors.TOTP.CONFIRM_CODE_INPUT, 'INVALID'))
        .then(click(selectors.TOTP.CONFIRM_CODE_BUTTON))
        .then(visibleByQSA('.tooltip'))
        .then(testElementTextInclude('.tooltip', 'invalid'))

        .then(confirmTotpCode(secret))
        // give the status message time to go away or else we won't be able to click "signout"
        .sleep(SUCCESS_MESSAGE_DELAY_MS)

        .then(click(selectors.SETTINGS.SIGNOUT, selectors.SIGNIN.HEADER))
        .then(fillOutSignIn(email, PASSWORD))
        .then(testElementExists(selectors.TOTP_SIGNIN.HEADER))

        // Show tool tip for invalid codes on sign-in
        .then(type(selectors.TOTP_SIGNIN.INPUT, '123432'))
        .then(click(selectors.TOTP_SIGNIN.SUBMIT))
        .then(visibleByQSA('.tooltip'))
        .then(testElementTextInclude('.tooltip', 'invalid'))

        // Redirect to /settings when successful
        .then(type(selectors.TOTP_SIGNIN.INPUT, generateTotpCode(secret)))
        .then(click(selectors.TOTP_SIGNIN.SUBMIT))
        .then(testElementExists(selectors.SETTINGS.HEADER));
    },

    'can add TOTP to account and confirm sync signin': function () {
      return this.remote
        .then(confirmTotpCode(secret))
        // give the status message time to go away or else we won't be able to click "signout"
        .sleep(SUCCESS_MESSAGE_DELAY_MS)

        .then(click(selectors.SETTINGS.SIGNOUT, selectors.SIGNIN.HEADER))
        .then(openPage(SYNC_SIGNIN_URL, selectors.SIGNIN.HEADER, {
          query: {}, webChannelResponses: {
            'fxaccounts:can_link_account': {ok: true},
            'fxaccounts:fxa_status': {capabilities: null, signedInUser: null},
          }
        }))

        .then(fillOutSignIn(email, PASSWORD))
        .then(testElementExists(selectors.TOTP_SIGNIN.HEADER))

        .then(type(selectors.TOTP_SIGNIN.INPUT, generateTotpCode(secret)))
        .then(click(selectors.TOTP_SIGNIN.SUBMIT))

        // about:accounts will take over post-verification, no transition
        .then(testIsBrowserNotified('fxaccounts:login'));
    },

    'can remove TOTP from account and skip confirmation': function () {
      return this.remote
        .then(confirmTotpCode(secret))
        // give the status message time to go away or else we won't be able to click "signout"
        .sleep(SUCCESS_MESSAGE_DELAY_MS)

        // Remove token
        .then(click(selectors.TOTP.DELETE_BUTTON))
        .then(testSuccessWasShown)
        .then(testElementExists(selectors.TOTP.MENU_BUTTON))

        // Does not prompt for code
        .sleep(SUCCESS_MESSAGE_DELAY_MS)
        .then(click(selectors.SETTINGS.SIGNOUT))
        .then(fillOutSignIn(email, PASSWORD))
        .then(testElementExists(selectors.SETTINGS.HEADER));
    },

    'can add TOTP to account and then delete it': function () {
      return this.remote
        .then(confirmTotpCode(secret))

        .then(click(selectors.SETTINGS_DELETE_ACCOUNT.MENU_BUTTON))
        .then(visibleByQSA(selectors.SETTINGS_DELETE_ACCOUNT.DETAILS))

        .then(fillOutDeleteAccount(PASSWORD))
        .then(testIsBrowserNotified('fxaccounts:delete'))

        .then(testElementExists(selectors.SIGNUP.HEADER));
    }
  }
});

registerSuite('TOTP - unverified session', {
  beforeEach: function () {
    email = TestHelpers.createEmail('sync{id}');

    return this.remote.then(createUser(email, PASSWORD, {preVerified: true}));
  },

  afterEach: function () {
    return this.remote.then(clearBrowserState());
  },

  tests: {
    'gated in unverified session open verification same tab': function () {
      return this.remote
        // when an account is created, the original session is verified
        // re-login to destroy original session and created an unverified one
        .then(openPage(SIGNIN_URL, selectors.SIGNIN.HEADER))
        .then(fillOutSignIn(email, PASSWORD))
        .then(testElementExists(selectors.TOTP.UNLOCK_BUTTON))

        // unlock panel
        .then(click(selectors.TOTP.UNLOCK_BUTTON))
        .then(testElementExists(selectors.TOTP.UNLOCK_SEND_VERIFY))

        // send and open verification in same tab
        .then(click(selectors.TOTP.UNLOCK_SEND_VERIFY))
        .then(openVerificationLinkInSameTab(email, 0))

        // panel becomes verified and can be opened
        .then(testElementExists(selectors.TOTP.STATUS_ENABLED));
    },

    'gated in unverified session open verification new tab': function () {
      return this.remote
        // when an account is created, the original session is verified
        // re-login to destroy original session and created an unverified one
        .then(openPage(SIGNIN_URL, selectors.SIGNIN.HEADER))
        .then(fillOutSignIn(email, PASSWORD))
        .then(testElementExists(selectors.TOTP.UNLOCK_BUTTON))

        // unlock panel
        .then(click(selectors.TOTP.UNLOCK_BUTTON))
        .then(testElementExists(selectors.TOTP.UNLOCK_SEND_VERIFY))

        // send and open verification in same tab
        .then(click(selectors.TOTP.UNLOCK_SEND_VERIFY))
        .then(openVerificationLinkInNewTab(email, 0))
        .then(switchToWindow(1))

        // panel becomes verified and can be opened
        .then(testElementExists(selectors.TOTP.STATUS_ENABLED))
        .then(closeCurrentWindow())

        .then(switchToWindow(0))

        .then(testElementExists(selectors.TOTP.UNLOCK_REFRESH_BUTTON))
        .then(click(selectors.TOTP.UNLOCK_REFRESH_BUTTON))

        // when refreshing the panel, it doesn't not automatically create token
        .then(testElementExists(selectors.TOTP.STATUS_DISABLED))
        .then(visibleByQSA(selectors.TOTP.STATUS_DISABLED));
    },

    'gated in unverified session open verification different browser': function () {
      return this.remote
        // when an account is created, the original session is verified
        // re-login to destroy original session and created an unverified one
        .then(openPage(SIGNIN_URL, selectors.SIGNIN.HEADER))
        .then(fillOutSignIn(email, PASSWORD))
        .then(testElementExists(selectors.TOTP.UNLOCK_BUTTON))

        // unlock panel
        .then(click(selectors.TOTP.UNLOCK_BUTTON))
        .then(testElementExists(selectors.TOTP.UNLOCK_SEND_VERIFY))

        // send and open verification in same tab
        .then(click(selectors.TOTP.UNLOCK_SEND_VERIFY))
        .then(openVerificationLinkInDifferentBrowser(email, 0))
        .then(click(selectors.TOTP.UNLOCK_REFRESH_BUTTON))

        .then(testElementExists(selectors.TOTP.UNLOCK_REFRESH_BUTTON))
        .then(click(selectors.TOTP.UNLOCK_REFRESH_BUTTON))

        .then(testElementExists(selectors.TOTP.STATUS_DISABLED))
        .then(visibleByQSA(selectors.TOTP.STATUS_DISABLED));
    }
  }
});
