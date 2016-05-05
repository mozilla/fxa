/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'require',
  'intern/node_modules/dojo/node!xmlhttprequest',
  'app/bower_components/fxa-js-client/fxa-client',
  'app/scripts/lib/constants',
  'tests/lib/helpers',
  'tests/functional/lib/helpers',
  'tests/functional/lib/fx-desktop'
], function (intern, registerSuite, require, nodeXMLHttpRequest,
      FxaClient, Constants, TestHelpers, FunctionalHelpers, FxDesktopHelpers) {
  var listenForFxaCommands = FxDesktopHelpers.listenForFxaCommands;
  var testIsBrowserNotifiedOfLogin = FxDesktopHelpers.testIsBrowserNotifiedOfLogin;

  var config = intern.config;
  var AUTH_SERVER_ROOT = config.fxaAuthRoot;
  var SIGNIN_URL = config.fxaContentRoot + 'signin';
  var SETTINGS_URL = config.fxaContentRoot + 'settings';

  var testErrorTextInclude = FunctionalHelpers.testErrorTextInclude;

  var FIRST_PASSWORD = 'password';
  var email;
  var client;
  var accountData;


  registerSuite({
    name: 'settings',

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
    },

    'with an invalid email': function () {
      return FunctionalHelpers.openPage(this, SETTINGS_URL + '?email=invalid', '#fxa-400-header')
        .then(testErrorTextInclude('invalid'))
        .then(testErrorTextInclude('email'));
    },

    'with an empty email': function () {
      return FunctionalHelpers.openPage(this, SETTINGS_URL + '?email=', '#fxa-400-header')
        .then(testErrorTextInclude('invalid'))
        .then(testErrorTextInclude('email'));
    },

    'with an invalid uid': function () {
      return FunctionalHelpers.openPage(this, SETTINGS_URL + '?uid=invalid', '#fxa-400-header')
        .then(testErrorTextInclude('invalid'))
        .then(testErrorTextInclude('uid'));
    },

    'with an empty uid': function () {
      return FunctionalHelpers.openPage(this, SETTINGS_URL + '?uid=', '#fxa-400-header')
        .then(testErrorTextInclude('invalid'))
        .then(testErrorTextInclude('uid'));
    },

    'sign in, go to settings, sign out': function () {
      var self = this;
      return FunctionalHelpers.openPage(this, SIGNIN_URL, '#fxa-signin-header')
        .then(function () {
          return FunctionalHelpers.fillOutSignIn(self, email, FIRST_PASSWORD);
        })

        .findByCssSelector('#fxa-settings-header')
        .end()

        // sign the user out
        .findById('signout')
          .click()
        .end()

        // success is going to the signin page
        .findById('fxa-signin-header')
        .end();
    },

    'sign in to desktop context, go to settings, no way to sign out': function () {
      var self = this;
      var url = SIGNIN_URL + '?context=' + Constants.FX_DESKTOP_V1_CONTEXT + '&service=sync';

      return FunctionalHelpers.openPage(self, url, '#fxa-signin-header')
        .execute(listenForFxaCommands)

        .then(function () {
          return FunctionalHelpers.fillOutSignIn(self, email, FIRST_PASSWORD);
        })

        .then(function () {
          return testIsBrowserNotifiedOfLogin(self, email, { checkVerified: true });
        })

        .then(function () {
          return FunctionalHelpers.openPage(self, SETTINGS_URL, '#fxa-settings-header');
        })

        // make sure the sign out element doesn't exist
        .then(FunctionalHelpers.noSuchElement(self, '#signout'));
    },

    'sign in, go to settings with setting param set to avatar redirects to avatar change page ': function () {
      var self = this;
      return FunctionalHelpers.fillOutSignIn(self, email, FIRST_PASSWORD, true)

        .findById('fxa-settings-header')
        .end()

        .then(function () {
          return FunctionalHelpers.openPage(self, SETTINGS_URL + '?setting=avatar', '#avatar-options');
        })

        .findByCssSelector('.avatar-panel button.cancel')
          .click()
        .end()

        // Should not redirect after clicking the home button
        .findById('fxa-settings-header')
        .end();
    },

    'sign in, go to settings with setting param and additional params redirects to avatar change page ': function () {
      var self = this;
      return FunctionalHelpers.fillOutSignIn(self, email, FIRST_PASSWORD, true)

        .findById('fxa-settings-header')
        .end()

        .then(function () {
          return FunctionalHelpers.openPage(self, SETTINGS_URL + '?setting=avatar&uid=' + accountData.uid, '#avatar-options');
        })

        .findByCssSelector('.avatar-panel button.cancel')
          .click()
        .end()

        // Should not redirect after clicking the home button
        .findById('fxa-settings-header')
        .end();
    },

    'sign in with setting param set to avatar redirects to avatar change page ': function () {
      var self = this;
      return FunctionalHelpers.openPage(self, SIGNIN_URL + '?setting=avatar', '#fxa-signin-header')
        .then(function () {
          return FunctionalHelpers.fillOutSignIn(self, email, FIRST_PASSWORD);
        })
        .findById('avatar-options')
        .end();
    },

    'sign in with setting param and additional params redirects to avatar change page ': function () {
      var self = this;
      return FunctionalHelpers.openPage(self, SIGNIN_URL + '?setting=avatar&uid=' + accountData.uid, '#fxa-signin-header')
        .then(function () {
          return FunctionalHelpers.fillOutSignIn(self, email, FIRST_PASSWORD);
        })
        .findById('avatar-options')
        .end();
    },

    'sign in, open settings in a second tab, sign out': function () {
      var windowName = 'sign-out inter-tab functional test';
      var self = this;
      return FunctionalHelpers.fillOutSignIn(this, email, FIRST_PASSWORD)
        .then(function () {
          return FunctionalHelpers.openSettingsInNewTab(self, windowName);
        })
        .switchToWindow(windowName)

        .findById('fxa-settings-header')
        .end()

        .findById('signout')
          .click()
        .end()

        .findById('fxa-signin-header')
        .end()

        .closeCurrentWindow()
        .switchToWindow('')

        .findById('fxa-signin-header')
        .end();
    }
  });

  registerSuite({
    name: 'settings unverified',

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
    },

    'visit settings page with an unverified account redirects to confirm': function () {
      var self = this;

      return FunctionalHelpers.fillOutSignIn(self, email, FIRST_PASSWORD)
        .findById('fxa-confirm-header')
        .end()

        .get(require.toUrl(SETTINGS_URL))
        // Expect to get redirected to confirm since the account is unverified
        .findById('fxa-confirm-header')
        .end();
    }

  });
});
