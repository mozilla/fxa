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

const ENTER_EMAIL_URL = `${config.fxaContentRoot}?action=email`;

const PASSWORD = 'passwordzxcv';

let email;

const {
  clearBrowserState,
  click,
  confirmTotpCode,
  createUser,
  fillOutEmailFirstSignIn,
  fillOutEmailFirstSignUp,
  fillOutSignUpCode,
  generateTotpCode,
  openFxaFromRp,
  openPage,
  testElementExists,
  testElementTextInclude,
  testErrorTextInclude,
  thenify,
  type,
  visibleByQSA,
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

    return this.remote.then(
      clearBrowserState({
        '123done': true,
        contentServer: true,
        force: true,
      })
    );
  },

  tests: {
    signup: function() {
      return this.remote
        .then(
          openFxaFromRp('two-step-authentication', {
            header: selectors.ENTER_EMAIL.HEADER,
          })
        )

        .then(fillOutEmailFirstSignUp(email, PASSWORD))
        .then(testElementExists(selectors.CONFIRM_SIGNUP_CODE.HEADER))

        .then(fillOutSignUpCode(email, 0))

        .then(testElementExists(selectors.SIGNIN_PASSWORD.HEADER));
    },

    'fails for account without TOTP': function() {
      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(
          openFxaFromRp('two-step-authentication', {
            header: selectors.ENTER_EMAIL.HEADER,
          })
        )
        .then(fillOutEmailFirstSignIn(email, PASSWORD))
        .then(testErrorTextInclude('requires two step authentication enabled'))
        .then(testErrorTextInclude('More information'));
    },

    'succeed for account with TOTP': function() {
      this.timeout = 60 * 1000;
      let secret;

      return (
        this.remote
          .then(createUser(email, PASSWORD, { preVerified: true }))
          .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
          .then(fillOutEmailFirstSignIn(email, PASSWORD))
          .then(testElementExists(selectors.SETTINGS.HEADER))

          .then(click(selectors.TOTP.MENU_BUTTON))

          .then(click(selectors.TOTP.SHOW_CODE_LINK))
          .then(visibleByQSA(selectors.TOTP.MANUAL_CODE))

          // Store the secret key to recalculate the code later
          .findByCssSelector(selectors.TOTP.MANUAL_CODE)
          .getVisibleText()
          .then(secretKey => {
            secret = secretKey;
          })
          .end()

          .then(() => {
            return this.remote.then(confirmTotpCode(secret));
          })
          .then(clearBrowserState({ force: true }))
          .then(
            openFxaFromRp('two-step-authentication', {
              header: selectors.ENTER_EMAIL.HEADER,
            })
          )
          .then(fillOutEmailFirstSignIn(email, PASSWORD))
          .then(testElementExists(selectors.TOTP_SIGNIN.HEADER))

          // Correctly submits the totp code and navigates to oauth page
          .then(() => {
            return this.remote.then(
              type(selectors.TOTP_SIGNIN.INPUT, generateTotpCode(secret))
            );
          })
          .then(click(selectors.TOTP_SIGNIN.SUBMIT))

          .then(testAtOAuthApp())
      );
    },
  },
});
