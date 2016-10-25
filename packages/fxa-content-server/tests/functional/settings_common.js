/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'intern/browser_modules/dojo/node!xmlhttprequest',
  'app/bower_components/fxa-js-client/fxa-client',
  'tests/lib/helpers',
  'tests/functional/lib/helpers'
], function (intern, registerSuite, nodeXMLHttpRequest, FxaClient,
      TestHelpers, FunctionalHelpers) {
  var config = intern.config;
  var AUTH_SERVER_ROOT = config.fxaAuthRoot;
  var SETTINGS_URL = config.fxaContentRoot + 'settings';
  var SIGNIN_URL = config.fxaContentRoot + 'signin';
  var AUTOMATED = '&automatedBrowser=true';

  var PASSWORD = 'password';
  var email;
  var client;
  var accountData;

  var thenify = FunctionalHelpers.thenify;

  var clearBrowserState = thenify(FunctionalHelpers.clearBrowserState);
  var createUser = FunctionalHelpers.createUser;
  var fillOutSignIn = thenify(FunctionalHelpers.fillOutSignIn);
  var openPage = thenify(FunctionalHelpers.openPage);
  var testElementExists = FunctionalHelpers.testElementExists;

  var SETTINGS_PAGES = {
    '': 'fxa-settings-header',
    '/avatar/camera': 'avatar-camera',
    '/avatar/change': 'avatar-change',
    '/avatar/crop': 'avatar-crop',
    '/avatar/gravatar': 'avatar-gravatar',
    '/avatar/gravatar_permissions': 'avatar-gravatar-permissions',
    '/change_password': 'change-password',
    '/communication_preferences': 'communication-preferences',
    '/delete_account': 'delete-account',
    '/display_name': 'display-name'
  };


  var unverifiedSuite = {
    name: 'visiting settings pages unverified',

    beforeEach: function () {
      email = TestHelpers.createEmail();

      return this.remote
        .then(clearBrowserState(this))
        .then(createUser(email, PASSWORD));
    }
  };

  function unverifiedAccountTest (suite, page) {
    suite['visit settings' + page + ' with an unverified account redirects to confirm'] = function () {
      var url = SETTINGS_URL + page;

      return this.remote
        .then(fillOutSignIn(this, email, PASSWORD))
        .then(testElementExists('#fxa-confirm-header'))

        // Expect to get redirected to confirm since the account is unverified
        .then(openPage(this, url, '#fxa-confirm-header'));
    };
  }

  var verifiedSuite = {
    name: 'settings common',

    beforeEach: function () {
      email = TestHelpers.createEmail();

      client = new FxaClient(AUTH_SERVER_ROOT, {
        xhr: nodeXMLHttpRequest.XMLHttpRequest
      });

      return this.remote
        .then(clearBrowserState(this))
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(function (result) {
          accountData = result;
        });
    }
  };

  function verifiedAccountTest (suite, page, pageHeader) {
    var url = SETTINGS_URL + page;
    suite['visit settings' + page + ' with an invalid sessionToken redirects to signin'] = function () {
      return this.remote
        .then(clearBrowserState(this))
        .then(function () {
          // invalidate the session token
          return client.sessionDestroy(accountData.sessionToken);
        })
        // Expect to get redirected to sign in since the
        // sessionToken is invalid
        .then(openPage(this, url, '#fxa-signin-header'));
    };

    suite['visit settings' + page + ' with an unknown uid parameter redirects to signin'] = function () {
      return this.remote
        .then(openPage(this, SIGNIN_URL, '#fxa-signin-header'))
        .then(fillOutSignIn(this, email, PASSWORD))

        .then(testElementExists('#fxa-settings-header'))

        // Expect to get redirected to sign in since the uid is unknown
        .then(openPage(this, url + '?uid=' + TestHelpers.createUID(), '#fxa-signin-header'));
    };

    suite['visit settings' + page + ' with a known uid does not redirect'] = function () {
      return this.remote
        .then(openPage(this, SIGNIN_URL, '#fxa-signin-header'))
        .then(fillOutSignIn(this, email, PASSWORD))

        .then(testElementExists('#fxa-settings-header'))

        // Expect to get redirected to sign in since the uid is unknown
        .then(openPage(this, url + '?uid=' + accountData.uid + AUTOMATED, '#' + pageHeader));
    };
  }


  Object.keys(SETTINGS_PAGES).forEach(function (page) {
    unverifiedAccountTest(unverifiedSuite, page);
  });

  Object.keys(SETTINGS_PAGES).forEach(function (page) {
    verifiedAccountTest(verifiedSuite, page, SETTINGS_PAGES[page]);
  });

  registerSuite(unverifiedSuite);
  registerSuite(verifiedSuite);
});
