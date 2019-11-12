/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const TestHelpers = require('../lib/helpers');
const selectors = require('./lib/selectors');

const config = intern._config;
const ENTER_EMAIL_URL = config.fxaContentRoot;
const SETTINGS_URL = config.fxaContentRoot + 'settings';
const AUTOMATED = '&automatedBrowser=true';

const PASSWORD = 'passwordcxvz';
let email;
let accountData;

const {
  clearBrowserState,
  click,
  createUser,
  destroySessionForEmail,
  fillOutEmailFirstSignIn,
  openPage,
  testElementExists,
  type,
} = require('./lib/helpers');

const SETTINGS_PAGES = {
  '': '#fxa-settings-header',
  '/avatar/camera': '#avatar-camera',
  '/avatar/change': '#avatar-change',
  '/avatar/crop': '#avatar-crop',
  '/change_password': '#change-password',
  '/communication_preferences': '#communication-preferences',
  '/delete_account': '#delete-account',
  '/display_name': '#display-name',
};

const unverifiedSuite = {
  beforeEach: function() {
    email = TestHelpers.createEmail();

    return this.remote
      .then(clearBrowserState())
      .then(createUser(email, PASSWORD));
  },
  tests: {},
};

function unverifiedAccountTest(suite, page) {
  suite[
    'visit settings' + page + ' with an unverified account redirects to confirm'
  ] = function() {
    const url = SETTINGS_URL + page;

    return (
      this.remote
        .then(openPage(url, selectors.ENTER_EMAIL.HEADER))
        .then(fillOutEmailFirstSignIn(email, PASSWORD))
        .then(testElementExists(selectors.CONFIRM_SIGNUP.HEADER))

        // Expect to get redirected to confirm since the account is unverified
        .then(openPage(url, selectors.CONFIRM_SIGNUP.HEADER))
    );
  };
}

const verifiedSuite = {
  beforeEach: function() {
    email = TestHelpers.createEmail();

    return this.remote
      .then(clearBrowserState({ force: true }))
      .then(createUser(email, PASSWORD, { preVerified: true }))
      .then(function(result) {
        accountData = result;
      });
  },
  tests: {},
};

function verifiedAccountTest(suite, page, pageHeader) {
  const url = SETTINGS_URL + page;
  suite[
    'visit settings' +
      page +
      ' without a session requires authentication, back to page after authentication'
  ] = function() {
    return (
      this.remote
        // Expect to have to authenticate
        .then(openPage(url, selectors.ENTER_EMAIL.HEADER))
        .then(fillOutEmailFirstSignIn(email, PASSWORD))
        .then(() => {
          if (page === '/avatar/crop') {
            // can't go back to crop, an invalid image error
            // is displayed on the avatar/change screen.
            return this.remote.then(
              testElementExists(SETTINGS_PAGES['/avatar/change'])
            );
          } else {
            return this.remote.then(testElementExists(pageHeader));
          }
        })
    );
  };

  suite[
    'visit settings' +
      page +
      ' with an invalid session requires authentication, back to page after authentication'
  ] = function() {
    return (
      this.remote
        .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
        .then(fillOutEmailFirstSignIn(email, PASSWORD))
        .then(testElementExists(selectors.SETTINGS.HEADER))
        .then(destroySessionForEmail(email))

        // Expect to have to authenticate
        .then(openPage(url, selectors.SIGNIN_PASSWORD.HEADER))
        .then(type(selectors.SIGNIN_PASSWORD.PASSWORD, PASSWORD))
        .then(click(selectors.SIGNIN_PASSWORD.SUBMIT))

        .then(() => {
          if (page === '/avatar/crop') {
            // can't go back to crop, an invalid image error
            // is displayed on the avatar/change screen.
            return this.remote.then(
              testElementExists(SETTINGS_PAGES['/avatar/change'])
            );
          } else {
            return this.remote.then(testElementExists(pageHeader));
          }
        })
    );
  };

  suite[
    'visit settings' +
      page +
      ' with an unknown uid parameter redirects to enter email'
  ] = function() {
    return (
      this.remote
        .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
        .then(fillOutEmailFirstSignIn(email, PASSWORD))

        .then(testElementExists(selectors.SETTINGS.HEADER))

        // Expect to get redirected to signin password since the uid is unknown
        .then(
          openPage(
            url + '?uid=' + TestHelpers.createUID(),
            // TODO - this should go to enter email rather than signin password
            selectors.SIGNIN_PASSWORD.HEADER
          )
        )
    );
  };

  suite[
    'visit settings' + page + ' with a known uid does not redirect'
  ] = function() {
    return this.remote
      .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
      .then(fillOutEmailFirstSignIn(email, PASSWORD))

      .then(testElementExists(selectors.SETTINGS.HEADER))

      .then(openPage(url + '?uid=' + accountData.uid + AUTOMATED, pageHeader));
  };
}

Object.keys(SETTINGS_PAGES).forEach(function(page) {
  unverifiedAccountTest(unverifiedSuite.tests, page);
});

Object.keys(SETTINGS_PAGES).forEach(function(page) {
  verifiedAccountTest(verifiedSuite.tests, page, SETTINGS_PAGES[page]);
});

registerSuite('visiting settings pages unverified', unverifiedSuite);
registerSuite('settings common', verifiedSuite);
