/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

/**
 * Functional suite for the mob_android_v1 broker. There are no "verify same browser" tests
 * because it's impossible to open the verification link in the app where the verification
 * was triggered.
 */

const { registerSuite } = intern.getInterface('object');
const TestHelpers = require('../lib/helpers');
const FunctionalHelpers = require('./lib/helpers');
const selectors = require('./lib/selectors');

const config = intern._config;

const SIGNIN_PAGE_URL = `${config.fxaContentRoot}signin?context=mob_android_v1&service=sync`;
const SIGNUP_PAGE_URL = `${config.fxaContentRoot}signup?context=mob_android_v1&service=sync`;

const COMMAND_CAN_LINK_ACCOUNT = 'fxaccounts:can_link_account';
const COMMAND_LOADED = 'fxaccounts:loaded';
const COMMAND_LOGIN = 'fxaccounts:login';
const COMMAND_VERIFIED = 'fxaccounts:verified';

let email;
const PASSWORD = '12345678';

const cleanMemory = FunctionalHelpers.cleanMemory;
const createUser = FunctionalHelpers.createUser;
const fillOutSignIn = FunctionalHelpers.fillOutSignIn;
const fillOutSignUp = FunctionalHelpers.fillOutSignUp;
const noSuchElement = FunctionalHelpers.noSuchElement;
const noSuchBrowserNotification = FunctionalHelpers.noSuchBrowserNotification;
const openPage = FunctionalHelpers.openPage;
const openVerificationLinkInDifferentBrowser = FunctionalHelpers.openVerificationLinkInDifferentBrowser;
const testElementExists = FunctionalHelpers.testElementExists;
const testIsBrowserNotified = FunctionalHelpers.testIsBrowserNotified;

registerSuite('mob_android_v1', {
  beforeEach: function () {
    email = TestHelpers.createEmail('sync{id}');
    return this.remote
      .then(FunctionalHelpers.clearBrowserState());
  },

  afterEach: function () {
    return this.remote
      .then(FunctionalHelpers.clearBrowserState());
  },
  tests: {
    'signup, verify different browser': function () {
      return this.remote
        .then(cleanMemory())
        .then(openPage(SIGNUP_PAGE_URL, selectors.SIGNUP.HEADER, {
          webChannelResponses: {
            [COMMAND_CAN_LINK_ACCOUNT]: {ok: true}
          }
        }))
        .then(noSuchElement(selectors.SIGNUP.CUSTOMIZE_SYNC_CHECKBOX))
        .then(testIsBrowserNotified(COMMAND_LOADED))
        .then(fillOutSignUp(email, PASSWORD))

        .then(testElementExists(selectors.CONFIRM_SIGNUP.HEADER))
        .then(testIsBrowserNotified(COMMAND_CAN_LINK_ACCOUNT))
        .then(noSuchBrowserNotification(COMMAND_VERIFIED))
        .then(testIsBrowserNotified(COMMAND_LOGIN))

        // verify the user
        .then(openVerificationLinkInDifferentBrowser(email, 0))

        .then(testElementExists(selectors.SIGNUP_COMPLETE.HEADER))
        .then(testIsBrowserNotified(COMMAND_VERIFIED));
    },

    'signin, verify different browser': function () {
      return this.remote
        .then(createUser(email, PASSWORD, {preVerified: true}))
        .then(openPage(SIGNIN_PAGE_URL, selectors.SIGNIN.HEADER, {
          webChannelResponses: {
            [COMMAND_CAN_LINK_ACCOUNT]: {ok: true}
          }
        }))
        .then(testIsBrowserNotified(COMMAND_LOADED))
        .then(fillOutSignIn(email, PASSWORD))

        .then(testElementExists(selectors.CONFIRM_SIGNIN.HEADER))
        .then(testIsBrowserNotified(COMMAND_LOGIN))
        .then(testIsBrowserNotified(COMMAND_CAN_LINK_ACCOUNT))
        .then(noSuchBrowserNotification(COMMAND_VERIFIED))

        // verify the user
        .then(openVerificationLinkInDifferentBrowser(email, 0))

        .then(testElementExists(selectors.SIGNIN_COMPLETE.HEADER))
        .then(testIsBrowserNotified(COMMAND_VERIFIED));
    }
  }
});
