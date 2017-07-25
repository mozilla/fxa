/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'intern',
  'intern!object',
  'intern/chai!assert',
  'tests/lib/helpers',
  'tests/functional/lib/helpers',
  'tests/functional/lib/selectors',
], function (intern, registerSuite, assert, TestHelpers, FunctionalHelpers, selectors) {

  const config = intern.config;
  const SIGNUP_URL = config.fxaContentRoot + 'signup';
  const SIGNIN_URL = config.fxaContentRoot + 'signin';
  const PASSWORD = 'password';

  let client;
  let email;
  let secondaryEmail;

  const clearBrowserState = FunctionalHelpers.clearBrowserState;
  const click = FunctionalHelpers.click;
  const closeCurrentWindow = FunctionalHelpers.closeCurrentWindow;
  const createUser = FunctionalHelpers.createUser;
  const fillOutResetPassword = FunctionalHelpers.fillOutResetPassword;
  const fillOutSignIn = FunctionalHelpers.fillOutSignIn;
  const fillOutSignUp = FunctionalHelpers.fillOutSignUp;
  const getUnblockInfo = FunctionalHelpers.getUnblockInfo;
  const openPage = FunctionalHelpers.openPage;
  const openVerificationLinkInDifferentBrowser = FunctionalHelpers.openVerificationLinkInDifferentBrowser;
  const openVerificationLinkInNewTab = FunctionalHelpers.openVerificationLinkInNewTab;
  const openVerificationLinkInSameTab = FunctionalHelpers.openVerificationLinkInSameTab;
  const respondToWebChannelMessage = FunctionalHelpers.respondToWebChannelMessage;
  const testElementExists = FunctionalHelpers.testElementExists;
  const testElementTextEquals = FunctionalHelpers.testElementTextEquals;
  const testElementTextInclude = FunctionalHelpers.testElementTextInclude;
  const testErrorTextInclude = FunctionalHelpers.testErrorTextInclude;
  const type = FunctionalHelpers.type;
  const visibleByQSA = FunctionalHelpers.visibleByQSA;

  registerSuite({
    name: 'settings secondary emails',

    beforeEach: function () {
      email = TestHelpers.createEmail();
      secondaryEmail = TestHelpers.createEmail();
      client = FunctionalHelpers.getFxaClient();

      return this.remote.then(clearBrowserState());
    },

    afterEach: function () {
      return this.remote.then(clearBrowserState());
    },

    'add and verify secondary email': function () {
      return this.remote
        // sign up via the UI, we need a verified session to use secondary email
        .then(openPage(SIGNUP_URL, selectors.SIGNUP.HEADER))
        .then(fillOutSignUp(email, PASSWORD))
        .then(testElementExists('#fxa-confirm-header'))
        .then(openVerificationLinkInSameTab(email, 0))
        .then(testElementExists(selectors.SETTINGS.HEADER))
        .then(click('#emails .settings-unit-stub button'))

        // attempt to the same email as primary
        .then(type('.new-email', email))
        .then(click('.email-add:not(.disabled)'))
        .then(visibleByQSA('.tooltip'))

        // add secondary email, resend and remove
        .then(type('.new-email', TestHelpers.createEmail()))
        .then(click('.email-add:not(.disabled)'))
        .then(testElementExists('.not-verified'))
        .then(click('.email-address .settings-button.warning.email-disconnect'))

        // add secondary email, verify
        .then(type('.new-email', secondaryEmail))
        .then(click('.email-add:not(.disabled)'))
        .then(testElementExists('.not-verified'))
        .then(openVerificationLinkInSameTab(secondaryEmail, 0))

        .then(click('#emails .settings-unit-stub button'))

        .then(testElementTextEquals('#emails .address', secondaryEmail))
        .then(testElementExists('.verified'))

        // sign out, try to sign in with secondary
        .then(click('#signout'))
        .then(testElementExists(selectors.SIGNIN.HEADER))
        .then(fillOutSignIn(secondaryEmail, PASSWORD))
        .then(testErrorTextInclude('primary account email required'))

        // try to reset with secondary email
        .then(fillOutResetPassword(secondaryEmail, PASSWORD))
        .then(testErrorTextInclude('primary account email required'))

        // make sure sign in still works
        .then(fillOutSignIn(email, PASSWORD));
    },

    'add secondary email that is primary to another account': function () {
      const existingUnverified = TestHelpers.createEmail();
      const existingVerified = TestHelpers.createEmail();
      const unverifiedAccountEmail = TestHelpers.createEmail();

      return this.remote
        // create an unverified and verified accounts
        // these are going to be tried as a secondary emails for another account
        .then(createUser(existingUnverified, PASSWORD, { preVerified: false }))
        .then(createUser(existingVerified, PASSWORD, { preVerified: true }))

        .then(openPage(SIGNUP_URL, selectors.SIGNUP.HEADER))
        .then(fillOutSignUp(unverifiedAccountEmail, PASSWORD))
        .then(testElementExists('#fxa-confirm-header'))

        // sign up and verify
        .then(openPage(SIGNUP_URL, selectors.SIGNUP.HEADER))
        .then(fillOutSignUp(email, PASSWORD))
        .then(testElementExists('#fxa-confirm-header'))
        .then(openVerificationLinkInSameTab(email, 0))
        .then(click('#emails .settings-unit-stub button'))
        .then(type('.new-email', unverifiedAccountEmail))
        .then(click('.email-add:not(.disabled)'))
        .then(visibleByQSA('.tooltip'));
    },

    'signin and signup with existing secondary email': function () {
      return this.remote
        // sign up via the UI, we need a verified session to use secondary email
        .then(openPage(SIGNUP_URL, selectors.SIGNUP.HEADER))
        .then(fillOutSignUp(email, PASSWORD))
        .then(testElementExists('#fxa-confirm-header'))
        .then(openVerificationLinkInSameTab(email, 0))
        .then(testElementExists(selectors.SETTINGS.HEADER))
        .then(click('#emails .settings-unit-stub button'))

        .then(type('.new-email', secondaryEmail))
        .then(click('.email-add:not(.disabled)'))
        .then(testElementExists('.not-verified'))
        .then(openVerificationLinkInSameTab(secondaryEmail, 0))

        .then(click('#emails .settings-unit-stub button'))
        .then(testElementExists('.verified'))
        .then(click('#signout'))
        .then(testElementExists(selectors.SIGNIN.HEADER))
        // try to signin with the secondary email
        .then(fillOutSignIn(secondaryEmail, PASSWORD))
        .then(testErrorTextInclude('Primary account email required'))
        // try to signup with the secondary email
        .then(openPage(SIGNUP_URL, selectors.SIGNUP.HEADER))
        .then(fillOutSignUp(email, PASSWORD))
        .then(testElementExists('#fxa-settings-content'));
    },

    'unblock code is sent to secondary emails': function () {
      email = TestHelpers.createEmail('blocked{id}');

      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(function (result) {
          return client.recoveryEmailCreate(result.sessionToken, secondaryEmail);
        })
        .then(fillOutSignIn(email, PASSWORD))
        .then(getUnblockInfo(email, 0))
        .then(testElementTextInclude(selectors.SIGNIN_UNBLOCK.EMAIL_FIELD, email))
        .then(getUnblockInfo(email, 0))
        .then(function (unblockInfo) {
          return this.parent
            .then(type('#unblock_code', '   ' + unblockInfo.unblockCode));
        })
        .then(click('button[type=submit]'))

        .then(testElementExists(selectors.SETTINGS.HEADER))
        .then(openVerificationLinkInSameTab(secondaryEmail, 0))
        .then(click('#emails .settings-unit-stub button'))
        .then(testElementExists('.verified'))
        .then(click('#signout'))
        .then(fillOutSignIn(email, PASSWORD))
        .then(testElementTextInclude(selectors.SIGNIN_UNBLOCK.EMAIL_FIELD, email))
        .then(getUnblockInfo(email, 0))
        .then(function (unblockInfo) {
          // original email gets the unblock code
          assert.ok(unblockInfo.unblockCode);
        })
        .then(getUnblockInfo(secondaryEmail, 1))
        .then(function (unblockInfo) {
          return this.parent
            .then(type('#unblock_code', '   ' + unblockInfo.unblockCode));
        })
        .then(click('button[type=submit]'))

        .then(testElementExists(selectors.SETTINGS.HEADER));
    },


    'signin confirmation is sent to secondary emails': function () {
      const PAGE_SIGNIN_DESKTOP = `${SIGNIN_URL}?context=fx_desktop_v3&service=sync&forceAboutAccounts=true`;
      const SETTINGS_URL = `${config.fxaContentRoot}settings?context=fx_desktop_v3&service=sync&forceAboutAccounts=true`;

      email = TestHelpers.createEmail('sync{id}');

      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(function (result) {
          return client.recoveryEmailCreate(result.sessionToken, secondaryEmail);
        })
        .then(openPage(PAGE_SIGNIN_DESKTOP, selectors.SIGNIN.HEADER))
        .then(respondToWebChannelMessage('fxaccounts:can_link_account', { ok: true } ))
        .then(fillOutSignIn(email, PASSWORD))

        .then(testElementExists('#fxa-confirm-signin-header'))
        .then(openVerificationLinkInDifferentBrowser(email))

        // wait until account data is in localstorage before redirecting
        .then(FunctionalHelpers.pollUntil(function () {
          var accounts = Object.keys(JSON.parse(localStorage.getItem('__fxa_storage.accounts')) || {});
          return accounts.length === 1 ? true : null;
        }, [], 10000))

        .then(openPage(SETTINGS_URL, selectors.SETTINGS.HEADER))
        .then(testElementExists(selectors.SETTINGS.HEADER))
        .then(openVerificationLinkInSameTab(secondaryEmail, 0))
        .then(click('#emails .settings-unit-stub button'))
        .then(testElementExists('.verified'))

        .then(clearBrowserState())

        .then(openPage(PAGE_SIGNIN_DESKTOP, selectors.SIGNIN.HEADER))
        .then(respondToWebChannelMessage('fxaccounts:can_link_account', { ok: true }))
        .then(fillOutSignIn(email, PASSWORD))
        .then(testElementExists('#fxa-confirm-signin-header'))

        .then(openVerificationLinkInNewTab(secondaryEmail, 1))
        .switchToWindow('newwindow')
        .then(testElementExists('#fxa-sign-in-complete-header'))
        .then(closeCurrentWindow());
    }
  });
});
