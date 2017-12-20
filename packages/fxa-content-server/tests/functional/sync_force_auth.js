/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern!object',
  'tests/lib/helpers',
  'tests/functional/lib/helpers',
  'tests/functional/lib/fx-desktop',
  'tests/functional/lib/selectors'
], function (registerSuite, TestHelpers, FunctionalHelpers, FxDesktopHelpers, selectors) {
  'use strict';

  const {
    clearBrowserState,
    closeCurrentWindow,
    createUser,
    fillOutForceAuth,
    fillOutSignInUnblock,
    noPageTransition,
    openForceAuth,
    openVerificationLinkInDifferentBrowser,
    openVerificationLinkInNewTab,
    switchToWindow,
    testElementExists,
    thenify,
  } = FunctionalHelpers;

  const {
    listenForFxaCommands,
    testIsBrowserNotifiedOfLogin,
    testIsBrowserNotifiedOfMessage: testIsBrowserNotified,
  } = FxDesktopHelpers;

  const PASSWORD = 'password';
  let email;

  const setupTest = thenify(function (options = {}) {
    const successSelector = options.blocked ? selectors.SIGNIN_UNBLOCK.HEADER :
                            options.preVerified ? selectors.CONFIRM_SIGNIN.HEADER :
                            selectors.CONFIRM_SIGNUP.HEADER;

    return this.parent
      .then(clearBrowserState())
      .then(createUser(email, PASSWORD, { preVerified: options.preVerified }))
      .then(openForceAuth({ query: {
        context: 'fx_desktop_v1',
        email: email,
        service: 'sync'
      }}))
      .execute(listenForFxaCommands)
      .then(fillOutForceAuth(PASSWORD))
      .then(testElementExists(successSelector))
      .then(testIsBrowserNotified('can_link_account'))
      .then(() => {
        if (! options.blocked) {
          return this.parent
            .then(testIsBrowserNotifiedOfLogin(email, { expectVerified: false }));
        }
      });
  });

  registerSuite({
    name: 'Firefox Desktop Sync v1 force_auth',

    beforeEach: function () {
      email = TestHelpers.createEmail('sync{id}');
    },

    'verified, verify same browser': function () {
      return this.remote
        .then(setupTest({ preVerified: true }))

        .then(openVerificationLinkInNewTab(email, 0))
        .then(switchToWindow(1))
          .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.HEADER))
          .then(closeCurrentWindow())

        // about:accounts will take over post-verification, no transition
        .then(noPageTransition(selectors.CONFIRM_SIGNIN.HEADER));
    },

    'verified, verify different browser - from original tab\'s P.O.V.': function () {
      return this.remote
        .then(setupTest({ preVerified: true }))

        .then(openVerificationLinkInDifferentBrowser(email))

        // about:accounts will take over post-verification, no transition
        .then(noPageTransition(selectors.CONFIRM_SIGNIN.HEADER));
    },

    'unverified': function () {
      return this.remote
        .then(setupTest({ preVerified: false }));
    },

    'verified, blocked': function () {
      email = TestHelpers.createEmail('blocked{id}');

      return this.remote
        .then(setupTest({ blocked: true, preVerified: true }))

        .then(fillOutSignInUnblock(email, 0))

        // about:accounts will take over post-verification, no transition
        .then(noPageTransition(selectors.SIGNIN_UNBLOCK.HEADER))
        .then(testIsBrowserNotifiedOfLogin(email, { expectVerified: true }));
    }
  });
});
