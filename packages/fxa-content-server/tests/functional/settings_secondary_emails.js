/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'intern',
  'intern!object',
  'tests/lib/helpers',
  'tests/functional/lib/helpers'
], function (intern, registerSuite, TestHelpers, FunctionalHelpers) {

  const config = intern.config;
  const SIGNUP_URL = config.fxaContentRoot + 'signup';
  const PASSWORD = 'password';

  let email;
  let secondaryEmail;

  const clearBrowserState = FunctionalHelpers.clearBrowserState;
  const click = FunctionalHelpers.click;
  const createUser = FunctionalHelpers.createUser;
  const fillOutResetPassword = FunctionalHelpers.fillOutResetPassword;
  const fillOutSignIn = FunctionalHelpers.fillOutSignIn;
  const fillOutSignUp = FunctionalHelpers.fillOutSignUp;
  const openPage = FunctionalHelpers.openPage;
  const openVerificationLinkInSameTab = FunctionalHelpers.openVerificationLinkInSameTab;
  const testElementExists = FunctionalHelpers.testElementExists;
  const testElementTextEquals = FunctionalHelpers.testElementTextEquals;
  const testErrorTextInclude = FunctionalHelpers.testErrorTextInclude;
  const type = FunctionalHelpers.type;
  const visibleByQSA = FunctionalHelpers.visibleByQSA;

  registerSuite({
    name: 'settings secondary emails',

    beforeEach: function () {
      email = TestHelpers.createEmail();
      secondaryEmail = TestHelpers.createEmail();

      return this.remote.then(clearBrowserState());
    },

    afterEach: function () {
      return this.remote.then(clearBrowserState());
    },

    'add and verify secondary email': function () {
      return this.remote
        // sign up via the UI, we need a verified session to use secondary email
        .then(openPage(SIGNUP_URL, '#fxa-signup-header'))
        .then(fillOutSignUp(email, PASSWORD))
        .then(testElementExists('#fxa-confirm-header'))
        .then(openVerificationLinkInSameTab(email, 0))
        .then(testElementExists('#fxa-settings-header'))
        .then(click('#emails .settings-unit-stub button'))

        // attempt to the same email as primary
        .then(type('.new-email', email))
        .then(click('.email-add:not(.disabled)'))
        .then(visibleByQSA('.tooltip'))

        // add secondary email, resend and remove
        .then(type('.new-email', TestHelpers.createEmail()))
        .then(click('.email-add:not(.disabled)'))
        .then(testElementExists('.not-verified'))
        .then(click('.email-disconnect'))

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
        .then(testElementExists('#fxa-signin-header'))
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

        .then(openPage(SIGNUP_URL, '#fxa-signup-header'))
        .then(fillOutSignUp(unverifiedAccountEmail, PASSWORD))
        .then(testElementExists('#fxa-confirm-header'))

        // sign up and verify
        .then(openPage(SIGNUP_URL, '#fxa-signup-header'))
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
        .then(openPage(SIGNUP_URL, '#fxa-signup-header'))
        .then(fillOutSignUp(email, PASSWORD))
        .then(testElementExists('#fxa-confirm-header'))
        .then(openVerificationLinkInSameTab(email, 0))
        .then(testElementExists('#fxa-settings-header'))
        .then(click('#emails .settings-unit-stub button'))

        .then(type('.new-email', secondaryEmail))
        .then(click('.email-add:not(.disabled)'))
        .then(testElementExists('.not-verified'))
        .then(openVerificationLinkInSameTab(secondaryEmail, 0))

        .then(click('#emails .settings-unit-stub button'))
        .then(testElementExists('.verified'))
        .then(click('#signout'))
        .then(testElementExists('#fxa-signin-header'))
        // try to signin with the secondary email
        .then(fillOutSignIn(secondaryEmail, PASSWORD))
        .then(testErrorTextInclude('Primary account email required'))
        // try to signup with the secondary email
        .then(openPage(SIGNUP_URL, '#fxa-signup-header'))
        .then(fillOutSignUp(email, PASSWORD))
        .then(testElementExists('#fxa-settings-content'));
    }
  });
});
