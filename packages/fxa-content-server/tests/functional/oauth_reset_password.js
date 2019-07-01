/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const assert = intern.getPlugin('chai').assert;
const FunctionalHelpers = require('./lib/helpers');
const TestHelpers = require('../lib/helpers');
const selectors = require('./lib/selectors');

const PASSWORD = 'passwordzxcv';
const TIMEOUT = 90 * 1000;

let email;
let secret;

const {
  clearBrowserState,
  click,
  closeCurrentWindow,
  createUser,
  enableTotp,
  fillOutCompleteResetPassword,
  fillOutResetPassword,
  fillOutSignIn,
  generateTotpCode,
  openExternalSite,
  openFxaFromRp,
  openPasswordResetLinkInDifferentBrowser,
  openVerificationLinkInNewTab,
  openVerificationLinkInSameTab,
  switchToWindow,
  testElementExists,
  testElementTextInclude,
  type,
  visibleByQSA,
} = FunctionalHelpers;

registerSuite('oauth reset password', {
  beforeEach: function() {
    // timeout after 90 seconds
    this.timeout = TIMEOUT;
    email = TestHelpers.createEmail();

    return this.remote
      .then(
        clearBrowserState({
          '123done': true,
          contentServer: true,
        })
      )
      .then(createUser(email, PASSWORD, { preVerified: true }));
  },
  tests: {
    'reset password, verify same browser': function() {
      this.timeout = TIMEOUT;

      return (
        this.remote
          .then(openFxaFromRp('signin'))
          .getCurrentUrl()
          .then(function(url) {
            assert.ok(url.indexOf('oauth/signin?') > -1);
            assert.ok(url.indexOf('client_id=') > -1);
            assert.ok(url.indexOf('redirect_uri=') > -1);
            assert.ok(url.indexOf('state=') > -1);
          })
          .end()

          .then(testElementExists('#fxa-signin-header .service'))
          .then(click('a[href^="/reset_password"]'))

          .then(testElementExists(selectors.RESET_PASSWORD.HEADER))
          .then(fillOutResetPassword(email))

          .then(testElementExists(selectors.CONFIRM_RESET_PASSWORD.HEADER))

          .then(openVerificationLinkInNewTab(email, 0))

          // Complete the reset password in the new tab
          .then(switchToWindow(1))
          .then(testElementExists(selectors.COMPLETE_RESET_PASSWORD.HEADER))
          .then(fillOutCompleteResetPassword(PASSWORD, PASSWORD))

          // this tab's success is seeing the reset password complete header.
          .then(testElementExists(selectors.RESET_PASSWORD_COMPLETE.HEADER))
          // user sees the name of the rp, but cannot redirect
          .then(testElementTextInclude('.account-ready-service', '123done'))
          .then(closeCurrentWindow())

          // the original tab should automatically sign in
          .then(testElementExists(selectors['123DONE'].AUTHENTICATED))
      );
    },

    'reset password, verify same browser with original tab closed': function() {
      return (
        this.remote
          .then(openFxaFromRp('signin'))
          .then(click(selectors.SIGNIN.RESET_PASSWORD))

          .then(fillOutResetPassword(email))
          .then(testElementExists(selectors.CONFIRM_RESET_PASSWORD.HEADER))

          // user browses to another site.
          .then(openExternalSite())
          .then(openVerificationLinkInNewTab(email, 0))

          .then(switchToWindow(1))

          .then(fillOutCompleteResetPassword(PASSWORD, PASSWORD))
          .then(testElementExists(selectors.RESET_PASSWORD_COMPLETE.HEADER))

          // switch to the original window
          .then(closeCurrentWindow())
      );
    },

    'reset password, verify same browser by replacing the original tab': function() {
      return this.remote
        .then(openFxaFromRp('signin'))
        .then(click(selectors.SIGNIN.RESET_PASSWORD))

        .then(fillOutResetPassword(email))

        .then(testElementExists(selectors.CONFIRM_RESET_PASSWORD.HEADER))

        .then(openVerificationLinkInSameTab(email, 0))
        .then(fillOutCompleteResetPassword(PASSWORD, PASSWORD))

        .then(testElementExists(selectors['123DONE'].AUTHENTICATED));
    },

    "reset password, verify in a different browser, from the original tab's P.O.V.": function() {
      return (
        this.remote
          .then(openFxaFromRp('signin'))
          .then(click(selectors.SIGNIN.RESET_PASSWORD))

          .then(testElementExists(selectors.RESET_PASSWORD.HEADER))
          .then(fillOutResetPassword(email))

          .then(testElementExists(selectors.CONFIRM_RESET_PASSWORD.HEADER))
          .then(openPasswordResetLinkInDifferentBrowser(email, PASSWORD))

          // user verified in a new browser, they have to enter
          // their updated credentials in the original tab.
          .then(testElementExists(selectors.SIGNIN.HEADER))
          .then(visibleByQSA('.success'))
          .then(type(selectors.SIGNIN.PASSWORD, PASSWORD))
          .then(click(selectors.SIGNIN.SUBMIT))

          // user is redirected to RP
          .then(testElementExists(selectors['123DONE'].AUTHENTICATED))
      );
    },

    "reset password, verify in a different browser, from the new browser's P.O.V.": function() {
      return (
        this.remote
          .then(openFxaFromRp('signin'))
          .then(click(selectors.SIGNIN.RESET_PASSWORD))

          .then(testElementExists(selectors.RESET_PASSWORD.HEADER))
          .then(fillOutResetPassword(email))

          .then(testElementExists(selectors.CONFIRM_RESET_PASSWORD.HEADER))

          // clear all browser state, simulate opening in a new browser
          .then(
            clearBrowserState({
              '123done': true,
              contentServer: true,
            })
          )
          .then(openVerificationLinkInSameTab(email, 0))

          .then(testElementExists(selectors.COMPLETE_RESET_PASSWORD.HEADER))
          .then(fillOutCompleteResetPassword(PASSWORD, PASSWORD))

          .then(testElementExists(selectors.RESET_PASSWORD_COMPLETE.HEADER))
          // user sees the name of the rp, but cannot redirect
          .then(testElementTextInclude('.account-ready-service', '123done'))
      );
    },
  },
});

