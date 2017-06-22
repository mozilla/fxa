/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'tests/lib/helpers',
  'tests/functional/lib/helpers',
  'tests/functional/lib/fx-desktop',
  'tests/functional/lib/selectors',
  'tests/functional/lib/ua-strings'
], function (intern, registerSuite,
  TestHelpers, FunctionalHelpers, FxDesktopHelpers, selectors, UA_STRINGS) {
  'use strict';

  const config = intern.config;
  const SIGNIN_PAGE_URL = `${config.fxaContentRoot}signin?context=fx_ios_v1&service=sync`;

  let email;
  const PASSWORD = '12345678';

  const thenify = FunctionalHelpers.thenify;
  const clearBrowserState = FunctionalHelpers.clearBrowserState;
  const closeCurrentWindow = FunctionalHelpers.closeCurrentWindow;
  const createUser = FunctionalHelpers.createUser;
  const fillOutSignIn = FunctionalHelpers.fillOutSignIn;
  const fillOutSignInUnblock = FunctionalHelpers.fillOutSignInUnblock;
  const listenForFxaCommands = FxDesktopHelpers.listenForFxaCommands;
  const noPageTransition = FunctionalHelpers.noPageTransition;
  const openPage = FunctionalHelpers.openPage;
  const openVerificationLinkInDifferentBrowser = FunctionalHelpers.openVerificationLinkInDifferentBrowser;
  const openVerificationLinkInNewTab = FunctionalHelpers.openVerificationLinkInNewTab;
  const testElementExists = FunctionalHelpers.testElementExists;
  const testElementTextInclude = FunctionalHelpers.testElementTextInclude;
  const testIsBrowserNotified = FxDesktopHelpers.testIsBrowserNotifiedOfMessage;
  const testIsBrowserNotifiedOfLogin = FxDesktopHelpers.testIsBrowserNotifiedOfLogin;
  const visibleByQSA = FunctionalHelpers.visibleByQSA;

  const setupTest = thenify(function (options) {
    options = options || {};

    const successSelector = options.blocked ? '#fxa-signin-unblock-header' :
                            options.preVerified ? '#fxa-confirm-signin-header' :
                            '#fxa-confirm-header';

    return this.parent
      .then(createUser(email, PASSWORD, { preVerified: options.preVerified }))
      .then(openPage(SIGNIN_PAGE_URL, selectors.SIGNIN.HEADER, {
        query: {
          forceUA: options.userAgent || UA_STRINGS['ios_firefox_6_0']
        }
      }))
      .execute(listenForFxaCommands)
      .then(fillOutSignIn(email, PASSWORD))
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
    name: 'FxiOS v1 sign_in',

    beforeEach: function () {
      email = TestHelpers.createEmail('sync{id}');

      return this.remote
        .then(clearBrowserState({ force: true }));
    },

    'verified, verify same browser': function () {
      return this.remote
        .then(setupTest({ preVerified: true }))

        .then(openVerificationLinkInNewTab(email, 0))
        .switchToWindow('newwindow')
          .then(testElementExists('#fxa-sign-in-complete-header'))
          .then(closeCurrentWindow())

        // about:accounts will take over post-verification, no transition
        .then(noPageTransition('#fxa-confirm-signin-header'));
    },

    'verified, verify different browser - from original tab\'s P.O.V.': function () {
      return this.remote
        .then(setupTest({ preVerified: true }))

        .then(openVerificationLinkInDifferentBrowser(email))

        // about:accounts will take over post-verification, no transition
        .then(noPageTransition('#fxa-confirm-signin-header'));
    },

    'Fx iOS <= 6.0 unverified, verify same browser': function () {
      return this.remote
      .then(setupTest({ preVerified: false, userAgent: UA_STRINGS['ios_firefox_6_0'] }))

        // email 0 - initial sign up email
        // email 1 - sign in w/ unverified address email
        // email 2 - "You have verified your Firefox Account"
        .then(openVerificationLinkInNewTab(email, 1))
        .switchToWindow('newwindow')
          .then(testElementExists('#fxa-connect-another-device-header'))
          .then(closeCurrentWindow())

        // about:accounts will take over post-verification, no transition
        .then(noPageTransition('#fxa-confirm-header'));
    },

    'Fx iOS >= 6.1 unverified, verify same browser': function () {
      return this.remote
        .then(setupTest({ preVerified: false, userAgent: UA_STRINGS['ios_firefox_6_1'] }))

        // email 0 - initial sign up email
        // email 1 - sign in w/ unverified address email
        // email 2 - "You have verified your Firefox Account"
        .then(openVerificationLinkInNewTab(email, 1))
        .switchToWindow('newwindow')
          .then(testElementExists('#fxa-connect-another-device-header'))
          .then(closeCurrentWindow())

          // In Fx for iOS >= 6.1, user should redirect to the signup-complete
          // page after verification.
          .then(testElementExists('#fxa-sign-up-complete-header'));
    },

    'signup link is enabled': function () {
      return this.remote
        .then(openPage(SIGNIN_PAGE_URL, selectors.SIGNIN.HEADER))
        .then(testElementExists('a[href^="/signup"]'));
    },

    'signin with an unknown account does not allow the user to sign up': function () {
      return this.remote
        .then(openPage(SIGNIN_PAGE_URL, selectors.SIGNIN.HEADER))
        .execute(listenForFxaCommands)

        .then(fillOutSignIn(email, PASSWORD))

        .then(visibleByQSA('.error'));
    },

    'blocked, valid code entered': function () {
      email = TestHelpers.createEmail('block{id}');

      return this.remote
        .then(setupTest({ blocked: true, preVerified: true }))

        .then(testElementExists('#fxa-signin-unblock-header'))
        .then(testElementTextInclude('.verification-email-message', email))
        .then(fillOutSignInUnblock(email, 0))

        // about:accounts will take over post-unblock, no transition
        .then(noPageTransition('#fxa-signin-unblock-header'))
        .then(testIsBrowserNotifiedOfLogin(email, { expectVerified: true }));
    }
  });
});
