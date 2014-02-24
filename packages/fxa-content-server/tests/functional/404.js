/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern!object',
  'intern/chai!assert',
  'require'
], function (registerSuite, assert, require) {
  'use strict';

  var url = 'http://localhost:3030/four-oh-four';

  registerSuite({
    name: '404',

    setup: function () {
    },

    'visit an invalid page': function () {

      return this.get('remote')
        .get(require.toUrl(url))
        .waitForElementById('fxa-404-header')

        .elementById('fxa-404-home')
          .click()
        .end()

        // success is going to the signup screen
        .waitForElementById('fxa-signup-header')
        .end();
    }
  });
});
