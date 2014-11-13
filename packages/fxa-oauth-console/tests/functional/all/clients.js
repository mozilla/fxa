/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'intern/chai!assert'
], function (intern, registerSuite, assert) {

  var config = intern.config;
  var APP_URL = 'http://127.0.0.1:10137';

  registerSuite({
    name: 'clients',

    'login, add a client, update that client, delete it, logout': function () {
      return this.remote
        .get(require.toUrl(APP_URL))

        .findByCssSelector('#login')
        .click()
        .end()

        .findByCssSelector('.sign-up')
        .click()
        .end()

        .findByCssSelector('#fxa-signup-header')
        .end()

        .findByCssSelector('input.email')
        .type('')
        .end()

        .findByCssSelector('#submit-btn')
        .click()
        .end()
    }

  });
});