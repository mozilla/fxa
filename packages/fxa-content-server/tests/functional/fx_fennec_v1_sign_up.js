/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const FunctionalHelpers = require('./lib/helpers');
const selectors = require('./lib/selectors');
var config = intern._config;
var ENTER_EMAIL_URL =
  config.fxaContentRoot + '?context=fx_fennec_v1&service=sync';

var email;
var PASSWORD = 'password12345678';

const {
  click,
  createEmail,
  fillOutSignUpCode,
  noSuchBrowserNotification,
  openPage,
  respondToWebChannelMessage,
  testElementExists,
  testElementValueEquals,
  testEmailExpected,
  testIsBrowserNotified,
  type,
  visibleByQSA,
} = FunctionalHelpers;

registerSuite('Fx Fennec Sync v1 sign_up', {
  beforeEach: function () {
    email = createEmail();
    return this.remote.then(FunctionalHelpers.clearBrowserState());
  },

  afterEach: function () {
    return this.remote.then(FunctionalHelpers.clearBrowserState());
  },
  tests: {
    'sign up': function () {
      return (
        this.remote
          .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
          .then(
            respondToWebChannelMessage('fxaccounts:can_link_account', {
              ok: true,
            })
          )
          .then(visibleByQSA(selectors.ENTER_EMAIL.SUB_HEADER))
          .then(type(selectors.ENTER_EMAIL.EMAIL, email))
          .then(
            click(
              selectors.ENTER_EMAIL.SUBMIT,
              selectors.SIGNUP_PASSWORD.HEADER
            )
          )
          .then(testIsBrowserNotified('fxaccounts:can_link_account'))

          .then(testElementValueEquals(selectors.SIGNUP_PASSWORD.EMAIL, email))
          // user thinks they mistyped their email
          .then(
            click(
              selectors.SIGNUP_PASSWORD.LINK_USE_DIFFERENT,
              selectors.ENTER_EMAIL.HEADER
            )
          )

          .then(testElementValueEquals(selectors.ENTER_EMAIL.EMAIL, email))
          .then(
            click(
              selectors.ENTER_EMAIL.SUBMIT,
              selectors.SIGNUP_PASSWORD.HEADER
            )
          )

          .then(type(selectors.SIGNUP_PASSWORD.PASSWORD, PASSWORD))
          .then(type(selectors.SIGNUP_PASSWORD.VPASSWORD, PASSWORD))
          .then(type(selectors.SIGNUP_PASSWORD.AGE, 21))
          .then(
            click(
              selectors.SIGNUP_PASSWORD.SUBMIT,
              selectors.CHOOSE_WHAT_TO_SYNC.HEADER
            )
          )

          // user should be transitioned to the choose what to Sync page
          .then(testIsBrowserNotified('fxaccounts:can_link_account'))
          // the login message is only sent after the confirm screen is shown.
          .then(noSuchBrowserNotification('fxaccounts:login'))

          // uncheck the passwords and history engines
          .then(click(selectors.CHOOSE_WHAT_TO_SYNC.ENGINE_PASSWORDS))
          .then(click(selectors.CHOOSE_WHAT_TO_SYNC.ENGINE_HISTORY))
          .then(click(selectors.CHOOSE_WHAT_TO_SYNC.SUBMIT))

          // user should be transitioned to the "go confirm your address" page
          .then(testElementExists(selectors.CONFIRM_SIGNUP_CODE.HEADER))

          // the login message is only sent after the sync preferences screen
          // has been cleared.
          .then(testIsBrowserNotified('fxaccounts:login'))

          // verify the user
          .then(fillOutSignUpCode(email, 0))

          .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.HEADER))
          // A post-verification email should be sent, this is Sync.
          .then(testEmailExpected(email, 1))
      );
    },
  },
});
