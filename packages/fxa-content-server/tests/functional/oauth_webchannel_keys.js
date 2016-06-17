/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * This suite tests the WebChannel functionality for delivering encryption keys
 * in the OAuth signin and signup cases. It uses a CustomEvent "WebChannelMessageToChrome"
 * to finish OAuth flows
 */

define([
  'intern',
  'intern!object',
  'intern/chai!assert',
  'tests/lib/helpers',
  'tests/functional/lib/helpers',
  'tests/functional/lib/fx-desktop',
  'tests/functional/lib/webchannel-helpers'
], function (intern, registerSuite, assert,
        TestHelpers, FunctionalHelpers, FxDesktopHelpers, WebChannelHelpers) {
  var config = intern.config;
  var SYNC_URL = config.fxaContentRoot + 'signin?context=fx_desktop_v1&service=sync';

  var PASSWORD = 'password';
  var email;
  var ANIMATION_DELAY_MS = 1000;
  var TIMEOUT = 90 * 1000;

  var thenify = FunctionalHelpers.thenify;

  var clearBrowserState = thenify(FunctionalHelpers.clearBrowserState);
  var click = FunctionalHelpers.click;
  var createUser = FunctionalHelpers.createUser;
  var fillOutCompleteResetPassword = thenify(FunctionalHelpers.fillOutCompleteResetPassword);
  var fillOutResetPassword = thenify(FunctionalHelpers.fillOutResetPassword);
  var fillOutSignIn = thenify(FunctionalHelpers.fillOutSignIn);
  var fillOutSignUp = thenify(FunctionalHelpers.fillOutSignUp);
  var getVerificationLink = thenify(FunctionalHelpers.getVerificationLink);
  var listenForSyncCommands = FxDesktopHelpers.listenForFxaCommands;
  var noEmailExpected = FunctionalHelpers.noEmailExpected;
  var openExternalSite = FunctionalHelpers.openExternalSite;
  var openPage = FunctionalHelpers.openPage;
  var openVerificationLinkDifferentBrowser = thenify(FunctionalHelpers.openVerificationLinkDifferentBrowser);
  var openVerificationLinkInNewTab = thenify(FunctionalHelpers.openVerificationLinkInNewTab);
  var openPasswordResetLinkDifferentBrowser = thenify(FunctionalHelpers.openPasswordResetLinkDifferentBrowser);
  var testElementExists = FunctionalHelpers.testElementExists;
  var testIsBrowserNotifiedOfLogin = WebChannelHelpers.testIsBrowserNotifiedOfLoginWithKeys;
  var testIsBrowserNotifiedOfSyncLogin = thenify(FxDesktopHelpers.testIsBrowserNotifiedOfLogin);
  var type = FunctionalHelpers.type;

  var openFxaFromRp = thenify(function (page) {
    return WebChannelHelpers.openFxaFromRp(this.parent, page, { query: {
      keys: true
    }});
  });

  var waitForBrowserLoginNotification = thenify(function (context) {
    var found = false;
    return this.parent
      .then(testIsBrowserNotifiedOfLogin(context, { shouldCloseTab: false }))
      .then(function () {
        found = true;
      }, function () {
        found = false;
      })
      .setFindTimeout(config.pageLoadTimeout)
      .then(function () {
        return found;
      });
  });

  registerSuite({
    name: 'oauth webchannel keys',

    beforeEach: function () {
      email = TestHelpers.createEmail('sync{id}');

      return this.remote
        .then(clearBrowserState(this, {
          '123done': true,
          contentServer: true
        }));
    },

    'signup, verify same browser, in a different tab, with original tab open': function () {
      this.timeout = TIMEOUT;

      var messageReceived = false;

      return this.remote
        .then(openFxaFromRp('signup'))
        .then(fillOutSignUp(this, email, PASSWORD))

        .then(testElementExists('#fxa-confirm-header'))
        .then(openVerificationLinkInNewTab(this, email, 0))

        .switchToWindow('newwindow')
        .then(testElementExists('#fxa-sign-up-complete-header'))

        .then(waitForBrowserLoginNotification(this))
        .then(function (result) {
          messageReceived = result;
        })
        .closeCurrentWindow()

        // switch to the original window
        .switchToWindow('')
        .then(waitForBrowserLoginNotification(this))
        .then(function (result) {
          messageReceived = messageReceived || result;
        })

        .then(function () {
          assert.isTrue(messageReceived, 'expected to receive a WebChannel event in either tab');
        })

        .then(testElementExists('#fxa-sign-up-complete-header'))

        // Do not expect a post-verification email, those are for Sync.
        .then(noEmailExpected(email, 1));
    },

    'signup, verify same browser, original tab closed navigated to another page': function () {
      this.timeout = TIMEOUT;

      return this.remote
        .then(openFxaFromRp('signup'))
        .then(fillOutSignUp(this, email, PASSWORD))

        .then(testElementExists('#fxa-confirm-header'))
        .then(openExternalSite(this))

        .then(openVerificationLinkInNewTab(this, email, 0))

        .switchToWindow('newwindow')
        .then(testIsBrowserNotifiedOfLogin(this, { shouldCloseTab: false }))

        .then(testElementExists('#fxa-sign-up-complete-header'))

        .closeCurrentWindow()
        // switch to the original window
        .switchToWindow('');
    },

    'signup, verify same browser, replace original tab': function () {
      this.timeout = TIMEOUT;

      return this.remote
        .then(openFxaFromRp('signup'))
        .then(fillOutSignUp(this, email, PASSWORD))

        .then(testElementExists('#fxa-confirm-header'))

        .then(getVerificationLink(email, 0))
        .then(function (verificationLink) {
          return openPage(this, verificationLink, '#fxa-sign-up-complete-header');
        })

        .then(testIsBrowserNotifiedOfLogin(this, { shouldCloseTab: false }));
    },

    'signup, verify different browser, from original tab\'s P.O.V.': function () {
      this.timeout = TIMEOUT;

      return this.remote
        .then(openFxaFromRp('signup'))
        .then(fillOutSignUp(this, email, PASSWORD))

        .then(testElementExists('#fxa-confirm-header'))

        .then(openVerificationLinkDifferentBrowser(email))

        .then(testIsBrowserNotifiedOfLogin(this, { shouldCloseTab: false }))

        .then(testElementExists('#fxa-sign-up-complete-header'));
    },

    'reset password, verify same browser': function () {
      this.timeout = TIMEOUT;

      var messageReceived = false;

      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(openFxaFromRp('signin'))
        .then(click('.reset-password'))

        .then(fillOutResetPassword(this, email))

        .then(testElementExists('#fxa-confirm-reset-password-header'))

        .then(openVerificationLinkInNewTab(this, email, 0))

        // Complete the reset password in the new tab
        .switchToWindow('newwindow')
        .then(fillOutCompleteResetPassword(this, PASSWORD, PASSWORD))

        // this tab should get the reset password complete header.
        .then(testElementExists('#fxa-reset-password-complete-header'))

        .then(waitForBrowserLoginNotification(this))
        .then(function (result) {
          messageReceived = result;
        })

        .sleep(ANIMATION_DELAY_MS)

        .findByCssSelector('.error').isDisplayed()
        .then(function (isDisplayed) {
          assert.isFalse(isDisplayed);
        })
        .end()

        .closeCurrentWindow()
        // switch to the original window
        .switchToWindow('')
        .then(waitForBrowserLoginNotification(this))
        .then(function (result) {
          messageReceived = messageReceived || result;
        })

        .then(function () {
          assert.isTrue(messageReceived, 'expected to receive a WebChannel event in either tab');
        })

        // the original tab should automatically sign in
        .then(testElementExists('#fxa-reset-password-complete-header'));
    },

    'reset password, verify same browser, original tab closed': function () {
      this.timeout = TIMEOUT;

      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(openFxaFromRp('signin'))
        .then(click('.reset-password'))

        .then(fillOutResetPassword(this, email))
        .then(testElementExists('#fxa-confirm-reset-password-header'))

        .then(openExternalSite(this))
        .then(openVerificationLinkInNewTab(this, email, 0))

        .switchToWindow('newwindow')
        .then(fillOutCompleteResetPassword(this, PASSWORD, PASSWORD))

        // the tab should automatically sign in
        .then(testIsBrowserNotifiedOfLogin(this, { shouldCloseTab: false }))
        .then(testElementExists('#fxa-reset-password-complete-header'))

        .closeCurrentWindow()
        // switch to the original window
        .switchToWindow('');
    },

    'reset password, verify same browser, replace original tab': function () {
      this.timeout = TIMEOUT;

      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(openFxaFromRp('signin'))
        .then(click('.reset-password'))

        .then(fillOutResetPassword(this, email))
        .then(testElementExists('#fxa-confirm-reset-password-header'))

        .then(getVerificationLink(email, 0))
        .then(function (verificationLink) {
          return openPage(this, verificationLink, '#fxa-complete-reset-password-header');
        })

        .then(fillOutCompleteResetPassword(this, PASSWORD, PASSWORD))

        // the tab should automatically sign in
        .then(testIsBrowserNotifiedOfLogin(this, { shouldCloseTab: false }))

        .then(testElementExists('#fxa-reset-password-complete-header'));
    },

    'reset password, verify in different browser, from the original tab\'s P.O.V.': function () {
      this.timeout = TIMEOUT;

      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(openFxaFromRp('signin'))
        .then(click('.reset-password'))

        .then(fillOutResetPassword(this, email))
        .then(testElementExists('#fxa-confirm-reset-password-header'))

        .then(openPasswordResetLinkDifferentBrowser(email, PASSWORD))

        // user verified in a new browser, they have to enter
        // their updated credentials in the original tab.
        .then(testElementExists('#fxa-signin-header'))
        .then(FunctionalHelpers.testSuccessWasShown(this))
        .then(type('#password', PASSWORD))
        .then(click('button[type=submit]'))

        // user is signed in
        .then(testIsBrowserNotifiedOfLogin(this, { shouldCloseTab: true }))

        // no screen transition, Loop will close this screen.
        .then(testElementExists('#fxa-signin-header'));
    },

    'signin a verified account and requesting keys after signing in to sync': function () {
      this.timeout = TIMEOUT;

      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(function () {
          return openPage(this, SYNC_URL, '#fxa-signin-header');
        })
        .execute(listenForSyncCommands)

        .then(fillOutSignIn(this, email, PASSWORD))
        .then(testIsBrowserNotifiedOfSyncLogin(this, email, { checkVerified: false }))

        // User must verify the Sync signin
        .then(testElementExists('#fxa-confirm-signin-header'))
        .then(openVerificationLinkDifferentBrowser(email, 0))

        .then(openFxaFromRp('signin'))
        .then(testElementExists('#fxa-signin-header'))
        // In a keyless oauth flow, the user could just click to confirm
        // without re-entering their password.  Since we need the password
        // to derive the keys, this flow must prompt for it.
        .then(type('input[type=password]', PASSWORD))
        .then(click('button[type="submit"]'))

        .then(testIsBrowserNotifiedOfLogin(this, { shouldCloseTab: true }));
    }
  });

});
