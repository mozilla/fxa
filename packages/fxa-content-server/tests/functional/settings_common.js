/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const nodeXMLHttpRequest = require('xmlhttprequest');
const FxaClient = require('fxa-js-client');
const TestHelpers = require('../lib/helpers');
const FunctionalHelpers = require('./lib/helpers');
var config = intern._config;
var AUTH_SERVER_ROOT = config.fxaAuthRoot;
var SETTINGS_URL = config.fxaContentRoot + 'settings';
var SIGNIN_URL = config.fxaContentRoot + 'signin';
var AUTOMATED = '&automatedBrowser=true';

var PASSWORD = 'password';
var email;
var client;
var accountData;

var clearBrowserState = FunctionalHelpers.clearBrowserState;
var createUser = FunctionalHelpers.createUser;
var fillOutSignIn = FunctionalHelpers.fillOutSignIn;
var openPage = FunctionalHelpers.openPage;
var testElementExists = FunctionalHelpers.testElementExists;

var SETTINGS_PAGES = {
  '': 'fxa-settings-header',
  '/avatar/camera': 'avatar-camera',
  '/avatar/change': 'avatar-change',
  '/avatar/crop': 'avatar-crop',
  '/change_password': 'change-password',
  '/communication_preferences': 'communication-preferences',
  '/delete_account': 'delete-account',
  '/display_name': 'display-name',
};

var unverifiedSuite = {
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
    var url = SETTINGS_URL + page;

    return (
      this.remote
        .then(fillOutSignIn(email, PASSWORD))
        .then(testElementExists('#fxa-confirm-header'))

        // Expect to get redirected to confirm since the account is unverified
        .then(openPage(url, '#fxa-confirm-header'))
    );
  };
}

var verifiedSuite = {
  beforeEach: function() {
    email = TestHelpers.createEmail();

    client = new FxaClient(AUTH_SERVER_ROOT, {
      xhr: nodeXMLHttpRequest.XMLHttpRequest,
    });

    return this.remote
      .then(clearBrowserState())
      .then(createUser(email, PASSWORD, { preVerified: true }))
      .then(function(result) {
        accountData = result;
      });
  },
  tests: {},
};

function verifiedAccountTest(suite, page, pageHeader) {
  var url = SETTINGS_URL + page;
  suite[
    'visit settings' +
      page +
      ' with an invalid sessionToken redirects to signin'
  ] = function() {
    return (
      this.remote
        .then(clearBrowserState())
        .then(function() {
          // invalidate the session token
          return client.sessionDestroy(accountData.sessionToken);
        })
        // Expect to get redirected to sign in since the
        // sessionToken is invalid
        .then(openPage(url, '#fxa-signin-header'))
    );
  };

  suite[
    'visit settings' +
      page +
      ' with an unknown uid parameter redirects to signin'
  ] = function() {
    return (
      this.remote
        .then(openPage(SIGNIN_URL, '#fxa-signin-header'))
        .then(fillOutSignIn(email, PASSWORD))

        .then(testElementExists('#fxa-settings-header'))

        // Expect to get redirected to sign in since the uid is unknown
        .then(
          openPage(
            url + '?uid=' + TestHelpers.createUID(),
            '#fxa-signin-header'
          )
        )
    );
  };

  suite[
    'visit settings' + page + ' with a known uid does not redirect'
  ] = function() {
    return (
      this.remote
        .then(openPage(SIGNIN_URL, '#fxa-signin-header'))
        .then(fillOutSignIn(email, PASSWORD))

        .then(testElementExists('#fxa-settings-header'))

        // Expect to get redirected to sign in since the uid is unknown
        .then(
          openPage(
            url + '?uid=' + accountData.uid + AUTOMATED,
            '#' + pageHeader
          )
        )
    );
  };
}

Object.keys(SETTINGS_PAGES).forEach(function(page) {
  unverifiedAccountTest(unverifiedSuite, page);
});

Object.keys(SETTINGS_PAGES).forEach(function(page) {
  verifiedAccountTest(verifiedSuite, page, SETTINGS_PAGES[page]);
});

registerSuite('visiting settings pages unverified', unverifiedSuite.tests);
registerSuite('settings common', verifiedSuite.tests);
