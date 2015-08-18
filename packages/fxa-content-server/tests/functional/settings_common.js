/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'require',
  'intern/node_modules/dojo/node!xmlhttprequest',
  'app/bower_components/fxa-js-client/fxa-client',
  'tests/lib/helpers',
  'tests/functional/lib/helpers'
], function (intern, registerSuite, require, nodeXMLHttpRequest, FxaClient,
      TestHelpers, FunctionalHelpers) {
  var config = intern.config;
  var AUTH_SERVER_ROOT = config.fxaAuthRoot;
  var SETTINGS_URL = config.fxaContentRoot + 'settings';
  var SIGNIN_URL = config.fxaContentRoot + 'signin';
  var AUTOMATED = '&automatedBrowser=true';

  var FIRST_PASSWORD = 'password';
  var SECOND_PASSWORD = 'new_password';
  var email;
  var client;
  var accountData;

  var SETTINGS_PAGES = {
    '': 'fxa-settings-header',
    '/avatar/change': 'avatar-change',
    '/avatar/gravatar': 'avatar-gravatar',
    '/avatar/gravatar_permissions': 'avatar-gravatar-permissions',
    '/avatar/camera': 'avatar-camera',
    '/avatar/crop': 'avatar-crop',
    '/change_password': 'change-password',
    '/communication_preferences': 'communication-preferences',
    '/delete_account': 'delete-account',
    '/display_name': 'display-name'
  };


  var unverifiedSuite = {
    name: 'visiting settings pages unverified',

    beforeEach: function () {
      email = TestHelpers.createEmail();

      client = new FxaClient(AUTH_SERVER_ROOT, {
        xhr: nodeXMLHttpRequest.XMLHttpRequest
      });

      var self = this;
      return client.signUp(email, FIRST_PASSWORD)
              .then(function () {
                return FunctionalHelpers.clearBrowserState(self);
              });
    },

    afterEach: function () {
      return FunctionalHelpers.clearBrowserState(this);
    }
  };

  function unverifiedAccountTest (suite, page) {
    suite['visit settings' + page + ' with an unverified account redirects to confirm'] = function () {
      var self = this;
      var url = SETTINGS_URL + page;

      return FunctionalHelpers.fillOutSignIn(self, email, FIRST_PASSWORD)

        .findById('fxa-confirm-header')
        .end()

        .get(require.toUrl(url))
        // Expect to get redirected to confirm since the account is unverified
        .findById('fxa-confirm-header')
        .end();
    };
  }

  var verifiedSuite = {
    name: 'settings common',

    beforeEach: function () {
      email = TestHelpers.createEmail();

      client = new FxaClient(AUTH_SERVER_ROOT, {
        xhr: nodeXMLHttpRequest.XMLHttpRequest
      });

      var self = this;
      return client.signUp(email, FIRST_PASSWORD, { preVerified: true })
              .then(function (result) {
                accountData = result;
                return FunctionalHelpers.clearBrowserState(self);
              });
    },

    afterEach: function () {
      return FunctionalHelpers.clearBrowserState(this);
    }
  };

  function verifiedAccountTest (suite, page, pageHeader) {
    var url = SETTINGS_URL + page;

    suite['visit settings' + page + ' with an invalid sessionToken redirects to signin'] = function () {
      // Changing the password invalidates the current sessionToken
      var self = this;

      return FunctionalHelpers.clearBrowserState(self)
        .then(function () {
          return client.passwordChange(email, FIRST_PASSWORD, SECOND_PASSWORD);
        })
        .then(function () {
          return self.remote
            .get(require.toUrl(url))
            // Expect to get redirected to sign in since the sessionToken is invalid
            .findById('fxa-signin-header')
            .end();
        });
    };

    suite['visit settings' + page + ' with an unknown uid parameter redirects to signin'] = function () {
      var self = this;

      return self.remote
        .get(require.toUrl(SIGNIN_URL))
        .setFindTimeout(intern.config.pageLoadTimeout)
        .then(function () {
          return FunctionalHelpers.fillOutSignIn(self, email, FIRST_PASSWORD);
        })
        .findById('fxa-settings-header')
        .end()

        .get(require.toUrl(url + '?uid=baduid'))
        // Expect to get redirected to sign in since the uid is unknown
        .findById('fxa-signin-header')
        .end();
    };

    suite['visit settings' + page + ' with a known uid does not redirect'] = function () {
      var self = this;

      return self.remote
        .get(require.toUrl(SIGNIN_URL))
        .setFindTimeout(intern.config.pageLoadTimeout)
        .then(function () {
          return FunctionalHelpers.fillOutSignIn(self, email, FIRST_PASSWORD);
        })

        .findById('fxa-settings-header')
        .end()

        .get(require.toUrl(url + '?uid=' + accountData.uid + AUTOMATED))
        .findById(pageHeader)
        .end();
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
