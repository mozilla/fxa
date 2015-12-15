/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


/**
 * Test the iframe oauth flow
 */

define([
  'intern',
  'intern!object',
  'intern/chai!assert',
  'require',
  'intern/node_modules/dojo/node!xmlhttprequest',
  'app/bower_components/fxa-js-client/fxa-client',
  'tests/lib/helpers',
  'tests/functional/lib/helpers'
], function (intern, registerSuite, assert, require, nodeXMLHttpRequest,
        FxaClient, TestHelpers, FunctionalHelpers) {
  var config = intern.config;
  var IFRAME_OAUTH_APP = config.fxaIframeOauthApp;
  var AUTH_SERVER_ROOT = config.fxaAuthRoot;

  var EXTERNAL_SITE = 'http://example.com';
  var EXTERNAL_SITE_LINK_TEXT = 'More information';
  var ANIMATION_DELAY_MS = 1000;

  var PASSWORD = 'password';
  var email;
  var client;
  function openFxaFromRp(context, page) {
    return context.remote
      .get(require.toUrl(IFRAME_OAUTH_APP + '#' + page))
      .setFindTimeout(intern.config.pageLoadTimeout)

      .findByCssSelector('#splash .' + page)
        .click()
      .end()

      .findByCssSelector('#fxa')
      .then(function (el, setContext) {
        // update the context to use the frame.
        return setContext(context.remote.switchToFrame(el));
      })

      .findByCssSelector('#fxa-' + page + '-header')
      .end();
  }


  registerSuite({
    name: 'iframe oauth channel',

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

    'signin an unverified account': function () {
      var self = this;

      email = TestHelpers.createEmail();

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

      email = TestHelpers.createEmail();

      return openFxaFromRp(self, 'signin')
        .then(function () {
          return client.signUp(email, PASSWORD, { preVerified: true });
        })

        .findByCssSelector('form input.email')
          .click()
          .clearValue()
          .type(email)
        .end()

        .findByCssSelector('form input.password')
          .click()
          .clearValue()
          .type(PASSWORD)
        .end()

        .findByCssSelector('button[type="submit"]')
          .click()
        .end()

        // user should be redirected back to 123done
        .switchToFrame(null)

        .findByCssSelector('#loggedin')
        .end();
    },

    'signup, verify same browser': function () {
      var self = this;

      return openFxaFromRp(self, 'signup')

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
        // wait for the verified window in the new tab
        .findByCssSelector('#fxa-sign-up-complete-header')
        .end()

        .closeCurrentWindow()

        // switch to the original window
        .switchToWindow('')

        // switch to the RP frame
        .switchToFrame(null)

        // user should be logged in
        .findByCssSelector('#loggedin')
        .end();
    },

    'signup, verify same browser with original tab closed': function () {
      var self = this;

      return openFxaFromRp(self, 'signup')

        .then(function () {
          return FunctionalHelpers.fillOutSignUp(self, email, PASSWORD);
        })

        .findByCssSelector('#fxa-confirm-header')
        .end()

        // user browses to another site.
        .switchToFrame(null)

        .get(require.toUrl(EXTERNAL_SITE))
          .findByPartialLinkText(EXTERNAL_SITE_LINK_TEXT)
        .end()

        .then(function () {
          return FunctionalHelpers.openVerificationLinkInNewTab(
                      self, email, 0);
        })

        .switchToWindow('newwindow')

        .findByCssSelector('#fxa-sign-up-complete-header')
        .end()

        // close the new tab
        .closeCurrentWindow()

        // go back to the original window
        .switchToWindow('')
        // switch to the RP frame
        .switchToFrame(null);
    },

    'signup, verify same browser by replacing the original tab': function () {
      var self = this;

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
          return self.remote.get(require.toUrl(verificationLink));
        })

        .findByCssSelector('#fxa-sign-up-complete-header')
        .end();
    },

    'signup, verify different browser - from original tab\'s P.O.V.': function () {
      var self = this;

      return openFxaFromRp(self, 'signup')
        .then(function () {
          return FunctionalHelpers.fillOutSignUp(self, email, PASSWORD);
        })

        .findByCssSelector('#fxa-confirm-header')
        .end()

        .then(function () {
          return FunctionalHelpers.openVerificationLinkDifferentBrowser(client, email);
        })

        .switchToFrame(null)

        // original tab redirects back to 123done
        .findByCssSelector('#loggedin')
        .end();
    },

    'signup, verify different browser - from new browser\'s P.O.V.': function () {
      var self = this;

      return openFxaFromRp(self, 'signup')
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

      return openFxaFromRp(self, 'signin')
        .then(function () {
          return client.signUp(email, PASSWORD, { preVerified: true });
        })

        .findByCssSelector('.reset-password')
          .click()
        .end()

        .then(function () {
          return FunctionalHelpers.fillOutResetPassword(self, email, {
            skipPageRedirect: true
          });
        })

        .findByCssSelector('#fxa-confirm-reset-password-header')
        .end()

        .then(function () {
          return FunctionalHelpers.openVerificationLinkInNewTab(
                      self, email, 0);
        })

        // Complete the reset password in the new tab
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

        // go back to the original window
        .switchToWindow('')
        // switch to the RP frame
        .switchToFrame(null)

        // the original tab should automatically sign in
        .findByCssSelector('#loggedin')
        .end();
    },

    'reset password, verify same browser with original tab closed': function () {
      var self = this;

      return openFxaFromRp(self, 'signin')
        .then(function () {
          return client.signUp(email, PASSWORD, { preVerified: true });
        })

        .findByCssSelector('.reset-password')
          .click()
        .end()

        .then(function () {
          return FunctionalHelpers.fillOutResetPassword(self, email, {
            skipPageRedirect: true
          });
        })

        .findByCssSelector('#fxa-confirm-reset-password-header')
        .end()

        // user browses to another site.
        .get(require.toUrl(EXTERNAL_SITE))
          .findByPartialLinkText(EXTERNAL_SITE_LINK_TEXT)
        .end()

        .then(function () {
          return FunctionalHelpers.openVerificationLinkInNewTab(
                      self, email, 0);
        })

        .switchToWindow('newwindow')

        .then(function () {
          return FunctionalHelpers.fillOutCompleteResetPassword(
              self, PASSWORD, PASSWORD);
        })

        .findByCssSelector('#fxa-reset-password-complete-header')
        .end()

        // close the new tab
        .closeCurrentWindow()

        // go back to the original window
        .switchToWindow('')
        // switch to the RP frame
        .switchToFrame(null);
    },

    'reset password, verify same browser by replacing the original tab': function () {
      var self = this;

      return openFxaFromRp(self, 'signin')
        .then(function () {
          return client.signUp(email, PASSWORD, { preVerified: true });
        })

        .findByCssSelector('.reset-password')
          .click()
        .end()

        .then(function () {
          return FunctionalHelpers.fillOutResetPassword(self, email, {
            skipPageRedirect: true
          });
        })

        .findByCssSelector('#fxa-confirm-reset-password-header')
        .end()

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

        .findByCssSelector('#fxa-reset-password-complete-header')
        .end();
    },

    'reset password, verify in different browser, from the original tab\'s P.O.V.': function () {
      var self = this;

      return openFxaFromRp(self, 'signin')
        .then(function () {
          return client.signUp(email, PASSWORD, { preVerified: true });
        })

        .findByCssSelector('.reset-password')
          .click()
        .end()

        .then(function () {
          return FunctionalHelpers.fillOutResetPassword(self, email, {
            skipPageRedirect: true
          });
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

        // go back to the RP frame
        .switchToFrame(null)

        // user is logged in to RP
        .findByCssSelector('#loggedin')
        .end();
    },

    'reset password, verify different browser - from new browser\'s P.O.V.': function () {
      var self = this;

      return openFxaFromRp(self, 'signin')
        .then(function () {
          return client.signUp(email, PASSWORD, { preVerified: true });
        })

        .findByCssSelector('.reset-password')
          .click()
        .end()

        .then(function () {
          return FunctionalHelpers.fillOutResetPassword(self, email, {
            skipPageRedirect: true
          });
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
