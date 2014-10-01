/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'intern/chai!assert',
  'require',
  'intern/node_modules/dojo/node!xmlhttprequest',
  'app/bower_components/fxa-js-client/fxa-client',
  'app/scripts/lib/constants',
  'tests/lib/helpers',
  'tests/functional/lib/helpers',
  'tests/functional/lib/fx-desktop'
], function (intern, registerSuite, assert, require, nodeXMLHttpRequest,
      FxaClient, Constants, TestHelpers, FunctionalHelpers, FxDesktopHelpers) {
  'use strict';

  var listenForFxaCommands = FxDesktopHelpers.listenForFxaCommands;
  var testIsBrowserNotifiedOfLogin = FxDesktopHelpers.testIsBrowserNotifiedOfLogin;

  var config = intern.config;
  var AUTH_SERVER_ROOT = config.fxaAuthRoot;
  var SIGNIN_URL = config.fxaContentRoot + 'signin';
  var SETTINGS_URL = config.fxaContentRoot + 'settings';

  var FIRST_PASSWORD = 'password';
  var SECOND_PASSWORD = 'new_password';
  var email;
  var client;


  registerSuite({
    name: 'settings',

    beforeEach: function () {
      email = TestHelpers.createEmail();

      client = new FxaClient(AUTH_SERVER_ROOT, {
        xhr: nodeXMLHttpRequest.XMLHttpRequest
      });

      var self = this;
      return client.signUp(email, FIRST_PASSWORD, { preVerified: true })
              .then(function () {
                return FunctionalHelpers.clearBrowserState(self);
              });
    },

    teardown: function () {
      return FunctionalHelpers.clearBrowserState(this);
    },

    'sign in, go to settings, sign out': function () {
      return this.get('remote')
        .get(require.toUrl(SIGNIN_URL))
        .setFindTimeout(intern.config.pageLoadTimeout)
        .findByCssSelector('form input.email')
          .click()
          .type(email)
        .end()

        .findByCssSelector('form input.password')
          .click()
          .type(FIRST_PASSWORD)
        .end()

        .findByCssSelector('button[type="submit"]')
          .click()
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
      return this.get('remote')
        .get(require.toUrl(SIGNIN_URL + '?context=' + Constants.FX_DESKTOP_CONTEXT))
        .setFindTimeout(intern.config.pageLoadTimeout)
        .execute(listenForFxaCommands)

        .findByCssSelector('form input.email')
          .click()
          .type(email)
        .end()

        .findByCssSelector('form input.password')
          .click()
          .type(FIRST_PASSWORD)
        .end()

        .findByCssSelector('button[type="submit"]')
          .click()
        .end()

        .then(function () {
          return testIsBrowserNotifiedOfLogin(self);
        })

        .get(require.toUrl(SETTINGS_URL))

        .findById('fxa-settings-header')
        .end()

        // make sure the sign out element doesn't exist
        .setFindTimeout(0)
        .findById('signout')
          .then(assert.fail, assert.ok)
        .end();
    },

    'visit settings page with an invalid sessionToken redirects to signin': function () {
      // Changing the password invalidates the current sessionToken
      var self = this;

      return FunctionalHelpers.clearBrowserState(self)
        .then(function () {
          return client.passwordChange(email, FIRST_PASSWORD, SECOND_PASSWORD);
        })
        .then(function () {
          return self.get('remote')
            .get(require.toUrl(SETTINGS_URL))
            // Expect to get redirected to sign in since the sessionToken is invalid
            .findById('fxa-signin-header')
            .end();
        });
    },

    'sign in, delete account': function () {
      return this.get('remote')
        .get(require.toUrl(SIGNIN_URL))
        .findByCssSelector('form input.email')
          .click()
          .type(email)
        .end()

        .findByCssSelector('form input.password')
          .click()
          .type(FIRST_PASSWORD)
        .end()

        .findByCssSelector('button[type="submit"]')
          .click()
        .end()

        .findById('fxa-settings-header')
        .end()

        // Go to delete account screen
        .findById('delete-account')
          .click()
        .end()

        // success is going to the delete account page
        .findById('fxa-delete-account-header')
        .end()

        .findByCssSelector('form input.password')
          .click()
          .type(FIRST_PASSWORD)
        .end()

        // delete account
        .findByCssSelector('button[type="submit"]')
          .click()
        .end()

        // success is going to the signup page
        .findById('fxa-signup-header')
        .end();
    }
  });
});
