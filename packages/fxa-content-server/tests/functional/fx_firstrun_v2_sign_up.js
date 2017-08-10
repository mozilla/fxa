/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'tests/lib/helpers',
  'tests/functional/lib/helpers',
  'tests/functional/lib/selectors',
  'tests/functional/lib/ua-strings'
], function (intern, registerSuite, TestHelpers, FunctionalHelpers, selectors, UA_STRINGS) {
  const config = intern.config;
  const PAGE_URL = config.fxaContentRoot + 'signup?context=fx_firstrun_v2&service=sync';

  var email;
  const PASSWORD = '12345678';

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
      .then(openPage(PAGE_URL, selectors.SIGNUP.HEADER, options))
      .then(visibleByQSA(selectors.SIGNUP.SUB_HEADER))
      .then(respondToWebChannelMessage('fxaccounts:can_link_account', { ok: true } ))

      .then(fillOutSignUp(email, PASSWORD))

      .then(testElementExists(selectors.CHOOSE_WHAT_TO_SYNC.HEADER))
      .then(testIsBrowserNotified('fxaccounts:can_link_account'))

      // uncheck the passwords and history engines
      .then(click(selectors.CHOOSE_WHAT_TO_SYNC.ENGINE_HISTORY))
      .then(click(selectors.CHOOSE_WHAT_TO_SYNC.ENGINE_PASSWORDS))
      .then(click(selectors.CHOOSE_WHAT_TO_SYNC.SUBMIT))

      // user should be transitioned to the "go confirm your address" page
      .then(testElementExists(selectors.CONFIRM_SIGNUP.HEADER))
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
      .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.HEADER))

      // switch back to the original window, user should be
      // able to send an SMS.
      .then(closeCurrentWindow())
      .then(testElementExists(selectors.SMS_SEND.HEADER));
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

    'sign up, user verifies at CWTS': function () {
      return this.remote
        .then(openPage(PAGE_URL, selectors.SIGNUP.HEADER, {
          webChannelResponses: {
            'fxaccounts:can_link_account': { ok: true }
          }
        }))
        .then(visibleByQSA(selectors.SIGNUP.SUB_HEADER))

        .then(fillOutSignUp(email, PASSWORD))

        .then(testElementExists(selectors.CHOOSE_WHAT_TO_SYNC.HEADER))
        .then(testIsBrowserNotified('fxaccounts:can_link_account'))
        .then(openVerificationLinkInDifferentBrowser(email, 0))

        // user should be transitioned straight to the "your address is confirmed"
        .then(testElementExists(selectors.SIGNUP_COMPLETE.HEADER))
        // the login message is sent automatically.
        .then(testIsBrowserNotified('fxaccounts:login'));
    },

    'sign up, verify same browser': function () {
      return this.remote
        .then(setupTest())

        // verify the user
        .then(openVerificationLinkInNewTab(email, 0))
        .switchToWindow('newwindow')

        // user should see the CAD screen in both signup and verification tabs.
        .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.HEADER))

        // switch back to the original window, it should transition to CAD.
        .then(closeCurrentWindow())
        .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.HEADER))
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
        .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.HEADER))

        // clear browser state to synthesize opening in a different browser
        .then(clearBrowserState({ force: true }))
        // verify the user in a different browser, they should see the
        // "connect another device" screen.
        .then(openVerificationLinkInSameTab(email, 0))
        .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.HEADER));
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
        .then(testElementExists(selectors.SMS_SEND.HEADER))

        // clear browser state to synthesize opening in a different browser
        .then(clearBrowserState({ force: true }))
        // verify the user in a different browser, they should see the
        // "connect another device" screen.
        .then(openVerificationLinkInSameTab(email, 0, options))
        .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.HEADER));
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
        .then(testElementExists(selectors.SMS_SEND.HEADER))
        .then(testAttributeEquals(selectors.SMS_SEND.PHONE_NUMBER, 'data-country', 'CA'))

        // switch back to the original window, it should transition to the verification tab.
        .then(closeCurrentWindow())
        .then(testElementExists(selectors.SMS_SEND.HEADER));
    },

    'sign up, force SMS, force unsupported country in signup tab': function () {
      return this.remote
        .then(openPage(PAGE_URL, selectors['400'].HEADER, {
          query: {
            country: 'ZZ',
            forceExperiment: 'sendSms',
            forceExperimentGroup: 'treatment'
          }
        }))
        .then(testElementTextInclude(selectors['400'].ERROR, 'country'));
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
        .then(testElementExists(selectors['400'].HEADER))
        .then(testElementTextInclude(selectors['400'].ERROR, 'country'))

        // switch back to the original window, it should not transition,
        // the invalid country prevents the verification code from being sent.
        .then(closeCurrentWindow())
        .then(testElementExists(selectors.CONFIRM_SIGNUP.HEADER));
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
