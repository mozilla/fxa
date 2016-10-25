/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'intern/chai!assert',
  'require',
  'intern/browser_modules/dojo/node!xmlhttprequest',
  'app/bower_components/fxa-js-client/fxa-client',
  'tests/lib/helpers',
  'tests/functional/lib/helpers',
  'tests/functional/lib/fx-desktop'
], function (intern, registerSuite, assert, require, nodeXMLHttpRequest,
        FxaClient, TestHelpers, FunctionalHelpers, FxDesktopHelpers) {
  var config = intern.config;
  var PAGE_URL = config.fxaContentRoot + 'signup?context=fx_desktop_v1&service=sync';
  var PAGE_URL_WITH_MIGRATION = PAGE_URL + '&migration=sync11';

  var SIGNIN_URL = config.fxaContentRoot + 'signin';

  var AUTH_SERVER_ROOT = config.fxaAuthRoot;

  var client;
  var email;
  var PASSWORD = '12345678';

  var closeCurrentWindow = FunctionalHelpers.closeCurrentWindow;
  var listenForFxaCommands = FxDesktopHelpers.listenForFxaCommands;
  var noPageTransition = FunctionalHelpers.noPageTransition;
  var testEmailExpected = FunctionalHelpers.testEmailExpected;
  var testIsBrowserNotifiedOfLogin = FxDesktopHelpers.testIsBrowserNotifiedOfLogin;

  registerSuite({
    name: 'Firefox Desktop Sync sign_up',

    beforeEach: function () {
      email = TestHelpers.createEmail();

      client = new FxaClient(AUTH_SERVER_ROOT, {
        xhr: nodeXMLHttpRequest.XMLHttpRequest
      });

      return FunctionalHelpers.clearBrowserState(this);
    },

    afterEach: function () {
      var self = this;

      return FunctionalHelpers.clearBrowserState(this)
        .then(function () {
          // ensure the next test suite (bounced_email) loads a fresh
          // signup page. If a fresh signup page is not forced, the
          // bounced_email tests try to sign up using the Sync broker,
          // resulting in a channel timeout.
          return self.remote
            .get(require.toUrl(SIGNIN_URL))

            .findByCssSelector('#fxa-signin-header')
            .end();
        });
    },

    'sign up, verify same browser': function () {

      var self = this;

      return this.remote
        .get(require.toUrl(PAGE_URL))
        .setFindTimeout(intern.config.pageLoadTimeout)
        .execute(listenForFxaCommands)

        .findByCssSelector('#fxa-signup-header')
        .end()

        .then(function () {
          return FunctionalHelpers.fillOutSignUp(self, email, PASSWORD);
        })

        .findByCssSelector('#fxa-confirm-header')

        .then(function () {
          return testIsBrowserNotifiedOfLogin(self, email);
        })

        .end()

        // verify the user
        .then(function () {
          return FunctionalHelpers.openVerificationLinkInNewTab(
                self, email, 0);
        })
        .switchToWindow('newwindow')

        // user should be redirected to "Success!" screen.
        // In real life, the original browser window would show
        // a "welcome to sync!" screen that has a manage button
        // on it, and this screen should show the FxA success screen.
        .findById('fxa-sign-up-complete-header')
        .end()

        .findByCssSelector('.account-ready-service')
        .getVisibleText()
        .then(function (text) {
          assert.ok(text.indexOf('Firefox Sync') > -1);
        })

        .end()
        .then(closeCurrentWindow())

        // We do not expect the verification poll to occur. The poll
        // will take a few seconds to complete if it erroneously occurs.
        // Add an affordance just in case the poll happens unexpectedly.
        .then(noPageTransition('#fxa-confirm-header', 5000))

        // A post-verification email should be sent, this is Sync.
        .then(testEmailExpected(email, 1));
    },

    'signup, verify same browser with original tab closed': function () {
      var self = this;

      return this.remote
        .get(require.toUrl(PAGE_URL))
        .setFindTimeout(intern.config.pageLoadTimeout)
        .execute(listenForFxaCommands)

        .findByCssSelector('#fxa-signup-header')
        .end()

        .then(function () {
          return FunctionalHelpers.fillOutSignUp(self, email, PASSWORD);
        })

        .findByCssSelector('#fxa-confirm-header')
        .end()

        .then(FunctionalHelpers.openExternalSite(self))

        .then(function () {
          return FunctionalHelpers.openVerificationLinkInNewTab(
                      self, email, 0);
        })

        .switchToWindow('newwindow')

        .findByCssSelector('#fxa-sign-up-complete-header')
        .end()

        .findByCssSelector('.account-ready-service')
        .getVisibleText()
        .then(function (text) {
          assert.ok(text.indexOf('Firefox Sync') > -1);
        })

        .then(closeCurrentWindow());
    },

    'signup, verify same browser by replacing the original tab': function () {
      var self = this;

      return this.remote
        .get(require.toUrl(PAGE_URL))
        .setFindTimeout(intern.config.pageLoadTimeout)
        .execute(listenForFxaCommands)

        .findByCssSelector('#fxa-signup-header')
        .end()

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

      return this.remote
        .get(require.toUrl(PAGE_URL))
        .setFindTimeout(intern.config.pageLoadTimeout)
        .execute(listenForFxaCommands)

        .findByCssSelector('#fxa-signup-header')
        .end()

        .then(function () {
          return FunctionalHelpers.fillOutSignUp(self, email, PASSWORD);
        })

        .findByCssSelector('#fxa-confirm-header')

        .then(function () {
          return testIsBrowserNotifiedOfLogin(self, email);
        })

        .end()

        .then(function () {
          return FunctionalHelpers.openVerificationLinkDifferentBrowser(client, email);
        })

        // The original tab should not transition
        .findByCssSelector('#fxa-confirm-header')
        .end();
    },

    'signup, verify different browser - from new browser\'s P.O.V.': function () {
      var self = this;

      return this.remote
        .get(require.toUrl(PAGE_URL))
        .setFindTimeout(intern.config.pageLoadTimeout)
        .execute(listenForFxaCommands)

        .findByCssSelector('#fxa-signup-header')
        .end()

        .then(function () {
          return FunctionalHelpers.fillOutSignUp(self, email, PASSWORD);
        })


        .findByCssSelector('#fxa-confirm-header')

        .then(function () {
          return testIsBrowserNotifiedOfLogin(self, email);
        })
        .end()

        // clear local/sessionStorage to synthesize continuing in
        // a separate browser.
        .then(function () {
          return FunctionalHelpers.clearBrowserState(self);
        })

        // verify the user
        .then(function () {
          return FunctionalHelpers.getVerificationLink(email, 0);
        })
        .then(function (link) {
          return self.remote.get(link);
        })

        // user should be redirected to "Success!" screen
        .findById('fxa-sign-up-complete-header')
        .end()

        .findByCssSelector('.account-ready-service')
        .getVisibleText()
        .then(function (text) {
          assert.ok(text.indexOf('Firefox Sync') > -1);
        })

        .end();
    },

    'choose option to customize sync': function () {
      var self = this;
      return this.remote
        .get(require.toUrl(PAGE_URL))
        .execute(listenForFxaCommands)

        .findByCssSelector('#fxa-signup-header')
        .end()

        .findByCssSelector('#customize-sync')
          .getAttribute('checked')
          .then(function (checkedAttribute) {
            assert.isNull(checkedAttribute);
          })
        .end()

        .then(function () {
          return FunctionalHelpers.fillOutSignUp(
              self, email, PASSWORD, { customizeSync: true });
        })

        .then(function () {
          return testIsBrowserNotifiedOfLogin(self, email);
        })

        // Being pushed to the confirmation screen is success.
        .findById('fxa-confirm-header')
        .end();
    },

    'force customize sync checkbox to be checked': function () {
      var url = (PAGE_URL += '&customizeSync=true');
      return this.remote
        .get(require.toUrl(url))

        .findByCssSelector('#customize-sync')
          .getAttribute('checked')
          .then(function (checkedAttribute) {
            assert.equal(checkedAttribute, 'checked');
          })
        .end();
    },

    'as a migrating user': function () {
      return this.remote
        .get(require.toUrl(PAGE_URL_WITH_MIGRATION))
        .setFindTimeout(intern.config.pageLoadTimeout)
        .execute(listenForFxaCommands)
        .then(FunctionalHelpers.visibleByQSA('.info.nudge'))
        .end();
    }
  });
});
