/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const TestHelpers = require('../lib/helpers');
const FunctionalHelpers = require('./lib/helpers');
var config = intern._config;
var OAUTH_APP = config.fxaOAuthApp;

const {
  clearBrowserState,
  closeCurrentWindow,
  createUser,
  fillOutForceAuth,
  fillOutSignInUnblock,
  fillOutEmailFirstSignUp,
  openFxaFromRp,
  openVerificationLinkInNewTab,
  switchToWindow,
  testElementDisabled,
  testElementExists,
  testElementTextInclude,
  testElementValueEquals,
  testUrlEquals,
  visibleByQSA,
} = FunctionalHelpers;

var PASSWORD = 'password';
var email;

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

          .then(testElementExists('#loggedin'))
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
              header: '#fxa-signup-header',
              query: { email: email },
            })
          )
          .then(visibleByQSA('.error'))
          .then(testElementTextInclude('.error', 'recreate'))
          // ensure the email is filled in, and not editible.
          .then(testElementValueEquals('input[type=email]', email))
          .then(testElementDisabled('input[type=email]'))
          .then(fillOutEmailFirstSignUp(email, PASSWORD, { enterEmail: false }))

          .then(testElementExists('#fxa-confirm-header'))
          .then(openVerificationLinkInNewTab(email, 0))

          .then(switchToWindow(1))
          // wait for the verified window in the new tab
          .then(testElementExists('#fxa-sign-up-complete-header'))
          // user sees the name of the RP,
          // but cannot redirect
          .then(testElementTextInclude('.account-ready-service', '123done'))

          // switch to the original window
          .then(closeCurrentWindow())

          .then(testElementExists('#loggedin'))
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

          .then(testElementExists('#fxa-signin-unblock-header'))
          .then(fillOutSignInUnblock(email, 0))

          .then(testElementExists('#loggedin'))
          // redirected back to the App
          .then(testUrlEquals(OAUTH_APP))
      );
    },
  },
});
