/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'tests/lib/helpers',
  'tests/functional/lib/helpers'
], function (intern, registerSuite, TestHelpers, FunctionalHelpers) {
  var config = intern.config;
  var OAUTH_APP = config.fxaOauthApp;

  var thenify = FunctionalHelpers.thenify;

  var clearBrowserState = thenify(FunctionalHelpers.clearBrowserState);
  var click = FunctionalHelpers.click;
  var createUser = FunctionalHelpers.createUser;
  var fillOutForceAuth = FunctionalHelpers.fillOutForceAuth;
  var openFxaFromRp = thenify(FunctionalHelpers.openFxaFromRp);
  var testElementExists = FunctionalHelpers.testElementExists;
  var testUrlEquals = FunctionalHelpers.testUrlEquals;
  var visibleByQSA = FunctionalHelpers.visibleByQSA;

  var PASSWORD = 'password';
  var email;


  registerSuite({
    name: 'oauth force_auth with a registered force_email',

    beforeEach: function () {
      email = TestHelpers.createEmail();
      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(clearBrowserState(this, {
          '123done': true,
          contentServer: true
        }));
    },

    'allows the user to sign in': function () {
      return this.remote
        .then(openFxaFromRp(this, 'force_auth', { query: { email: email }}))
        .then(fillOutForceAuth(PASSWORD))

        .then(testElementExists('#loggedin'))
        .then(testUrlEquals(OAUTH_APP));
    }
  });

  registerSuite({
    name: 'oauth force_auth with an unregistered force_mail',

    beforeEach: function () {
      email = TestHelpers.createEmail();
      // clear localStorage to avoid polluting other tests.
      return this.remote
        .then(clearBrowserState(this, {
          '123done': true,
          contentServer: true
        }));
    },

    'sign in shows an error message': function () {
      return this.remote
        .then(openFxaFromRp(this, 'force_auth', { query: { email: email }}))
        .then(fillOutForceAuth(PASSWORD))
        .then(visibleByQSA('.error'));
    },

    'reset password shows an error message': function () {
      return this.remote
        .then(openFxaFromRp(this, 'force_auth', { query: { email: email }}))
        .then(click('a[href="/confirm_reset_password"]'))
        .then(visibleByQSA('.error'));
    }
  });
});
