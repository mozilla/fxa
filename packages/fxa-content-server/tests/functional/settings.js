/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern!object',
  'intern/chai!assert',
  'require',
  'intern/node_modules/dojo/node!xmlhttprequest',
  'app/bower_components/fxa-js-client/fxa-client'
], function (registerSuite, assert, require, nodeXMLHttpRequest, FxaClient) {
  'use strict';

  var AUTH_SERVER_ROOT = 'http://127.0.0.1:9000/v1';
  var SIGNIN_URL = 'http://localhost:3030/signin';
  var SETTINGS_URL = 'http://localhost:3030/settings';

  var FIRST_PASSWORD = 'password';
  var SECOND_PASSWORD = 'new_password';
  var email;

  registerSuite({
    name: 'settings',

    'sign up': function () {
      email = 'signin' + Math.random() + '@example.com';

      var client = new FxaClient(AUTH_SERVER_ROOT, {
        xhr: nodeXMLHttpRequest.XMLHttpRequest
      });
      return client.signUp(email, FIRST_PASSWORD);
    },

    'sign in for signing out': function () {
      return this.get('remote')
        .get(require.toUrl(SIGNIN_URL))
        .waitForElementById('fxa-signin-header')

        .elementByCssSelector('form input.email')
          .click()
          .type(email)
        .end()

        .elementByCssSelector('form input.password')
          .click()
          .type(FIRST_PASSWORD)
        .end()

        .elementByCssSelector('button[type="submit"]')
          .click()
        .end();
    },

    'go to settings page, sign out': function () {
      return this.get('remote')
        .get(require.toUrl(SETTINGS_URL))
        .waitForElementById('fxa-settings-header')

        // sign the user out
        .elementById('signout')
          .click()
        .end()

        // success is going to the signin page
        .waitForElementById('fxa-signin-header')
        .end();
    },

    'sign in for changing password': function () {
      return this.get('remote')
        .get(require.toUrl(SIGNIN_URL))
        .waitForElementById('fxa-signin-header')

        .elementByCssSelector('form input.email')
          .click()
          .type(email)
        .end()

        .elementByCssSelector('form input.password')
          .click()
          .type(FIRST_PASSWORD)
        .end()

        .elementByCssSelector('button[type="submit"]')
          .click()
        .end();
    },

    'go to settings page, change password': function () {
      return this.get('remote')
        .get(require.toUrl(SETTINGS_URL))
        .waitForElementById('fxa-settings-header')
        .end()

        // Go to change password screen
        .elementById('change-password')
          .click()
        .end()

        .waitForElementById('fxa-change-password-header')

        .elementById('old_password')
          .click()
          .type(FIRST_PASSWORD)
        .end()

        .elementById('new_password')
          .click()
          .type(SECOND_PASSWORD)
        .end()

        .elementByCssSelector('button[type="submit"]')
          .click()
        .end()

        // brittle, but some processing time.
        .wait(2000)

        .elementByCssSelector('.success').isDisplayed()
          .then(function (isDisplayed) {
            assert.equal(isDisplayed, true);
          })
        .end();
    },

    'sign in with new password': function () {
      return this.get('remote')
        .get(require.toUrl(SIGNIN_URL))
        .waitForElementById('fxa-signin-header')

        .elementByCssSelector('form input.email')
          .click()
          .type(email)
        .end()

        .elementByCssSelector('form input.password')
          .click()
          .type(SECOND_PASSWORD)
        .end()

        .elementByCssSelector('button[type="submit"]')
          .click()
        .end();
    },

    'go to settings page, delete account': function () {
      return this.get('remote')
        .get(require.toUrl(SETTINGS_URL))
        .waitForElementById('fxa-settings-header')
        .end()

        // Go to delete account screen
        .elementById('delete-account')
          .click()
        .end()

        // success is going to the delete account page
        .waitForElementById('fxa-delete-account-header')
        .end()

        .elementByCssSelector('form input.password')
          .click()
          .type(SECOND_PASSWORD)
        .end()

        // delete account
        .elementByCssSelector('button[type="submit"]')
          .click()
        .end()

        // success is going to the signup page
        .waitForElementById('fxa-signup-header')
        .end();
    }

  });
});
