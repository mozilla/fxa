/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const FunctionalHelpers = require('./lib/helpers');
const selectors = require('./lib/selectors');
const config = intern._config;

const QUERY_PARAMS = '?context=fx_desktop_v3&service=sync&action=email';
const ENTER_EMAIL_URL = `${config.fxaContentRoot}${QUERY_PARAMS}`;

const PASSWORD = 'password1234567';
let email;

const {
  clearBrowserState,
  click,
  createEmail,
  createUser,
  fillOutEmailFirstSignIn,
  openPage,
  testElementExists,
} = FunctionalHelpers;

registerSuite('push_login', {
  beforeEach: function () {
    email = createEmail('sync{id}');

    return this.remote
      .then(clearBrowserState({ force: true }))
      .then(createUser(email, PASSWORD, { preVerified: true }));
  },

  tests: {
    'verify login via push - treatment': function () {
      return this.remote
        .then(
          openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER, {
            query: {
              forceExperiment: 'pushLogin',
              forceExperimentGroup: 'treatment',
            },
          })
        )
        .then(fillOutEmailFirstSignIn(email, PASSWORD))
        .then(testElementExists(selectors.PUSH_VERIFY_LOGIN.HEADER))

        .then(click(selectors.PUSH_VERIFY_LOGIN.RESEND))
        .then(click(selectors.PUSH_VERIFY_LOGIN.SEND_EMAIL))

        .then(testElementExists(selectors.SIGNIN_TOKEN_CODE.HEADER));
    },
    control: function () {
      return this.remote
        .then(
          openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER, {
            query: {
              forceExperiment: 'pushLogin',
              forceExperimentGroup: 'control',
            },
          })
        )
        .then(fillOutEmailFirstSignIn(email, PASSWORD))

        .then(testElementExists(selectors.SIGNIN_TOKEN_CODE.HEADER));
    },
  },
});
