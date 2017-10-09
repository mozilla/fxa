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
], function (intern, registerSuite, TestHelpers, FunctionalHelpers, FxDesktopHelpers, selectors) {
  var config = intern.config;
  var PAGE_URL = config.fxaContentRoot + 'signup?context=fx_desktop_v1&service=sync';
  var PAGE_URL_WITH_MIGRATION = PAGE_URL + '&migration=sync11';

  var email;
  var PASSWORD = '12345678';

  const {
    clearBrowserState,
    closeCurrentWindow,
    fillOutSignUp,
    noPageTransition,
    noSuchElement,
    openPage,
    openVerificationLinkInDifferentBrowser,
    openVerificationLinkInNewTab,
    openVerificationLinkInSameTab,
    testAttributeEquals,
    testElementExists,
    testEmailExpected,
    visibleByQSA,
  } = FunctionalHelpers;

  const {
    listenForFxaCommands,
    testIsBrowserNotifiedOfLogin,
  } = FxDesktopHelpers;

  registerSuite({
    name: 'Firefox Desktop Sync sign_up',

    beforeEach: function () {
      email = TestHelpers.createEmail();

      return this.remote.then(clearBrowserState());
    },

    afterEach: function () {
      return this.remote.then(clearBrowserState());
    },

    'sign up, verify same browser': function () {
      return this.remote
        .then(openPage(PAGE_URL, selectors.SIGNUP.HEADER))
        .execute(listenForFxaCommands)
        .then(fillOutSignUp(email, PASSWORD))

        .then(testElementExists(selectors.CONFIRM_SIGNUP.HEADER))

        .then(testIsBrowserNotifiedOfLogin(email))

        // verify the user
        .then(openVerificationLinkInNewTab(email, 0))
        .switchToWindow('newwindow')

          .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.HEADER))
          .then(noSuchElement(selectors.CONNECT_ANOTHER_DEVICE.SIGNIN_BUTTON))

          .then(closeCurrentWindow())

        // We do not expect the verification poll to occur. The poll
        // will take a few seconds to complete if it erroneously occurs.
        // Add an affordance just in case the poll happens unexpectedly.
        .then(noPageTransition(selectors.CONFIRM_SIGNUP.HEADER, 5000))

        // A post-verification email should be sent, this is Sync.
        .then(testEmailExpected(email, 1));
    },

    'signup, verify same browser with original tab closed': function () {
      return this.remote
        .then(openPage(PAGE_URL, selectors.SIGNUP.HEADER))
        .execute(listenForFxaCommands)
        .then(fillOutSignUp(email, PASSWORD))

        .then(testElementExists(selectors.CONFIRM_SIGNUP.HEADER))
        .then(FunctionalHelpers.openExternalSite())

        .then(openVerificationLinkInNewTab(email, 0))

        .switchToWindow('newwindow')

        .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.HEADER))
        .then(closeCurrentWindow());
    },

    'signup, verify same browser by replacing the original tab': function () {
      return this.remote
        .then(openPage(PAGE_URL, selectors.SIGNUP.HEADER))
        .execute(listenForFxaCommands)
        .then(fillOutSignUp(email, PASSWORD))

        .then(testElementExists(selectors.CONFIRM_SIGNUP.HEADER))

        .then(openVerificationLinkInSameTab(email, 0))
        .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.HEADER));
    },


    'signup, verify different browser - from original tab\'s P.O.V.': function () {
      return this.remote
        .then(openPage(PAGE_URL, selectors.SIGNUP.HEADER))
        .execute(listenForFxaCommands)
        .then(fillOutSignUp(email, PASSWORD))

        .then(testElementExists(selectors.CONFIRM_SIGNUP.HEADER))
        .then(testIsBrowserNotifiedOfLogin(email))

        .then(openVerificationLinkInDifferentBrowser(email, 0))

        // The original tab should not transition
        .then(noPageTransition(selectors.CONFIRM_SIGNUP.HEADER, 5000));
    },

    'signup, verify different browser - from new browser\'s P.O.V.': function () {
      return this.remote
        .then(openPage(PAGE_URL, selectors.SIGNUP.HEADER))
        .execute(listenForFxaCommands)
        .then(fillOutSignUp(email, PASSWORD))
        .then(testElementExists(selectors.CONFIRM_SIGNUP.HEADER))

        .then(testIsBrowserNotifiedOfLogin(email))

        // clear local/sessionStorage to synthesize continuing in
        // a separate browser.
        .then(clearBrowserState())

        // verify the user
        .then(openVerificationLinkInSameTab(email, 0))

        // user should be redirected to "Success!" screen
        .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.HEADER));
    },

    'choose option to customize sync': function () {
      return this.remote
        .then(openPage(PAGE_URL, selectors.SIGNUP.HEADER))
        .execute(listenForFxaCommands)

        .then(testAttributeEquals(selectors.SIGNUP.CUSTOMIZE_SYNC_INPUT, 'checked', null))
        .then(fillOutSignUp(email, PASSWORD, { customizeSync: true }))

        .then(testIsBrowserNotifiedOfLogin(email))

        // Being pushed to the confirmation screen is success.
        .then(testElementExists(selectors.CONFIRM_SIGNUP.HEADER));
    },

    'force customize sync checkbox to be checked': function () {
      var url = (PAGE_URL += '&customizeSync=true');
      return this.remote
        .then(openPage(url, selectors.SIGNUP.HEADER))

        .then(testAttributeEquals(selectors.SIGNUP.CUSTOMIZE_SYNC_INPUT, 'checked', 'checked'));
    },

    'as a migrating user': function () {
      return this.remote
        .then(openPage(PAGE_URL_WITH_MIGRATION, selectors.SIGNUP.HEADER))
        .then(visibleByQSA(selectors.SIGNUP.MIGRATING_USER));
    }
  });
});
