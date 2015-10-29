/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'intern/chai!assert',
  'require',
  'intern/node_modules/dojo/node!xmlhttprequest',
  'app/bower_components/fxa-js-client/fxa-client',
  'tests/lib/helpers',
  'tests/functional/lib/helpers',
  'tests/functional/lib/webchannel-helpers',
], function (intern, registerSuite, assert, require, nodeXMLHttpRequest,
  FxaClient, TestHelpers, FunctionalHelpers, WebChannelHelpers) {
  var config = intern.config;
  var AUTH_SERVER_ROOT = config.fxaAuthRoot;

  var PASSWORD = 'password';
  var email;
  var client;
  var ANIMATION_DELAY_MS = 1000;
  var CHANNEL_DELAY = 4000; // how long it takes for the WebChannel indicator to appear
  var TIMEOUT = 90 * 1000;

  /**
   * This suite tests the WebChannel functionality in the OAuth signin and
   * signup cases. It uses a CustomEvent "WebChannelMessageToChrome" to
   * finish OAuth flows
   */

  var testIsBrowserNotifiedOfLogin = WebChannelHelpers.testIsBrowserNotifiedOfLogin;
  var openFxaFromRp = WebChannelHelpers.openFxaFromRp;

  registerSuite({
    name: 'oauth webchannel',

    beforeEach: function () {
      email = TestHelpers.createEmail();
      client = new FxaClient(AUTH_SERVER_ROOT, {
        xhr: nodeXMLHttpRequest.XMLHttpRequest
      });

      return FunctionalHelpers.clearBrowserState(this, {
        '123done': true,
        contentServer: true
      });
    },

    'signin an unverified account using an oauth app': function () {
      var self = this;
      self.timeout = TIMEOUT;

      return openFxaFromRp(self, 'signin')
        .then(function () {
          return client.signUp(email, PASSWORD, { preVerified: false });
        })

        .then(function () {
          return FunctionalHelpers.fillOutSignIn(self, email, PASSWORD);
        })

        // wah wah, user has to verify.
        .findByCssSelector('#fxa-confirm-header')
        .end();
    },

    'signin a verified account using an oauth app': function () {
      var self = this;
      self.timeout = TIMEOUT;

      return openFxaFromRp(self, 'signin')
        .then(function () {
          return client.signUp(email, PASSWORD, { preVerified: true });
        })

        .execute(FunctionalHelpers.listenForWebChannelMessage)

        .then(function () {
          return FunctionalHelpers.fillOutSignIn(self, email, PASSWORD);
        })

        .then(testIsBrowserNotifiedOfLogin(self, { shouldCloseTab: true }))

        // no screen transition, Loop will close this screen.
        .findByCssSelector('#fxa-signin-header')
        .end();
    },

    'signup, verify same browser': function () {
      var self = this;
      self.timeout = TIMEOUT;

      var messageReceived = false;

      return openFxaFromRp(self, 'signup')
        .execute(FunctionalHelpers.listenForWebChannelMessage)

        .then(function () {
          return FunctionalHelpers.fillOutSignUp(self, email, PASSWORD);
        })

        .findByCssSelector('#fxa-confirm-header')
        .end()

        .then(function () {
          return FunctionalHelpers.openVerificationLinkInNewTab(
                      self, email, 0);
        })
        .switchToWindow('newwindow')
        .execute(FunctionalHelpers.listenForWebChannelMessage)

        // wait for the verified window in the new tab
        .findById('fxa-sign-up-complete-header')
        .setFindTimeout(CHANNEL_DELAY)
        .then(testIsBrowserNotifiedOfLogin(self, { shouldCloseTab: false }))
        .end()
        .then(function () {
          messageReceived = true;
        }, function () {
          // element was not found
        })

        .closeCurrentWindow()
        // switch to the original window
        .switchToWindow('')
        .setFindTimeout(CHANNEL_DELAY)
        .then(testIsBrowserNotifiedOfLogin(self, { shouldCloseTab: false }))
        .then(function () {
          messageReceived = true;
        }, function () {
          // element was not found
        })
        .setFindTimeout(config.pageLoadTimeout)

        .then(function () {
          assert.isTrue(messageReceived, 'expected to receive a WebChannel event in either tab');
        })

        .findById('fxa-sign-up-complete-header')
        .end();
    },

    'signup, verify same browser with original tab closed': function () {
      var self = this;
      self.timeout = TIMEOUT;

      return openFxaFromRp(self, 'signup')

        .then(function () {
          return FunctionalHelpers.fillOutSignUp(self, email, PASSWORD);
        })

        .findByCssSelector('#fxa-confirm-header')
        .end()

        .then(FunctionalHelpers.openExternalSite(self))

        .then(function () {
          return FunctionalHelpers.openVerificationLinkInNewTab(self, email, 0);
        })

        .switchToWindow('newwindow')
        .execute(FunctionalHelpers.listenForWebChannelMessage)

        .then(testIsBrowserNotifiedOfLogin(self, { shouldCloseTab: false }))

        .findById('fxa-sign-up-complete-header')
        .end()

        .closeCurrentWindow()
        // switch to the original window
        .switchToWindow('');
    },

    'signup, verify same browser, replace original tab': function () {
      var self = this;
      self.timeout = TIMEOUT;

      return openFxaFromRp(self, 'signup')

        .then(function () {
          return FunctionalHelpers.fillOutSignUp(self, email, PASSWORD);
        })

        .findByCssSelector('#fxa-confirm-header')
        .end()

        .then(function () {
          return FunctionalHelpers.getVerificationLink(email, 0);
        })
        .then(function (verificationLink) {
          return self.remote.get(require.toUrl(verificationLink))
            .execute(FunctionalHelpers.listenForWebChannelMessage);
        })

        .then(testIsBrowserNotifiedOfLogin(self, { shouldCloseTab: false }))

        .findById('fxa-sign-up-complete-header')
        .end();
    },

    'signup, verify different browser - from original tab\'s P.O.V.': function () {
      var self = this;
      self.timeout = TIMEOUT;

      return openFxaFromRp(self, 'signup')
        .execute(FunctionalHelpers.listenForWebChannelMessage)

        .then(function () {
          return FunctionalHelpers.fillOutSignUp(self, email, PASSWORD);
        })

        .findByCssSelector('#fxa-confirm-header')
        .end()

        .then(function () {
          return FunctionalHelpers.openVerificationLinkDifferentBrowser(client, email);
        })

        .then(testIsBrowserNotifiedOfLogin(self, { shouldCloseTab: false }))

        .findById('fxa-sign-up-complete-header')
        .end();
    },

    'signup, verify different browser - from new browser\'s P.O.V.': function () {
      var self = this;
      self.timeout = TIMEOUT;

      return openFxaFromRp(self, 'signup')
        .execute(FunctionalHelpers.listenForWebChannelMessage)

        .then(function () {
          return FunctionalHelpers.fillOutSignUp(self, email, PASSWORD);
        })

        .findByCssSelector('#fxa-confirm-header')
        .end()

        .then(function () {
          // clear browser state to simulate opening the link
          // in the same browser
          return FunctionalHelpers.clearBrowserState(self);
        })

        .then(function () {
          return FunctionalHelpers.getVerificationLink(email, 0);
        })
        .then(function (verificationLink) {
          return self.remote.get(require.toUrl(verificationLink));
        })

        // new browser dead ends at the 'account verified' screen.
        .findByCssSelector('#fxa-sign-up-complete-header')
        .end();
    },

    'reset password, verify same browser': function () {
      var self = this;
      self.timeout = TIMEOUT;

      var messageReceived = false;

      return openFxaFromRp(self, 'signin')
        .execute(FunctionalHelpers.listenForWebChannelMessage)

        .then(function () {
          return client.signUp(email, PASSWORD, { preVerified: true });
        })

        .findByCssSelector('.reset-password')
        .click()
        .end()

        .then(function () {
          return FunctionalHelpers.fillOutResetPassword(self, email);
        })

        .findByCssSelector('#fxa-confirm-reset-password-header')
        .end()

        .then(function () {
          return FunctionalHelpers.openVerificationLinkInNewTab(
            self, email, 0);
        })

        // Complete the reset password in the new tab
        .switchToWindow('newwindow')
        .execute(FunctionalHelpers.listenForWebChannelMessage)

        .then(function () {
          return FunctionalHelpers.fillOutCompleteResetPassword(
            self, PASSWORD, PASSWORD);
        })

        // this tab should get the reset password complete header.
        .findByCssSelector('#fxa-reset-password-complete-header')
        .end()

        .setFindTimeout(CHANNEL_DELAY)
        .then(testIsBrowserNotifiedOfLogin(self, { shouldCloseTab: false }))
        .then(function () {
          messageReceived = true;
        }, function () {
          // element was not found
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
        .setFindTimeout(CHANNEL_DELAY)
        .then(testIsBrowserNotifiedOfLogin(self, { shouldCloseTab: false }))
        .then(function () {
          messageReceived = true;
        }, function () {
          // element was not found
        })

        .then(function () {
          assert.isTrue(messageReceived, 'expected to receive a WebChannel event in either tab');
        })
        .setFindTimeout(config.pageLoadTimeout)
        // the original tab should automatically sign in
        .findByCssSelector('#fxa-reset-password-complete-header')
        .end();
    },

    'reset password, verify same browser with original tab closed': function () {
      var self = this;
      self.timeout = TIMEOUT;

      return openFxaFromRp(self, 'signin')
        .then(function () {
          return client.signUp(email, PASSWORD, { preVerified: true });
        })

        .findByCssSelector('.reset-password')
          .click()
        .end()

        .then(function () {
          return FunctionalHelpers.fillOutResetPassword(self, email);
        })

        .findByCssSelector('#fxa-confirm-reset-password-header')
        .end()

        .then(FunctionalHelpers.openExternalSite(self))

        .then(function () {
          return FunctionalHelpers.openVerificationLinkInNewTab(self, email, 0);
        })

        .switchToWindow('newwindow')
        .execute(FunctionalHelpers.listenForWebChannelMessage)

        .then(function () {
          return FunctionalHelpers.fillOutCompleteResetPassword(
              self, PASSWORD, PASSWORD);
        })

        // the tab should automatically sign in
        .then(testIsBrowserNotifiedOfLogin(self, { shouldCloseTab: false }))

        .findByCssSelector('#fxa-reset-password-complete-header')
        .end()

        .closeCurrentWindow()
        // switch to the original window
        .switchToWindow('');
    },

    'reset password, verify same browser, replace original tab': function () {
      var self = this;
      self.timeout = TIMEOUT;

      return openFxaFromRp(self, 'signin')

        .then(function () {
          return client.signUp(email, PASSWORD, { preVerified: true });
        })

        .findByCssSelector('.reset-password')
          .click()
        .end()

        .then(function () {
          return FunctionalHelpers.fillOutResetPassword(self, email);
        })

        .findByCssSelector('#fxa-confirm-reset-password-header')
        .end()

        .then(function () {
          return FunctionalHelpers.getVerificationLink(email, 0);
        })
        .then(function (verificationLink) {
          return self.remote.get(require.toUrl(verificationLink))
            .execute(FunctionalHelpers.listenForWebChannelMessage);
        })

        .then(function () {
          return FunctionalHelpers.fillOutCompleteResetPassword(
              self, PASSWORD, PASSWORD);
        })

        // the tab should automatically sign in
        .then(testIsBrowserNotifiedOfLogin(self, { shouldCloseTab: false }))

        .findByCssSelector('#fxa-reset-password-complete-header')
        .end();
    },

    'reset password, verify in different browser, from the original tab\'s P.O.V.': function () {
      var self = this;
      self.timeout = TIMEOUT;

      return openFxaFromRp(self, 'signin')
        .execute(FunctionalHelpers.listenForWebChannelMessage)

        .then(function () {
          return client.signUp(email, PASSWORD, { preVerified: true });
        })

        .findByCssSelector('.reset-password')
          .click()
        .end()

        .then(function () {
          return FunctionalHelpers.fillOutResetPassword(self, email);
        })

        .findByCssSelector('#fxa-confirm-reset-password-header')
        .end()

        .then(function () {
          return FunctionalHelpers.openPasswordResetLinkDifferentBrowser(
              client, email, PASSWORD);
        })

        // user verified in a new browser, they have to enter
        // their updated credentials in the original tab.
        .findByCssSelector('#fxa-signin-header')
        .end()

        .then(FunctionalHelpers.testSuccessWasShown(self))

        .findByCssSelector('#password')
          .type(PASSWORD)
        .end()

        .findByCssSelector('button[type=submit]')
          .click()
        .end()

        // user is signed in
        .then(testIsBrowserNotifiedOfLogin(self, { shouldCloseTab: true }))

        // no screen transition, Loop will close this screen.
        .findByCssSelector('#fxa-signin-header')
        .end();
    },

    'reset password, verify different browser - from new browser\'s P.O.V.': function () {
      var self = this;
      self.timeout = TIMEOUT;

      return openFxaFromRp(self, 'signin')
        .then(function () {
          return client.signUp(email, PASSWORD, { preVerified: true });
        })

        .findByCssSelector('.reset-password')
          .click()
        .end()

        .then(function () {
          return FunctionalHelpers.fillOutResetPassword(self, email);
        })

        .findByCssSelector('#fxa-confirm-reset-password-header')
        .end()

        .then(function () {
          // clear browser state to simulate opening the link
          // in the same browser
          return FunctionalHelpers.clearBrowserState(self);
        })

        .then(function () {
          return FunctionalHelpers.getVerificationLink(email, 0);
        })
        .then(function (verificationLink) {
          return self.remote.get(require.toUrl(verificationLink));
        })

        .then(function () {
          return FunctionalHelpers.fillOutCompleteResetPassword(
              self, PASSWORD, PASSWORD);
        })

        // this tab's success is seeing the reset password complete header.
        .findByCssSelector('#fxa-reset-password-complete-header')
        .end();
    }
  });

});
