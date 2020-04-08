/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const FunctionalHelpers = require('./lib/helpers');
const selectors = require('./lib/selectors');

const config = intern._config;
const ENTER_EMAIL_URL = config.fxaContentRoot;
const PASSWORD = 'passwordcxzv';
let email;

const {
  clearBrowserState,
  click,
  createEmail,
  createUser,
  fillOutEmailFirstSignIn,
  openPage,
  type,
  visibleByQSA,
  testElementExists,
} = FunctionalHelpers;

registerSuite('exampleTest', {
  beforeEach: function() {
    email = createEmail();

    return this.remote.then(clearBrowserState());
  },

  tests: {
    tomato: function() {
      return (
        this.remote

          .then(createUser(email, PASSWORD, { preVerified: true }))

          .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))

          .then(fillOutEmailFirstSignIn(email, PASSWORD))

          // success is seeing the error message.

          .then(visibleByQSA(selectors.SETTINGS.HEADER))

          .then(testElementExists(selectors.SETTINGS.HEADER))

          .then(click(selectors.SETTINGS.SIGNOUT, selectors.ENTER_EMAIL.HEADER))

          .then(type(selectors.ENTER_EMAIL.EMAIL, email))
          //.then(type(selectors.SIGNIN.PASSWORD))

          .then(
            click(
              selectors.ENTER_EMAIL.SUBMIT,
              selectors.SIGNIN_PASSWORD.HEADER
            )
          )
          .then(type(selectors.SIGNIN.PASSWORD, PASSWORD))
          .then(click(selectors.SIGNIN.SUBMIT))

          // success is seeing the existing user logged in

          .then(visibleByQSA(selectors.SETTINGS.HEADER))
      );
    },
  },
});
