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
  'tests/lib/helpers',
  'tests/functional/lib/helpers',
  'tests/functional/lib/test'
], function (intern, registerSuite, assert, require, nodeXMLHttpRequest,
      FxaClient, TestHelpers, FunctionalHelpers, Test)  {
  'use strict';

  var config = intern.config;
  var AUTH_SERVER_ROOT = config.fxaAuthRoot;
  var PAGE_URL = config.fxaContentRoot + 'delete_account';

  var PASSWORD = 'password';
  var email;
  var client;

  registerSuite({
    name: 'delete_account',

    beforeEach: function () {
      email = TestHelpers.createEmail();

      client = new FxaClient(AUTH_SERVER_ROOT, {
        xhr: nodeXMLHttpRequest.XMLHttpRequest
      });

      var self = this;
      return client.signUp(email, PASSWORD, { preVerified: true })
        .then(function () {
          return FunctionalHelpers.clearBrowserState(self);
        });
    },

    teardown: function () {
      return FunctionalHelpers.clearBrowserState(this);
    },

    'sign in, delete account': function () {
      return FunctionalHelpers.fillOutSignIn(this, email, PASSWORD)
        .findById('fxa-settings-header')
        .end()

        // Go to delete account screen
        .findById('delete-account')
          .click()
        .end()

        // ensure the back button exists
        .findById('back')
        .end()

        // success is going to the delete account page
        .findById('fxa-delete-account-header')
        .end()

        .findByCssSelector('form input.password')
          .click()
          .type(PASSWORD)
        .end()

        // delete account
        .findByCssSelector('button[type="submit"]')
          .click()
        .end()

        // success is going to the signup page
        .findById('fxa-signup-header')
        .end();
    },

    'visit delete account directly - no back button': function () {
      var self = this;
      return FunctionalHelpers.fillOutSignIn(this, email, PASSWORD)
        .findById('fxa-settings-header')
        .end()

        // Go to delete account screen directly
        .get(require.toUrl(PAGE_URL))
        .findById('fxa-delete-account-header')
        .end()

        .then(Test.noElementById(self, 'back'));
    }

  });
});
