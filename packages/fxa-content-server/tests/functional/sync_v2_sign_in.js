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
  var PAGE_URL = config.fxaContentRoot + 'signin?context=fx_desktop_v2&service=sync&forceAboutAccounts=true';

  var email;
  var PASSWORD = '12345678';

  var thenify = FunctionalHelpers.thenify;

  var clearBrowserState = FunctionalHelpers.clearBrowserState;
  var closeCurrentWindow = FunctionalHelpers.closeCurrentWindow;
  var createUser = FunctionalHelpers.createUser;
  var fillOutSignIn = FunctionalHelpers.fillOutSignIn;
  var fillOutSignInUnblock = FunctionalHelpers.fillOutSignInUnblock;
  var noPageTransition = FunctionalHelpers.noPageTransition;
  var openPage = thenify(FunctionalHelpers.openPage);
  var openVerificationLinkDifferentBrowser = thenify(FunctionalHelpers.openVerificationLinkDifferentBrowser);
  var openVerificationLinkInNewTab = thenify(FunctionalHelpers.openVerificationLinkInNewTab);
  var respondToWebChannelMessage = FunctionalHelpers.respondToWebChannelMessage;
  var testElementExists = FunctionalHelpers.testElementExists;
  var testIsBrowserNotified = FunctionalHelpers.testIsBrowserNotified;

  var setupTest = thenify(function (options) {
    options = options || {};

    const successSelector = options.blocked ? '#fxa-signin-unblock-header' :
                            options.preVerified ? '#fxa-confirm-signin-header' :
                            '#fxa-confirm-header';

    return this.parent
      .then(clearBrowserState({ force: true }))
      .then(createUser(email, PASSWORD, { preVerified: options.preVerified }))
      .then(openPage(this.parent, PAGE_URL, '#fxa-signin-header'))
      .then(respondToWebChannelMessage(this.parent, 'fxaccounts:can_link_account', { ok: true } ))
      .then(fillOutSignIn(email, PASSWORD))

      .then(testIsBrowserNotified(this.parent, 'fxaccounts:can_link_account'))

      .then(() => {
        if (! options.blocked) {
          return this.parent
            .then(testIsBrowserNotified(this.parent, 'fxaccounts:login'));
        }
      })

      .then(testElementExists(successSelector));
  });

  registerSuite({
    name: 'Firefox Desktop Sync v2 sign_in',

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
        .then(testIsBrowserNotified(this, 'fxaccounts:login'))

        // about:accounts will take over post-verification, no transition
        .then(noPageTransition('#fxa-signin-unblock-header'));
    }
  });
});
