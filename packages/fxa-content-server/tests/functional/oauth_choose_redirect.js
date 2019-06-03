/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const TestHelpers = require('../lib/helpers');
const FunctionalHelpers = require('./lib/helpers');
const selectors = require('./lib/selectors');

const config = intern._config;

const CONTENT_SERVER_ROOT = config.fxaContentRoot;
const PASSWORD = 'passwordzxcv';

const {
  clearBrowserState,
  createUser,
  getQueryParamValue,
  openFxaFromRp,
  openPage,
  testElementValueEquals,
} = FunctionalHelpers;

let email;
let oAuthUrl;

registerSuite('oauth choose redirect', {
  beforeEach: function () {
    email = TestHelpers.createEmail();

    return this.remote
      .then(clearBrowserState())
      .then(openFxaFromRp('signup'))
      .then(getQueryParamValue('client_id'))
      .then((clientId) => {
        oAuthUrl = `${CONTENT_SERVER_ROOT}oauth?&scope=profile&client_id=${clientId}&email=${encodeURIComponent(email)}`;
      });
  },

  tests: {
    'oauth endpoint redirects to signup with an unregistered email': function () {
      return this.remote
        .then(openPage(oAuthUrl, selectors.SIGNUP.HEADER))
        .then(testElementValueEquals(selectors.SIGNUP.EMAIL, email));
    },

    'oauth endpoint redirects to signin with a registered email': function () {
      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(openPage(oAuthUrl, selectors.SIGNIN.HEADER))
        .then(testElementValueEquals(selectors.SIGNIN.EMAIL, email));
    }
  }
});
