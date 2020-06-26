/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const FunctionalHelpers = require('./lib/helpers');
const selectors = require('./lib/selectors');

const {
  clearBrowserState,
  click,
  createEmail,
  createUser,
  fillOutForceAuth,
  openForceAuth,
  testElementDisabled,
  testElementExists,
  testElementTextInclude,
  testElementValueEquals,
  type,
} = FunctionalHelpers;

const PASSWORD = 'passwordcxzv';
let email;

registerSuite('force_auth', {
  beforeEach: function () {
    email = createEmail();

    return this.remote.then(clearBrowserState());
  },
  tests: {
    'with a registered email, registered uid': function () {
      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(function (accountInfo) {
          return openForceAuth({
            query: {
              email: email,
              uid: accountInfo.uid,
            },
          }).call(this);
        })
        .then(fillOutForceAuth(PASSWORD))

        .then(testElementExists(selectors.SETTINGS.HEADER));
    },

    'forgot password flow via force_auth': function () {
      return (
        this.remote
          .then(createUser(email, PASSWORD, { preVerified: true }))
          .then(openForceAuth({ query: { email: email } }))

          .then(click(selectors.FORCE_AUTH.LINK_RESET_PASSWORD))

          .then(testElementExists(selectors.RESET_PASSWORD.HEADER))
          .then(testElementValueEquals(selectors.FORCE_AUTH.EMAIL, email))
          .then(testElementDisabled(selectors.FORCE_AUTH.EMAIL))
          .then(
            testElementTextInclude(
              selectors.FORCE_AUTH.EMAIL_NOT_EDITABLE,
              email
            )
          )
          // User thinks they have remembered their password, clicks the
          // "sign in" link. Go back to /force_auth.
          .then(click(selectors.RESET_PASSWORD.LINK_SIGNIN))

          .then(testElementExists(selectors.FORCE_AUTH.HEADER))
          // User goes back to reset password to submit.
          .then(click(selectors.FORCE_AUTH.LINK_RESET_PASSWORD))

          .then(testElementExists(selectors.RESET_PASSWORD.HEADER))
          .then(click(selectors.RESET_PASSWORD.SUBMIT))

          .then(testElementExists(selectors.CONFIRM_RESET_PASSWORD.HEADER))
          // User has remembered their password, for real this time.
          // Go back to /force_auth.
          .then(click(selectors.CONFIRM_RESET_PASSWORD.LINK_SIGNIN))

          .then(testElementExists(selectors.FORCE_AUTH.HEADER))
          .then(testElementValueEquals(selectors.FORCE_AUTH.EMAIL, email))
          .then(testElementDisabled(selectors.FORCE_AUTH.EMAIL))
          .then(
            testElementTextInclude(
              selectors.FORCE_AUTH.EMAIL_NOT_EDITABLE,
              email
            )
          )
      );
    },

    'form prefill information is cleared after sign in->sign out': function () {
      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(openForceAuth({ query: { email: email } }))
        .then(fillOutForceAuth(PASSWORD))

        .then(testElementExists(selectors.SETTINGS.HEADER))
        .then(click(selectors.SETTINGS.SIGNOUT, selectors.ENTER_EMAIL.HEADER))

        .then(type(selectors.ENTER_EMAIL.EMAIL, email))
        .then(
          click(selectors.ENTER_EMAIL.SUBMIT, selectors.SIGNIN_PASSWORD.HEADER)
        )

        .then(testElementValueEquals(selectors.SIGNIN_PASSWORD.PASSWORD, ''));
    },
  },
});
