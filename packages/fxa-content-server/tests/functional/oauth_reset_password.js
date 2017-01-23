/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern!object',
  'intern/chai!assert',
  'tests/lib/helpers',
  'tests/functional/lib/helpers'
], function (registerSuite, assert, TestHelpers, FunctionalHelpers) {
  var PASSWORD = 'password';
  var TIMEOUT = 90 * 1000;
  var email;

  var clearBrowserState = FunctionalHelpers.clearBrowserState;
  var click = FunctionalHelpers.click;
  var closeCurrentWindow = FunctionalHelpers.closeCurrentWindow;
  var createUser = FunctionalHelpers.createUser;
  var fillOutCompleteResetPassword = FunctionalHelpers.fillOutCompleteResetPassword;
  var fillOutResetPassword = FunctionalHelpers.fillOutResetPassword;
  var openExternalSite = FunctionalHelpers.openExternalSite;
  var openFxaFromRp = FunctionalHelpers.openFxaFromRp;
  var openPasswordResetLinkInDifferentBrowser = FunctionalHelpers.openPasswordResetLinkInDifferentBrowser;
  var openVerificationLinkInNewTab = FunctionalHelpers.openVerificationLinkInNewTab;
  var openVerificationLinkInSameTab = FunctionalHelpers.openVerificationLinkInSameTab;
  var testElementExists = FunctionalHelpers.testElementExists;
  var testElementTextInclude = FunctionalHelpers.testElementTextInclude;
  var type = FunctionalHelpers.type;
  var visibleByQSA = FunctionalHelpers.visibleByQSA;

  registerSuite({
    name: 'oauth reset password',

    beforeEach: function () {
      // timeout after 90 seconds
      this.timeout = TIMEOUT;
      email = TestHelpers.createEmail();

      return this.remote
        .then(clearBrowserState({
          '123done': true,
          contentServer: true
        }))
        .then(createUser(email, PASSWORD, { preVerified: true }));
    },

    'reset password, verify same browser': function () {
      this.timeout = TIMEOUT;

      return this.remote
        .then(openFxaFromRp('signin'))
        .getCurrentUrl()
        .then(function (url) {
          assert.ok(url.indexOf('oauth/signin?') > -1);
          assert.ok(url.indexOf('client_id=') > -1);
          assert.ok(url.indexOf('redirect_uri=') > -1);
          assert.ok(url.indexOf('state=') > -1);
        })
        .end()

        .then(testElementExists('#fxa-signin-header .service'))
        .then(click('a[href^="/reset_password"]'))

        .then(testElementExists('#fxa-reset-password-header'))
        .then(fillOutResetPassword(email))

        .then(testElementExists('#fxa-confirm-reset-password-header'))

        .then(openVerificationLinkInNewTab(email, 0))

        // Complete the reset password in the new tab
        .switchToWindow('newwindow')
        .then(testElementExists('#fxa-complete-reset-password-header'))
        .then(fillOutCompleteResetPassword(PASSWORD, PASSWORD))

        // this tab's success is seeing the reset password complete header.
        .then(testElementExists('#fxa-reset-password-complete-header'))
        // user sees the name of the rp, but cannot redirect
        .then(testElementTextInclude('.account-ready-service', '123done'))
        .then(closeCurrentWindow())

        // the original tab should automatically sign in
        .then(testElementExists('#loggedin'));
    },

    'reset password, verify same browser with original tab closed': function () {
      return this.remote
        .then(openFxaFromRp('signin'))
        .then(click('.reset-password'))

        .then(fillOutResetPassword(email))
        .then(testElementExists('#fxa-confirm-reset-password-header'))

        // user browses to another site.
        .then(openExternalSite())
        .then(openVerificationLinkInNewTab(email, 0))

        .switchToWindow('newwindow')

        .then(fillOutCompleteResetPassword(PASSWORD, PASSWORD))
        .then(testElementExists('#fxa-reset-password-complete-header'))

        // switch to the original window
        .then(closeCurrentWindow());
    },

    'reset password, verify same browser by replacing the original tab': function () {
      return this.remote
        .then(openFxaFromRp('signin'))
        .then(click('.reset-password'))

        .then(fillOutResetPassword(email))

        .then(testElementExists('#fxa-confirm-reset-password-header'))

        .then(openVerificationLinkInSameTab(email, 0))
        .then(fillOutCompleteResetPassword(PASSWORD, PASSWORD))

        .then(testElementExists('#loggedin'));
    },

    'reset password, verify in a different browser, from the original tab\'s P.O.V.': function () {
      return this.remote
        .then(openFxaFromRp('signin'))
        .then(click('.reset-password'))

        .then(testElementExists('#fxa-reset-password-header'))
        .then(fillOutResetPassword(email))

        .then(testElementExists('#fxa-confirm-reset-password-header'))
        .then(openPasswordResetLinkInDifferentBrowser(email, PASSWORD))

        // user verified in a new browser, they have to enter
        // their updated credentials in the original tab.
        .then(testElementExists('#fxa-signin-header'))
        .then(visibleByQSA('.success'))
        .then(type('#password', PASSWORD))
        .then(click('button[type=submit]'))

        // user is redirected to RP
        .then(testElementExists('#loggedin'));
    },

    'reset password, verify in a different browser, from the new browser\'s P.O.V.': function () {
      return this.remote
        .then(openFxaFromRp('signin'))
        .then(click('.reset-password'))

        .then(testElementExists('#fxa-reset-password-header'))
        .then(fillOutResetPassword(email))

        .then(testElementExists('#fxa-confirm-reset-password-header'))

        // clear all browser state, simulate opening in a new browser
        .then(clearBrowserState({
          '123done': true,
          contentServer: true
        }))
        .then(openVerificationLinkInSameTab(email, 0))

        .then(testElementExists('#fxa-complete-reset-password-header'))
        .then(fillOutCompleteResetPassword(PASSWORD, PASSWORD))

        .then(testElementExists('#fxa-reset-password-complete-header'))
        // user sees the name of the rp, but cannot redirect
        .then(testElementTextInclude('.account-ready-service', '123done'));
    }
  });
});
