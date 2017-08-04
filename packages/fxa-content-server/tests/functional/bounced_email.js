/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'tests/lib/helpers',
  'tests/functional/lib/helpers',
  'tests/functional/lib/selectors'
], function (intern, registerSuite, TestHelpers, FunctionalHelpers, selectors) {
  var bouncedEmail;
  var deliveredEmail;
  const PASSWORD = '12345678';
  const SIGNIN_URL = `${intern.config.fxaContentRoot}signin`;

  const clearBrowserState = FunctionalHelpers.clearBrowserState;
  const click = FunctionalHelpers.click;
  const closeCurrentWindow = FunctionalHelpers.closeCurrentWindow;
  const createUser = FunctionalHelpers.createUser;
  const fillOutSignIn = FunctionalHelpers.fillOutSignIn;
  const fillOutSignUp = FunctionalHelpers.fillOutSignUp;
  const getFxaClient = FunctionalHelpers.getFxaClient;
  const openPage = FunctionalHelpers.openPage;
  const pollUntil = FunctionalHelpers.pollUntil;
  const respondToWebChannelMessage = FunctionalHelpers.respondToWebChannelMessage;
  const switchToWindow = FunctionalHelpers.switchToWindow;
  const testElementExists = FunctionalHelpers.testElementExists;
  const testElementValueEquals = FunctionalHelpers.testElementValueEquals;
  const testIsBrowserNotified = FunctionalHelpers.testIsBrowserNotified;
  const thenify = FunctionalHelpers.thenify;

  registerSuite({
    name: 'sign_up with an email that bounces',

    beforeEach () {
      bouncedEmail = TestHelpers.createEmail();
      deliveredEmail = TestHelpers.createEmail();
      return this.remote
        .then(clearBrowserState())
        // ensure a fresh signup page is loaded. If this suite is
        // run after a Sync suite, these tests try to use a Sync broker
        // which results in a channel timeout.
        .then(openPage(SIGNIN_URL, selectors.SIGNIN.HEADER));

    },

    afterEach () {
      return this.remote.then(clearBrowserState());
    },

    'sign up, bounce email, allow user to restart flow but force a different email': function () {
      const client = getFxaClient();

      return this.remote
        .then(fillOutSignUp(bouncedEmail, PASSWORD))
        .findById('fxa-confirm-header')
        .end()

        .then(function () {
          return client.accountDestroy(bouncedEmail, PASSWORD);
        })

        .findById('fxa-signup-header')
        .end()

        // expect an error message to already be present on redirect
        .then(FunctionalHelpers.visibleByQSA('.tooltip'))

        // submit button should be disabled.
        .findByCssSelector('button[type="submit"].disabled')
        .end()

        .findByCssSelector('input[type="email"]')
          .clearValue()
          .click()
          .type(bouncedEmail)
        .end()

        // user must change the email address
        .findByCssSelector('button[type="submit"].disabled')
          .click()
        .end()

        // error message should still be around
        .then(FunctionalHelpers.visibleByQSA('.tooltip'))

        .findByCssSelector('input[type="email"]')
          .clearValue()
          .click()
          .type(deliveredEmail)
        .end()

        .findByCssSelector('button[type="submit"]')
          .click()
        .end()

        .findById('fxa-confirm-header')
        .end();
    }

  });

  const setUpBouncedSignIn = thenify(function (email) {
    const client = getFxaClient();
    email = email || TestHelpers.createEmail('sync{id}');

    return this.parent
      .then(clearBrowserState({ force: true }))
      .then(createUser(email, PASSWORD, { preVerified: true }))
      .then(openPage(`${SIGNIN_URL}?context=fx_desktop_v2&service=sync`, selectors.SIGNIN.HEADER))
      .then(respondToWebChannelMessage('fxaccounts:can_link_account', { ok: true }))
      .then(fillOutSignIn(email, PASSWORD))
      .then(testElementExists(selectors.CONFIRM_SIGNIN.HEADER))
      .then(testIsBrowserNotified('fxaccounts:can_link_account'))
      .then(testIsBrowserNotified('fxaccounts:login'))
      .then(() => client.accountDestroy(email, PASSWORD))
      .then(testElementExists(selectors.SIGNIN_BOUNCED.HEADER))
      .then(testElementExists(selectors.SIGNIN_BOUNCED.CREATE_ACCOUNT))
      .then(testElementExists(selectors.SIGNIN_BOUNCED.BACK))
      .then(testElementExists(selectors.SIGNIN_BOUNCED.SUPPORT));
  });

  registerSuite({
    name: 'sign_in with an email that bounces',

    afterEach () {
      return this.remote.then(clearBrowserState());
    },

    'click create-account': function () {
      return this.remote
        .then(setUpBouncedSignIn())
        .then(click(selectors.SIGNIN_BOUNCED.CREATE_ACCOUNT))
        .then(testElementExists(selectors.SIGNUP.HEADER))
        .then(testElementValueEquals(selectors.SIGNUP.EMAIL, ''))
        .then(testElementValueEquals(selectors.SIGNUP.PASSWORD, ''));
    },

    'click back': function () {
      const email = TestHelpers.createEmail('sync{id}');
      return this.remote
        .then(setUpBouncedSignIn(email))
        .then(click(selectors.SIGNIN_BOUNCED.BACK))
        .then(testElementExists(selectors.SIGNIN.HEADER))
        .then(testElementValueEquals(selectors.SIGNIN.EMAIL, email))
        .then(testElementValueEquals(selectors.SIGNIN.PASSWORD, PASSWORD));
    },

    'click support': function () {
      return this.remote
        .then(setUpBouncedSignIn())
        .then(click(selectors.SIGNIN_BOUNCED.SUPPORT))
        .then(switchToWindow(1))
        .then(pollUntil(() => window.location.href.startsWith('https://support.mozilla.org/')))
        .then(closeCurrentWindow());
    },

    'refresh': function () {
      return this.remote
        .then(setUpBouncedSignIn())
        .refresh()
        .then(testElementExists(selectors.SIGNIN.HEADER));
    }
  });
});
