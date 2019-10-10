/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const TestHelpers = require('../lib/helpers');
const FunctionalHelpers = require('./lib/helpers');
var config = intern._config;
var CONFIRM_URL = config.fxaContentRoot + 'confirm';
var SIGNUP_URL = config.fxaContentRoot + 'signup';
var PASSWORD = '12345678';

var email;

var clearBrowserState = FunctionalHelpers.clearBrowserState;
var click = FunctionalHelpers.click;
var closeCurrentWindow = FunctionalHelpers.closeCurrentWindow;
var fillOutEmailFirstSignUp = FunctionalHelpers.fillOutEmailFirstSignUp;
var noSuchElement = FunctionalHelpers.noSuchElement;
var openPage = FunctionalHelpers.openPage;
var respondToWebChannelMessage = FunctionalHelpers.respondToWebChannelMessage;
var switchToWindow = FunctionalHelpers.switchToWindow;
var testElementExists = FunctionalHelpers.testElementExists;
var testElementTextInclude = FunctionalHelpers.testElementTextInclude;
var testSuccessWasShown = FunctionalHelpers.testSuccessWasShown;

registerSuite('confirm', {
  beforeEach: function() {
    email = TestHelpers.createEmail();
    // clear localStorage to avoid polluting other tests.
    return this.remote.then(clearBrowserState());
  },
  tests: {
    'visit confirmation screen without initiating sign up, user is redirected to /signup': function() {
      return (
        this.remote
          // user is immediately redirected to /signup if they have no
          // sessionToken.
          // Success is showing the screen
          .then(openPage(CONFIRM_URL, '#fxa-signup-header'))
      );
    },

    'sign up, wait for confirmation screen, click resend': function() {
      var email = 'test_signin' + Math.random() + '@restmail.dev.lcip.org';

      return (
        this.remote
          .then(openPage(SIGNUP_URL, '#fxa-signup-header'))
          .then(fillOutEmailFirstSignUp(email, PASSWORD))

          .then(testElementExists('#fxa-confirm-header'))
          .then(testElementTextInclude('.verification-email-message', email))
          .then(noSuchElement('#open-webmail'))

          .then(click('#resend'))

          // the test below depends on the speed of the email resent XHR
          // we have to wait until the resent request completes and the
          // success notification is visible
          .then(testSuccessWasShown())
      );
    },

    'sign up with a restmail address, get the open restmail button': function() {
      var SIGNUP_URL =
        intern._config.fxaContentRoot +
        'signup?context=fx_desktop_v3&service=sync';
      this.timeout = 90000;

      return (
        this.remote
          .then(openPage(SIGNUP_URL, '#fxa-signup-header'))
          .then(
            respondToWebChannelMessage('fxaccounts:can_link_account', {
              ok: true,
            })
          )

          .then(fillOutEmailFirstSignUp(email, PASSWORD))

          .then(testElementExists('#choose-what-to-sync'))
          .then(click('button[type="submit"]'))

          .then(testElementExists('#fxa-confirm-header'))
          .then(click('[data-webmail-type="restmail"]'))

          .then(switchToWindow(1))

          // wait until url is correct
          .then(
            FunctionalHelpers.pollUntil(
              function(email) {
                return window.location.pathname.endsWith(email);
              },
              [email],
              10000
            )
          )

          .then(closeCurrentWindow())

          .then(testElementExists('#fxa-confirm-header'))
      );
    },
  },
});
