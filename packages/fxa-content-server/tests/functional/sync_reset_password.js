/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'require',
  'tests/lib/helpers',
  'tests/functional/lib/helpers',
  'tests/functional/lib/fx-desktop'
], function (intern, registerSuite, require,
        TestHelpers, FunctionalHelpers, FxDesktopHelpers) {
  var config = intern.config;

  var PAGE_URL = config.fxaContentRoot + 'reset_password?context=fx_desktop_v1&service=sync';
  var PASSWORD = 'password';

  var email;
  var user;

  var thenify = FunctionalHelpers.thenify;

  var clearBrowserState = FunctionalHelpers.clearBrowserState;
  var click = FunctionalHelpers.click;
  var closeCurrentWindow = FunctionalHelpers.closeCurrentWindow;
  var createUser = FunctionalHelpers.createUser;
  var fillOutCompleteResetPassword = FunctionalHelpers.fillOutCompleteResetPassword;
  var fillOutResetPassword = FunctionalHelpers.fillOutResetPassword;
  var getVerificationLink = thenify(FunctionalHelpers.getVerificationLink);
  var listenForFxaCommands = FxDesktopHelpers.listenForFxaCommands;
  var openExternalSite = FunctionalHelpers.openExternalSite;
  var openPage = FunctionalHelpers.openPage;
  var openPasswordResetLinkDifferentBrowser = thenify(FunctionalHelpers.openPasswordResetLinkDifferentBrowser);
  var openVerificationLinkInNewTab = FunctionalHelpers.openVerificationLinkInNewTab;
  var testElementExists = FunctionalHelpers.testElementExists;
  var testSuccessWasShown = FunctionalHelpers.testSuccessWasShown;
  var testIsBrowserNotifiedOfLogin = FxDesktopHelpers.testIsBrowserNotifiedOfLogin;
  var type = FunctionalHelpers.type;


  registerSuite({
    name: 'Firefox Desktop Sync v1 reset_password',

    beforeEach: function () {
      // timeout after 90 seconds
      this.timeout = 90000;

      email = TestHelpers.createEmail('sync{id}');
      user = TestHelpers.emailToUser(email);

      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(clearBrowserState());
    },

    'reset password, verify same browser': function () {
      // verify account
      return this.remote
        .then(openPage(PAGE_URL, '#fxa-reset-password-header'))
        .execute(listenForFxaCommands)
        .then(fillOutResetPassword(email))

        .then(testElementExists('#fxa-confirm-reset-password-header'))

        .then(openVerificationLinkInNewTab(email, 0))
        .switchToWindow('newwindow')

        .then(testElementExists('#fxa-complete-reset-password-header'))
        .then(fillOutCompleteResetPassword(PASSWORD, PASSWORD))

        .then(testElementExists('#fxa-reset-password-complete-header'))
        .then(testElementExists('.account-ready-service'))
        .then(closeCurrentWindow())

        .then(testSuccessWasShown())
        .then(testIsBrowserNotifiedOfLogin(email, { expectVerified: true }));
    },

    'reset password, verify same browser with original tab closed': function () {
      return this.remote
        .then(openPage(PAGE_URL, '#fxa-reset-password-header'))
        .execute(listenForFxaCommands)
        .then(fillOutResetPassword(email))

        .then(testElementExists('#fxa-confirm-reset-password-header'))

        // user browses to another site.
        .then(openExternalSite())
        .then(openVerificationLinkInNewTab(email, 0))
        .switchToWindow('newwindow')

        .then(fillOutCompleteResetPassword(PASSWORD, PASSWORD))
        .then(testElementExists('#fxa-reset-password-complete-header'))

        .then(closeCurrentWindow());
    },

    'reset password, verify same browser by replacing the original tab': function () {
      var self = this;
      return this.remote
        .then(openPage(PAGE_URL, '#fxa-reset-password-header'))
        .execute(listenForFxaCommands)
        .then(fillOutResetPassword(email))

        .then(testElementExists('#fxa-confirm-reset-password-header'))

        .then(getVerificationLink(email, 0))
        .then(function (verificationLink) {
          return self.remote.get(require.toUrl(verificationLink));
        })

        .then(fillOutCompleteResetPassword(PASSWORD, PASSWORD))
        .then(testElementExists('#fxa-reset-password-complete-header'));
    },

    'reset password, verify different browser - from original tab\'s P.O.V.': function () {
      // verify account
      return this.remote
        .then(openPage(PAGE_URL, '#fxa-reset-password-header'))
        .execute(listenForFxaCommands)
        .then(fillOutResetPassword(email))
        .then(testElementExists('#fxa-confirm-reset-password-header'))

        .then(openPasswordResetLinkDifferentBrowser(email, PASSWORD))

        .then(testElementExists('#fxa-signin-header'))
        .then(testSuccessWasShown())

        .then(type('#password', PASSWORD))
        .then(click('button[type=submit]'))

        .then(testIsBrowserNotifiedOfLogin(email, { expectVerified: false }))

        // user verified the reset password in another browser, they must
        // re-verify they want to sign in on this device to avoid
        // opening up an attack vector.
        .then(testElementExists('#fxa-confirm-signin-header'));
    },

    'reset password, verify different browser - from new browser\'s P.O.V.': function () {

      var self = this;

      // verify account
      return this.remote
        .then(openPage(PAGE_URL, '#fxa-reset-password-header'))
        .execute(listenForFxaCommands)
        .then(fillOutResetPassword(email))
        .then(testElementExists('#fxa-confirm-reset-password-header'))

        // clear all browser state, simulate opening in a new
        // browser
        .then(clearBrowserState())
        .then(getVerificationLink(user, 0))
        .then(function (url) {
          return self.remote.get(require.toUrl(url));
        })
        .then(testElementExists('#fxa-complete-reset-password-header'))
        .then(fillOutCompleteResetPassword(PASSWORD, PASSWORD))

        .then(testElementExists('#fxa-reset-password-complete-header'))
        .then(testElementExists('.account-ready-service'));
    }
  });

});
