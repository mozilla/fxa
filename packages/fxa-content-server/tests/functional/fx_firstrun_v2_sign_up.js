/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'tests/lib/helpers',
  'tests/functional/lib/helpers'
], function (intern, registerSuite, TestHelpers, FunctionalHelpers) {
  const config = intern.config;
  const PAGE_URL = config.fxaContentRoot + 'signup?context=fx_firstrun_v2&service=sync';

  var email;
  const PASSWORD = '12345678';

  const SELECTOR_CHOOSE_WHAT_TO_SYNC_HEADER = '#fxa-choose-what-to-sync-header';
  const SELECTOR_CHOOSE_WHAT_TO_SYNC_HISTORY_ENTRY = 'div.two-col-block:nth-child(2) > div:nth-child(1) > label:nth-child(1)';
  const SELECTOR_CHOOSE_WHAT_TO_SYNC_PASSWORD_ENTRY = 'div.two-col-block:nth-child(1) > div:nth-child(3) > label:nth-child(1)';
  const SELECTOR_CHOOSE_WHAT_TO_SYNC_SUBMIT = 'button[type=submit]';
  const SELECTOR_CONFIRM_HEADER = '#fxa-confirm-header';
  const SELECTOR_CONNECT_ANOTHER_DEVICE_HEADER = '#fxa-connect-another-device-header';
  const SELECTOR_SEND_SMS_HEADER = '#fxa-send-sms-header';
  const SELECTOR_SIGN_UP_HEADER = '#fxa-signup-header';
  const SELECTOR_SIGN_UP_COMPLETE_HEADER = '#fxa-sign-up-complete-header';

  /*eslint-disable max-len*/
  const UA_STRINGS = {
    'android_chrome': 'Mozilla/5.0 (Linux; Android 4.0.4; Galaxy Nexus Build/IMM76B) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.133 Mobile Safari/535.19',
    'android_firefox': 'Mozilla/5.0 (Android 4.4; Mobile; rv:43.0) Gecko/41.0 Firefox/43.0',
    'ios_firefox': 'Mozilla/5.0 (iPhone; CPU iPhone OS 8_3 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) FxiOS/1.0 Mobile/12F69 Safari/600.1.4',
    'ios_safari': 'Mozilla/5.0 (iPhone; CPU iPhone OS 5_0 like Mac OS X) AppleWebKit/534.46 (KHTML, like Gecko) Version/5.1 Mobile/9A334 Safari/7534.48.3'
  };
  /*eslint-enable max-len*/

  const clearBrowserState = FunctionalHelpers.clearBrowserState;
  const click = FunctionalHelpers.click;
  const closeCurrentWindow = FunctionalHelpers.closeCurrentWindow;
  const fillOutSignUp = FunctionalHelpers.fillOutSignUp;
  const openPage = FunctionalHelpers.openPage;
  const openVerificationLinkInNewTab = FunctionalHelpers.openVerificationLinkInNewTab;
  const openVerificationLinkInSameTab = FunctionalHelpers.openVerificationLinkInSameTab;
  const respondToWebChannelMessage = FunctionalHelpers.respondToWebChannelMessage;
  const testElementExists = FunctionalHelpers.testElementExists;
  const testEmailExpected = FunctionalHelpers.testEmailExpected;
  const testIsBrowserNotified = FunctionalHelpers.testIsBrowserNotified;
  const thenify = FunctionalHelpers.thenify;

  const setupTest = thenify(function () {
    return this.parent
      .then(openPage(PAGE_URL, SELECTOR_SIGN_UP_HEADER))
      .then(respondToWebChannelMessage('fxaccounts:can_link_account', { ok: true } ))

      .then(fillOutSignUp(email, PASSWORD))

      .then(testElementExists(SELECTOR_CHOOSE_WHAT_TO_SYNC_HEADER))
      .then(testIsBrowserNotified('fxaccounts:can_link_account'))

      // uncheck the passwords and history engines
      .then(click(SELECTOR_CHOOSE_WHAT_TO_SYNC_HISTORY_ENTRY))
      .then(click(SELECTOR_CHOOSE_WHAT_TO_SYNC_PASSWORD_ENTRY))
      .then(click(SELECTOR_CHOOSE_WHAT_TO_SYNC_SUBMIT))

      // user should be transitioned to the "go confirm your address" page
      .then(testElementExists(SELECTOR_CONFIRM_HEADER))
      // the login message is only sent after the sync preferences screen
      // has been cleared.
      .then(testIsBrowserNotified('fxaccounts:login'));
  });

  const verifyMobileTest = thenify(function (uaString) {
    return this.parent
      .then(setupTest())

      // verify the user
      .then(openVerificationLinkInNewTab(email, 0, {
        query: {
          forceExperiment: 'sendSms',
          forceExperimentGroup: 'treatment',
          forceUA: uaString
        }
      }))
      .switchToWindow('newwindow')

      // mobile users are ineligible to send an SMS, they should be redirected
      // to the "connect another device" screen
      .then(testElementExists(SELECTOR_CONNECT_ANOTHER_DEVICE_HEADER))

      // switch back to the original window, it should transition.
      .then(closeCurrentWindow())
      .then(testElementExists(SELECTOR_SIGN_UP_COMPLETE_HEADER));
  });

  registerSuite({
    name: 'Firstrun Sync v2 sign_up',

    beforeEach: function () {
      email = TestHelpers.createEmail();
      return this.remote
        .then(clearBrowserState());
    },

    afterEach: function () {
      return this.remote
        .then(clearBrowserState());
    },

    'sign up, verify same browser': function () {
      return this.remote
        .then(setupTest())

        // verify the user
        .then(openVerificationLinkInNewTab(email, 0))
        .switchToWindow('newwindow')

        // user should be redirected to "Success!" screen.
        // In real life, the original browser window would show
        // a "welcome to sync!" screen that has a manage button
        // on it, and this screen should show the FxA success screen.
        .then(testElementExists(SELECTOR_CONNECT_ANOTHER_DEVICE_HEADER))

        // switch back to the original window, it should transition.
        .then(closeCurrentWindow())
        .then(testElementExists(SELECTOR_SIGN_UP_COMPLETE_HEADER))
        // A post-verification email should be sent, this is Sync.
        .then(testEmailExpected(email, 1));
    },

    'sign up, verify different browser, force SMS': function () {
      return this.remote
        .then(setupTest())
        // clear browser state to synthesize opening in a different browser
        .then(clearBrowserState({ force: true }))
        // verify the user in a different browser, they should see the
        // "connect another device" screen.
        .then(openVerificationLinkInSameTab(email, 0, {
          query: {
            forceExperiment: 'sendSms',
            forceExperimentGroup: 'treatment'
          }
        }))
        .then(testElementExists(SELECTOR_CONNECT_ANOTHER_DEVICE_HEADER));
    },

    'sign up, verify same browser, force SMS': function () {
      return this.remote
        .then(setupTest())

        // verify the user
        .then(openVerificationLinkInNewTab(email, 0, {
          query: {
            forceExperiment: 'sendSms',
            forceExperimentGroup: 'treatment'
          }
        }))
        .switchToWindow('newwindow')

        // user should be redirected to "Send SMS" screen.
        .then(testElementExists(SELECTOR_SEND_SMS_HEADER))

        // switch back to the original window, it should transition.
        .then(closeCurrentWindow())
        .then(testElementExists(SELECTOR_SIGN_UP_COMPLETE_HEADER));
    },

    'sign up, verify Chrome on Android, force SMS sends to connect_another_device': function () {
      return this.remote
        .then(verifyMobileTest(UA_STRINGS['android_chrome']));
    },

    'sign up, verify Firefox on Android, force SMS sends to connect_another_device': function () {
      return this.remote
        .then(verifyMobileTest(UA_STRINGS['android_firefox']));
    },

    'sign up, verify Firefox on iOS, force SMS sends to connect_another_device': function () {
      return this.remote
        .then(verifyMobileTest(UA_STRINGS['ios_firefox']));
    },

    'sign up, verify Safari on iOS, force SMS sends to connect_another_device': function () {
      return this.remote
        .then(verifyMobileTest(UA_STRINGS['ios_safari']));
    },
  });
});
