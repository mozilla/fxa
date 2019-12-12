/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const FunctionalHelpers = require('./lib/helpers');
var config = intern._config;
var PAGE_URL = config.fxaContentRoot + 'force_auth';
var PASSWORD = 'password';
var email;

const {
  clearBrowserState,
  createEmail,
  createUser,
  fillOutForceAuth,
  fillOutSignInUnblock,
  openPage,
  testErrorTextInclude,
  testElementExists,
  testElementTextInclude,
  visibleByQSA,
} = FunctionalHelpers;

var forceAuthPageUrl;

registerSuite('force_auth blocked', {
  beforeEach: function() {
    email = createEmail('blocked{id}');

    forceAuthPageUrl = PAGE_URL + '?email=' + encodeURIComponent(email);

    return this.remote
      .then(createUser(email, PASSWORD, { preVerified: true }))
      .then(clearBrowserState());
  },

  afterEach: function() {
    return this.remote.then(clearBrowserState());
  },
  tests: {
    'valid code entered': function() {
      return this.remote
        .then(openPage(forceAuthPageUrl, '#fxa-force-auth-header'))
        .then(fillOutForceAuth(PASSWORD))

        .then(testElementExists('#fxa-signin-unblock-header'))
        .then(testElementTextInclude('.verification-email-message', email))
        .then(fillOutSignInUnblock(email, 0))

        .then(testElementExists('#fxa-settings-header'));
    },

    'incorrect password entered': function() {
      return (
        this.remote
          .then(openPage(forceAuthPageUrl, '#fxa-force-auth-header'))
          .then(fillOutForceAuth('incorrect'))

          .then(testElementExists('#fxa-signin-unblock-header'))
          .then(testElementTextInclude('.verification-email-message', email))
          // consume the first code.
          .then(fillOutSignInUnblock(email, 0))

          .then(testElementExists('#fxa-force-auth-header'))
          .then(testErrorTextInclude('incorrect password'))
          .then(fillOutForceAuth(PASSWORD))

          .then(testElementTextInclude('.verification-email-message', email))

          // Try the first, already consumed code. It should fail, the second
          // should be used instead.
          .then(fillOutSignInUnblock(email, 0))
          .then(visibleByQSA('.error'))
          .then(testErrorTextInclude('invalid'))
          // get and consume the second code
          .then(fillOutSignInUnblock(email, 1))

          .then(testElementExists('#fxa-settings-header'))
      );
    },
  },
});
