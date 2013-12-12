/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern!object',
  'intern/chai!assert',
  'require'
], function (registerSuite, assert, require) {
  'use strict';

  var url = 'http://localhost:3030/flow';

  registerSuite({
    name: 'login',

    'create account form': function () {
      var email = 'some-unknown-email@email.com';
      var password = 'password';

      return this.remote
        .get(require.toUrl(url))
        .wait(1000)

        .elementByCssSelector('#dialog x-tabbox x-tab:last-child')
          .clickElement()
          .end()

        .wait(1000)

        .elementByCssSelector('#dialog .login-panel .email')
          .click()
          .type(email)
        .end()

        .elementByCssSelector('#dialog .login-panel .password')
          .click()
          .type(password)
        .end()

        .elementByCssSelector('#dialog .login-panel .go')
          .click()
        .end()

        .wait(1000)

        .elementByCssSelector('#dialog .login-panel .error')
        .text()
        .then(function (text) {
          assert.strictEqual(text, 'Try another email or Create an account', 'Validates false login');
        })
        .end();
    }
  });
});