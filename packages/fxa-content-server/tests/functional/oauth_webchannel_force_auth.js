/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern!object',
  'tests/lib/helpers',
  'tests/functional/lib/helpers',
  'tests/functional/lib/webchannel-helpers'
], function (registerSuite, TestHelpers, FunctionalHelpers, WebChannelHelpers) {
  var thenify = FunctionalHelpers.thenify;

  var createUser = FunctionalHelpers.createUser;
  var fillOutForceAuth = FunctionalHelpers.fillOutForceAuth;
  var openFxaFromRp = thenify(WebChannelHelpers.openFxaFromRp);
  var testElementExists = FunctionalHelpers.testElementExists;
  var testIsBrowserNotifiedOfLogin = WebChannelHelpers.testIsBrowserNotifiedOfLogin;

  var PASSWORD = 'password';
  var email;

  registerSuite({
    name: 'oauth webchannel force_auth',
    beforeEach: function () {
      email = TestHelpers.createEmail();

      return FunctionalHelpers.clearBrowserState(this);
    },

    'verified': function () {
      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(openFxaFromRp(this, 'force_auth', { query: { email: email }}))
        .then(fillOutForceAuth(PASSWORD))

        // the page does not transition, loop will close the screen
        .then(testElementExists('#fxa-force-auth-header'))
        .then(testIsBrowserNotifiedOfLogin(this, { shouldCloseTab: true }));
    },

    'unverified': function () {
      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: false }))
        .then(openFxaFromRp(this, 'force_auth', { query: { email: email }}))
        .then(fillOutForceAuth(PASSWORD))

        .then(testElementExists('#fxa-confirm-header'));
    }
  });
});
