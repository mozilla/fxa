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
  var PASSWORD = 'password';

  var clearBrowserState = FunctionalHelpers.clearBrowserState;
  var getQueryParamValue = FunctionalHelpers.getQueryParamValue;
  var openFxaFromRp = FunctionalHelpers.openFxaFromRp;
  var openPage = FunctionalHelpers.openPage;
  var testElementValueEquals = FunctionalHelpers.testElementValueEquals;

  var email;
  var oAuthUrl = CONTENT_SERVER_ROOT + 'oauth?&scope=profile&client_id=';

  registerSuite({
    name: 'oauth choose redirect',

    beforeEach: function () {
      email = TestHelpers.createEmail();

      return this.remote.then(clearBrowserState());
    },

    'get client_id for other tests': function () {
      return this.remote
        .then(openFxaFromRp('signup'))
        .then(getQueryParamValue('client_id'))
        .then(function (clientId) {
          oAuthUrl += clientId;
        });
    },

    'oauth endpoint redirects to signup with an unregistered email': function () {
      var invalidAccountUrl = oAuthUrl + '&email=' + email;

      return this.remote
        .then(openPage(invalidAccountUrl, '#fxa-signup-header'))
        .then(testElementValueEquals('input[type=email]', email));
    },

    'oauth endpoint redirects to signin with a registered email': function () {
      var validAccountUrl = oAuthUrl + '&email=' + email;

      return this.remote
        .then(FunctionalHelpers.createUser(email, PASSWORD, { preVerified: true}))
        .then(openPage(validAccountUrl, '#fxa-signin-header'))
        .then(testElementValueEquals('input[type=email]', email));
    }
  });
});
