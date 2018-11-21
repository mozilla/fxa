/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const TestHelpers = require('../lib/helpers');
const FunctionalHelpers = require('./lib/helpers');
var config = intern._config;

var PASSWORD = 'passwordzxcv';
var RESET_PASSWORD_URL = config.fxaContentRoot + 'reset_password?context=fx_desktop_v2&service=sync&forceAboutAccounts=true&automatedBrowser=true';

var email;

var click = FunctionalHelpers.click;
var clearBrowserState = FunctionalHelpers.clearBrowserState;
var closeCurrentWindow = FunctionalHelpers.closeCurrentWindow;
var createUser = FunctionalHelpers.createUser;
var fillOutResetPassword = FunctionalHelpers.fillOutResetPassword;
var fillOutCompleteResetPassword = FunctionalHelpers.fillOutCompleteResetPassword;
var noSuchBrowserNotification = FunctionalHelpers.noSuchBrowserNotification;
var openPage = FunctionalHelpers.openPage;
var openVerificationLinkInNewTab = FunctionalHelpers.openVerificationLinkInNewTab;
var switchToWindow = FunctionalHelpers.switchToWindow;
var testElementExists = FunctionalHelpers.testElementExists;
var testIsBrowserNotified = FunctionalHelpers.testIsBrowserNotified;
var testSuccessWasShown = FunctionalHelpers.testSuccessWasShown;

registerSuite('Firefox Desktop Sync v2 reset password', {
  beforeEach: function () {
    // timeout after 90 seconds
    this.timeout = 90000;

    email = TestHelpers.createEmail();
    return this.remote.then(clearBrowserState());
  },

  afterEach: function () {
    // clear localStorage to avoid polluting other tests.
    return this.remote.then(clearBrowserState());
  },
  tests: {
    'reset password, verify same browser': function () {
      return this.remote
        .then(openPage(RESET_PASSWORD_URL, '#fxa-reset-password-header'))
        .then(createUser(email, PASSWORD, {preVerified: true}))
        .then(fillOutResetPassword(email))

        .then(testElementExists('#fxa-confirm-reset-password-header'))
        .then(openVerificationLinkInNewTab(email, 0))

        .then(switchToWindow(1))

        .then(testElementExists('#fxa-complete-reset-password-header'))
        .then(fillOutCompleteResetPassword(PASSWORD, PASSWORD))

        .then(testElementExists('#fxa-reset-password-complete-header'))
        .then(testElementExists('.account-ready-service'))

        // the verification tab sends the WebChannel message. This fixes
        // two problems: 1) initiating tab is closed, 2) The initiating
        // tab when running in E10s does not have all the necessary data
        // because localStorage is not shared.
        .then(testIsBrowserNotified('fxaccounts:login'))

        .then(closeCurrentWindow())

        .then(testSuccessWasShown())
        // Only expect the login message in the verification tab to avoid
        // a race condition within the browser when it receives two login messages.
        .then(noSuchBrowserNotification('fxaccounts:login'));
    },

    'reset password with a restmail address, get the open webmail button': function () {
      this.timeout = 90000;

      return this.remote
        .then(openPage(RESET_PASSWORD_URL, '#fxa-reset-password-header'))
        .then(createUser(email, PASSWORD, {preVerified: true}))
        .then(fillOutResetPassword(email))

        .then(testElementExists('#fxa-confirm-reset-password-header'))
        .then(click('[data-webmail-type="restmail"]'))

        .then(switchToWindow(1))
        // wait until url is correct
        .then(FunctionalHelpers.pollUntil(function (email) {
          return window.location.pathname.endsWith(email);
        }, [email], 10000))
        .then(closeCurrentWindow())

        .then(testElementExists('#fxa-confirm-reset-password-header'));
    }
  }
});
