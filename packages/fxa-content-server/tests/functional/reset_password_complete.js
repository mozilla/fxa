/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern!object',
  'intern/chai!assert',
  'require'
], function (registerSuite, assert, require) {
  'use strict';

  var url = 'http://localhost:3030/reset_password_complete';

  registerSuite({
    name: 'reset_password_complete',

    setup: function () {
    },

    'open email verification link': function () {

      return this.get('remote')
        .get(require.toUrl(url))
        .waitForElementById('fxa-reset-password-complete-header')

        .end();
    }
  });
});
