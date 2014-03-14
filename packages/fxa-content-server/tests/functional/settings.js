/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern!object',
  'intern/chai!assert',
  'require',
  'intern/node_modules/dojo/node!xmlhttprequest',
  'app/bower_components/fxa-js-client/fxa-client',
  'app/scripts/lib/constants'
], function (registerSuite, assert, require, nodeXMLHttpRequest, FxaClient, Constants) {
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
      return client.signUp(email, FIRST_PASSWORD, {preVerified: true});
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
        // Temporary solution to force the correct context.
        // TODO: (Issue #742) Refactor functional tests to not share state between tests
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

    'sign in to desktop context for signing out': function () {
      return this.get('remote')
        .get(require.toUrl(SIGNIN_URL + '?context=' + Constants.FX_DESKTOP_CONTEXT))
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
        .end()
        // We need to wait for the sign in to finish. When the desktop context
        // this will manifest itself in the "too many retries" error being
        // shown, which signals the desktop channel didn't get a response.
        .waitForVisibleByCssSelector('#stage .error')
        .elementByCssSelector('#stage .error').isDisplayed()
        .then(function (isDisplayed) {
          assert.equal(isDisplayed, true);
        });
    },

    'go to settings page from the desktop context, make sure the user cannot sign out': function () {
      return this.get('remote')
        .get(require.toUrl(SETTINGS_URL))
        .waitForElementById('fxa-settings-header')
        // make sure the sign out element doesn't exist
        .hasElementById('signout')
          .then(function(hasElement) {
            assert(!hasElement);
          })
        // Clear out the session since we didn't sign out. This isn't ideal since it implies too much
        // knowledge of the implementation of the Session module but it guarantees that we don't
        // break the other tests.
        .eval('sessionStorage.clear(); localStorage.clear();') // jshint ignore:line
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
