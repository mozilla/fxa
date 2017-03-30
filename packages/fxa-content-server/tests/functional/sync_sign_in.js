/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'tests/lib/helpers',
  'tests/functional/lib/helpers',
  'tests/functional/lib/fx-desktop'
], function (intern, registerSuite, TestHelpers, FunctionalHelpers,
  FxDesktopHelpers) {
  var config = intern.config;
  var ROOT_URL = config.fxaContentRoot;
  var PAGE_URL = config.fxaContentRoot + 'signin?context=fx_desktop_v1&service=sync';
  var PAGE_URL_WITH_MIGRATION = PAGE_URL + '&migration=sync11';

  var email;
  var PASSWORD = '12345678';

  var thenify = FunctionalHelpers.thenify;

  var clearBrowserState = FunctionalHelpers.clearBrowserState;
  var click = FunctionalHelpers.click;
  var closeCurrentWindow = FunctionalHelpers.closeCurrentWindow;
  var createUser = FunctionalHelpers.createUser;
  var fillOutSignIn = FunctionalHelpers.fillOutSignIn;
  var fillOutSignInUnblock = FunctionalHelpers.fillOutSignInUnblock;
  var listenForFxaCommands = FxDesktopHelpers.listenForFxaCommands;
  var noPageTransition = FunctionalHelpers.noPageTransition;
  var openPage = FunctionalHelpers.openPage;
  var openVerificationLinkInDifferentBrowser = FunctionalHelpers.openVerificationLinkInDifferentBrowser;
  var openVerificationLinkInNewTab = FunctionalHelpers.openVerificationLinkInNewTab;
  var testElementExists = FunctionalHelpers.testElementExists;
  var testIsBrowserNotified = FxDesktopHelpers.testIsBrowserNotifiedOfMessage;
  var testIsBrowserNotifiedOfLogin = FxDesktopHelpers.testIsBrowserNotifiedOfLogin;
  var visibleByQSA = FunctionalHelpers.visibleByQSA;

  var setupTest = thenify(function (options) {
    options = options || {};

    const successSelector = options.blocked ? '#fxa-signin-unblock-header' :
                            options.preVerified ? '#fxa-confirm-signin-header' :
                            '#fxa-confirm-header';

    return this.parent
      .then(createUser(email, PASSWORD, { preVerified: !! options.preVerified }))
      .then(openPage(options.pageUrl || PAGE_URL, '#fxa-signin-header'))
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
    name: 'Firefox Desktop Sync v1 sign_in',

    beforeEach: function () {
      email = TestHelpers.createEmail('sync{id}');
      return this.remote
        .then(clearBrowserState());
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

    'verified, resend email, verify same browser': function () {
      return this.remote
        .then(setupTest({ preVerified: true }))

        .then(click('#resend'))
        .then(visibleByQSA('.success'))

        // email 0 is the original signin email, open the resent email instead
        .then(openVerificationLinkInNewTab(email, 1))
        .switchToWindow('newwindow')
          .then(testElementExists('#fxa-sign-in-complete-header'))
          .then(closeCurrentWindow())

        // about:accounts will take over post-verification, no transition
        .then(noPageTransition('#fxa-confirm-signin-header'));
    },

    'verified, do not confirm signin, load root': function () {
      return this.remote
        .then(setupTest({ preVerified: true }))

        .then(openPage(ROOT_URL, '#fxa-confirm-signin-header'));
    },

    'unverified': function () {
      return this.remote
        .then(setupTest({ preVerified: false }));
    },

    'unverified, do not confirm signin, load root': function () {
      return this.remote
        .then(setupTest({ preVerified: false }))

        .then(openPage(ROOT_URL, '#fxa-confirm-header'));
    },

    'as a migrating user': function () {
      return this.remote
        .then(openPage(PAGE_URL_WITH_MIGRATION, '#fxa-signin-header'))
        .then(visibleByQSA('.info.nudge'));
    },

    'verified, blocked': function () {
      email = TestHelpers.createEmail('blocked{id}');

      return this.remote
        .then(setupTest({ blocked: true, preVerified: true }))

        .then(fillOutSignInUnblock(email, 0))

        // about:accounts will take over post-verification, no transition
        .then(noPageTransition('#fxa-signin-unblock-header'))
        .then(testIsBrowserNotifiedOfLogin(email, { expectVerified: true }));
    }
  });
});