registerSuite('oauth reset password with TOTP', {
  beforeEach: function() {
    // timeout after 90 seconds
    this.timeout = TIMEOUT;
    email = TestHelpers.createEmail();

    return this.remote
      .then(
        clearBrowserState({
          '123done': true,
          contentServer: true,
        })
      )
      .then(createUser(email, PASSWORD, { preVerified: true }))
      .then(fillOutSignIn(email, PASSWORD))
      .then(testElementExists(selectors.SETTINGS.HEADER))
      .then(enableTotp())
      .then(_secret => {
        secret = _secret;
      })
      .then(click(selectors.SETTINGS.SIGNOUT, selectors.SIGNIN.HEADER))
      .then(
        clearBrowserState({
          '123done': true,
          contentServer: true,
        })
      )
      .then(
        openFxaFromRp('email-first', { header: selectors.ENTER_EMAIL.HEADER })
      )
      .then(type(selectors.ENTER_EMAIL.EMAIL, email))
      .then(
        click(selectors.ENTER_EMAIL.SUBMIT, selectors.SIGNIN_PASSWORD.HEADER)
      )

      .then(click(selectors.SIGNIN_PASSWORD.LINK_FORGOT_PASSWORD))
      .then(fillOutResetPassword(email));
  },

  tests: {
    'reset password, verify same browser same tab': function() {
      return this.remote
        .then(openVerificationLinkInSameTab(email, 1))
        .then(fillOutCompleteResetPassword(PASSWORD, PASSWORD))

        .then(testElementExists(selectors.TOTP_SIGNIN.HEADER))
        .then(type(selectors.TOTP_SIGNIN.INPUT, generateTotpCode(secret)))
        .then(click(selectors.TOTP_SIGNIN.SUBMIT))

        .then(testElementExists(selectors['123DONE'].AUTHENTICATED_TOTP));
    },

    'reset password, verify same browser different tab': function() {
      return this.remote
        .then(openVerificationLinkInNewTab(email, 1))
        .then(switchToWindow(1))
        .then(fillOutCompleteResetPassword(PASSWORD, PASSWORD))

        .then(testElementExists(selectors.TOTP_SIGNIN.HEADER))
        .then(type(selectors.TOTP_SIGNIN.INPUT, generateTotpCode(secret)))
        .then(
          click(
            selectors.TOTP_SIGNIN.SUBMIT,
            selectors['123DONE'].AUTHENTICATED_TOTP
          )
        )

        .then(switchToWindow(0))

        .then(testElementExists(selectors.RESET_PASSWORD_COMPLETE.HEADER));
    },

    "reset password, verify in a different browser, from the original tab's P.O.V.": function() {
      return (
        this.remote
          .then(openPasswordResetLinkInDifferentBrowser(email, PASSWORD, 1))

          // user verified in a new browser, they have to enter
          // their updated credentials in the original tab.
          .then(testElementExists(selectors.ENTER_EMAIL.HEADER))
          .then(
            click(
              selectors.ENTER_EMAIL.SUBMIT,
              selectors.SIGNIN_PASSWORD.HEADER
            )
          )

          .then(type(selectors.SIGNIN_PASSWORD.PASSWORD, PASSWORD))
          .then(click(selectors.SIGNIN_PASSWORD.SUBMIT))

          .then(testElementExists(selectors.TOTP_SIGNIN.HEADER))
          .then(type(selectors.TOTP_SIGNIN.INPUT, generateTotpCode(secret)))
          .then(
            click(
              selectors.TOTP_SIGNIN.SUBMIT,
              selectors['123DONE'].AUTHENTICATED_TOTP
            )
          )
      );
    },

    "reset password, verify in a different browser from new browser's P.O.V.": function() {
      return (
        this.remote
          // clear all browser state, simulate opening in a new browser
          .then(clearBrowserState({ force: true }))
          .then(openVerificationLinkInSameTab(email, 1))
          .then(fillOutCompleteResetPassword(PASSWORD, PASSWORD))

          // this tab's success is seeing the reset password complete header.
          .then(testElementExists(selectors.RESET_PASSWORD_COMPLETE.HEADER))
      );
    },
  },
});
