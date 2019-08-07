/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const assert = intern.getPlugin('chai').assert;
const { createEmail } = require('../lib/helpers');
const FunctionalHelpers = require('./lib/helpers');
const config = intern._config;
const OAUTH_APP = config.fxaOAuthApp;
const selectors = require('./lib/selectors');

const SIGNIN_URL = `${config.fxaContentRoot}signin`;

const PASSWORD = 'passwordzxcv';

let email;
let secret;

const {
  clearBrowserState,
  click,
  closeCurrentWindow,
  confirmTotpCode,
  fillOutSignIn,
  generateTotpCode,
  openFxaFromRp,
  openPage,
  openVerificationLinkInNewTab,
  switchToWindow,
  testElementExists,
  testElementTextInclude,
  testElementValueEquals,
  testErrorTextInclude,
  thenify,
  type,
} = FunctionalHelpers;

const testAtOAuthApp = thenify(function() {
  return this.parent
    .then(testElementExists(selectors['123DONE'].AUTHENTICATED))
    .then(testElementTextInclude(selectors['123DONE'].AUTHENTICATED_TOTP, '🔒'))
    .getCurrentUrl()
    .then(function(url) {
      // redirected back to the App
      assert.ok(url.indexOf(OAUTH_APP) > -1);
    });
});

registerSuite('oauth require totp', {
  beforeEach: function() {
    email = createEmail();

    return this.remote
      .then(
        clearBrowserState({
          '123done': true,
          contentServer: true,
          force: true,
        })
      )
      .then(
        openFxaFromRp('two-step-authentication', {
          header: selectors.ENTER_EMAIL.HEADER,
        })
      )

      .then(type(selectors.ENTER_EMAIL.EMAIL, email))
      .then(
        click(selectors.ENTER_EMAIL.SUBMIT, selectors.SIGNUP_PASSWORD.HEADER)
      )

      .then(testElementValueEquals(selectors.SIGNUP_PASSWORD.EMAIL, email))
      .then(type(selectors.SIGNUP_PASSWORD.PASSWORD, PASSWORD))
      .then(testElementExists(selectors.SIGNUP_PASSWORD.SHOW_PASSWORD))

      .then(type(selectors.SIGNUP_PASSWORD.VPASSWORD, PASSWORD))
      .then(testElementExists(selectors.SIGNUP_PASSWORD.SHOW_VPASSWORD))

      .then(type(selectors.SIGNUP_PASSWORD.AGE, 21))
      .then(
        click(selectors.SIGNUP_PASSWORD.SUBMIT, selectors.CONFIRM_SIGNUP.HEADER)
      )

      .then(openVerificationLinkInNewTab(email, 0))
      .then(switchToWindow(1))
      .then(testElementExists(selectors.SIGNUP_COMPLETE.HEADER))
      .then(closeCurrentWindow())

      .then(testElementExists(selectors.SIGNIN_PASSWORD.HEADER))
      .then(
        clearBrowserState({
          '123done': true,
          contentServer: true,
          force: true,
        })
      );
  },

  tests: {
    'fails for account without TOTP': function() {
      return this.remote
        .then(
          openFxaFromRp('two-step-authentication', {
            header: selectors.ENTER_EMAIL.HEADER,
          })
        )
        .then(type(selectors.ENTER_EMAIL.EMAIL, email))
        .then(
          click(selectors.ENTER_EMAIL.SUBMIT, selectors.SIGNIN_PASSWORD.HEADER)
        )
        .then(type(selectors.SIGNIN_PASSWORD.PASSWORD, PASSWORD))
        .then(
          click(
            selectors.SIGNIN_PASSWORD.SUBMIT,
            selectors.SIGNIN_PASSWORD.HEADER
          )
        )
        .then(testErrorTextInclude('requires two step authentication enabled'))
        .then(testErrorTextInclude('More information'));
    },

    'succeed for account with TOTP': function() {
      return (
        this.remote
          .then(openPage(SIGNIN_URL, selectors.SIGNIN.HEADER))
          .then(fillOutSignIn(email, PASSWORD))
          .then(testElementExists(selectors.SETTINGS.HEADER))

          .then(click(selectors.TOTP.MENU_BUTTON))

          .then(click(selectors.TOTP.SHOW_CODE_LINK))
          .then(testElementExists(selectors.TOTP.MANUAL_CODE))

          // Store the secret key to recalculate the code later
          .findByCssSelector(selectors.TOTP.MANUAL_CODE)
          .getVisibleText()
          .then(secretKey => {
            secret = secretKey;
            return (
              this.remote
                .then(confirmTotpCode(secret))
                .then(
                  clearBrowserState({
                    '123done': true,
                    contentServer: true,
                  })
                )
                .then(
                  openFxaFromRp('two-step-authentication', {
                    header: selectors.ENTER_EMAIL.HEADER,
                  })
                )
                .then(type(selectors.ENTER_EMAIL.EMAIL, email))
                .then(
                  click(
                    selectors.ENTER_EMAIL.SUBMIT,
                    selectors.SIGNIN_PASSWORD.HEADER
                  )
                )
                .then(type(selectors.SIGNIN_PASSWORD.PASSWORD, PASSWORD))
                .then(
                  click(
                    selectors.SIGNIN_PASSWORD.SUBMIT,
                    selectors.TOTP_SIGNIN.HEADER
                  )
                )

                // Correctly submits the totp code and navigates to oauth page
                .then(
                  type(selectors.TOTP_SIGNIN.INPUT, generateTotpCode(secret))
                )
                .then(click(selectors.TOTP_SIGNIN.SUBMIT))

                .then(testAtOAuthApp())
            );
          })
          .end()
      );
    },
  },
});
