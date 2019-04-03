/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const TestHelpers = require('../lib/helpers');
const FunctionalHelpers = require('./lib/helpers');
const selectors = require('./lib/selectors');
const config = intern._config;
const PAGE_URL = config.fxaContentRoot + 'signin?context=iframe&service=sync';

let email;
const PASSWORD = '12345678';

const {
  clearBrowserNotifications,
  clearBrowserState,
  closeCurrentWindow,
  createUser,
  fillOutSignIn,
  fillOutSignInUnblock,
  noPageTransition,
  noSuchBrowserNotification,
  openPage,
  openVerificationLinkInDifferentBrowser,
  openVerificationLinkInNewTab,
  switchToWindow,
  testElementExists,
  testElementTextInclude,
  testIsBrowserNotified,
  thenify,
  visibleByQSA,
} = FunctionalHelpers;

const setupTest = thenify(function (options = {}) {
  return this.parent
    .then(createUser(email, PASSWORD, { preVerified: options.preVerified }))
    .then(openPage(PAGE_URL, selectors.SIGNIN.EMAIL, {
      query: options.query,
      webChannelResponses: {
        'fxaccounts:can_link_account': { ok: options.canLinkAccountResponse !== false }
      }
    }))
    .then(visibleByQSA(selectors.SIGNIN.SUB_HEADER))
    // delay for the webchannel message
    .sleep(500)
    .then(fillOutSignIn(email, PASSWORD))
    .then(testIsBrowserNotified('fxaccounts:can_link_account'));
});

registerSuite('Firstrun Sync v1 signin', {
  beforeEach: function () {
    email = TestHelpers.createEmail('sync{id}');

    return this.remote
      .then(clearBrowserState({
        force: true
      }));
  },
  tests: {
    'verified, verify same browser ': function () {


      return this.remote
        .then(setupTest({ preVerified: true }))

        .then(testElementExists(selectors.CONFIRM_SIGNIN.HEADER))

        .then(testIsBrowserNotified('fxaccounts:login'))
        .then(clearBrowserNotifications())

        .then(openVerificationLinkInNewTab(email, 0))
        .then(switchToWindow(1))
        .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.HEADER))
        .then(closeCurrentWindow())

        .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.HEADER))
        .then(noSuchBrowserNotification('fxaccounts:login'));
    },

    'verified, verify different browser - from original tab\'s P.O.V.': function () {
      return this.remote
        .then(setupTest({preVerified: true}))

        .then(testElementExists(selectors.CONFIRM_SIGNIN.HEADER))
        .then(testIsBrowserNotified('fxaccounts:login'))

        .then(openVerificationLinkInDifferentBrowser(email))

        .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.HEADER));
    },

    'unverified': function () {
      this.timeout = 90 * 1000;
      return this.remote
        .then(setupTest({preVerified: false}))

        .then(testElementExists(selectors.CONFIRM_SIGNUP.HEADER))
        .then(testIsBrowserNotified('fxaccounts:login'))
        .then(clearBrowserNotifications())

        // email 0 - initial sign up email
        // email 1 - sign in w/ unverified address email
        // email 2 - "You have verified your Firefox Account"
        .then(openVerificationLinkInNewTab(email, 1))
        .then(switchToWindow(1))
        .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.HEADER))
        .then(closeCurrentWindow())

        // Since this is really a signup flow, the original tab
        // redirects to CAD too.
        .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.HEADER))
        .then(noSuchBrowserNotification('fxaccounts:login'));
    },

    'signin, cancel merge warning': function () {
      return this.remote
        .then(setupTest({canLinkAccountResponse: false, preVerified: true}))

        .then(noSuchBrowserNotification('fxaccounts:login'))

        // user should not transition to the next screen
        .then(noPageTransition(selectors.SIGNIN.HEADER));
    },

    'blocked, valid code entered': function () {
      email = TestHelpers.createEmail('block{id}');

      return this.remote
        .then(setupTest({preVerified: true}))

        .then(testElementExists(selectors.SIGNIN_UNBLOCK.HEADER))
        .then(testElementTextInclude(selectors.SIGNIN_UNBLOCK.EMAIL_FIELD, email))
        .then(fillOutSignInUnblock(email, 0))

        .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.HEADER))
        .then(testIsBrowserNotified('fxaccounts:login'));
    }
  }
});
