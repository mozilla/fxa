/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const FunctionalHelpers = require('./lib/helpers');
const selectors = require('./lib/selectors');
const config = intern._config;

const PASSWORD = 'passwordzxcv';
let email;

const {
  click,
  clearBrowserState,
  createEmail,
  fillOutEmailFirstSignUp,
  fillOutSignUpCode,
  getFxaClient,
  getSignupCode,
  openPage,
  testElementExists,
  testElementTextInclude,
  testSuccessWasShown,
  type,
  visibleByQSA,
} = FunctionalHelpers;

const ENTER_EMAIL_URL = config.fxaContentRoot;

function testAtConfirmScreen(email) {
  return function () {
    return this.parent
      .then(testElementExists(selectors.CONFIRM_SIGNUP_CODE.HEADER))
      .then(
        testElementTextInclude(selectors.CONFIRM_SIGNUP_CODE.EMAIL_FIELD, email)
      );
  };
}

registerSuite('signup with code', {
  beforeEach: function () {
    email = createEmail();
    return this.remote.then(clearBrowserState({ force: true }));
  },

  tests: {
    'bounced email': function () {
      const client = getFxaClient();
      return (
        this.remote
          .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
          .then(fillOutEmailFirstSignUp(email, PASSWORD))
          .then(testAtConfirmScreen(email))
          .then(() => client.accountDestroy(email, PASSWORD))
          .then(testElementExists(selectors.ENTER_EMAIL.HEADER))
          // expect an error message to already be present on redirect
          .then(visibleByQSA(selectors.ENTER_EMAIL.TOOLTIP_BOUNCED_EMAIL))
      );
    },

    'valid code then click back': function () {
      return this.remote
        .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
        .then(fillOutEmailFirstSignUp(email, PASSWORD))
        .then(testAtConfirmScreen(email))
        .then(fillOutSignUpCode(email, 0))

        .then(testElementExists(selectors.SETTINGS.HEADER))
        .then(testSuccessWasShown())
        .goBack()
        .then(testAtConfirmScreen(email));
    },

    'invalid code': function () {
      return this.remote
        .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
        .then(fillOutEmailFirstSignUp(email, PASSWORD))
        .then(testAtConfirmScreen(email))
        .then(getSignupCode(email, 0))
        .then((code) => {
          code = code === '123123' ? '123124' : '123123';
          return this.remote.then(
            type(selectors.SIGNIN_TOKEN_CODE.INPUT, code)
          );
        })
        .then(click(selectors.SIGNIN_TOKEN_CODE.SUBMIT))
        .then(
          testElementTextInclude(
            selectors.SIGNIN_TOKEN_CODE.TOOLTIP,
            'invalid or expired verification code'
          )
        );
    },
  },
});
