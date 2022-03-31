/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const FunctionalHelpers = require('./lib/helpers');
const selectors = require('./lib/selectors');
const uaStrings = require('./lib/ua-strings');

const config = intern._config;
const ENTER_EMAIL_URL = `${config.fxaContentRoot}?context=fx_fennec_v1&service=sync`;

let email;
const PASSWORD = '12345678';

const {
  clearBrowserState,
  createEmail,
  createUser,
  fillOutEmailFirstSignIn,
  fillOutSignInTokenCode,
  fillOutSignInUnblock,
  openPage,
  respondToWebChannelMessage,
  testElementExists,
  testElementTextInclude,
  testIsBrowserNotified,
  thenify,
} = FunctionalHelpers;

const setupTest = thenify(function (successSelector, options = {}) {
  return this.parent
    .then(clearBrowserState())
    .then(createUser(email, PASSWORD, { preVerified: options.preVerified }))
    .then(
      openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER, {
        query: {
          forceUA: uaStrings['android_firefox'],
        },
      })
    )
    .then(
      respondToWebChannelMessage('fxaccounts:can_link_account', { ok: true })
    )
    .then(fillOutEmailFirstSignIn(email, PASSWORD))
    .then(testElementExists(successSelector))
    .then(testIsBrowserNotified('fxaccounts:can_link_account'));
});

registerSuite('Fx Fennec Sync v1 sign_in', {
  beforeEach: function () {
    email = createEmail('sync{id}');
  },
  tests: {
    verified: function () {
      return this.remote
        .then(
          setupTest(selectors.SIGNIN_TOKEN_CODE.HEADER, { preVerified: true })
        )

        .then(fillOutSignInTokenCode(email, 0))

        .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.HEADER))
        .then(testIsBrowserNotified('fxaccounts:login'));
    },

    unverified: function () {
      return (
        this.remote
          .then(
            setupTest(selectors.CONFIRM_SIGNUP_CODE.HEADER, {
              preVerified: false,
            })
          )

          // email 0 - initial sign up email
          // email 1 - sign in w/ unverified address email
          // email 2 - "You have verified your Firefox Account"
          .then(fillOutSignInTokenCode(email, 1))

          .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.HEADER))
          .then(testIsBrowserNotified('fxaccounts:login'))
      );
    },

    'blocked, valid code entered': function () {
      email = createEmail('block{id}');

      return this.remote
        .then(
          setupTest(selectors.SIGNIN_UNBLOCK.HEADER, {
            blocked: true,
            preVerified: true,
          })
        )

        .then(
          testElementTextInclude(selectors.SIGNIN_UNBLOCK.EMAIL_FIELD, email)
        )
        .then(fillOutSignInUnblock(email, 0))

        .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.HEADER))
        .then(testIsBrowserNotified('fxaccounts:login'));
    },
  },
});
