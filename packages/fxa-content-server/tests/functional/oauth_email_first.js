/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const assert = intern.getPlugin('chai').assert;
const { createEmail } = require('../lib/helpers');
const FunctionalHelpers = require('./lib/helpers');
const config = intern._config;
const OAUTH_APP = config.fxaOAuthApp;
const selectors = require('./lib/selectors');

const PASSWORD = 'password';
let email;

const {
  clearBrowserState,
  click,
  createUser,
  openFxaFromRp,
  openVerificationLinkInSameTab,
  reOpenWithAdditionalQueryParams,
  testElementExists,
  testElementValueEquals,
  thenify,
  type,
} = FunctionalHelpers;

const testAtOAuthApp = thenify(function () {
  return this.parent
    .then(testElementExists(selectors['123DONE'].AUTHENTICATED))

    .getCurrentUrl()
    .then(function (url) {
      // redirected back to the App
      assert.ok(url.indexOf(OAUTH_APP) > -1);
    });
});

registerSuite('oauth email first', {
  beforeEach: function () {
    email = createEmail();

    return this.remote
      .then(clearBrowserState({
        '123done': true,
        contentServer: true
      }));
  },
  tests: {
    'signup': function () {
      return this.remote
        .then(openFxaFromRp('email-first', { header: selectors.ENTER_EMAIL.HEADER }))

        .then(type(selectors.ENTER_EMAIL.EMAIL, email))
        .then(click(selectors.ENTER_EMAIL.SUBMIT, selectors.SIGNUP_PASSWORD.HEADER))

        .then(testElementValueEquals(selectors.SIGNUP_PASSWORD.EMAIL, email))
        .then(type(selectors.SIGNUP_PASSWORD.PASSWORD, PASSWORD))
        .then(type(selectors.SIGNUP_PASSWORD.VPASSWORD, PASSWORD))
        .then(type(selectors.SIGNUP_PASSWORD.AGE, 21))
        .then(click(selectors.SIGNUP_PASSWORD.SUBMIT, selectors.CONFIRM_SIGNUP.HEADER))

        .then(openVerificationLinkInSameTab(email, 0))

        .then(testAtOAuthApp());
    },

    'signin verified': function () {
      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(openFxaFromRp('email-first', { header: selectors.ENTER_EMAIL.HEADER }))

        .then(testElementExists(selectors.ENTER_EMAIL.HEADER))
        .then(type(selectors.ENTER_EMAIL.EMAIL, email))
        .then(click(selectors.ENTER_EMAIL.SUBMIT, selectors.SIGNIN_PASSWORD.HEADER))

        .then(testElementValueEquals(selectors.SIGNIN_PASSWORD.EMAIL, email))
        .then(type(selectors.SIGNIN_PASSWORD.PASSWORD, PASSWORD))
        .then(click(selectors.SIGNIN_PASSWORD.SUBMIT))

        .then(testAtOAuthApp());
    },

    'signin unverified': function () {
      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: false }))
        .then(openFxaFromRp('email-first', { header: selectors.ENTER_EMAIL.HEADER }))

        .then(testElementExists(selectors.ENTER_EMAIL.HEADER))
        .then(type(selectors.ENTER_EMAIL.EMAIL, email))
        .then(click(selectors.ENTER_EMAIL.SUBMIT, selectors.SIGNIN_PASSWORD.HEADER))

        .then(testElementValueEquals(selectors.SIGNIN_PASSWORD.EMAIL, email))
        .then(type(selectors.SIGNIN_PASSWORD.PASSWORD, PASSWORD))
        .then(click(selectors.SIGNIN_PASSWORD.SUBMIT, selectors.CONFIRM_SIGNUP.HEADER))

        .then(openVerificationLinkInSameTab(email, 1))

        .then(testAtOAuthApp());
    },


    'email specified by relier, not registered': function () {
      return this.remote
        .then(openFxaFromRp('email-first', { header: selectors.ENTER_EMAIL.HEADER }))
        .then(reOpenWithAdditionalQueryParams({ email }, selectors.SIGNUP_PASSWORD.HEADER ))
        .then(testElementValueEquals(selectors.SIGNUP_PASSWORD.EMAIL, email))
        // user realizes it's the wrong email address.
        .then(click(selectors.SIGNUP_PASSWORD.LINK_MISTYPED_EMAIL, selectors.ENTER_EMAIL.HEADER))

        .then(testElementValueEquals(selectors.ENTER_EMAIL.EMAIL, email));

    },

    'email specified by relier, registered': function () {
      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(openFxaFromRp('email-first', { header: selectors.ENTER_EMAIL.HEADER }))
        .then(reOpenWithAdditionalQueryParams({ email }, selectors.SIGNIN_PASSWORD.HEADER ))
        .then(testElementValueEquals(selectors.SIGNIN_PASSWORD.EMAIL, email))
        // user realizes it's the wrong email address.
        .then(click(selectors.SIGNIN_PASSWORD.LINK_MISTYPED_EMAIL, selectors.ENTER_EMAIL.HEADER))

        .then(testElementValueEquals(selectors.ENTER_EMAIL.EMAIL, email));
    }
  }
});
