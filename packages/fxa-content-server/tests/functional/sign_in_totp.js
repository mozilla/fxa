/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const {registerSuite} = intern.getInterface('object');
const TestHelpers = require('../lib/helpers');
const FunctionalHelpers = require('./lib/helpers');
const otplib = require('otplib');
const selectors = require('./lib/selectors');

// Default options for TOTP
otplib.authenticator.options = {encoding: 'hex'};

const config = intern._config;

const SIGNUP_URL = `${config.fxaContentRoot}signup`;
const SETTINGS_URL = `${config.fxaContentRoot}settings?showTwoStepAuthentication=true`;
const PASSWORD = 'password';
const SYNC_SIGNIN_URL = `${config.fxaContentRoot}signin?context=fx_desktop_v3&service=sync`;

let authenticator;
let code;
let email;
let secret;

const {
  clearBrowserState,
  click,
  fillOutSignUp,
  fillOutSignIn,
  openPage,
  noSuchElement,
  openVerificationLinkInSameTab,
  testElementExists,
  testElementTextInclude,
  testIsBrowserNotified,
  testSuccessWasShown,
  type,
  visibleByQSA,
} = FunctionalHelpers;

const generateCode = (secret) => {
  secret = secret.replace(/[- ]*/g, '');
  authenticator = new otplib.authenticator.Authenticator();
  authenticator.options = otplib.authenticator.options;
  code = authenticator.generate(secret);
  return code;
};

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

        // Shows success for confirming token
        .then(type(selectors.TOTP.CONFIRM_CODE_INPUT, generateCode(secret)))
        .then(click(selectors.TOTP.CONFIRM_CODE_BUTTON))
        .then(testSuccessWasShown)
        .then(testElementExists(selectors.TOTP.STATUS_ENABLED))

        .then(click(selectors.SETTINGS.SIGNOUT))
        .then(fillOutSignIn(email, PASSWORD))
        .then(testElementExists(selectors.TOTP_SIGNIN.HEADER))

        // Show tool tip for invalid codes on sign-in
        .then(type(selectors.TOTP_SIGNIN.INPUT, '123432'))
        .then(click(selectors.TOTP_SIGNIN.SUBMIT))
        .then(visibleByQSA('.tooltip'))
        .then(testElementTextInclude('.tooltip', 'invalid'))

        // Redirect to /settings when successful
        .then(type(selectors.TOTP_SIGNIN.INPUT, generateCode(secret)))
        .then(click(selectors.TOTP_SIGNIN.SUBMIT))
        .then(testElementExists(selectors.SETTINGS.HEADER));
    },

    'can add TOTP to account and confirm sync signin': function () {
      return this.remote
      // Shows success for confirming token
        .then(type(selectors.TOTP.CONFIRM_CODE_INPUT, generateCode(secret)))
        .then(click(selectors.TOTP.CONFIRM_CODE_BUTTON))
        .then(testSuccessWasShown)
        .then(testElementExists(selectors.TOTP.STATUS_ENABLED))

        .then(click(selectors.SETTINGS.SIGNOUT))
        .then(openPage(SYNC_SIGNIN_URL, selectors.SIGNIN.HEADER, {
          query: {}, webChannelResponses: {
            'fxaccounts:can_link_account': {ok: true},
            'fxaccounts:fxa_status': {capabilities: null, signedInUser: null},
          }
        }))

        .then(fillOutSignIn(email, PASSWORD))
        .then(testElementExists(selectors.TOTP_SIGNIN.HEADER))

        .then(type(selectors.TOTP_SIGNIN.INPUT, generateCode(secret)))
        .then(click(selectors.TOTP_SIGNIN.SUBMIT))

        // about:accounts will take over post-verification, no transition
        .then(testIsBrowserNotified('fxaccounts:login'));
    },

    'can remove TOTP from account and skip confirmation': function () {
      return this.remote
        .then(type(selectors.TOTP.CONFIRM_CODE_INPUT, generateCode(secret)))
        .then(click(selectors.TOTP.CONFIRM_CODE_BUTTON))
        .then(testSuccessWasShown)
        .then(testElementExists(selectors.TOTP.STATUS_ENABLED))

        // Remove token
        .then(click(selectors.TOTP.DELETE_BUTTON))
        .then(testSuccessWasShown)
        .then(testElementExists(selectors.TOTP.MENU_BUTTON))

        // Does not prompt for code
        .then(click(selectors.SETTINGS.SIGNOUT))
        .then(fillOutSignIn(email, PASSWORD))
        .then(testElementExists(selectors.SETTINGS.HEADER));
    },
  }
});
