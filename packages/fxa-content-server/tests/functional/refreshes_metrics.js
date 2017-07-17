/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'tests/functional/lib/helpers'
], function (intern, registerSuite, FunctionalHelpers) {
  var AUTOMATED = '?automatedBrowser=true';
  var SIGNUP_URL = intern.config.fxaContentRoot + 'signup' + AUTOMATED;
  var SIGNIN_URL = intern.config.fxaContentRoot + 'signin' + AUTOMATED;

  var cleanMemory = FunctionalHelpers.cleanMemory;
  var clearBrowserState = FunctionalHelpers.clearBrowserState;
  var openPage = FunctionalHelpers.openPage;
  var testAreEventsLogged = FunctionalHelpers.testAreEventsLogged;
  var testElementExists = FunctionalHelpers.testElementExists;

  registerSuite({
    name: 'refreshing a screen logs a refresh event',

    beforeEach: function () {
      return this.remote
        .then(clearBrowserState());
    },

    'refreshing the signup screen': function () {
      return this.remote
        .then(cleanMemory())
        .then(openPage(SIGNUP_URL, '#fxa-signup-header'))

        .refresh()
        .then(testElementExists('#fxa-signup-header'))
        // Unload the page to flush the metrics
        .then(openPage(SIGNIN_URL, '#fxa-signin-header'))
        .then(testAreEventsLogged(['screen.signup', 'screen.signup', 'signup.refresh']));
    }
  });
});
