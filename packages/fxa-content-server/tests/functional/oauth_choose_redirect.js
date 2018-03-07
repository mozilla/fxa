/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const TestHelpers = require('../lib/helpers');
const FunctionalHelpers = require('./lib/helpers');
const config = intern._config;
const CONTENT_SERVER_ROOT = config.fxaContentRoot;
const TRUSTED_REDIRECT_URI = `${config.fxaOAuthApp}api/oauth`;
const PASSWORD = 'password';

const clearBrowserState = FunctionalHelpers.clearBrowserState;
const getQueryParamValue = FunctionalHelpers.getQueryParamValue;
const openFxaFromRp = FunctionalHelpers.openFxaFromRp;
const openPage = FunctionalHelpers.openPage;
const testElementValueEquals = FunctionalHelpers.testElementValueEquals;

let email;
let oAuthUrl = `${CONTENT_SERVER_ROOT}oauth?&scope=profile&redirect_uri=${TRUSTED_REDIRECT_URI}&client_id=`;

registerSuite('oauth choose redirect', {
  beforeEach: function () {
    email = TestHelpers.createEmail();

    return this.remote.then(clearBrowserState());
  },
  tests: {
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
        .then(FunctionalHelpers.createUser(email, PASSWORD, {preVerified: true}))
        .then(openPage(validAccountUrl, '#fxa-signin-header'))
        .then(testElementValueEquals('input[type=email]', email));
    }
  }
});
