/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern!object',
  'intern/chai!assert',
  'require'
], function (registerSuite, assert, require) {
  'use strict';

  var url = 'http://localhost:3030/signup';

  registerSuite({
    name: 'pp',

    setup: function () {
    },

    'start at signup': function () {

      return this.get('remote')
        .get(require.toUrl(url))
        .waitForElementById('fxa-signup-header')

        .elementById('fxa-pp')
          .click()
        .end()

        // success is going to the TOS screen
        .waitForElementById('fxa-pp-header')
        .end()

        .elementById('fxa-pp-back')
          .click()
        .end()

        // success is going back to the signup
        .waitForElementById('fxa-signup-header')
        .end();
    }
  });
});
