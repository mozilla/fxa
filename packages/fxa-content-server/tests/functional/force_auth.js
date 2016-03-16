/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern!object',
  'tests/lib/helpers',
  'tests/functional/lib/helpers'
], function (registerSuite, TestHelpers, FunctionalHelpers) {
  var thenify = FunctionalHelpers.thenify;

  var clearBrowserState = thenify(FunctionalHelpers.clearBrowserState);
  var click = FunctionalHelpers.click;
  var createUser = FunctionalHelpers.createUser;
  var fillOutForceAuth = FunctionalHelpers.fillOutForceAuth;
  var openForceAuth = FunctionalHelpers.openForceAuth;
  var testElementExists = FunctionalHelpers.testElementExists;
  var testElementValueEquals = FunctionalHelpers.testElementValueEquals;
  var type = FunctionalHelpers.type;
  var visibleByQSA = FunctionalHelpers.visibleByQSA;

  var PASSWORD = 'password';
  var email;

  registerSuite({
    name: 'force_auth with an existing user',

    beforeEach: function () {
      email = TestHelpers.createEmail();

      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(clearBrowserState(this));
    },

    'sign in via force_auth': function () {
      return this.remote
        .then(openForceAuth({ query: { email: email }}))
        .then(fillOutForceAuth(PASSWORD))

        .then(testElementExists('#fxa-settings-header'));
    },

    'forgot password flow via force-auth goes directly to confirm email screen': function () {
      return this.remote
        .then(openForceAuth({ query: { email: email }}))
        .then(click('.reset-password'))

        .then(testElementExists('#fxa-confirm-reset-password-header'))
        // user remembers her password, clicks the "sign in" link. They
        // should go back to the /force_auth screen.
        .then(click('.sign-in'))

        .then(testElementExists('#fxa-force-auth-header'));
    },

    'visiting the tos/pp links saves information for return': function () {
      return this.remote
        .then(testRepopulateFields('/legal/terms', 'fxa-tos-header'))
        .then(testRepopulateFields('/legal/privacy', 'fxa-pp-header'));
    },

    'form prefill information is cleared after sign in->sign out': function () {
      return this.remote
        .then(openForceAuth({ query: { email: email }}))
        .then(fillOutForceAuth(PASSWORD))

        .then(testElementExists('#fxa-settings-header'))
        .then(click('#signout'))

        .then(testElementExists('#fxa-signin-header'))
        .then(testElementValueEquals('input[type=password]', ''));
    }
  });

  registerSuite({
    name: 'force_auth with an unregistered user',

    beforeEach: function () {
      email = TestHelpers.createEmail();

      return this.remote
        .then(clearBrowserState(this));
    },

    'sign in shows an error message': function () {
      var self = this;
      return this.remote
        .then(openForceAuth({ query: { email: email }}))
        .then(fillOutForceAuth(self, PASSWORD))
        .then(visibleByQSA('.error'));
    },

    'reset password shows an error message': function () {
      return this.remote
        .then(openForceAuth({ query: { email: email }}))
        .then(click('a[href="/confirm_reset_password"]'))
        .then(visibleByQSA('.error'));
    }
  });


  function testRepopulateFields(dest, header) {
    return function () {
      return this.parent
        .then(openForceAuth({ query: { email: email }}))
        .then(type('input[type=password]', PASSWORD))
        .then(click('a[href="' + dest + '"]'))

        .then(testElementExists('#' + header))
        .then(click('.back'))

        .then(testElementExists('#fxa-force-auth-header'))
        // check the email address was re-populated
        .then(testElementValueEquals('input[type=password]', PASSWORD));
    };
  }
});
