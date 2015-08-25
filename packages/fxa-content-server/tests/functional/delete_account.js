/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'require',
  'intern/node_modules/dojo/node!xmlhttprequest',
  'app/bower_components/fxa-js-client/fxa-client',
  'tests/lib/helpers',
  'tests/functional/lib/helpers'
], function (intern, registerSuite, require, nodeXMLHttpRequest,
      FxaClient, TestHelpers, FunctionalHelpers)  {
  var config = intern.config;
  var AUTH_SERVER_ROOT = config.fxaAuthRoot;
  var PAGE_URL = config.fxaContentRoot + 'settings/delete_account';

  var PASSWORD = 'password';
  var email;
  var client;

  function initiateLockedAccountDeleteAccount(context) {
    return FunctionalHelpers.fillOutSignIn(context, email, PASSWORD)

      .findByCssSelector('#fxa-settings-header')
      .end()

      .get(require.toUrl(PAGE_URL))

      .then(FunctionalHelpers.visibleByQSA('#delete-account'))
      .end()

      .then(function () {
        return client.accountLock(email, PASSWORD);
      })


      .then(function () {
        return FunctionalHelpers.fillOutDeleteAccount(context, PASSWORD);
      })

      .then(FunctionalHelpers.visibleByQSA('#delete-account .error'))
      .end()

      .findByCssSelector('a[href="/confirm_account_unlock"]')
        .click()
      .end()

      .findByCssSelector('#fxa-confirm-account-unlock-header')
      .end();
  }

  registerSuite({
    name: 'delete_account',

    beforeEach: function () {
      email = TestHelpers.createEmail();

      client = new FxaClient(AUTH_SERVER_ROOT, {
        xhr: nodeXMLHttpRequest.XMLHttpRequest
      });

      var self = this;
      return client.signUp(email, PASSWORD, { preVerified: true })
        .then(function () {
          return FunctionalHelpers.clearBrowserState(self);
        });
    },

    afterEach: function () {
      return FunctionalHelpers.clearBrowserState(this);
    },

    'sign in, delete account': function () {
      var self = this;
      return FunctionalHelpers.fillOutSignIn(this, email, PASSWORD)
        .findById('fxa-settings-header')
        .end()

        // Go to delete account screen
        .findByCssSelector('#delete-account .settings-unit-toggle')
          .click()
        .end()

        // success is going to the delete account page
        .then(FunctionalHelpers.visibleByQSA('#delete-account'))

        .then(function () {
          return FunctionalHelpers.fillOutDeleteAccount(self, PASSWORD);
        })

        // success is going to the signup page
        .findById('fxa-signup-header')
        .end();
    },

    'sign in, cancel delete account': function () {
      return FunctionalHelpers.fillOutSignIn(this, email, PASSWORD)
        .findById('fxa-settings-header')
        .end()

        // Go to delete account screen
        .findByCssSelector('#delete-account .settings-unit-toggle')
          .click()
        .end()

        // success is going to the delete account page
        .then(FunctionalHelpers.visibleByQSA('#delete-account'))

        .findByCssSelector('#delete-account .cancel')
          .click()
        .end()

        // success is going to the signup page
        .findById('fxa-settings-header')
        .end();
    },

    'locked account, verify same browser': function () {
      var self = this;

      return initiateLockedAccountDeleteAccount(self)
        .then(function () {
          return FunctionalHelpers.openVerificationLinkSameBrowser(
                      self, email, 0);
        })

        .switchToWindow('newwindow')
        // wait for the verified window in the new tab
        .findByCssSelector('#fxa-account-unlock-complete-header')
        .end()

        // switch to the original window
        .closeCurrentWindow()
        .switchToWindow('')

        .then(FunctionalHelpers.visibleByQSA('.success'))
        .end()

        // account is unlocked, re-try the delete account
        .then(function () {
          return FunctionalHelpers.fillOutDeleteAccount(self, PASSWORD);
        })

        .findByCssSelector('#fxa-signup-header')
        .end();
    },

    'locked account, verify same browser with original tab closed': function () {
      var self = this;

      return initiateLockedAccountDeleteAccount(self)
        // user browses to another site.
        .switchToFrame(null)

        .then(FunctionalHelpers.openExternalSite(self))

        .then(function () {
          return FunctionalHelpers.openVerificationLinkSameBrowser(
                      self, email, 0);
        })

        .switchToWindow('newwindow')
        // wait for the verified window in the new tab
        .findByCssSelector('#fxa-account-unlock-complete-header')
        .end()

        // switch to the original window
        .closeCurrentWindow()
        .switchToWindow('');
    },

    'locked account, verify same browser by replacing original tab': function () {
      var self = this;
      return initiateLockedAccountDeleteAccount(this)
        .then(function () {
          return FunctionalHelpers.getVerificationLink(email, 0);
        })
        .then(function (verificationLink) {
          return self.remote.get(require.toUrl(verificationLink));
        })

        .findByCssSelector('#fxa-account-unlock-complete-header')
        .end();
    },

    'locked account, verify different browser - from original tab\'s P.O.V.': function () {
      var self = this;
      return initiateLockedAccountDeleteAccount(this)
        .then(function () {
          return FunctionalHelpers.openUnlockLinkDifferentBrowser(client, email, 'x-unlock-code');
        })

        .then(FunctionalHelpers.visibleByQSA('.success'))
        .end()

        // account is unlocked, re-try the delete account
        .then(function () {
          return FunctionalHelpers.fillOutDeleteAccount(self, PASSWORD);
        })

        .findByCssSelector('#fxa-signup-header')
        .end();
    },

    'locked account, verify different browser - from new browser\'s P.O.V.': function () {
      var self = this;
      return initiateLockedAccountDeleteAccount(this)
        .then(function () {
          return FunctionalHelpers.clearBrowserState(self);
        })

        .then(function () {
          return FunctionalHelpers.getVerificationLink(email, 0);
        })
        .then(function (verificationLink) {
          return self.remote.get(require.toUrl(verificationLink));
        })

        // new browser dead ends at the 'account verified' screen.
        .findByCssSelector('#fxa-account-unlock-complete-header')
        .end();
    }

  });
});
