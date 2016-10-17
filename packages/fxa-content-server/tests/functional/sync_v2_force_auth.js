/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern!object',
  'tests/lib/helpers',
  'tests/functional/lib/helpers'
], function (registerSuite, TestHelpers, FunctionalHelpers) {
  var email;
  var PASSWORD = '12345678';

  var thenify = FunctionalHelpers.thenify;

  var clearBrowserState = thenify(FunctionalHelpers.clearBrowserState);
  var closeCurrentWindow = FunctionalHelpers.closeCurrentWindow;
  var createUser = FunctionalHelpers.createUser;
  var fillOutForceAuth = FunctionalHelpers.fillOutForceAuth;
  var fillOutSignInUnblock = FunctionalHelpers.fillOutSignInUnblock;
  var noPageTransition = FunctionalHelpers.noPageTransition;
  var noSuchBrowserNotification = FunctionalHelpers.noSuchBrowserNotification;
  var openForceAuth = FunctionalHelpers.openForceAuth;
  var openVerificationLinkDifferentBrowser = thenify(FunctionalHelpers.openVerificationLinkDifferentBrowser);
  var openVerificationLinkInNewTab = thenify(FunctionalHelpers.openVerificationLinkInNewTab);
  var respondToWebChannelMessage = FunctionalHelpers.respondToWebChannelMessage;
  var testElementExists = FunctionalHelpers.testElementExists;
  var testIsBrowserNotified = FunctionalHelpers.testIsBrowserNotified;

  var setupTest = thenify(function (options) {
    options = options || {};
    var forceAuthOptions = { query: {
      context: 'fx_desktop_v2',
      email: email,
      service: 'sync'
    }};

    if (options.forceAboutAccounts) {
      forceAuthOptions.query.forceAboutAccounts = 'true';
    }

    const successSelector = options.blocked ? '#fxa-signin-unblock-header' :
                            options.preVerified ? '#fxa-confirm-signin-header' :
                            '#fxa-confirm-header';

    return this.parent
      .then(clearBrowserState(this.parent))
      .then(createUser(email, PASSWORD, { preVerified: options.preVerified }))
      .then(openForceAuth(forceAuthOptions))
      .then(noSuchBrowserNotification(this.parent, 'fxaccounts:logout'))
      .then(respondToWebChannelMessage(this.parent, 'fxaccounts:can_link_account', { ok: true } ))
      .then(fillOutForceAuth(PASSWORD))

      .then(testElementExists(successSelector))
      .then(testIsBrowserNotified(this.parent, 'fxaccounts:can_link_account'))

      .then(() => {
        if (! options.blocked) {
          return this.parent
            .then(testIsBrowserNotified(this.parent, 'fxaccounts:login'));
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
        .then(setupTest({ forceAboutAccounts: true, preVerified: true }))

        .then(openVerificationLinkInNewTab(this, email, 0))
        .switchToWindow('newwindow')
          .then(testElementExists('#fxa-sign-in-complete-header'))
          .then(closeCurrentWindow())

        // about:accounts will take over post-verification, no transition
        .then(noPageTransition('#fxa-confirm-signin-header'));
    },

    'verified - about:accounts, verify, from original tab\'s P.O.V.': function () {
      return this.remote
        .then(setupTest({ forceAboutAccounts: true, preVerified: true }))

        .then(openVerificationLinkDifferentBrowser(email))
        // about:accounts will take over post-verification, no transition
        .then(noPageTransition('#fxa-confirm-signin-header'));
    },

    'unverified - about:accounts': function () {
      return this.remote
        .then(setupTest({ forceAboutAccounts: true, preVerified: false }))

        .then(testIsBrowserNotified(this, 'fxaccounts:can_link_account'))
        .then(testIsBrowserNotified(this, 'fxaccounts:login'));
    },

    'verified - web flow, verify, from original tab\'s P.O.V.': function () {
      return this.remote
        .then(setupTest({ preVerified: true }))
        .then(testIsBrowserNotified(this, 'fxaccounts:can_link_account'))
        .then(testIsBrowserNotified(this, 'fxaccounts:login'))

        .then(openVerificationLinkDifferentBrowser(email))
        .then(testElementExists('#fxa-sign-in-complete-header'));
    },

    'unverified - web flow, verify, from original tab\'s P.O.V.': function () {
      return this.remote
        .then(setupTest({ preVerified: false }))
        .then(testIsBrowserNotified(this, 'fxaccounts:can_link_account'))
        .then(testIsBrowserNotified(this, 'fxaccounts:login'))

        .then(openVerificationLinkDifferentBrowser(email, 1))
        .then(testElementExists('#fxa-sign-up-complete-header'));
    },

    'verified, blocked': function () {
      email = TestHelpers.createEmail('blocked{id}');

      return this.remote
        .then(setupTest({ blocked: true, forceAboutAccounts: true, preVerified: true }))
        .then(fillOutSignInUnblock(email, 0))
        // about:accounts will take over post-verification, no transition
        .then(noPageTransition('#fxa-signin-unblock-header'))
        .then(testIsBrowserNotified(this, 'fxaccounts:login'));
    }
  });
});
