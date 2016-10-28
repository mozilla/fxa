/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'tests/functional/lib/helpers'
], function (intern, registerSuite, FunctionalHelpers) {
  var config = intern.config;
  var SIGNIN_URL = config.fxaContentRoot + 'signin';

  var thenify = FunctionalHelpers.thenify;

  var clearBrowserState = FunctionalHelpers.clearBrowserState;
  var mousedown = FunctionalHelpers.mousedown;
  var mouseup = FunctionalHelpers.mouseup;
  var openPage = thenify(FunctionalHelpers.openPage);
  var testAttributeEquals = FunctionalHelpers.testAttributeEquals;
  var type = FunctionalHelpers.type;

  registerSuite({
    name: 'password visibility',

    beforeEach: function () {
      return this.remote.then(clearBrowserState());
    },

    'show password ended with mouseup': function () {
      return this.remote
        .then(openPage(this, SIGNIN_URL, '#fxa-signin-header'))
        .then(type('#password', 'password'))

        // turn it into a text field
        .then(mousedown('.show-password-label'))

        .then(testAttributeEquals('#password', 'type', 'text'))
        .then(testAttributeEquals('#password', 'autocomplete', 'off'))

        // turn it back into a password field
        .then(mouseup('.show-password-label'))

        .then(testAttributeEquals('#password', 'type', 'password'))
        .then(testAttributeEquals('#password', 'autocomplete', null));
    }
  });
});
