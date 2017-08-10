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
  const SIGNIN_URL = `${intern.config.fxaContentRoot}signin?context=fx_desktop_v3&service=sync`;
  const SIGNUP_URL = `${intern.config.fxaContentRoot}signup?context=fx_desktop_v3&service=sync`;

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
  const type = FunctionalHelpers.type;
  const visibleByQSA = FunctionalHelpers.visibleByQSA;

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
        .then(openPage(SIGNUP_URL, selectors.SIGNUP.HEADER))
        .then(respondToWebChannelMessage('fxaccounts:can_link_account', { ok: true }));
    },

    afterEach () {
      return this.remote.then(clearBrowserState());
    },

    'sign up, bounce email at /choose_what_to_sync, allow user to restart flow but force a different email': function () {
      const client = getFxaClient();

      return this.remote
        .then(fillOutSignUp(bouncedEmail, PASSWORD))
        .then(testElementExists(selectors.CHOOSE_WHAT_TO_SYNC.HEADER))

        .then(() => client.accountDestroy(bouncedEmail, PASSWORD))

        .then(testElementExists(selectors.SIGNUP.HEADER))
        // The first can_link_account handler is removed, hook up another.
        .then(respondToWebChannelMessage('fxaccounts:can_link_account', { ok: true }))
        // expect an error message to already be present on redirect
        .then(visibleByQSA(selectors.SIGNUP.TOOLTIP_BOUNCED_EMAIL))
        // submit button should be disabled.
        .then(testElementExists(selectors.SIGNUP.SUBMIT_DISABLED))
        .then(type(selectors.SIGNUP.EMAIL, bouncedEmail))
        // user must change the email address
        .then(click(selectors.SIGNUP.SUBMIT_DISABLED))
        // error message should still be around
        .then(visibleByQSA(selectors.SIGNUP.TOOLTIP_BOUNCED_EMAIL))
        .then(type(selectors.SIGNUP.EMAIL, deliveredEmail))
        .then(click(selectors.SIGNUP.SUBMIT, selectors.CHOOSE_WHAT_TO_SYNC.HEADER))

        .then(click(selectors.CHOOSE_WHAT_TO_SYNC.SUBMIT, selectors.CONFIRM_SIGNUP.HEADER));
    },

    'sign up, bounce email at /confirm': function () {
      const client = getFxaClient();

      return this.remote
        .then(fillOutSignUp(bouncedEmail, PASSWORD))

        .then(testElementExists(selectors.CHOOSE_WHAT_TO_SYNC.HEADER))
        .then(click(selectors.CHOOSE_WHAT_TO_SYNC.SUBMIT, selectors.CONFIRM_SIGNUP.HEADER))

        .then(() => client.accountDestroy(bouncedEmail, PASSWORD))

        .then(testElementExists(selectors.SIGNUP.HEADER))
        // The first can_link_account handler is removed, hook up another.
        .then(respondToWebChannelMessage('fxaccounts:can_link_account', { ok: true }))
        // expect an error message to already be present on redirect
        .then(visibleByQSA(selectors.SIGNUP.TOOLTIP_BOUNCED_EMAIL))
        // submit button should be disabled.
        .then(testElementExists(selectors.SIGNUP.SUBMIT_DISABLED))
        .then(type(selectors.SIGNUP.EMAIL, bouncedEmail))
        // user must change the email address
        .then(click(selectors.SIGNUP.SUBMIT_DISABLED))
        // error message should still be around
        .then(visibleByQSA(selectors.SIGNUP.TOOLTIP_BOUNCED_EMAIL))
        .then(type(selectors.SIGNUP.EMAIL, deliveredEmail))
        .then(click(selectors.SIGNUP.SUBMIT, selectors.CHOOSE_WHAT_TO_SYNC.HEADER))

        .then(click(selectors.CHOOSE_WHAT_TO_SYNC.SUBMIT, selectors.CONFIRM_SIGNUP.HEADER));
    }
  });

  const setUpBouncedSignIn = thenify(function (email) {
    const client = getFxaClient();
    email = email || TestHelpers.createEmail('sync{id}');

    return this.parent
      .then(clearBrowserState({ force: true }))
      .then(createUser(email, PASSWORD, { preVerified: true }))
      .then(openPage(SIGNIN_URL, selectors.SIGNIN.HEADER))
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
