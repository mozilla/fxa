/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern!object',
  'tests/lib/helpers',
  'tests/functional/lib/helpers',
  'tests/functional/lib/fx-desktop'
], function (registerSuite, TestHelpers, FunctionalHelpers, FxDesktopHelpers) {
  var thenify = FunctionalHelpers.thenify;

  var clearBrowserState = thenify(FunctionalHelpers.clearBrowserState);
  var closeCurrentWindow = FunctionalHelpers.closeCurrentWindow;
  var createUser = FunctionalHelpers.createUser;
  var fillOutForceAuth = FunctionalHelpers.fillOutForceAuth;
  var fillOutSignInUnblock = FunctionalHelpers.fillOutSignInUnblock;
  var listenForFxaCommands = FxDesktopHelpers.listenForFxaCommands;
  var noPageTransition = FunctionalHelpers.noPageTransition;
  var openForceAuth = FunctionalHelpers.openForceAuth;
  var openVerificationLinkDifferentBrowser = thenify(FunctionalHelpers.openVerificationLinkDifferentBrowser);
  var openVerificationLinkInNewTab = thenify(FunctionalHelpers.openVerificationLinkInNewTab);
  var testElementExists = FunctionalHelpers.testElementExists;
  var testIsBrowserNotified = thenify(FxDesktopHelpers.testIsBrowserNotifiedOfMessage);
  var testIsBrowserNotifiedOfLogin = thenify(FxDesktopHelpers.testIsBrowserNotifiedOfLogin);

  var PASSWORD = 'password';
  var email;

  var setupTest = thenify(function (options) {
    options = options || {};

    const successSelector = options.blocked ? '#fxa-signin-unblock-header' :
                            options.preVerified ? '#fxa-confirm-signin-header' :
                            '#fxa-confirm-header';

    return this.parent
      .then(clearBrowserState(this.parent))
      .then(createUser(email, PASSWORD, { preVerified: options.preVerified }))
      .then(openForceAuth({ query: {
        context: 'fx_desktop_v1',
        email: email,
        service: 'sync'
      }}))
      .execute(listenForFxaCommands)
      .then(fillOutForceAuth(PASSWORD))
      .then(testIsBrowserNotified(this.parent, 'can_link_account'))
      .then(() => {
        if (! options.blocked) {
          return this.parent
            .then(testIsBrowserNotifiedOfLogin(this.parent, email, { checkVerified: false }));
        }
      })

      .then(testElementExists(successSelector));
  });

  registerSuite({
    name: 'Firefox Desktop Sync v1 force_auth',

    beforeEach: function () {
      email = TestHelpers.createEmail('sync{id}');
    },

    'verified, verify same browser': function () {
      return this.remote
        .then(setupTest({ preVerified: true }))

        .then(openVerificationLinkInNewTab(this, email, 0))
        .switchToWindow('newwindow')
          .then(testElementExists('#fxa-sign-in-complete-header'))
          .then(closeCurrentWindow())

        // about:accounts will take over post-verification, no transition
        .then(noPageTransition('#fxa-confirm-signin-header'));
    },

    'verified, verify different browser - from original tab\'s P.O.V.': function () {
      return this.remote
        .then(setupTest({ preVerified: true }))

        .then(openVerificationLinkDifferentBrowser(email))

        // about:accounts will take over post-verification, no transition
        .then(noPageTransition('#fxa-confirm-signin-header'));
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
        .then(testIsBrowserNotifiedOfLogin(this, email, { checkVerified: true }))

        // about:accounts will take over post-verification, no transition
        .then(noPageTransition('#fxa-signin-unblock-header'));
    }
  });
});
