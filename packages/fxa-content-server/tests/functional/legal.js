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

  var url = intern.config.fxaContentRoot + 'legal';

  registerSuite({
    name: 'legal',

    setup: function () {
    },

    'start at legal page': function () {

      return this.get('remote')
        .get(require.toUrl(url))
        .waitForElementById('fxa-legal-header')

        .elementByCssSelector('a[href="/legal/terms"]')
          .click()
        .end()

        // success is going to the TOS screen
        .waitForElementById('fxa-tos-header')
        .end()

        .elementById('fxa-tos-back')
          .click()
        .end()

        .waitForElementById('fxa-legal-header')
        .elementByCssSelector('a[href="/legal/privacy"]')
          .click()
        .end()

        // success is going to the privacy screen
        .waitForElementById('fxa-pp-header')
        .end()

        .elementById('fxa-pp-back')
          .click()
        .end()

        // success is going back to the legal screen.
        .waitForElementById('fxa-legal-header')
        .end();
    }
  });
});
