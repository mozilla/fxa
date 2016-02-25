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
  var CONTENT_SERVER_ROOT = config.fxaContentRoot;

  var openPage = FunctionalHelpers.openPage;
  var testElementValueEquals = FunctionalHelpers.testElementValueEquals;

  var oAuthUrl = CONTENT_SERVER_ROOT + 'oauth?client_id=dcdb5ae7add825d2&scope=profile';
  var PASSWORD = 'password';
  var email;

  registerSuite({
    name: 'oauth choose redirect',

    beforeEach: function () {
      return FunctionalHelpers.clearBrowserState(this);
    },

    'oauth endpoint redirects to signup with invalid account email': function () {
      var self = this;

      email = TestHelpers.createEmail();

      var invalidAccountUrl = oAuthUrl + '&email=' + email;

      return openPage(self, invalidAccountUrl, '#fxa-signup-header')
        .then(testElementValueEquals('input[type=email]', email));
    },

    'oauth endpoint redirects to signin with valid account email': function () {
      var self = this;

      email = TestHelpers.createEmail();

      var validAccountUrl = oAuthUrl + '&email=' + email;

      return self.remote
        .then(FunctionalHelpers.createUser(email, PASSWORD, { preVerified: true}))
        .then(function () {
          return openPage(self, validAccountUrl, '#fxa-signin-header');
        })
        .then(testElementValueEquals('input[type=email]', email));
    }
  });
});
