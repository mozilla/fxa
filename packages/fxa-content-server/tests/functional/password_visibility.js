/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'intern/chai!assert',
  'require',
  'tests/functional/lib/helpers'
], function (intern, registerSuite, assert, require, FunctionalHelpers) {
  var config = intern.config;
  var SIGNIN_URL = config.fxaContentRoot + 'signin';
  var SYNC_SIGNIN_URL = config.fxaContentRoot + 'signin?service=sync&context=fx_desktop_v1';

  registerSuite({
    name: 'password visibility',

    beforeEach: function () {
      return FunctionalHelpers.clearBrowserState(this);
    },

    afterEach: function () {
      return FunctionalHelpers.clearBrowserState(this);
    },

    'toggle show password for normal RP': function () {
      this.remote.get(require.toUrl(SIGNIN_URL))
        .findByCssSelector('#fxa-signin-header')
        .end()

        .findByCssSelector('#password')
          .click()
          .type('password')
        .end()

        // turn it into a text field
        .findByCssSelector('.show-password-label')
          .click()
        .end()

        .findByCssSelector('#password')
          .getAttribute('type')
          .then(function (typeValue) {
            assert.equal(typeValue, 'text');
          })

          .getAttribute('autocomplete')
          .then(function (autocompleteValue) {
            assert.equal(autocompleteValue, 'off');
          })
        .end()

        // turn it back into a password field
        .findByCssSelector('.show-password-label')
          .click()
        .end()

        .findByCssSelector('#password')
          .getAttribute('type')
          .then(function (typeValue) {
            assert.equal(typeValue, 'password');
          })

          .getAttribute('autocomplete')
          .then(function (autocompleteValue) {
            assert.isNull(autocompleteValue);
          })
        .end();
    },

    'toggle show password for Sync': function () {
      this.remote.get(require.toUrl(SYNC_SIGNIN_URL))
        .findByCssSelector('#fxa-signin-header')
        .end()

        .findByCssSelector('#password')
          .click()
          .type('password')
        .end()

        // turn it into a text field
        .findByCssSelector('.show-password-label')
          .click()
        .end()

        .findByCssSelector('#password')
          .getAttribute('type')
          .then(function (typeValue) {
            assert.equal(typeValue, 'text');
          })

          .getAttribute('autocomplete')
          .then(function (autocompleteValue) {
            assert.equal(autocompleteValue, 'off');
          })
        .end()

        // turn it back into a password field
        .findByCssSelector('.show-password-label')
          .click()
        .end()

        .findByCssSelector('#password')
          .getAttribute('type')
          .then(function (typeValue) {
            assert.equal(typeValue, 'password');
          })

          .getAttribute('autocomplete')
          .then(function (autocompleteValue) {
            assert.equal(autocompleteValue, 'off');
          })
        .end();
    }
  });
});
