/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const assert = intern.getPlugin('chai').assert;
const TestHelpers = require('../lib/helpers');
const FunctionalHelpers = require('./lib/helpers');
const selectors = require('./lib/selectors');

const config = intern._config;
const SIGNUP_URL = config.fxaContentRoot + 'signup';
const SIGNIN_URL = config.fxaContentRoot + 'signin';
const PASSWORD = 'passwordzxcv';

let client;
let email;
let secondaryEmail;

const {
  clearBrowserState,
  click,
  closeCurrentWindow,
  createUser,
  fillOutResetPassword,
  fillOutEmailFirstSignIn,
  fillOutSignIn,
  fillOutSignUp,
  getUnblockInfo,
  openPage,
  openVerificationLinkInDifferentBrowser,
  openVerificationLinkInNewTab,
  openVerificationLinkInSameTab,
  respondToWebChannelMessage,
  switchToWindow,
  testElementExists,
  testElementTextEquals,
  testElementTextInclude,
  testErrorTextInclude,
  type,
  visibleByQSA,
} = FunctionalHelpers;

registerSuite('settings secondary emails', {
  beforeEach: function() {
    email = TestHelpers.createEmail('sync{id}');
    secondaryEmail = TestHelpers.createEmail('sync{id}');
    client = FunctionalHelpers.getFxaClient();

    return this.remote.then(clearBrowserState({ force: true }));
  },

  tests: {
    'gated in unverified session open verification same tab': function() {
      return (
        this.remote
          // when an account is created, the original session is verified
          // re-login to destroy original session and created an unverified one
          .then(createUser(email, PASSWORD, { preVerified: true }))
          .then(openPage(SIGNIN_URL, selectors.SIGNIN.HEADER))
          .then(fillOutSignIn(email, PASSWORD))
          .then(testElementExists(selectors.EMAIL.UNLOCK_BUTTON))

          // unlock panel
          .then(click(selectors.EMAIL.UNLOCK_BUTTON))
          .then(testElementExists(selectors.EMAIL.UNLOCK_SEND_BUTTON))

          // send and open verification in same tab
          .then(click(selectors.EMAIL.UNLOCK_SEND_BUTTON))
          .then(openVerificationLinkInSameTab(email, 0))

          // panel becomes verified and opens add secondary panel
          .then(visibleByQSA(selectors.EMAIL.INPUT))
      );
    },

    'gated in unverified session open verification new tab': function() {
      return (
        this.remote
          // when an account is created, the original session is verified
          // re-login to destroy original session and created an unverified one
          .then(createUser(email, PASSWORD, { preVerified: true }))
          .then(openPage(SIGNIN_URL, selectors.SIGNIN.HEADER))
          .then(fillOutSignIn(email, PASSWORD))
          .then(testElementExists(selectors.EMAIL.UNLOCK_BUTTON))

          // unlock panel
          .then(click(selectors.EMAIL.UNLOCK_BUTTON))
          .then(testElementExists(selectors.EMAIL.UNLOCK_SEND_BUTTON))

          // send and open verification in same tab
          .then(click(selectors.EMAIL.UNLOCK_SEND_BUTTON))
          .then(openVerificationLinkInNewTab(email, 0))
          .then(switchToWindow(1))
          // panel becomes verified and opens add secondary panel
          .then(testElementExists(selectors.EMAIL.INPUT))
          .then(visibleByQSA(selectors.EMAIL.INPUT))
          .then(closeCurrentWindow())

          .then(switchToWindow(0))
          .then(testElementExists(selectors.EMAIL.UNLOCK_REFRESH_BUTTON))
          .then(click(selectors.EMAIL.UNLOCK_REFRESH_BUTTON))
          .then(testElementExists(selectors.EMAIL.INPUT))
          .then(visibleByQSA(selectors.EMAIL.INPUT))
      );
    },

    'gated in unverified session open verification different browser': function() {
      return (
        this.remote
          // when an account is created, the original session is verified
          // re-login to destroy original session and created an unverified one
          .then(createUser(email, PASSWORD, { preVerified: true }))
          .then(openPage(SIGNIN_URL, selectors.SIGNIN.HEADER))
          .then(fillOutSignIn(email, PASSWORD))
          .then(testElementExists(selectors.EMAIL.UNLOCK_BUTTON))

          // unlock panel
          .then(click(selectors.EMAIL.UNLOCK_BUTTON))
          .then(testElementExists(selectors.EMAIL.UNLOCK_SEND_BUTTON))

          // send and open verification in same tab
          .then(click(selectors.EMAIL.UNLOCK_SEND_BUTTON))
          .then(openVerificationLinkInDifferentBrowser(email, 0))
          .then(click(selectors.EMAIL.UNLOCK_REFRESH_BUTTON))

          .then(testElementExists(selectors.EMAIL.INPUT))
          .then(visibleByQSA(selectors.EMAIL.INPUT))
      );
    },

    'add and verify secondary email': function() {
      return (
        this.remote
          // sign up via the UI, we need a verified session to use secondary email
          .then(openPage(SIGNUP_URL, selectors.SIGNUP.HEADER))
          .then(fillOutSignUp(email, PASSWORD))
          .then(testElementExists(selectors.CONFIRM_SIGNUP.HEADER))
          .then(openVerificationLinkInSameTab(email, 0))
          .then(testElementExists(selectors.SETTINGS.HEADER))
          .then(click(selectors.EMAIL.MENU_BUTTON))

          // attempt to the same email as primary
          .then(type(selectors.EMAIL.INPUT, email))
          .then(click(selectors.EMAIL.ADD_BUTTON))
          .then(visibleByQSA(selectors.EMAIL.TOOLTIP))

          // add secondary email, resend and remove
          .then(type(selectors.EMAIL.INPUT, TestHelpers.createEmail()))
          .then(click(selectors.EMAIL.ADD_BUTTON))
          .then(testElementExists(selectors.EMAIL.NOT_VERIFIED_LABEL))

          .then(click(selectors.EMAIL.REMOVE_BUTTON))
          .waitForDeletedByCssSelector(selectors.EMAIL.REMOVE_BUTTON)

          .then(click(selectors.EMAIL.MENU_BUTTON))

          // add secondary email, verify
          .then(type(selectors.EMAIL.INPUT, secondaryEmail))
          .then(click(selectors.EMAIL.ADD_BUTTON))
          .then(testElementExists(selectors.EMAIL.NOT_VERIFIED_LABEL))
          .then(openVerificationLinkInSameTab(secondaryEmail, 0))

          .then(click(selectors.EMAIL.MENU_BUTTON))

          .then(
            testElementTextEquals(selectors.EMAIL.ADDRESS_LABEL, secondaryEmail)
          )
          .then(testElementExists(selectors.EMAIL.VERIFIED_LABEL))

          // sign out, try to sign in with secondary
          .then(click(selectors.SETTINGS.SIGNOUT))
          .then(testElementExists(selectors.SIGNIN.HEADER))
          .then(fillOutSignIn(secondaryEmail, PASSWORD))
          .then(testErrorTextInclude('primary account email required'))

          // try to reset with secondary email
          .then(fillOutResetPassword(secondaryEmail, PASSWORD))
          .then(testErrorTextInclude('primary account email required'))

          // make sure sign in still works
          .then(fillOutSignIn(email, PASSWORD))
      );
    },

    'add secondary email that is primary to another account': function() {
      const existingUnverified = TestHelpers.createEmail();
      const existingVerified = TestHelpers.createEmail();
      const unverifiedAccountEmail = TestHelpers.createEmail();

      return (
        this.remote
          // create an unverified and verified accounts
          // these are going to be tried as a secondary emails for another account
          .then(
            createUser(existingUnverified, PASSWORD, { preVerified: false })
          )
          .then(createUser(existingVerified, PASSWORD, { preVerified: true }))

          .then(openPage(SIGNUP_URL, selectors.SIGNUP.HEADER))
          .then(fillOutSignUp(unverifiedAccountEmail, PASSWORD))
          .then(testElementExists(selectors.CONFIRM_SIGNUP.HEADER))

          // sign up and verify
          .then(openPage(SIGNUP_URL, selectors.SIGNUP.HEADER))
          .then(fillOutSignUp(email, PASSWORD))
          .then(testElementExists(selectors.CONFIRM_SIGNUP.HEADER))
          .then(openVerificationLinkInSameTab(email, 0))
          .then(click(selectors.EMAIL.MENU_BUTTON))
          .then(type(selectors.EMAIL.INPUT, unverifiedAccountEmail))
          .then(click(selectors.EMAIL.ADD_BUTTON))
          .then(visibleByQSA(selectors.EMAIL.TOOLTIP))
      );
    },

    'signin and signup with existing secondary email': function() {
      return (
        this.remote
          // sign up via the UI, we need a verified session to use secondary email
          .then(openPage(SIGNUP_URL, selectors.SIGNUP.HEADER))
          .then(fillOutSignUp(email, PASSWORD))
          .then(testElementExists(selectors.CONFIRM_SIGNUP.HEADER))
          .then(openVerificationLinkInSameTab(email, 0))
          .then(testElementExists(selectors.SETTINGS.HEADER))
          .then(click(selectors.EMAIL.MENU_BUTTON))

          .then(type(selectors.EMAIL.INPUT, secondaryEmail))
          .then(click(selectors.EMAIL.ADD_BUTTON))
          .then(testElementExists(selectors.EMAIL.NOT_VERIFIED_LABEL))
          .then(openVerificationLinkInSameTab(secondaryEmail, 0))

          .then(click(selectors.EMAIL.MENU_BUTTON))
          .then(testElementExists(selectors.EMAIL.VERIFIED_LABEL))
          .then(click(selectors.SETTINGS.SIGNOUT))
          .then(testElementExists(selectors.SIGNIN.HEADER))
          // try to signin with the secondary email
          .then(fillOutSignIn(secondaryEmail, PASSWORD))
          .then(testErrorTextInclude('Primary account email required'))
          // try to signup with the secondary email
          .then(openPage(SIGNUP_URL, selectors.SIGNUP.HEADER))
          .then(fillOutSignUp(email, PASSWORD))
          .then(testElementExists(selectors.SETTINGS.CONTENT))
      );
    },

    'unblock code is sent to secondary emails': function() {
      email = TestHelpers.createEmail('blocked{id}');

      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(function(result) {
          return client.recoveryEmailCreate(
            result.sessionToken,
            secondaryEmail
          );
        })
        .then(fillOutSignIn(email, PASSWORD))
        .then(getUnblockInfo(email, 0))
        .then(
          testElementTextInclude(selectors.SIGNIN_UNBLOCK.EMAIL_FIELD, email)
        )
        .then(getUnblockInfo(email, 0))
        .then(function(unblockInfo) {
          return this.parent.then(
            type('#unblock_code', '   ' + unblockInfo.unblockCode)
          );
        })
        .then(click(selectors.SIGNIN_UNBLOCK.SUBMIT))

        .then(testElementExists(selectors.SETTINGS.HEADER))
        .then(openVerificationLinkInSameTab(secondaryEmail, 0))
        .then(click(selectors.EMAIL.MENU_BUTTON))
        .then(testElementExists(selectors.EMAIL.VERIFIED_LABEL))
        .then(click(selectors.SETTINGS.SIGNOUT))
        .then(fillOutSignIn(email, PASSWORD))
        .then(
          testElementTextInclude(selectors.SIGNIN_UNBLOCK.EMAIL_FIELD, email)
        )
        .then(getUnblockInfo(email, 0))
        .then(function(unblockInfo) {
          // original email gets the unblock code
          assert.ok(unblockInfo.unblockCode);
        })
        .then(getUnblockInfo(secondaryEmail, 1))
        .then(function(unblockInfo) {
          return this.parent.then(
            type('#unblock_code', '   ' + unblockInfo.unblockCode)
          );
        })
        .then(click(selectors.SIGNIN_UNBLOCK.SUBMIT))

        .then(testElementExists(selectors.SETTINGS.HEADER));
    },

    'signin confirmation is sent to secondary emails': function() {
      const EMAIL_FIRST_URL = `${SIGNIN_URL}?context=fx_desktop_v3&service=sync&forceAboutAccounts=true`;
      const SETTINGS_URL = `${config.fxaContentRoot}settings?context=fx_desktop_v3&service=sync&forceAboutAccounts=true`;

      email = TestHelpers.createEmail('sync{id}');

      return (
        this.remote
          .then(createUser(email, PASSWORD, { preVerified: true }))
          .then(function(result) {
            return client.recoveryEmailCreate(
              result.sessionToken,
              secondaryEmail
            );
          })
          .then(openPage(EMAIL_FIRST_URL, selectors.ENTER_EMAIL.HEADER))
          .then(
            respondToWebChannelMessage('fxaccounts:can_link_account', {
              ok: true,
            })
          )
          .then(fillOutEmailFirstSignIn(email, PASSWORD))

          .then(testElementExists(selectors.CONFIRM_SIGNIN.HEADER))
          .then(openVerificationLinkInDifferentBrowser(email))

          // wait until account data is in localstorage before redirecting
          .then(
            FunctionalHelpers.pollUntil(
              function() {
                var accounts = Object.keys(
                  JSON.parse(localStorage.getItem('__fxa_storage.accounts')) ||
                    {}
                );
                return accounts.length === 1 ? true : null;
              },
              [],
              10000
            )
          )

          .then(openPage(SETTINGS_URL, selectors.SETTINGS.HEADER))
          .then(testElementExists(selectors.SETTINGS.HEADER))
          .then(openVerificationLinkInSameTab(secondaryEmail, 0))
          .then(click(selectors.EMAIL.MENU_BUTTON))
          .then(testElementExists(selectors.EMAIL.VERIFIED_LABEL))

          // force: true is needed to avoid localStorage being
          // written by the verification tab after it was just cleared using JS.
          // force: true goes to the /clear page.
          .then(clearBrowserState({ force: true }))

          .then(openPage(EMAIL_FIRST_URL, selectors.ENTER_EMAIL.HEADER))
          .then(
            respondToWebChannelMessage('fxaccounts:can_link_account', {
              ok: true,
            })
          )
          .then(fillOutEmailFirstSignIn(email, PASSWORD))
          .then(testElementExists(selectors.CONFIRM_SIGNIN.HEADER))

          .then(openVerificationLinkInNewTab(secondaryEmail, 1))
          .then(switchToWindow(1))
          .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.HEADER))
          .then(closeCurrentWindow())
      );
    },
  },
});
