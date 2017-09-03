/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'tests/lib/helpers',
  'tests/functional/lib/helpers',
  'tests/functional/lib/ua-strings',
  'tests/functional/lib/selectors'
], function (intern, registerSuite, TestHelpers, FunctionalHelpers, UA_STRINGS, selectors) {
  'use strict';

  const config = intern.config;

  const ADJUST_LINK_ANDROID =
    'https://app.adjust.com/2uo1qc?campaign=fxa-conf-page&' +
    'creative=button-autumn-2016-connect-another-device&adgroup=android';

  const ADJUST_LINK_IOS =
    'https://app.adjust.com/2uo1qc?campaign=fxa-conf-page&' +
    'creative=button-autumn-2016-connect-another-device&adgroup=ios&' +
    'fallback=https://itunes.apple.com/app/apple-store/id989804926?pt=373246&' +
    'ct=adjust_tracker&mt=8';

  const CONNECT_ANOTHER_DEVICE_URL = `${config.fxaContentRoot}connect_another_device`;
  const SIGNIN_DESKTOP_URL = `${config.fxaContentRoot}signin?context=fx_desktop_v3&service=sync`;
  const SIGNUP_FENNEC_URL = `${config.fxaContentRoot}signup?context=fx_fennec_v1&service=sync`;
  const SIGNUP_DESKTOP_URL = `${config.fxaContentRoot}signup?context=fx_desktop_v3&service=sync`;

  const SYNC_CONTEXT_ANDROID = 'context=fx_fennec_v1';
  const SYNC_CONTEXT_DESKTOP = 'context=fx_desktop_v3';
  const SYNC_SERVICE = 'service=sync';

  const CHANNEL_COMMAND_CAN_LINK_ACCOUNT = 'fxaccounts:can_link_account';
  const CONNECT_ANOTHER_DEVICE_ENTRYPOINT = `entrypoint=${encodeURIComponent('fxa:connect_another_device')}`;

  const {
    clearBrowserState,
    click,
    createUser,
    fillOutSignIn,
    fillOutSignUp,
    noSuchElement,
    openPage,
    openVerificationLinkInSameTab,
    respondToWebChannelMessage,
    testElementExists,
    testElementTextInclude,
    testElementValueEquals,
    testHrefEquals,
    testUrlInclude,
    testUrlPathnameEquals,
  } = FunctionalHelpers;

  let email;
  const PASSWORD = '12345678';

  registerSuite({
    name: 'connect_another_device',

    beforeEach: function () {
      email = TestHelpers.createEmail('sync{id}');

      return this.remote.then(clearBrowserState());
    },

    'sign up Fx Desktop, load /connect_another_device page': function () {
      // should have both links to mobile apps
      return this.remote
        .then(openPage(SIGNUP_DESKTOP_URL, selectors.SIGNUP.HEADER, {
          forceUA: UA_STRINGS['desktop_firefox']
        }))
        .then(respondToWebChannelMessage(CHANNEL_COMMAND_CAN_LINK_ACCOUNT, { ok: true } ))
        .then(fillOutSignUp(email, PASSWORD))
        .then(testElementExists(selectors.CHOOSE_WHAT_TO_SYNC.HEADER))

        .then(openPage(CONNECT_ANOTHER_DEVICE_URL, selectors.CONNECT_ANOTHER_DEVICE.HEADER))
        .then(noSuchElement(selectors.CONNECT_ANOTHER_DEVICE.SIGNIN_BUTTON))
        .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.TEXT_INSTALL_FX_DESKTOP))
        .then(testHrefEquals(selectors.CONNECT_ANOTHER_DEVICE.LINK_INSTALL_IOS, ADJUST_LINK_IOS))
        .then(testHrefEquals(selectors.CONNECT_ANOTHER_DEVICE.LINK_INSTALL_ANDROID, ADJUST_LINK_ANDROID));
    },

    'sign up Fx Desktop, verify same browser': function () {
      // should have both links to mobile apps
      return this.remote
        .then(openPage(SIGNUP_DESKTOP_URL, selectors.SIGNUP.HEADER, {
          forceUA: UA_STRINGS['desktop_firefox']
        }))
        .then(respondToWebChannelMessage(CHANNEL_COMMAND_CAN_LINK_ACCOUNT, { ok: true } ))
        .then(fillOutSignUp(email, PASSWORD))
        .then(testElementExists(selectors.CHOOSE_WHAT_TO_SYNC.HEADER))
        .then(click(selectors.CHOOSE_WHAT_TO_SYNC.SUBMIT))

        .then(testElementExists(selectors.CONFIRM_SIGNUP.HEADER))

        .then(openVerificationLinkInSameTab(email, 0))
        .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.HEADER))
        .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.SUCCESS_SAME_BROWSER))
        .then(noSuchElement(selectors.CONNECT_ANOTHER_DEVICE.SIGNIN_BUTTON))
        .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.TEXT_INSTALL_FX_DESKTOP))
        .then(testHrefEquals(selectors.CONNECT_ANOTHER_DEVICE.LINK_INSTALL_IOS, ADJUST_LINK_IOS))
        .then(testHrefEquals(selectors.CONNECT_ANOTHER_DEVICE.LINK_INSTALL_ANDROID, ADJUST_LINK_ANDROID));
    },

    'sign up Fx Desktop, verify different Fx Desktop': function () {
      // should sign in to sync here
      return this.remote
        .then(openPage(SIGNUP_DESKTOP_URL, selectors.SIGNUP.HEADER, {
          forceUA: UA_STRINGS['desktop_firefox']
        }))
        .then(respondToWebChannelMessage(CHANNEL_COMMAND_CAN_LINK_ACCOUNT, { ok: true } ))
        // this tests needs to sign up so that we can check if the email gets prefilled
        .then(fillOutSignUp(email, PASSWORD))
        .then(testElementExists(selectors.CHOOSE_WHAT_TO_SYNC.HEADER))
        .then(click(selectors.CHOOSE_WHAT_TO_SYNC.SUBMIT))

        .then(testElementExists(selectors.CONFIRM_SIGNUP.HEADER))

        // clear browser state to synthesize verifying in a different browser.
        .then(clearBrowserState())

        .then(openVerificationLinkInSameTab(email, 0))
        .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.SUCCESS_DIFFERENT_BROWSER))

        // ask "why must I do this?"
        .then(click(selectors.CONNECT_ANOTHER_DEVICE.LINK_WHY_IS_THIS_REQUIRED))
        .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE_WHY_IS_THIS_REQUIRED.HEADER))
        // leave the help text
        .then(click(selectors.CONNECT_ANOTHER_DEVICE_WHY_IS_THIS_REQUIRED.CLOSE))

        .then(click(selectors.CONNECT_ANOTHER_DEVICE.SIGNIN_BUTTON))

        .then(testElementExists(selectors.SIGNIN.HEADER))
        .then(testElementValueEquals(selectors.SIGNIN.EMAIL, email))
        .then(testUrlPathnameEquals('/signin'))
        .then(testUrlInclude(SYNC_CONTEXT_DESKTOP))
        .then(testUrlInclude(SYNC_SERVICE))
        .then(testUrlInclude(CONNECT_ANOTHER_DEVICE_ENTRYPOINT));
    },

    'sign in Fx Desktop, verify same browser': function () {
      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(openPage(SIGNIN_DESKTOP_URL, selectors.SIGNIN.HEADER, {
          forceUA: UA_STRINGS['desktop_firefox']
        }))
        .then(respondToWebChannelMessage(CHANNEL_COMMAND_CAN_LINK_ACCOUNT, { ok: true } ))
        .then(fillOutSignIn(email, PASSWORD))
        .then(testElementExists(selectors.CONFIRM_SIGNIN.HEADER))
        .then(openVerificationLinkInSameTab(email, 0))
        // Does not work for sign in, even if forced.
        .then(testElementExists(selectors.SIGNIN_COMPLETE.HEADER));
    },

    'sign up Fx Desktop, verify different Fx Desktop with another user already signed in': function () {
      const signInEmail = TestHelpers.createEmail('sync{id}');
      const signUpEmail = email;

      return this.remote
        // preVerified: false causes the "verify account" email to be sent,
        // that's used later to verify.
        .then(createUser(signUpEmail, PASSWORD, { preVerified: false }))
        .then(createUser(signInEmail, PASSWORD, { preVerified: true }))

        .then(openPage(SIGNIN_DESKTOP_URL, selectors.SIGNIN.HEADER, {
          forceUA: UA_STRINGS['desktop_firefox']
        }))
        .then(respondToWebChannelMessage(CHANNEL_COMMAND_CAN_LINK_ACCOUNT, { ok: true } ))
        .then(fillOutSignIn(signInEmail, PASSWORD))
        .then(testElementExists(selectors.CONFIRM_SIGNIN.HEADER))
        .then(openVerificationLinkInSameTab(signInEmail, 0))
        // Does not work for sign in, even if forced.
        .then(testElementExists(selectors.SIGNIN_COMPLETE.HEADER))

        // NOW - go back and open the verification link for the sign up user in a
        // browser where another user is already signed in.
        .then(openVerificationLinkInSameTab(signUpEmail, 0))
        // User goes to the old "Account verified" screen.
        .then(testElementExists(selectors.SIGNUP_COMPLETE.HEADER));
    },

    'sign up Fx Desktop, verify in Fennec': function () {
      // should navigate to sign in and have the email prefilled
      return this.remote
        .then(openPage(SIGNUP_DESKTOP_URL, selectors.SIGNUP.HEADER, {
          forceUA: UA_STRINGS['desktop_firefox']
        }))
        .then(respondToWebChannelMessage(CHANNEL_COMMAND_CAN_LINK_ACCOUNT, { ok: true } ))
        // this tests needs to sign up so that we can check if the email gets prefilled
        .then(fillOutSignUp(email, PASSWORD))
        .then(testElementExists(selectors.CHOOSE_WHAT_TO_SYNC.HEADER))
        .then(click(selectors.CHOOSE_WHAT_TO_SYNC.SUBMIT))

        .then(testElementExists(selectors.CONFIRM_SIGNUP.HEADER))

        // clear browser state to synthesize verifying in an Android browser.
        .then(clearBrowserState())

        .then(openVerificationLinkInSameTab(email, 0, {
          query: {
            forceUA: UA_STRINGS['android_firefox']
          }
        }))
        .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.SUCCESS_DIFFERENT_BROWSER))

        // ask "why must I do this?"
        .then(click(selectors.CONNECT_ANOTHER_DEVICE.LINK_WHY_IS_THIS_REQUIRED))
        .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE_WHY_IS_THIS_REQUIRED.HEADER))
        // leave the help text
        .then(click(selectors.CONNECT_ANOTHER_DEVICE_WHY_IS_THIS_REQUIRED.CLOSE))

        .then(click(selectors.CONNECT_ANOTHER_DEVICE.SIGNIN_BUTTON))

        .then(testElementExists(selectors.SIGNIN.HEADER))
        .then(testElementValueEquals(selectors.SIGNIN.EMAIL, email))
        .then(testUrlPathnameEquals('/signin'))
        .then(testUrlInclude(SYNC_CONTEXT_ANDROID))
        .then(testUrlInclude(SYNC_SERVICE))
        .then(testUrlInclude(CONNECT_ANOTHER_DEVICE_ENTRYPOINT));
    },


    'sign up Fx Desktop, verify in Fx for iOS': function () {
      return this.remote
        .then(openPage(SIGNUP_DESKTOP_URL, selectors.SIGNUP.HEADER, {
          forceUA: UA_STRINGS['desktop_firefox']
        }))
        .then(respondToWebChannelMessage(CHANNEL_COMMAND_CAN_LINK_ACCOUNT, { ok: true } ))
        .then(fillOutSignUp(email, PASSWORD))
        .then(testElementExists(selectors.CHOOSE_WHAT_TO_SYNC.HEADER))
        .then(click(selectors.CHOOSE_WHAT_TO_SYNC.SUBMIT))

        .then(testElementExists(selectors.CONFIRM_SIGNUP.HEADER))

        // clear browser state to synthesize verifying in an Android browser.
        .then(clearBrowserState())

        .then(openVerificationLinkInSameTab(email, 0, {
          query: {
            forceUA: UA_STRINGS['ios_firefox']
          }
        }))
        .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.SUCCESS_DIFFERENT_BROWSER))

        // ask "why must I do this?"
        .then(click(selectors.CONNECT_ANOTHER_DEVICE.LINK_WHY_IS_THIS_REQUIRED))
        .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE_WHY_IS_THIS_REQUIRED.HEADER))
        // leave the help text
        .then(click(selectors.CONNECT_ANOTHER_DEVICE_WHY_IS_THIS_REQUIRED.CLOSE))

        .then(noSuchElement(selectors.CONNECT_ANOTHER_DEVICE.SIGNIN_BUTTON))
        .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.TEXT_SIGNIN_FXIOS))
        .then(noSuchElement(selectors.CONNECT_ANOTHER_DEVICE.LINK_INSTALL_ANDROID))
        .then(noSuchElement(selectors.CONNECT_ANOTHER_DEVICE.LINK_INSTALL_IOS));
    },

    'sign up Fx Desktop, verify in Android Chrome': function () {
      // should show adjust Google badge
      return this.remote
        .then(openPage(SIGNUP_DESKTOP_URL, selectors.SIGNUP.HEADER, {
          forceUA: UA_STRINGS['desktop_firefox']
        }))
        .then(respondToWebChannelMessage(CHANNEL_COMMAND_CAN_LINK_ACCOUNT, { ok: true } ))
        .then(fillOutSignUp(email, PASSWORD))
        .then(testElementExists(selectors.CHOOSE_WHAT_TO_SYNC.HEADER))
        .then(click(selectors.CHOOSE_WHAT_TO_SYNC.SUBMIT))

        .then(testElementExists(selectors.CONFIRM_SIGNUP.HEADER))

        // clear browser state to synthesize verifying in an Android browser.
        .then(clearBrowserState())

        .then(openVerificationLinkInSameTab(email, 0, {
          query: {
            forceUA: UA_STRINGS['android_chrome']
          }
        }))
        .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.SUCCESS_DIFFERENT_BROWSER))
        .then(testElementTextInclude(selectors.CONNECT_ANOTHER_DEVICE.SUCCESS_DIFFERENT_BROWSER, 'email verified'))

        // ask "why must I do this?"
        .then(click(selectors.CONNECT_ANOTHER_DEVICE.LINK_WHY_IS_THIS_REQUIRED))
        .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE_WHY_IS_THIS_REQUIRED.HEADER))
        // leave the help text
        .then(click(selectors.CONNECT_ANOTHER_DEVICE_WHY_IS_THIS_REQUIRED.CLOSE))

        .then(noSuchElement(selectors.CONNECT_ANOTHER_DEVICE.SIGNIN_BUTTON))
        .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.TEXT_INSTALL_FX_ANDROID))
        .then(noSuchElement(selectors.CONNECT_ANOTHER_DEVICE.LINK_INSTALL_IOS))
        .then(testHrefEquals(selectors.CONNECT_ANOTHER_DEVICE.LINK_INSTALL_ANDROID, ADJUST_LINK_ANDROID))

        .refresh()

        .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.SUCCESS_DIFFERENT_BROWSER))
        .then(testElementTextInclude(selectors.CONNECT_ANOTHER_DEVICE.SUCCESS_DIFFERENT_BROWSER, 'email verified'));
    },

    'sign up Fx Desktop, verify in Chrome Desktop': function () {
      // should show adjust Google badge
      return this.remote
        .then(openPage(SIGNUP_DESKTOP_URL, selectors.SIGNUP.HEADER, {
          forceUA: UA_STRINGS['desktop_firefox']
        }))
        .then(respondToWebChannelMessage(CHANNEL_COMMAND_CAN_LINK_ACCOUNT, { ok: true } ))
        .then(fillOutSignUp(email, PASSWORD))
        .then(testElementExists(selectors.CHOOSE_WHAT_TO_SYNC.HEADER))
        .then(click(selectors.CHOOSE_WHAT_TO_SYNC.SUBMIT))

        .then(testElementExists(selectors.CONFIRM_SIGNUP.HEADER))

        // clear browser state to synthesize verifying in an Android browser.
        .then(clearBrowserState())

        .then(openVerificationLinkInSameTab(email, 0, {
          query: {
            forceUA: UA_STRINGS['desktop_chrome']
          }
        }))
        .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.SUCCESS_DIFFERENT_BROWSER))

        // ask "why must I do this?"
        .then(click(selectors.CONNECT_ANOTHER_DEVICE.LINK_WHY_IS_THIS_REQUIRED))
        .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE_WHY_IS_THIS_REQUIRED.HEADER))
        // leave the help text
        .then(click(selectors.CONNECT_ANOTHER_DEVICE_WHY_IS_THIS_REQUIRED.CLOSE))
        .then(noSuchElement(selectors.CONNECT_ANOTHER_DEVICE.SIGNIN_BUTTON))
        .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.TEXT_INSTALL_FROM_OTHER))
        .then(testHrefEquals(selectors.CONNECT_ANOTHER_DEVICE.LINK_INSTALL_IOS, ADJUST_LINK_IOS))
        .then(testHrefEquals(selectors.CONNECT_ANOTHER_DEVICE.LINK_INSTALL_ANDROID, ADJUST_LINK_ANDROID));
    },

    'sign up Fx Desktop, verify in iOS Safari': function () {
      return this.remote
        .then(openPage(SIGNUP_DESKTOP_URL, selectors.SIGNUP.HEADER, {
          forceUA: UA_STRINGS['desktop_firefox']
        }))
        .then(respondToWebChannelMessage(CHANNEL_COMMAND_CAN_LINK_ACCOUNT, { ok: true } ))
        .then(fillOutSignUp(email, PASSWORD))
        .then(testElementExists(selectors.CHOOSE_WHAT_TO_SYNC.HEADER))
        .then(click(selectors.CHOOSE_WHAT_TO_SYNC.SUBMIT))

        .then(testElementExists(selectors.CONFIRM_SIGNUP.HEADER))

        // clear browser state to synthesize verifying in an Android browser.
        .then(clearBrowserState())

        .then(openVerificationLinkInSameTab(email, 0, {
          query: {
            forceUA: UA_STRINGS['ios_safari']
          }
        }))
        .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.SUCCESS_DIFFERENT_BROWSER))

        // ask "why must I do this?"
        .then(click(selectors.CONNECT_ANOTHER_DEVICE.LINK_WHY_IS_THIS_REQUIRED))
        .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE_WHY_IS_THIS_REQUIRED.HEADER))
        // leave the help text
        .then(click(selectors.CONNECT_ANOTHER_DEVICE_WHY_IS_THIS_REQUIRED.CLOSE))

        .then(noSuchElement(selectors.CONNECT_ANOTHER_DEVICE.SIGNIN_BUTTON))
        .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.TEXT_INSTALL_FX_IOS))
        .then(noSuchElement(selectors.CONNECT_ANOTHER_DEVICE.LINK_INSTALL_ANDROID))
        .then(testHrefEquals(selectors.CONNECT_ANOTHER_DEVICE.LINK_INSTALL_IOS, ADJUST_LINK_IOS));
    },

    'sign up in Fennec, verify same browser': function () {
      // should have both links to mobile apps
      return this.remote
        .then(openPage(SIGNUP_FENNEC_URL, selectors.SIGNUP.HEADER, {
          query: {
            forceUA: UA_STRINGS['android_firefox']
          }
        }))
        .then(respondToWebChannelMessage(CHANNEL_COMMAND_CAN_LINK_ACCOUNT, { ok: true } ))
        .then(fillOutSignUp(email, PASSWORD))
        .then(testElementExists(selectors.CHOOSE_WHAT_TO_SYNC.HEADER))
        .then(click(selectors.CHOOSE_WHAT_TO_SYNC.SUBMIT))

        .then(testElementExists(selectors.CONFIRM_SIGNUP.HEADER))

        .then(openVerificationLinkInSameTab(email, 0, {
          query: {
            forceUA: UA_STRINGS['android_firefox']
          }
        }))
        .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.HEADER))
        .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.SUCCESS_SAME_BROWSER))

        .then(noSuchElement(selectors.CONNECT_ANOTHER_DEVICE.SIGNIN_BUTTON))
        .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.TEXT_INSTALL_FX_FROM_FX_ANDROID))
        .then(testHrefEquals(selectors.CONNECT_ANOTHER_DEVICE.LINK_INSTALL_IOS, ADJUST_LINK_IOS))
        .then(testHrefEquals(selectors.CONNECT_ANOTHER_DEVICE.LINK_INSTALL_ANDROID, ADJUST_LINK_ANDROID));
    }
  });
});
