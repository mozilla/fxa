/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern!object',
  'intern/chai!assert',
  'require',
  'tests/lib/helpers',
  'tests/functional/lib/helpers'
], function (registerSuite, assert, require, TestHelpers, FunctionalHelpers) {
  var PASSWORD = 'password';
  var email;

  registerSuite({
    name: 'oauth sign up verification_redirect',

    beforeEach: function () {
      email = TestHelpers.createEmail();
      // clear localStorage to avoid polluting other tests.
      // Without the clear, /signup tests fail because of the info stored
      // in prefillEmail
      return FunctionalHelpers.clearBrowserState(this, {
        '123done': true,
        contentServer: true
      });
    },

    'signup, same browser same window, verification_redirect=always': function () {
      var self = this;

      return FunctionalHelpers.openFxaFromRp(self, 'signup')
        // upgrade the content server oauth to include 'verification_redirect'
        .getCurrentUrl()
        .then(function (url) {
          return self.remote.get(require.toUrl(url + '&verification_redirect=always'));
        })
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

        // should redirect back to 123done
        .findByCssSelector('#loggedin')
        .end();
    },

    'signup, same browser, original tab closed, verification_redirect=always': function () {
      var self = this;

      return FunctionalHelpers.openFxaFromRp(self, 'signup')
        // upgrade the content server oauth to include 'verification_redirect'
        .getCurrentUrl()
        .then(function (url) {
          return self.remote.get(require.toUrl(url + '&verification_redirect=always'));
        })
        .then(function () {
          return FunctionalHelpers.fillOutSignUp(self, email, PASSWORD);
        })

        .findByCssSelector('#fxa-confirm-header')
        .end()

        // closes the original tab
        .then(FunctionalHelpers.openExternalSite(self))

        .then(function () {
          return FunctionalHelpers.openVerificationLinkInNewTab(self, email, 0);
        })

        .switchToWindow('newwindow')

        // should redirect back to 123done
        .findByCssSelector('#loggedin')
        .end()

        .closeCurrentWindow()
        .switchToWindow('');
    },

    'signup, same browser different window, verification_redirect=always': function () {
      var self = this;
      self.timeout = 90 * 1000;

      return FunctionalHelpers.openFxaFromRp(self, 'signup')
        // upgrade the content server oauth to include 'verification_redirect'
        .getCurrentUrl()
        .then(function (url) {
          return self.remote.get(require.toUrl(url + '&verification_redirect=always'));
        })
        .then(function () {
          return FunctionalHelpers.fillOutSignUp(self, email, PASSWORD);
        })

        .findByCssSelector('#fxa-confirm-header')
        .end()

        .then(function () {
          return FunctionalHelpers.openVerificationLinkInNewTab(
            self, email, 0);
        })

        // wait for the original tab to login
        .findByCssSelector('#loggedin')
        .end()

        .switchToWindow('newwindow')

        // this is an verification_redirect flow, both windows should login
        .findByCssSelector('#loggedin')
        .end()

        .closeCurrentWindow()
        .switchToWindow('');
    },

    'signup, verify different browser, verification_redirect=always': function () {
      var self = this;

      return FunctionalHelpers.openFxaFromRp(self, 'signup')
        // upgrade the content server oauth to include 'verification_redirect'
        .getCurrentUrl()
        .then(function (url) {
          return self.remote.get(require.toUrl(url + '&verification_redirect=always'));
        })
        .then(function () {
          return FunctionalHelpers.fillOutSignUp(self, email, PASSWORD);
        })

        .findByCssSelector('#fxa-confirm-header')
        .end()

        .then(function () {
          // clear browser state to simulate opening link in a new browser
          return FunctionalHelpers.clearBrowserState(self, {
            '123done': true,
            contentServer: true
          });
        })

        .then(function () {
          return FunctionalHelpers.getVerificationLink(email, 0);
        })
        .then(function (verificationLink) {
          return self.remote.get(require.toUrl(verificationLink));
        })

        // new browser provides a proceed link to the relier
        .findByCssSelector('#proceed')
          .click()
        .end()

        // Note: success is 123done giving a bad request because this is a different browser
        .findByCssSelector('body')
        .getVisibleText()
        .then(function (text) {
          assert.equal(text, 'Bad request - missing code - missing state');
        })
        .end();
    }
  });
});
