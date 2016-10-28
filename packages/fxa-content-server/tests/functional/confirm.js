/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'tests/lib/helpers',
  'tests/functional/lib/helpers'
], function (intern, registerSuite, TestHelpers, FunctionalHelpers) {
  var config = intern.config;
  var CONFIRM_URL = config.fxaContentRoot + 'confirm';
  var SIGNUP_URL = config.fxaContentRoot + 'signup';
  var PASSWORD = '12345678';

  var thenify = FunctionalHelpers.thenify;

  var clearBrowserState = FunctionalHelpers.clearBrowserState;
  var click = FunctionalHelpers.click;
  var closeCurrentWindow = FunctionalHelpers.closeCurrentWindow;
  var fillOutSignUp = thenify(FunctionalHelpers.fillOutSignUp);
  var noSuchElement = FunctionalHelpers.noSuchElement;
  var openPage = thenify(FunctionalHelpers.openPage);
  var respondToWebChannelMessage = FunctionalHelpers.respondToWebChannelMessage;
  var testElementExists = FunctionalHelpers.testElementExists;
  var testElementTextInclude = FunctionalHelpers.testElementTextInclude;
  var testSuccessWasShown = FunctionalHelpers.testSuccessWasShown;

  registerSuite({
    name: 'confirm',

    beforeEach: function () {
      // clear localStorage to avoid polluting other tests.
      return this.remote.then(clearBrowserState());
    },

    'visit confirmation screen without initiating sign up, user is redirected to /signup': function () {
      return this.remote
        // user is immediately redirected to /signup if they have no
        // sessionToken.
        // Success is showing the screen
        .then(openPage(this, CONFIRM_URL, '#fxa-signup-header'));
    },

    'sign up, wait for confirmation screen, click resend': function () {
      var email = TestHelpers.createEmail();

      return this.remote
        .then(openPage(this, SIGNUP_URL, '#fxa-signup-header'))
        .then(fillOutSignUp(this, email, PASSWORD))

        .then(testElementExists('#fxa-confirm-header'))
        .then(testElementTextInclude('.verification-email-message', email))
        .then(noSuchElement(this, '#open-webmail'))

        .then(click('#resend'))

        // the test below depends on the speed of the email resent XHR
        // we have to wait until the resent request completes and the
        // success notification is visible
        .then(testSuccessWasShown(this));
    },

    'sign up with a gmail address, get the open gmail button': function () {
      var email = 'signin' + Math.random() + '@gmail.com';
      var SIGNUP_URL = intern.config.fxaContentRoot + 'signup?context=fx_desktop_v2&service=sync';
      this.timeout = 90000;

      return this.remote
        .then(openPage(this, SIGNUP_URL, '#fxa-signup-header'))
        .then(respondToWebChannelMessage(this, 'fxaccounts:can_link_account', { ok: true } ))

        .then(fillOutSignUp(this, email, PASSWORD))

        .then(testElementExists('#choose-what-to-sync'))
        .then(click('button[type="submit"]'))

        .then(testElementExists('#fxa-confirm-header'))
        .then(click('[data-webmail-type="gmail"]'))

        .getAllWindowHandles()
          .then(function (handles) {
            return this.parent.switchToWindow(handles[1]);
          })

        .then(testElementExists('.google-header-bar'))
        .then(closeCurrentWindow())

        .then(testElementExists('#fxa-confirm-header'));
    }
  });
});
