/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'intern/chai!assert',
  'require'
], function (intern, registerSuite, assert, require) {
  'use strict';

  var url = intern.config.fxaContentRoot + 'signup';

  registerSuite({
    name: 'tos',

    'start at signup': function () {

      return this.get('remote')
        .get(require.toUrl(url))
        .waitForElementById('fxa-signup-header')

        .elementById('fxa-tos')
          .click()
        .end()

        .waitForVisibleByCssSelector('#legal-copy ol li')
        .waitForVisibleByCssSelector('#fxa-tos-back')
        .elementById('fxa-tos-back')
          .click()
        .end()

        // success is going back to the signup
        .waitForElementById('fxa-signup-header')
        .end();
    }
  });
});
