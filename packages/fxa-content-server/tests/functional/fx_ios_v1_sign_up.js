/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'tests/lib/helpers',
  'tests/functional/lib/helpers',
  'tests/functional/lib/fx-desktop'
], function (intern, registerSuite, TestHelpers, FunctionalHelpers, FxDesktopHelpers) {
  var config = intern.config;
  var PAGE_URL = config.fxaContentRoot + 'signup?context=fx_ios_v1&service=sync';

  var email;
  var PASSWORD = '12345678';

  var thenify = FunctionalHelpers.thenify;
  var clearBrowserState = FunctionalHelpers.clearBrowserState;
  var closeCurrentWindow = FunctionalHelpers.closeCurrentWindow;
  var fillOutSignUp = FunctionalHelpers.fillOutSignUp;
  var listenForFxaCommands = FxDesktopHelpers.listenForFxaCommands;
  var noPageTransition = FunctionalHelpers.noPageTransition;
  var noSuchElement = FunctionalHelpers.noSuchElement;
  var openPage = FunctionalHelpers.openPage;
  var openVerificationLinkInNewTab = FunctionalHelpers.openVerificationLinkInNewTab;
  var testElementExists = FunctionalHelpers.testElementExists;
  var testEmailExpected = FunctionalHelpers.testEmailExpected;
  var testIsBrowserNotifiedOfLogin = FxDesktopHelpers.testIsBrowserNotifiedOfLogin;

  /*eslint-disable max-len*/
  var UA_STRINGS = {
    'ios_firefox_6_0': 'Mozilla/5.0 (iPhone; CPU iPhone OS 8_3 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) FxiOS/6.0 Mobile/12F69 Safari/600.1.4',
    'ios_firefox_6_1': 'Mozilla/5.0 (iPhone; CPU iPhone OS 8_3 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) FxiOS/6.1 Mobile/12F69 Safari/600.1.4',
  };
  /*eslint-enable max-len*/

  const setupTest = thenify(function (userAgent) {
    return this.parent
      .then(openPage(PAGE_URL, '#fxa-signup-header', {
        query: {
          forceUA: userAgent
        }
      }))
      .execute(listenForFxaCommands)
      .then(noSuchElement('#customize-sync'))
      .then(fillOutSignUp(email, PASSWORD))

      .then(testElementExists('#fxa-confirm-header'))
      .then(testIsBrowserNotifiedOfLogin(email))

      // verify the user
      .then(openVerificationLinkInNewTab(email, 0))
      .switchToWindow('newwindow')

      .then(testElementExists('#fxa-connect-another-device-header'))
      .then(closeCurrentWindow());
  });

  registerSuite({
    name: 'FxiOS v1 sign_up',

    beforeEach: function () {
      email = TestHelpers.createEmail();
      return this.remote.then(clearBrowserState());
    },

    afterEach: function () {
      return this.remote
        .then(clearBrowserState());
    },

    'Fx iOS <= 6.0 sign up, verify same browser': function () {
      return this.remote
        .then(setupTest(UA_STRINGS['ios_firefox_6_0']))

        // no screen transition, no polling even, in Fx <= 6.0
        .then(noPageTransition('#fxa-confirm-header'))

        // A post-verification email should be sent, this is Sync.
        .then(testEmailExpected(email, 1));
    },

    'Fx iOS >= 6.1 sign up, verify same browser': function () {
      return this.remote
        .then(setupTest(UA_STRINGS['ios_firefox_6_1']))

        // In Fx for iOS >= 6.1, user should redirect to the signup-complete
        // page after verification.
        .then(testElementExists('#fxa-sign-up-complete-header'))

        // A post-verification email should be sent, this is Sync.
        .then(testEmailExpected(email, 1));
    }
  });
});
