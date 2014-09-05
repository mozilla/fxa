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
  'tests/functional/lib/helpers'
], function (intern, registerSuite, assert, require, nodeXMLHttpRequest, FxaClient, TestHelpers, FunctionalHelpers) {
  'use strict';

  var config = intern.config;
  var AUTH_SERVER_ROOT = config.fxaAuthRoot;
  var SIGNIN_URL = config.fxaContentRoot + 'signin';
  var CHANGE_PASSWORD_URL = config.fxaContentRoot + 'change_password';

  var FIRST_PASSWORD = 'password';
  var SECOND_PASSWORD = 'new_password';
  var email;
  var client;

  var ANIMATION_DELAY_MS = 500;

  function clearBrowserStorage() {
    /*jshint validthis: true*/
    // clear localStorage to avoid polluting other tests.
    return FunctionalHelpers.clearBrowserState(this);
  }

  registerSuite({
    name: 'settings->change password with verified email',

    beforeEach: function () {
      email = TestHelpers.createEmail();

      client = new FxaClient(AUTH_SERVER_ROOT, {
        xhr: nodeXMLHttpRequest.XMLHttpRequest
      });

      var self = this;
      return client.signUp(email, FIRST_PASSWORD, { preVerified: true })
        .then(function () {
          return self.get('remote')
            .setFindTimeout(intern.config.pageLoadTimeout);
        })
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

        // Go to change password screen
        .findById('change-password')
          .click()
        .end()

        .findById('old_password')
          .click()
          .type('INCORRECT')
        .end()

        .findById('new_password')
          .click()
          .type(SECOND_PASSWORD)
        .end()

        .findByCssSelector('button[type="submit"]')
          .click()
        .end()

        .then(FunctionalHelpers.visibleByQSA('.error'))

        .findByCssSelector('.error').isDisplayed()
          .then(function (isDisplayed) {
            assert.isTrue(isDisplayed);
          })
        .end()

        // click the show button, the error should not be hidden.
        .findByCssSelector('[for=show-old-password]')
          .click()
        .end()

        .findByCssSelector('.error').isDisplayed()
          .then(function (isDisplayed) {
            assert.isTrue(isDisplayed);
          })
        .end()

        // Change form so that it is valid, error should be hidden.
        .findById('old_password')
          .click()
          .type(FIRST_PASSWORD)
        .end()

        // Since the test is to see if the error is hidden,
        // .findByClass cannot be used. We want the opposite of
        // .findByClass.
        .sleep(ANIMATION_DELAY_MS)

        .findByCssSelector('.error').isDisplayed()
          .then(function (isDisplayed) {
            assert.isFalse(isDisplayed);
          })
        .end();
    },

    'sign in, change password, sign in with new password': function () {
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

        // Go to change password screen
        .findById('change-password')
          .click()
        .end()

        .findById('old_password')
          .click()
          .type(FIRST_PASSWORD)
        .end()

        .findById('new_password')
          .click()
          .type(SECOND_PASSWORD)
        .end()

        .findByCssSelector('button[type="submit"]')
          .click()
        .end()

        .findById('fxa-settings-header')
        .end()

        .then(FunctionalHelpers.visibleByQSA('.success'))

        .findByClassName('success').isDisplayed()
          .then(function (isDisplayed) {
            assert.equal(isDisplayed, true);
          })
        .end()

        .get(require.toUrl(SIGNIN_URL))

        .findByCssSelector('.use-different')
          .click()
        .end()

        .findByCssSelector('form input.email')
          .click()
          .type(email)
        .end()

        .findByCssSelector('form input.password')
          .click()
          .type(SECOND_PASSWORD)
        .end()

        .findByCssSelector('button[type="submit"]')
          .click()
        .end();
    }

  });

  registerSuite({
    name: 'settings->change password with unverified email',

    beforeEach: function () {
      email = TestHelpers.createEmail();

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

        .findById('fxa-confirm-header')
        .end()

        // unverified user browses directly to change password page.
        .get(require.toUrl(CHANGE_PASSWORD_URL))
        .findById('old_password')
          .click()
          .type(FIRST_PASSWORD)
        .end()

        .findById('new_password')
          .click()
          .type(SECOND_PASSWORD)
        .end()

        .findByCssSelector('button[type="submit"]')
          .click()
        .end()

        // uh oh, user must verify their account.
        .findById('resend')
          .click()
        .end()

        .findById('fxa-confirm-header')
        .end();
    }
  });

});
