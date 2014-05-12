/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern!object',
  'intern/chai!assert',
  'require',
  'intern/node_modules/dojo/node!xmlhttprequest',
  'app/bower_components/fxa-js-client/fxa-client',
  'app/scripts/lib/constants',
  'tests/lib/helpers'
], function (registerSuite, assert, require, nodeXMLHttpRequest, FxaClient, Constants, TestHelpers) {
  'use strict';

  var AUTH_SERVER_ROOT = 'http://127.0.0.1:9000/v1';
  var SIGNIN_URL = 'http://localhost:3030/signin';
  var SETTINGS_URL = 'http://localhost:3030/settings';

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
                  return self.get('remote')
                    .get(require.toUrl(SIGNIN_URL))
                    .waitForElementById('fxa-signin-header')
                    // Clear out the session. This isn't ideal since
                    // it implies too much knowledge of the implementation
                    // of the Session module but it guarantees that we don't
                    // break the other tests.
                    .safeEval('sessionStorage.clear(); localStorage.clear();') // jshint ignore:line
                    .end();

                });
    },

    teardown: function () {
      return this.get('remote')
        .get(require.toUrl(SIGNIN_URL))
        .waitForElementById('fxa-signin-header')
        // Clear out the session. This isn't ideal since
        // it implies too much knowledge of the implementation
        // of the Session module but it guarantees that we don't
        // break the other tests.
        .safeEval('sessionStorage.clear(); localStorage.clear();') // jshint ignore:line
        .end();
    },

    'sign in, go to settings, sign out': function () {
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
        .end()

        .waitForElementById('fxa-settings-header')

        // sign the user out
        .elementById('signout')
          .click()
        .end()

        // success is going to the signin page
        .waitForElementById('fxa-signin-header')
        .end();
    },

    'sign in to desktop context, go to settings, no way to sign out': function () {
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

        // Add an explicit timeout while waiting for the browser channel to
        // timeout and the progress-indicator to be taken away.
        // Without the explicit timeout, the implicit timeout kicks in while
        // waiting for `#stage .error` and the test fails.
        .wait(4000)

        // We need to wait for the sign in to finish. When the desktop context
        // this will manifest itself in the "Unexpected Error" error being
        // shown, which signals the desktop channel didn't get a response.
        .waitForVisibleByCssSelector('#stage .error')
        .elementByCssSelector('#stage .error').isDisplayed()
        .then(function (isDisplayed) {
          assert.equal(isDisplayed, true);
        })

        .get(require.toUrl(SETTINGS_URL))
        .waitForElementById('fxa-settings-header')
        // make sure the sign out element doesn't exist
        .hasElementById('signout')
          .then(function(hasElement) {
            assert.isFalse(hasElement);
          })
        .end();
    },

    'visit settings page with an invalid sessionToken redirects to signin': function() {
      // Changing the password invalidates the current sessionToken
      var self = this;
      return client.passwordChange(email, FIRST_PASSWORD, SECOND_PASSWORD)
          .then(function () {
            return self.get('remote')
              .get(require.toUrl(SETTINGS_URL))
              // Expect to get redirected to sign in since the sessionToken is invalid
              .waitForElementById('fxa-signin-header')
              .end();
          });
    },

    'sign in, delete account': function () {
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
        .end()

        .waitForElementById('fxa-settings-header')
        .end()

        // Go to delete account screen
        .waitForElementById('delete-account')
        .elementById('delete-account')
          .click()
        .end()

        // success is going to the delete account page
        .waitForVisibleById('fxa-delete-account-header')

        .elementByCssSelector('form input.password')
          .click()
          .type(FIRST_PASSWORD)
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
