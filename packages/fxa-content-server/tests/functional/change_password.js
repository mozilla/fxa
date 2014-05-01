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
  var CHANGE_PASSWORD_URL = 'http://localhost:3030/change_password';

  var FIRST_PASSWORD = 'password';
  var SECOND_PASSWORD = 'new_password';
  var email;
  var client;

  var ANIMATION_DELAY_MS = 500;

  function clearBrowserStorage() {
    /*jshint validthis: true*/
    return this.get('remote')
      .get(require.toUrl(SIGNIN_URL))
      .waitForVisibleById('fxa-signin-header')
      // Clear out the session. This isn't ideal since
      // it implies too much knowledge of the implementation
      // of the Session module but it guarantees that we don't
      // break the other tests.
      .safeEval('sessionStorage.clear(); localStorage.clear();') // jshint ignore:line
      .end();

  }

  registerSuite({
    name: 'settings->change password with verified email',

    beforeEach: function () {
      email = 'signin' + Math.random() + '@example.com';

      client = new FxaClient(AUTH_SERVER_ROOT, {
        xhr: nodeXMLHttpRequest.XMLHttpRequest
      });

      var self = this;
      return client.signUp(email, FIRST_PASSWORD, { preVerified: true })
          .then(function () {
            return clearBrowserStorage.call(self);
          });
    },

    teardown: function () {
      return clearBrowserStorage.call(this);
    },

    'sign in, try to change password with an incorrect old password': function () {
      return this.get('remote')
        .get(require.toUrl(SIGNIN_URL))
        .waitForVisibleById('fxa-signin-header')

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

        .waitForVisibleById('fxa-settings-header')

        // Go to change password screen
        .elementById('change-password')
          .click()
        .end()

        .waitForVisibleById('fxa-change-password-header')

        .elementById('old_password')
          .click()
          .type('INCORRECT')
        .end()

        .elementById('new_password')
          .click()
          .type(SECOND_PASSWORD)
        .end()

        .elementByCssSelector('button[type="submit"]')
          .click()
        .end()

        .waitForVisibleByClassName('error')

        .elementByCssSelector('.error').isDisplayed()
          .then(function (isDisplayed) {
            assert.isTrue(isDisplayed);
          })
        .end()

        // click the show button, the error should not be hidden.
        .elementByCssSelector('[for=show-old-password]')
          .click()
        .end()

        .elementByCssSelector('.error').isDisplayed()
          .then(function (isDisplayed) {
            assert.isTrue(isDisplayed);
          })
        .end()

        // Change form so that it is valid, error should be hidden.
        .elementById('old_password')
          .click()
          .type(FIRST_PASSWORD)
        .end()

        // Since the test is to see if the error is hidden,
        // .waitForVisibleByClass cannot be used. We want the opposite of
        // .waitForVisibleByClass.
        .wait(ANIMATION_DELAY_MS)

        .elementByCssSelector('.error').isDisplayed()
          .then(function (isDisplayed) {
            assert.isFalse(isDisplayed);
          })
        .end();
    },

    'sign in, change password, sign in with new password': function () {
      return this.get('remote')
        .get(require.toUrl(SIGNIN_URL))
        .waitForVisibleById('fxa-signin-header')

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

        .waitForVisibleById('fxa-settings-header')

        // Go to change password screen
        .elementById('change-password')
          .click()
        .end()

        .waitForVisibleById('fxa-change-password-header')

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

        .waitForVisibleById('fxa-settings-header')

        // For whatever reason, .waitForVisibleByClassName completes
        // but the .isDisplayed() check fails. With the .wait, no such
        // error.
        .wait(ANIMATION_DELAY_MS)
        .waitForVisibleByClassName('success')

        .elementByClassName('success').isDisplayed()
          .then(function (isDisplayed) {
            assert.equal(isDisplayed, true);
          })
        .end()

        .get(require.toUrl(SIGNIN_URL))
        .waitForVisibleById('fxa-signin-header')

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
    }

  });

  registerSuite({
    name: 'settings->change password with unverified email',

    beforeEach: function () {
      email = 'signin' + Math.random() + '@example.com';

      client = new FxaClient(AUTH_SERVER_ROOT, {
        xhr: nodeXMLHttpRequest.XMLHttpRequest
      });

      var self = this;
      return client.signUp(email, FIRST_PASSWORD, { preVerified: false })
          .then(function () {
            return clearBrowserStorage.call(self);
          });
    },

    teardown: function () {
      return clearBrowserStorage.call(this);
    },

    'sign in, change password screen, user must verifiy account': function () {
      return this.get('remote')
        .get(require.toUrl(SIGNIN_URL))
        .waitForVisibleById('fxa-signin-header')

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

        .waitForVisibleById('fxa-confirm-header')

        // unverified user browses directly to change password page.
        .get(require.toUrl(CHANGE_PASSWORD_URL))
        .waitForVisibleById('fxa-change-password-header')

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

        // uh oh, user must verify their account.
        .waitForVisibleById('resend')

        .elementById('resend')
          .click()
        .end()

        .waitForVisibleById('fxa-confirm-header');
    }
  });

});
