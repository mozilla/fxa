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

let email;
let recoveryCode;
let secret;

const {
  clearBrowserState,
  click,
  fillOutSignUp,
  fillOutSignIn,
  generateTotpCode,
  openPage,
  openVerificationLinkInSameTab,
  testElementExists,
  testElementTextInclude,
  testIsBrowserNotified,
  type,
  visibleByQSA,
} = FunctionalHelpers;

registerSuite('recovery code', {

  beforeEach: function () {
    email = TestHelpers.createEmail();
    const self = this;
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
        return self.remote.then(type(selectors.TOTP.CONFIRM_CODE_INPUT, generateTotpCode(secret)))
          .then(click(selectors.TOTP.CONFIRM_CODE_BUTTON))
          .then(testElementExists(selectors.SIGNIN_RECOVERY_CODE.MODAL))

          // Store a recovery code
          .findByCssSelector(selectors.SIGNIN_RECOVERY_CODE.FIRST_CODE)
          .getVisibleText()
          .then((code) => recoveryCode = code);
      })
      .end();
  },

  afterEach: function () {
    return this.remote.then(clearBrowserState());
  },

  tests: {
    'can sign-in with recovery code - sync': function () {
      return this.remote
        .then(click(selectors.SIGNIN_RECOVERY_CODE.DONE_BUTTON))
        .then(click(selectors.SETTINGS.SIGNOUT))
        .then(openPage(SYNC_SIGNIN_URL, selectors.SIGNIN.HEADER, {
          query: {}, webChannelResponses: {
            'fxaccounts:can_link_account': {ok: true},
            'fxaccounts:fxa_status': {capabilities: null, signedInUser: null},
          }
        }))

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
        .then(testIsBrowserNotified('fxaccounts:login'));
    },
  }
});
