/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const TestHelpers = require('../lib/helpers');
const FunctionalHelpers = require('./lib/helpers');
const selectors = require('./lib/selectors');
var config = intern._config;
var PAGE_URL =
  config.fxaContentRoot + 'signup?context=fx_fennec_v1&service=sync';

var email;
var PASSWORD = '12345678';

const {
  click,
  closeCurrentWindow,
  fillOutSignUp,
  noSuchElement,
  noSuchBrowserNotification,
  openPage,
  openVerificationLinkInNewTab,
  respondToWebChannelMessage,
  switchToWindow,
  testElementExists,
  testEmailExpected,
  testIsBrowserNotified,
} = FunctionalHelpers;

registerSuite('Fx Fennec Sync v1 sign_up', {
  beforeEach: function() {
    email = TestHelpers.createEmail();
    return this.remote.then(FunctionalHelpers.clearBrowserState());
  },

  afterEach: function() {
    return this.remote.then(FunctionalHelpers.clearBrowserState());
  },
  tests: {
    'sign up, verify same browser': function() {
      return (
        this.remote
          .then(openPage(PAGE_URL, selectors.SIGNUP.HEADER))
          .then(
            respondToWebChannelMessage('fxaccounts:can_link_account', {
              ok: true,
            })
          )
          .then(noSuchElement(selectors.SIGNUP.CUSTOMIZE_SYNC_CHECKBOX))
          .then(fillOutSignUp(email, PASSWORD))

          // user should be transitioned to the choose what to Sync page
          .then(testElementExists(selectors.CHOOSE_WHAT_TO_SYNC.HEADER))
          .then(testIsBrowserNotified('fxaccounts:can_link_account'))
          // the login message is only sent after the confirm screen is shown.
          .then(noSuchBrowserNotification('fxaccounts:login'))

          // uncheck the passwords and history engines
          .then(click(selectors.CHOOSE_WHAT_TO_SYNC.ENGINE_PASSWORDS))
          .then(click(selectors.CHOOSE_WHAT_TO_SYNC.ENGINE_HISTORY))
          .then(click(selectors.CHOOSE_WHAT_TO_SYNC.SUBMIT))

          // user should be transitioned to the "go confirm your address" page
          .then(testElementExists(selectors.CONFIRM_SIGNUP.HEADER))

          // the login message is only sent after the sync preferences screen
          // has been cleared.
          .then(testIsBrowserNotified('fxaccounts:login'))

          // verify the user
          .then(openVerificationLinkInNewTab(email, 0))
          .then(switchToWindow(1))

          .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.HEADER))

          .then(closeCurrentWindow())
          .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.HEADER))
          // A post-verification email should be sent, this is Sync.
          .then(testEmailExpected(email, 1))
      );
    },
  },
});
