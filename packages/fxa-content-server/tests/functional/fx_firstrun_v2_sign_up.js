/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'tests/lib/helpers',
  'tests/functional/lib/helpers',
  'tests/functional/lib/ua-strings'
], function (intern, registerSuite, TestHelpers, FunctionalHelpers, UA_STRINGS) {
  const config = intern.config;
  const PAGE_URL = config.fxaContentRoot + 'signup?context=fx_firstrun_v2&service=sync';

  var email;
  const PASSWORD = '12345678';

  const SELECTOR_400_HEADER = '#fxa-400-header';
  const SELECTOR_400_ERROR = '.error';
  const SELECTOR_CHOOSE_WHAT_TO_SYNC_HEADER = '#fxa-choose-what-to-sync-header';
  const SELECTOR_CHOOSE_WHAT_TO_SYNC_HISTORY_ENTRY = 'div.two-col-block:nth-child(2) > div:nth-child(1) > label:nth-child(1)';
  const SELECTOR_CHOOSE_WHAT_TO_SYNC_PASSWORD_ENTRY = 'div.two-col-block:nth-child(1) > div:nth-child(3) > label:nth-child(1)';
  const SELECTOR_CHOOSE_WHAT_TO_SYNC_SUBMIT = 'button[type=submit]';
  const SELECTOR_CONFIRM_HEADER = '#fxa-confirm-header';
  const SELECTOR_CONNECT_ANOTHER_DEVICE_HEADER = '#fxa-connect-another-device-header';
  const SELECTOR_SEND_SMS_HEADER = '#fxa-send-sms-header';
  const SELECTOR_SEND_SMS_PHONE_NUMBER = 'input[type="tel"]';
  const SELECTOR_SIGN_UP_HEADER = '#fxa-signup-header';
  const SELECTOR_SIGN_UP_SUB_HEADER = '#fxa-signup-header .service';

  const clearBrowserState = FunctionalHelpers.clearBrowserState;
  const click = FunctionalHelpers.click;
  const closeCurrentWindow = FunctionalHelpers.closeCurrentWindow;
  const fillOutSignUp = FunctionalHelpers.fillOutSignUp;
  const openPage = FunctionalHelpers.openPage;
  const openVerificationLinkInDifferentBrowser = FunctionalHelpers.openVerificationLinkInDifferentBrowser;
  const openVerificationLinkInNewTab = FunctionalHelpers.openVerificationLinkInNewTab;
  const openVerificationLinkInSameTab = FunctionalHelpers.openVerificationLinkInSameTab;
  const respondToWebChannelMessage = FunctionalHelpers.respondToWebChannelMessage;
  const testAttributeEquals = FunctionalHelpers.testAttributeEquals;
  const testElementExists = FunctionalHelpers.testElementExists;
  const testElementTextInclude = FunctionalHelpers.testElementTextInclude;
  const testEmailExpected = FunctionalHelpers.testEmailExpected;
  const testIsBrowserNotified = FunctionalHelpers.testIsBrowserNotified;
  const thenify = FunctionalHelpers.thenify;
  const visibleByQSA = FunctionalHelpers.visibleByQSA;

  const setupTest = thenify(function (options) {
    return this.parent
      .then(openPage(PAGE_URL, SELECTOR_SIGN_UP_HEADER, options))
      .then(visibleByQSA(SELECTOR_SIGN_UP_SUB_HEADER))
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

  const verifyMobileTest = thenify(function (verificationUaString) {
    const query = {
      country: 'US',
      forceExperiment: 'sendSms',
      forceExperimentGroup: 'treatment'
    };

    const signupOptions = { query };

    const verificationQuery = Object.create(query);
    verificationQuery.forceUA = verificationUaString;
    const verificationOptions = {
      query: verificationQuery
    };

    return this.parent
      .then(setupTest(signupOptions))
      // These all synthesize the user verifying on a mobile device
      // instead of on the same device. Clear browser state.
      .then(clearBrowserState())

      // verify the user
      .then(openVerificationLinkInNewTab(email, 0, verificationOptions))
      .switchToWindow('newwindow')

      // mobile users are ineligible to send an SMS, they should be redirected
      // to the "connect another device" screen
      .then(testElementExists(SELECTOR_CONNECT_ANOTHER_DEVICE_HEADER))

      // switch back to the original window, user should be
      // able to send an SMS.
      .then(closeCurrentWindow())
      .then(testElementExists(SELECTOR_SEND_SMS_HEADER));
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

        // user should see the CAD screen in both signup and verification tabs.
        .then(testElementExists(SELECTOR_CONNECT_ANOTHER_DEVICE_HEADER))

        // switch back to the original window, it should transition to CAD.
        .then(closeCurrentWindow())
        .then(testElementExists(SELECTOR_CONNECT_ANOTHER_DEVICE_HEADER))
        // A post-verification email should be sent, this is Sync.
        .then(testEmailExpected(email, 1));
    },

    'sign up, verify different browser': function () {
      return this.remote
        .then(setupTest())
        // First, synthesize opening the verification link in a different browser
        // to see how the original browser reacts. Then, use this browser to
        // synthesize what the other browser sees.
        .then(openVerificationLinkInDifferentBrowser(email, 0))
        .then(testElementExists(SELECTOR_CONNECT_ANOTHER_DEVICE_HEADER))

        // clear browser state to synthesize opening in a different browser
        .then(clearBrowserState({ force: true }))
        // verify the user in a different browser, they should see the
        // "connect another device" screen.
        .then(openVerificationLinkInSameTab(email, 0))
        .then(testElementExists(SELECTOR_CONNECT_ANOTHER_DEVICE_HEADER));
    },

    'sign up, verify different browser, force SMS': function () {
      const options =  {
        query: {
          forceExperiment: 'sendSms',
          forceExperimentGroup: 'treatment'
        }
      };

      return this.remote
        .then(setupTest(options))
        // First, synthesize opening the verification link in a different browser
        // to see how the original browser reacts. Then, use this browser to
        // synthesize what the other browser sees.
        .then(openVerificationLinkInDifferentBrowser(email, 0))
        .then(testElementExists(SELECTOR_SEND_SMS_HEADER))

        // clear browser state to synthesize opening in a different browser
        .then(clearBrowserState({ force: true }))
        // verify the user in a different browser, they should see the
        // "connect another device" screen.
        .then(openVerificationLinkInSameTab(email, 0, options))
        .then(testElementExists(SELECTOR_CONNECT_ANOTHER_DEVICE_HEADER));
    },

    'sign up, verify same browser, force SMS, force supported country': function () {
      const options =  {
        query: {
          country: 'CA',
          forceExperiment: 'sendSms',
          forceExperimentGroup: 'treatment'
        }
      };

      return this.remote
        .then(setupTest(options))

        // verify the user
        .then(openVerificationLinkInNewTab(email, 0, options))
        .switchToWindow('newwindow')

        // user should be redirected to "Send SMS" screen.
        .then(testElementExists(SELECTOR_SEND_SMS_HEADER))
        .then(testAttributeEquals(SELECTOR_SEND_SMS_PHONE_NUMBER, 'data-country', 'CA'))

        // switch back to the original window, it should transition to the verification tab.
        .then(closeCurrentWindow())
        .then(testElementExists(SELECTOR_SEND_SMS_HEADER));
    },

    'sign up, force SMS, force unsupported country in signup tab': function () {
      return this.remote
        .then(openPage(PAGE_URL, SELECTOR_400_HEADER, {
          query: {
            country: 'ZZ',
            forceExperiment: 'sendSms',
            forceExperimentGroup: 'treatment'
          }
        }))
        .then(testElementTextInclude(SELECTOR_400_ERROR, 'country'));
    },

    'sign up, verify same browser, force SMS, force unsupported country in verification tab': function () {
      return this.remote
        .then(setupTest())

        // verify the user
        .then(openVerificationLinkInNewTab(email, 0, {
          query: {
            country: 'ZZ',
            forceExperiment: 'sendSms',
            forceExperimentGroup: 'treatment'
          }
        }))
        .switchToWindow('newwindow')

        // user should be redirected to the 400 page, `country` is invalid
        .then(testElementExists(SELECTOR_400_HEADER))
        .then(testElementTextInclude(SELECTOR_400_ERROR, 'country'))

        // switch back to the original window, it should not transition,
        // the invalid country prevents the verification code from being sent.
        .then(closeCurrentWindow())
        .then(testElementExists(SELECTOR_CONFIRM_HEADER));
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
