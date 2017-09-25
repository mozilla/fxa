/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern!object',
  'tests/lib/helpers',
  'tests/functional/lib/helpers',
  'tests/functional/lib/selectors'
], function (registerSuite, TestHelpers, FunctionalHelpers, selectors) {
  'use strict';

  let email;
  const PASSWORD = '12345678';

  const {
    cleanMemory,
    clearBrowserState,
    closeCurrentWindow,
    createUser,
    fillOutForceAuth,
    fillOutSignInUnblock,
    noPageTransition,
    noSuchBrowserNotification,
    openForceAuth,
    openVerificationLinkInDifferentBrowser,
    openVerificationLinkInNewTab,
    respondToWebChannelMessage,
    testElementExists,
    testIsBrowserNotified,
    thenify,
  } = FunctionalHelpers;

  const setupTest = thenify(function (options = {}) {
    const forceAuthOptions = { query: {
      context: 'fx_desktop_v2',
      email: email,
      service: 'sync'
    }};

    if (options.forceAboutAccounts) {
      forceAuthOptions.query.forceAboutAccounts = 'true';
    }

    const successSelector = options.blocked ? selectors.SIGNIN_UNBLOCK.HEADER :
                            options.preVerified ? selectors.CONFIRM_SIGNIN.HEADER :
                            selectors.CONFIRM_SIGNUP.HEADER;

    return this.parent
      .then(clearBrowserState())
      .then(createUser(email, PASSWORD, { preVerified: options.preVerified }))
      .then(openForceAuth(forceAuthOptions))
      .then(noSuchBrowserNotification('fxaccounts:logout'))
      .then(respondToWebChannelMessage('fxaccounts:can_link_account', { ok: true } ))
      .then(fillOutForceAuth(PASSWORD))

      .then(testElementExists(successSelector))
      .then(testIsBrowserNotified('fxaccounts:can_link_account'))

      .then(() => {
        if (! options.blocked) {
          return this.parent
            .then(testIsBrowserNotified('fxaccounts:login'));
        }
      });
  });

  registerSuite({
    name: 'Firefox Desktop Sync v2 force_auth',

    beforeEach: function () {
      email = TestHelpers.createEmail('sync{id}');
    },

    'verified - about:accounts, verify same browser': function () {
      return this.remote
        .then(cleanMemory())
        .then(setupTest({ forceAboutAccounts: true, preVerified: true }))

        .then(openVerificationLinkInNewTab(email, 0))
        .switchToWindow('newwindow')
          .then(testElementExists(selectors.SIGNIN_COMPLETE.HEADER))
          .then(closeCurrentWindow())

        // about:accounts will take over post-verification, no transition
        .then(noPageTransition(selectors.CONFIRM_SIGNIN.HEADER));
    },

    'verified - about:accounts, verify, from original tab\'s P.O.V.': function () {
      return this.remote
        .then(setupTest({ forceAboutAccounts: true, preVerified: true }))

        .then(openVerificationLinkInDifferentBrowser(email))
        // about:accounts will take over post-verification, no transition
        .then(noPageTransition(selectors.CONFIRM_SIGNIN.HEADER));
    },

    'unverified - about:accounts': function () {
      return this.remote
        .then(setupTest({ forceAboutAccounts: true, preVerified: false }))

        .then(testIsBrowserNotified('fxaccounts:can_link_account'))
        .then(testIsBrowserNotified('fxaccounts:login'));
    },

    'verified - web flow, verify, from original tab\'s P.O.V.': function () {
      return this.remote
        .then(setupTest({ preVerified: true }))
        .then(testIsBrowserNotified('fxaccounts:can_link_account'))
        .then(testIsBrowserNotified('fxaccounts:login'))

        .then(openVerificationLinkInDifferentBrowser(email))
        .then(testElementExists(selectors.SIGNIN_COMPLETE.HEADER));
    },

    'unverified - web flow, verify, from original tab\'s P.O.V.': function () {
      return this.remote
        .then(setupTest({ preVerified: false }))
        .then(testIsBrowserNotified('fxaccounts:can_link_account'))
        .then(testIsBrowserNotified('fxaccounts:login'))

        .then(openVerificationLinkInDifferentBrowser(email, 1))
        .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.HEADER));
    },

    'verified, blocked': function () {
      email = TestHelpers.createEmail('blocked{id}');

      return this.remote
        .then(setupTest({ blocked: true, forceAboutAccounts: true, preVerified: true }))
        .then(fillOutSignInUnblock(email, 0))
        // about:accounts will take over post-verification, no transition
        .then(noPageTransition(selectors.SIGNIN_UNBLOCK.HEADER))
        .then(testIsBrowserNotified('fxaccounts:login'));
    }
  });
});
