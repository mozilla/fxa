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

  var clearBrowserState = FunctionalHelpers.clearBrowserState;
  var mousedown = FunctionalHelpers.mousedown;
  var mouseup = FunctionalHelpers.mouseup;
  var noSuchElement = FunctionalHelpers.noSuchElement;
  var openPage = FunctionalHelpers.openPage;
  var testAttributeEquals = FunctionalHelpers.testAttributeEquals;
  var testElementExists = FunctionalHelpers.testElementExists;
  var type = FunctionalHelpers.type;
  var visibleByQSA = FunctionalHelpers.visibleByQSA;

  registerSuite({
    name: 'password visibility',

    beforeEach: function () {
      return this.remote.then(clearBrowserState());
    },

    'show password ended with mouseup': function () {
      return this.remote
        .then(openPage(SIGNIN_URL, '#fxa-signin-header'))
        // show-password button only appears once user types in a character.
        .then(noSuchElement('.show-password-label'))
        .then(type('#password', 'p'))
        .then(testElementExists('.show-password-label'))
        .then(visibleByQSA('.show-password-label'))

        // turn password field into a text field
        .then(mousedown('.show-password-label'))

        .then(testAttributeEquals('#password', 'type', 'text'))
        .then(testAttributeEquals('#password', 'autocomplete', 'off'))

        // turn text field back into a password field
        .then(mouseup('.show-password-label'))

        .then(testAttributeEquals('#password', 'type', 'password'))
        .then(testAttributeEquals('#password', 'autocomplete', null))

        // \u0008 is unicode for backspace char. By default `type` clears the
        // element value before typing, we want the character to do so.
        .then(type('#password', '\u0008', { clearValue: true }))
        // give a short pause to clear the input
        .sleep(1000)
        // element still exists
        .then(testElementExists('.show-password-label'));

    }
  });
});
