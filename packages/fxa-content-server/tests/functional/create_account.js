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
  //var email = 'some' + new Date().getTime() + '@example.com';

  registerSuite({
    name: 'create_account',

    'create account form': function () {
      var email = 'some' + new Date().getTime() + '@example.com';
      var password = '12345678';

      return this.remote
        .get(require.toUrl(url))
        .wait(1000)

        .elementByCssSelector('#dialog .email')
          .click()
          .type(email)
        .end()

        .elementByCssSelector('#dialog .password')
          .click()
          .type(password)
        .end()

        .elementByCssSelector('#dialog .confirm_password')
          .click()
          .type(password)
        .end()

        .elementByCssSelector('#dialog .go')
          .click()
        .end()

        .wait(500)

        .elementByCssSelector('#dialog .create-panel .error')
          .text()
          .then(function (resultText) {
            assert.strictEqual(resultText, '', 'No errors in email creation');
          })
        .end();
    }
  });
});
