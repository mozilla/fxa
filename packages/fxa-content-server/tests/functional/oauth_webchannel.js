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
  'tests/lib/restmail',
  'tests/lib/helpers',
  'tests/functional/lib/helpers',
  'tests/functional/lib/fx-desktop'
], function (intern, registerSuite, assert, require, nodeXMLHttpRequest,
        FxaClient, restmail, TestHelpers, FunctionalHelpers, FxDesktopHelpers) {
  'use strict';

  var config = intern.config;
  var AUTH_SERVER_ROOT = config.fxaAuthRoot;
  var SYNC_URL = config.fxaContentRoot + 'signin?context=fx_desktop_v1&service=sync';

  var PASSWORD = 'password';
  var TOO_YOUNG_YEAR = new Date().getFullYear() - 13;
  var OLD_ENOUGH_YEAR = TOO_YOUNG_YEAR - 1;
  var user;
  var email;
  var client;
  var ANIMATION_DELAY_MS = 1000;

  var listenForSyncCommands = FxDesktopHelpers.listenForFxaCommands;
  var testIsBrowserNotifiedOfSyncLogin = FxDesktopHelpers.testIsBrowserNotifiedOfLogin;


  /**
   * This suite tests the WebChannel functionality in the OAuth signin and
   * signup cases. It uses a CustomEvent "WebChannelMessageToChrome" to
   * finish OAuth flows
   */

  function testIsBrowserNotifiedOfLogin(context, shouldCloseTab, wantKeys) {
    return FunctionalHelpers.testIsBrowserNotified(context, 'oauth_complete', function (data) {
      assert.ok(data.redirect);
      assert.ok(data.code);
      assert.ok(data.state);
      assert.equal(data.closeWindow, shouldCloseTab);
      if (wantKeys) {
        assert.ok(data.keys);
      }
    });
  }

  function openFxaFromRp(context, page, additionalQueryParams) {
    var queryParams = '&webChannelId=test';
    for (var key in additionalQueryParams) {
      queryParams += ('&' + key + '=' + additionalQueryParams[key]);
    }
    return FunctionalHelpers.openFxaFromRp(context, page, queryParams);
  }


  registerSuite({
    name: 'oauth web channel',

    beforeEach: function () {
      email = TestHelpers.createEmail();
      user = TestHelpers.emailToUser(email);

      client = new FxaClient(AUTH_SERVER_ROOT, {
        xhr: nodeXMLHttpRequest.XMLHttpRequest
      });

      return FunctionalHelpers.clearBrowserState(this, {
        contentServer: true,
        '123done': true
      });
    },

    'signin an unverified account using an oauth app': function () {
      var self = this;

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

      return openFxaFromRp(self, 'signin')
        .then(function () {
          return client.signUp(email, PASSWORD, { preVerified: true });
        })

        .execute(FunctionalHelpers.listenForWebChannelMessage)

        .then(function () {
          return FunctionalHelpers.fillOutSignIn(self, email, PASSWORD);
        })

        .then(testIsBrowserNotifiedOfLogin(self, true))

        // no screen transition, Loop will close this screen.
        .findByCssSelector('#fxa-signin-header')
        .end();
    },

    'signup, verify same browser': function () {
      var self = this;

      return openFxaFromRp(self, 'signup')
        .execute(FunctionalHelpers.listenForWebChannelMessage)

        .then(function () {
          return FunctionalHelpers.fillOutSignUp(self, email, PASSWORD, OLD_ENOUGH_YEAR);
        })

        .findByCssSelector('#fxa-confirm-header')
        .end()

        .then(function () {
          return FunctionalHelpers.openVerificationLinkSameBrowser(
                      self, email, 0);
        })
        .switchToWindow('newwindow')
        // wait for the verified window in the new tab
        .findById('fxa-sign-up-complete-header')
        .end()

        .closeCurrentWindow()
        // switch to the original window
        .switchToWindow('')

        .then(testIsBrowserNotifiedOfLogin(self, false))

        .findById('fxa-sign-up-complete-header')
        .end();
    },

    'signup, verify same browser with original tab closed': function () {
      var self = this;

      return openFxaFromRp(self, 'signup')

        .then(function () {
          return FunctionalHelpers.fillOutSignUp(self, email, PASSWORD, OLD_ENOUGH_YEAR);
        })

        .findByCssSelector('#fxa-confirm-header')
        .end()

        .then(FunctionalHelpers.openExternalSite(self))

        .then(function () {
          return FunctionalHelpers.openVerificationLinkSameBrowser(self, email, 0);
        })

        .switchToWindow('newwindow')
        .execute(FunctionalHelpers.listenForWebChannelMessage)

        .then(testIsBrowserNotifiedOfLogin(self, false))

        .findById('fxa-sign-up-complete-header')
        .end()

        .closeCurrentWindow()
        // switch to the original window
        .switchToWindow('');
    },

    'signup, verify same browser, replace original tab': function () {
      var self = this;

      return openFxaFromRp(self, 'signup')

        .then(function () {
          return FunctionalHelpers.fillOutSignUp(self, email, PASSWORD, OLD_ENOUGH_YEAR);
        })

        .findByCssSelector('#fxa-confirm-header')
        .end()

        .then(function () {
          return FunctionalHelpers.getVerificationLink(email, 0);
        })
        .then(function (verificationLink) {
          return self.get('remote').get(require.toUrl(verificationLink))
            .execute(FunctionalHelpers.listenForWebChannelMessage);
        })

        .then(testIsBrowserNotifiedOfLogin(self, false))

        .findById('fxa-sign-up-complete-header')
        .end();
    },

    'signup, verify different browser - from original tab\'s P.O.V.': function () {
      var self = this;

      return openFxaFromRp(self, 'signup')
        .execute(FunctionalHelpers.listenForWebChannelMessage)

        .then(function () {
          return FunctionalHelpers.fillOutSignUp(self, email, PASSWORD, OLD_ENOUGH_YEAR);
        })

        .findByCssSelector('#fxa-confirm-header')
        .end()

        .then(function () {
          return FunctionalHelpers.openVerificationLinkDifferentBrowser(client, email);
        })

        .then(testIsBrowserNotifiedOfLogin(self, false))

        .findById('fxa-sign-up-complete-header')
        .end();
    },

    'signup, verify different browser - from new browser\'s P.O.V.': function () {
      var self = this;

      return openFxaFromRp(self, 'signup')
        .execute(FunctionalHelpers.listenForWebChannelMessage)

        .then(function () {
          return FunctionalHelpers.fillOutSignUp(self, email, PASSWORD, OLD_ENOUGH_YEAR);
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
          return self.get('remote').get(require.toUrl(verificationLink));
        })

        // new browser dead ends at the 'account verified' screen.
        .findByCssSelector('#fxa-sign-up-complete-header')
        .end();
    },

    'password reset, verify same browser': function () {
      var self = this;

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
          return FunctionalHelpers.openVerificationLinkSameBrowser(
                      self, email, 0);
        })

        // Complete the password reset in the new tab
        .switchToWindow('newwindow')

        .then(function () {
          return FunctionalHelpers.fillOutCompleteResetPassword(
              self, PASSWORD, PASSWORD);
        })

        // this tab's success is seeing the reset password complete header.
        .findByCssSelector('#fxa-reset-password-complete-header')
        .end()

        .sleep(ANIMATION_DELAY_MS)

        .findByCssSelector('.error').isDisplayed()
        .then(function (isDisplayed) {
          assert.isFalse(isDisplayed);
        })
        .end()

        .closeCurrentWindow()
        // switch to the original window
        .switchToWindow('')

        // the original tab should automatically sign in
        .then(testIsBrowserNotifiedOfLogin(self, false))

        .findByCssSelector('#fxa-reset-password-complete-header')
        .end();
    },

    'password reset, verify same browser with original tab closed': function () {
      var self = this;

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
          return FunctionalHelpers.openVerificationLinkSameBrowser(self, email, 0);
        })

        .switchToWindow('newwindow')
        .execute(FunctionalHelpers.listenForWebChannelMessage)

        .then(function () {
          return FunctionalHelpers.fillOutCompleteResetPassword(
              self, PASSWORD, PASSWORD);
        })

        // the tab should automatically sign in
        .then(testIsBrowserNotifiedOfLogin(self, false))

        .findByCssSelector('#fxa-reset-password-complete-header')
        .end()

        .closeCurrentWindow()
        // switch to the original window
        .switchToWindow('');
    },

    'password reset, verify same browser, replace original tab': function () {
      var self = this;

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
          return self.get('remote').get(require.toUrl(verificationLink))
            .execute(FunctionalHelpers.listenForWebChannelMessage);
        })

        .then(function () {
          return FunctionalHelpers.fillOutCompleteResetPassword(
              self, PASSWORD, PASSWORD);
        })

        // the tab should automatically sign in
        .then(testIsBrowserNotifiedOfLogin(self, false))

        .findByCssSelector('#fxa-reset-password-complete-header')
        .end();
    },

    'password reset, verify in different browser, from the original tab\'s P.O.V.': function () {
      var self = this;

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

        .then(FunctionalHelpers.visibleByQSA('.success'))
        .end()

        .findByCssSelector('#password')
          .type(PASSWORD)
        .end()

        .findByCssSelector('button[type=submit]')
          .click()
        .end()

        // user is signed in
        .then(testIsBrowserNotifiedOfLogin(self, true))

        // no screen transition, Loop will close this screen.
        .findByCssSelector('#fxa-signin-header')
        .end();
    },

    'password reset, verify different browser - from new browser\'s P.O.V.': function () {
      var self = this;

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
          return self.get('remote').get(require.toUrl(verificationLink));
        })

        .then(function () {
          return FunctionalHelpers.fillOutCompleteResetPassword(
              self, PASSWORD, PASSWORD);
        })

        // this tab's success is seeing the reset password complete header.
        .findByCssSelector('#fxa-reset-password-complete-header')
        .end();
    },

    'signin a verified account and requesting keys after signing in to sync': function () {
      var self = this;

      return client.signUp(email, PASSWORD, { preVerified: true })
        .then(function () {
          return self.get('remote')
            .get(require.toUrl(SYNC_URL))
            .setFindTimeout(intern.config.pageLoadTimeout)
            .execute(listenForSyncCommands)

            .findByCssSelector('#fxa-signin-header')
            .end()

            .then(function () {
              return FunctionalHelpers.fillOutSignIn(self, email, PASSWORD);
            })

            .then(function () {
              return testIsBrowserNotifiedOfSyncLogin(self, email, { checkVerified: true });
            })

            .then(function () {
              return openFxaFromRp(self, 'signin', { keys: true });
            })

            .findByCssSelector('#fxa-signin-header')
            .end()

            .execute(FunctionalHelpers.listenForWebChannelMessage)

            // user cannot edit their email address,
            // and must fill in their password so that
            // keys can be sent to the relier.
            .findByCssSelector('input[type=password]')
              .click()
              .clearValue()
              .type(PASSWORD)
            .end()

            .findByCssSelector('button[type="submit"]')
              .click()
            .end()

            .then(testIsBrowserNotifiedOfLogin(self, true, true));
        });
    }
  });

});
