/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const TestHelpers = require('../lib/helpers');
const FunctionalHelpers = require('./lib/helpers');
const selectors = require('./lib/selectors');

const config = intern._config;

const SIGNUP_URL = `${config.fxaContentRoot}signup`;
const SETTINGS_URL = `${config.fxaContentRoot}settings`;
const PASSWORD = 'passwordzxcv';
const SYNC_SIGNIN_URL = `${config.fxaContentRoot}signin?context=fx_desktop_v3&service=sync`;

let email;
let recoveryCode, recoveryCode2;
let secret;

const {
  clearBrowserState,
  click,
  fillOutSignUp,
  fillOutSignIn,
  generateTotpCode,
  noSuchBrowserNotification,
  openPage,
  openVerificationLinkInSameTab,
  testElementExists,
  testElementTextInclude,
  testIsBrowserNotified,
  type,
  visibleByQSA,
} = FunctionalHelpers;

registerSuite('recovery code', {
  beforeEach: function() {
    email = TestHelpers.createEmail();
    const self = this;
    return (
      this.remote
        .then(clearBrowserState({ force: true }))
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
        .then(secretKey => {
          secret = secretKey;
          return (
            self.remote
              .then(
                type(
                  selectors.TOTP.CONFIRM_CODE_INPUT,
                  generateTotpCode(secret)
                )
              )
              .then(click(selectors.TOTP.CONFIRM_CODE_BUTTON))
              .then(testElementExists(selectors.SIGNIN_RECOVERY_CODE.MODAL))

              // Store a recovery code
              .findByCssSelector(selectors.SIGNIN_RECOVERY_CODE.FIRST_CODE)
              .getVisibleText()
              .then(code => {
                recoveryCode = code;
                return self.remote
                  .findByCssSelector(selectors.SIGNIN_RECOVERY_CODE.SECOND_CODE)
                  .getVisibleText()
                  .then(code => (recoveryCode2 = code));
              })
          );
        })
        .end()
    );
  },

  tests: {
    'can sign-in with recovery code - sync': function() {
      return (
        this.remote
          .then(click(selectors.SIGNIN_RECOVERY_CODE.DONE_BUTTON))
          .then(click(selectors.SETTINGS.SIGNOUT))
          .then(
            openPage(SYNC_SIGNIN_URL, selectors.SIGNIN.HEADER, {
              query: {},
              webChannelResponses: {
                'fxaccounts:can_link_account': { ok: true },
                'fxaccounts:fxa_status': {
                  capabilities: null,
                  signedInUser: null,
                },
              },
            })
          )

          .then(fillOutSignIn(email, PASSWORD))
          .then(testElementExists(selectors.TOTP_SIGNIN.HEADER))
          .then(click(selectors.SIGNIN_RECOVERY_CODE.LINK))

          // Fails for invalid code
          .then(type(selectors.SIGNIN_RECOVERY_CODE.INPUT, 'invalid!!!!'))
          .then(click(selectors.SIGNIN_RECOVERY_CODE.SUBMIT))
          .then(visibleByQSA('.tooltip'))
          .then(testElementTextInclude('.tooltip', 'invalid'))

          .then(type(selectors.SIGNIN_RECOVERY_CODE.INPUT, recoveryCode))
          .then(click(selectors.SIGNIN_RECOVERY_CODE.SUBMIT))

          // about:accounts will take over post-verification, no transition
          .then(testIsBrowserNotified('fxaccounts:login'))
      );
    },

    'can regenerate recovery code when low': function() {
      return (
        this.remote
          .then(click(selectors.SIGNIN_RECOVERY_CODE.DONE_BUTTON))
          .then(click(selectors.SETTINGS.SIGNOUT))
          .then(
            openPage(SYNC_SIGNIN_URL, selectors.SIGNIN.HEADER, {
              query: {},
              webChannelResponses: {
                'fxaccounts:can_link_account': { ok: true },
                'fxaccounts:fxa_status': {
                  capabilities: null,
                  signedInUser: null,
                },
              },
            })
          )

          .then(fillOutSignIn(email, PASSWORD))
          .then(testElementExists(selectors.TOTP_SIGNIN.HEADER))
          .then(click(selectors.SIGNIN_RECOVERY_CODE.LINK))

          .then(type(selectors.SIGNIN_RECOVERY_CODE.INPUT, recoveryCode))
          .then(click(selectors.SIGNIN_RECOVERY_CODE.SUBMIT))

          .then(testIsBrowserNotified('fxaccounts:login'))

          // Next attempt to use recovery code will redirect to
          // page where user can generate more recovery codes
          .then(clearBrowserState({ force: true }))

          .then(
            openPage(SYNC_SIGNIN_URL, selectors.SIGNIN.HEADER, {
              query: {},
              webChannelResponses: {
                'fxaccounts:can_link_account': { ok: true },
                'fxaccounts:fxa_status': {
                  capabilities: null,
                  signedInUser: null,
                },
              },
            })
          )

          .then(fillOutSignIn(email, PASSWORD))
          .then(testElementExists(selectors.TOTP_SIGNIN.HEADER))
          .then(click(selectors.SIGNIN_RECOVERY_CODE.LINK))

          .then(type(selectors.SIGNIN_RECOVERY_CODE.INPUT, recoveryCode2))
          .then(click(selectors.SIGNIN_RECOVERY_CODE.SUBMIT))

          .then(noSuchBrowserNotification('fxaccounts:login'))

          .then(testElementExists(selectors.TOTP.RECOVERY_CODES_DESCRIPTION))
          .then(click(selectors.TOTP.RECOVERY_CODES_REPLACE))
          .then(testElementExists(selectors.SIGNIN_RECOVERY_CODE.FIRST_CODE))

          // After dismissing modal, the login message is sent
          .then(click(selectors.TOTP.RECOVERY_CODES_DONE))
          .then(testIsBrowserNotified('fxaccounts:login'))
      );
    },
  },
});
