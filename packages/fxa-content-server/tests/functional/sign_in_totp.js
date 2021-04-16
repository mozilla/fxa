/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const FunctionalHelpers = require('./lib/helpers');
const selectors = require('./lib/selectors');

const config = intern._config;

const SETTINGS_URL = `${config.fxaContentRoot}settings`;
const PASSWORD = 'passwordzxcv';
const SYNC_ENTER_EMAIL_URL = `${config.fxaContentRoot}?context=fx_desktop_v3&service=sync`;
const ENTER_EMAIL_URL = `${config.fxaContentRoot}?action=email`;
const RECOVERY_CODES_URL = `${config.fxaContentRoot}settings/two_step_authentication/replace_codes`;
const RESET_PASSWORD_URL = `${config.fxaContentRoot}reset_password?context=fx_desktop_v3&service=sync`;

let email;
let secret;

const {
  confirmTotpCode,
  clearBrowserState,
  click,
  createEmail,
  createUser,
  fillOutCompleteResetPassword,
  fillOutDeleteAccount,
  fillOutEmailFirstSignIn,
  fillOutEmailFirstSignUp,
  fillOutResetPassword,
  fillOutSignUpCode,
  fillOutVerificationCode,
  generateTotpCode,
  openPage,
  openVerificationLinkInNewTab,
  openVerificationLinkInSameTab,
  signOut,
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
    email = createEmail();
    return (
      this.remote
        .then(clearBrowserState({ force: true }))
        .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
        .then(fillOutEmailFirstSignUp(email, PASSWORD))
        .then(testElementExists(selectors.CONFIRM_SIGNUP_CODE.HEADER))
        .then(fillOutSignUpCode(email, 0))
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
        .end()
        .then(() => this.remote.then(click(selectors.TOTP.KEY_OK_BUTTON)))
    );
  },

  tests: {
    'can add TOTP to account and confirm web signin': function () {
      return (
        this.remote
          // Shows tool tip for invalid codes on setup
          // Note: as usual we have to click the label first, to get it out
          // of the way, then we can click into the input.
          .then(click(selectors.TOTP.CONFIRM_CODE_INPUT_LABEL))
          .then(click(selectors.TOTP.CONFIRM_CODE_INPUT))
          .then(type(selectors.TOTP.CONFIRM_CODE_INPUT, '123432'))
          .then(click(selectors.TOTP.CONFIRM_CODE_BUTTON))
          .then(visibleByQSA(selectors.TOTP.TOOLTIP))
          .then(testElementTextInclude(selectors.TOTP.TOOLTIP, 'Incorrect'))

          .then(confirmTotpCode(secret))

          .then(signOut())
          .then(fillOutEmailFirstSignIn(email, PASSWORD))
          .then(testElementExists(selectors.TOTP_SIGNIN.HEADER))

          // Show tool tip for invalid codes on sign-in
          .then(type(selectors.TOTP_SIGNIN.INPUT, '123432'))
          .then(click(selectors.TOTP_SIGNIN.SUBMIT))
          .then(visibleByQSA(selectors.TOTP.LOGIN_FLOW_TOOLTIP))
          .then(
            testElementTextInclude(selectors.TOTP.LOGIN_FLOW_TOOLTIP, 'Invalid')
          )

          // Redirect to /settings when successful
          .then(type(selectors.TOTP_SIGNIN.INPUT, generateTotpCode(secret)))
          .then(click(selectors.TOTP_SIGNIN.SUBMIT))
          .then(testElementExists(selectors.SETTINGS.HEADER))
      );
    },

    'can add TOTP to account and confirm sync signin': function () {
      return this.remote
        .then(confirmTotpCode(secret))

        .then(signOut())
        .then(
          openPage(SYNC_ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER, {
            query: {},
          })
        )

        .then(fillOutEmailFirstSignIn(email, PASSWORD))
        .then(testElementExists(selectors.TOTP_SIGNIN.HEADER))

        .then(type(selectors.TOTP_SIGNIN.INPUT, generateTotpCode(secret)))
        .then(click(selectors.TOTP_SIGNIN.SUBMIT))

        .then(testIsBrowserNotified('fxaccounts:login'))
        .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.HEADER));
    },

    'can remove TOTP from account and skip confirmation': function () {
      return (
        this.remote
          .then(confirmTotpCode(secret))

          // Remove token, first in unit row then in confirmation modal
          .then(
            click(selectors.TOTP.DELETE_BUTTON, selectors.TOTP.CONFIRM_DELETE)
          )
          .then(click(selectors.TOTP.CONFIRM_DELETE))
          .then(testSuccessWasShown)
          .then(testElementExists(selectors.TOTP.MENU_BUTTON))
          .refresh()

          // Does not prompt for code
          .then(signOut())
          .then(fillOutEmailFirstSignIn(email, PASSWORD))
          .then(testElementExists(selectors.SETTINGS.HEADER))
      );
    },

    'can add TOTP to account and then delete it': function () {
      return this.remote
        .then(confirmTotpCode(secret))
        .then(click(selectors.SETTINGS_DELETE_ACCOUNT.DELETE_ACCOUNT_BUTTON))
        .then(visibleByQSA(selectors.SETTINGS_DELETE_ACCOUNT.DETAILS))

        .then(fillOutDeleteAccount(PASSWORD))
        .then(testElementExists(selectors.ENTER_EMAIL.HEADER));
    },

    'can navigate directly to recovery codes': function () {
      return this.remote
        .then(confirmTotpCode(secret))
        .then(
          openPage(
            RECOVERY_CODES_URL,
            selectors.TOTP.RECOVERY_CODES_DESCRIPTION
          )
        )
        .then(
          click(selectors.SETTINGS_V2.SECURITY.TFA.CLOSE_RECOVERY_KEY_BLOCK)
        );
    },

    'can reset password, prompt for TOTP and login - same browser same tab': function () {
      return (
        this.remote
          .then(confirmTotpCode(secret))

          .then(signOut())
          //.then(clearBrowserState())

          .then(openPage(RESET_PASSWORD_URL, selectors.RESET_PASSWORD.HEADER))
          .then(fillOutResetPassword(email))
          .then(testElementExists(selectors.CONFIRM_RESET_PASSWORD.HEADER))

          .then(openVerificationLinkInSameTab(email, 2))
          .then(fillOutCompleteResetPassword(PASSWORD, PASSWORD))
          .then(testElementExists(selectors.TOTP_SIGNIN.HEADER))

          .then(type(selectors.TOTP_SIGNIN.INPUT, generateTotpCode(secret)))
          .then(
            click(
              selectors.TOTP_SIGNIN.SUBMIT,
              selectors.CONNECT_ANOTHER_DEVICE.HEADER
            )
          )

          .then(testIsBrowserNotified('fxaccounts:login'))

          .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.SUCCESS))
      );
    },

    'can reset password, prompt for TOTP and login - same browser different tab': function () {
      return this.remote
        .then(confirmTotpCode(secret))
        .then(signOut())

        .then(openPage(RESET_PASSWORD_URL, selectors.RESET_PASSWORD.HEADER))
        .then(fillOutResetPassword(email))
        .then(testElementExists(selectors.CONFIRM_RESET_PASSWORD.HEADER))

        .then(openVerificationLinkInNewTab(email, 2))
        .then(switchToWindow(1))
        .then(fillOutCompleteResetPassword(PASSWORD, PASSWORD))
        .then(testElementExists(selectors.TOTP_SIGNIN.HEADER))

        .then(type(selectors.TOTP_SIGNIN.INPUT, generateTotpCode(secret)))
        .then(
          click(
            selectors.TOTP_SIGNIN.SUBMIT,
            selectors.CONNECT_ANOTHER_DEVICE.HEADER
          )
        )

        .then(testIsBrowserNotified('fxaccounts:login'))

        .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.SUCCESS));
    },

    'can reset password, prompt for TOTP and login - verify different browser': function () {
      return (
        this.remote
          .then(confirmTotpCode(secret))
          .then(signOut())

          .then(openPage(RESET_PASSWORD_URL, selectors.RESET_PASSWORD.HEADER))
          .then(fillOutResetPassword(email))
          .then(testElementExists(selectors.CONFIRM_RESET_PASSWORD.HEADER))

          // clear all browser state, simulate opening in a new browser
          .then(clearBrowserState({ force: true }))
          .then(openVerificationLinkInSameTab(email, 2))
          .then(fillOutCompleteResetPassword(PASSWORD, PASSWORD))
          .then(testElementExists(selectors.TOTP_SIGNIN.HEADER))

          .then(type(selectors.TOTP_SIGNIN.INPUT, generateTotpCode(secret)))
          .then(click(selectors.TOTP_SIGNIN.SUBMIT))

          .then(testElementExists(selectors.SETTINGS.HEADER))
      );
    },
  },
});

registerSuite('TOTP - unverified session', {
  beforeEach: function () {
    email = createEmail('sync{id}');

    return this.remote
      .then(createUser(email, PASSWORD, { preVerified: true }))
      .then(clearBrowserState({ force: true }));
  },

  tests: {
    'gated in unverified session open verification same tab': function () {
      return (
        this.remote
          // when an account is created, the original session is verified
          // re-login to destroy original session and created an unverified one
          .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
          .then(fillOutEmailFirstSignIn(email, PASSWORD))
          .then(testElementExists(selectors.TOTP.UNLOCK_BUTTON))

          // unlock panel
          .then(click(selectors.TOTP.UNLOCK_BUTTON))
          .then(testElementExists(selectors.TOTP.UNLOCK_SEND_VERIFY))

          // send and open verification in same tab
          // TODO new modal doesn't allow the click. it just auto-sends.
          //.then(click(selectors.TOTP.UNLOCK_SEND_VERIFY))
          .then(fillOutVerificationCode(email, 0))

          // panel becomes verified and can be opened
          .then(
            testElementExists(
              selectors.SETTINGS_V2.SECURITY.TFA.SECURITY_CODE_TEXTBOX_LABEL
            )
          )
      );
    },
  },
});
