/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const TestHelpers = require('../lib/helpers');
const FunctionalHelpers = require('./lib/helpers');
const selectors = require('./lib/selectors');

var config = intern._config;
var OAUTH_APP = config.fxaOAuthApp;

const {
  clearBrowserState,
  createUser,
  fillOutEmailFirstSignUp,
  fillOutForceAuth,
  fillOutSignInUnblock,
  fillOutSignUpCode,
  openFxaFromRp,
  testElementDisabled,
  testElementExists,
  testElementTextInclude,
  testElementValueEquals,
  testUrlEquals,
  visibleByQSA,
} = FunctionalHelpers;

const PASSWORD = 'password123456789';
let email;

registerSuite('oauth force_auth', {
  beforeEach: function() {
    email = TestHelpers.createEmail();
    return this.remote.then(
      clearBrowserState({
        '123done': true,
        contentServer: true,
      })
    );
  },
  tests: {
    'with a registered email': function() {
      return (
        this.remote
          .then(createUser(email, PASSWORD, { preVerified: true }))
          .then(openFxaFromRp('force-auth', { query: { email: email } }))
          .then(fillOutForceAuth(PASSWORD))

          .then(testElementExists(selectors['123DONE'].AUTHENTICATED))
          // redirected back to the App
          .then(testUrlEquals(OAUTH_APP))
      );
    },

    'with an unregistered email': function() {
      // Test often times out waiting for emails, give it a bit more time.
      // See #5024
      this.timeout = 60 * 1000;

      return (
        this.remote
          .then(
            openFxaFromRp('force-auth', {
              header: selectors.SIGNUP_PASSWORD.HEADER,
              query: { email: email },
            })
          )
          .then(visibleByQSA(selectors.SIGNUP_PASSWORD.ERROR))
          .then(
            testElementTextInclude(selectors.SIGNUP_PASSWORD.ERROR, 'recreate')
          )
          // ensure the email is filled in, and not editible.
          .then(testElementValueEquals(selectors.SIGNUP_PASSWORD.EMAIL, email))
          .then(testElementDisabled(selectors.SIGNUP_PASSWORD.EMAIL))
          .then(fillOutEmailFirstSignUp(email, PASSWORD, { enterEmail: false }))

          .then(testElementExists(selectors.CONFIRM_SIGNUP_CODE.HEADER))
          .then(fillOutSignUpCode(email, 0))

          .then(testElementExists(selectors['123DONE'].AUTHENTICATED))
          // redirected back to the App
          .then(testUrlEquals(OAUTH_APP))
      );
    },

    'verified, blocked': function() {
      email = TestHelpers.createEmail('blocked{id}');

      return (
        this.remote
          .then(createUser(email, PASSWORD, { preVerified: true }))
          .then(openFxaFromRp('force-auth', { query: { email: email } }))
          .then(fillOutForceAuth(PASSWORD))

          .then(testElementExists(selectors.SIGNIN_UNBLOCK.HEADER))
          .then(fillOutSignInUnblock(email, 0))

          .then(testElementExists(selectors['123DONE'].AUTHENTICATED))
          // redirected back to the App
          .then(testUrlEquals(OAUTH_APP))
      );
    },
  },
});
