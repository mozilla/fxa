/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'tests/lib/helpers',
  'tests/functional/lib/helpers'
], function (intern, registerSuite, TestHelpers, FunctionalHelpers) {
  var config = intern.config;

  var ADJUST_LINK_ANDROID =
    'https://app.adjust.com/2uo1qc?campaign=fxa-conf-page&' +
    'creative=button-autumn-2016-connect-another-device&adgroup=android';

  var ADJUST_LINK_IOS =
    'https://app.adjust.com/2uo1qc?campaign=fxa-conf-page&' +
    'creative=button-autumn-2016-connect-another-device&adgroup=ios&' +
    'fallback=https://itunes.apple.com/app/apple-store/id989804926?pt=373246&' +
    'ct=adjust_tracker&mt=8';

  /*eslint-disable max-len*/
  var UA_STRINGS = {
    'android_chrome': 'Mozilla/5.0 (Linux; Android 4.0.4; Galaxy Nexus Build/IMM76B) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.133 Mobile Safari/535.19',
    'android_firefox': 'Mozilla/5.0 (Android 4.4; Mobile; rv:43.0) Gecko/41.0 Firefox/43.0',
    'desktop_chrome': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.59 Safari/537.36',
    'desktop_firefox': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.12; rv:50.0) Gecko/20100101 Firefox/50.0',
    'ios_firefox': 'Mozilla/5.0 (iPhone; CPU iPhone OS 8_3 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) FxiOS/1.0 Mobile/12F69 Safari/600.1.4',
    'ios_safari': 'Mozilla/5.0 (iPhone; CPU iPhone OS 5_0 like Mac OS X) AppleWebKit/534.46 (KHTML, like Gecko) Version/5.1 Mobile/9A334 Safari/7534.48.3'
  };
  /*eslint-enable max-len*/

  var CONNECT_ANOTHER_DEVICE_ENTRYPOINT = 'entrypoint=connect_another_device';
  var SELECTOR_CONFIRM_SIGNIN_HEADER = '#fxa-confirm-signin-header';
  var SELECTOR_CONTINUE_BUTTON = 'form div a';
  var SELECTOR_INSTALL_TEXT_ANDROID = '#install-mobile-firefox-android';
  var SELECTOR_INSTALL_TEXT_FX_DESKTOP = '#install-mobile-firefox-desktop';
  var SELECTOR_INSTALL_TEXT_IOS = '#install-mobile-firefox-ios';
  var SELECTOR_INSTALL_TEXT_OTHER = '#install-mobile-firefox-other';
  var SELECTOR_INSTALL_TEXT_FROM_ANDROID = '#connect-other-firefox-from-android';
  var SELECTOR_MARKETING_LINK_ANDROID = '.marketing-link-android';
  var SELECTOR_MARKETING_LINK_IOS = '.marketing-link-ios';
  var SELECTOR_PAGE_LOADED = '.graphic-connect-another-device';
  var SELECTOR_SIGNIN_FXIOS = '#signin-fxios';
  var SELECTOR_SIGNIN_HEADER = '#fxa-signin-header';
  var SELECTOR_SIGNIN_COMPLETE_HEADER = '#fxa-sign-in-complete-header';
  var SELECTOR_SIGNUP_COMPLETE_HEADER = '#fxa-sign-up-complete-header';
  var SELECTOR_SUCCESS_DIFFERENT_BROWSER = '.success-not-authenticated';
  var SELECTOR_SUCCESS_SAME_BROWSER = '.success-authenticated';
  var SELECTOR_WHY_CONNECT_ANOTHER_DEVICE = 'a[href="/connect_another_device/why"]';
  var SELECTOR_WHY_CONNECT_ANOTHER_DEVICE_CLOSE = 'button[type="submit"]';
  var SELECTOR_WHY_CONNECT_ANOTHER_DEVICE_HEADER = '#fxa-why-connect-another-device-header';
  var SIGNIN_DESKTOP_URL = config.fxaContentRoot + 'signin?context=fx_desktop_v3&service=sync';
  var SIGNUP_FENNEC_URL = config.fxaContentRoot + 'signup?context=fx_fennec_v1&service=sync';
  var SIGNUP_DESKTOP_URL = config.fxaContentRoot + 'signup?context=fx_desktop_v3&service=sync';
  var SYNC_CONTEXT_ANDROID = 'context=fx_fennec_v1';
  var SYNC_CONTEXT_DESKTOP = 'context=fx_desktop_v3';
  var SYNC_SERVICE = 'service=sync';

  var clearBrowserState = FunctionalHelpers.clearBrowserState;
  var click = FunctionalHelpers.click;
  var createUser = FunctionalHelpers.createUser;
  var fillOutSignIn = FunctionalHelpers.fillOutSignIn;
  var fillOutSignUp = FunctionalHelpers.fillOutSignUp;
  var noSuchElement = FunctionalHelpers.noSuchElement;
  var openPage = FunctionalHelpers.openPage;
  var openVerificationLinkInSameTab = FunctionalHelpers.openVerificationLinkInSameTab;
  var respondToWebChannelMessage = FunctionalHelpers.respondToWebChannelMessage;
  var testElementExists = FunctionalHelpers.testElementExists;
  var testElementTextInclude = FunctionalHelpers.testElementTextInclude;
  var testElementValueEquals = FunctionalHelpers.testElementValueEquals;
  var testHrefEquals = FunctionalHelpers.testHrefEquals;
  var testUrlInclude = FunctionalHelpers.testUrlInclude;
  var testUrlPathnameEquals = FunctionalHelpers.testUrlPathnameEquals;

  var email;
  var PASSWORD = '12345678';

  registerSuite({
    name: 'connect_another_device',

    beforeEach: function () {
      email = TestHelpers.createEmail('sync{id}');

      return this.remote.then(clearBrowserState());
    },

    'sign up Fx Desktop, verify same browser': function () {
      // should have both links to mobile apps
      return this.remote
        .then(openPage(SIGNUP_DESKTOP_URL, '#fxa-signup-header', {
          forceUA: UA_STRINGS['desktop_firefox']
        }))
        .then(respondToWebChannelMessage('fxaccounts:can_link_account', { ok: true } ))
        .then(fillOutSignUp(email, PASSWORD))
        .then(testElementExists('#fxa-choose-what-to-sync-header'))
        .then(click('button[type=submit]'))

        .then(testElementExists('#fxa-confirm-header'))

        .then(openVerificationLinkInSameTab(email, 0))
        .then(testElementExists(SELECTOR_PAGE_LOADED))
        .then(testElementExists(SELECTOR_SUCCESS_SAME_BROWSER))
        .then(noSuchElement(SELECTOR_CONTINUE_BUTTON))
        .then(testElementExists(SELECTOR_INSTALL_TEXT_FX_DESKTOP))
        .then(testHrefEquals(SELECTOR_MARKETING_LINK_IOS, ADJUST_LINK_IOS))
        .then(testHrefEquals(SELECTOR_MARKETING_LINK_ANDROID, ADJUST_LINK_ANDROID));
    },

    'sign up Fx Desktop, verify different Fx Desktop': function () {
      // should sign in to sync here
      return this.remote
        .then(openPage(SIGNUP_DESKTOP_URL, '#fxa-signup-header', {
          forceUA: UA_STRINGS['desktop_firefox']
        }))
        .then(respondToWebChannelMessage('fxaccounts:can_link_account', { ok: true } ))
        // this tests needs to sign up so that we can check if the email gets prefilled
        .then(fillOutSignUp(email, PASSWORD))
        .then(testElementExists('#fxa-choose-what-to-sync-header'))
        .then(click('button[type=submit]'))

        .then(testElementExists('#fxa-confirm-header'))

        // clear browser state to synthesize verifying in a different browser.
        .then(clearBrowserState())

        .then(openVerificationLinkInSameTab(email, 0))
        .then(testElementExists(SELECTOR_SUCCESS_DIFFERENT_BROWSER))

        // ask "why must I do this?"
        .then(click(SELECTOR_WHY_CONNECT_ANOTHER_DEVICE))
        .then(testElementExists(SELECTOR_WHY_CONNECT_ANOTHER_DEVICE_HEADER))
        // leave the help text
        .then(click(SELECTOR_WHY_CONNECT_ANOTHER_DEVICE_CLOSE))

        .then(click(SELECTOR_CONTINUE_BUTTON))

        .then(testElementExists(SELECTOR_SIGNIN_HEADER))
        .then(testElementValueEquals('input[type=email]', email))
        .then(testUrlPathnameEquals('/signin'))
        .then(testUrlInclude(SYNC_CONTEXT_DESKTOP))
        .then(testUrlInclude(SYNC_SERVICE))
        .then(testUrlInclude(CONNECT_ANOTHER_DEVICE_ENTRYPOINT));
    },

    'sign in Fx Desktop, verify same browser': function () {
      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(openPage(SIGNIN_DESKTOP_URL, '#fxa-signin-header', {
          forceUA: UA_STRINGS['desktop_firefox']
        }))
        .then(respondToWebChannelMessage('fxaccounts:can_link_account', { ok: true } ))
        .then(fillOutSignIn(email, PASSWORD))
        .then(testElementExists(SELECTOR_CONFIRM_SIGNIN_HEADER))
        .then(openVerificationLinkInSameTab(email, 0))
        // Does not work for sign in, even if forced.
        .then(testElementExists(SELECTOR_SIGNIN_COMPLETE_HEADER));
    },

    'sign up Fx Desktop, verify different Fx Desktop with another user already signed in': function () {
      var signInEmail = TestHelpers.createEmail('sync{id}');
      var signUpEmail = email;

      return this.remote
        // preVerified: false causes the "verify account" email to be sent,
        // that's used later to verify.
        .then(createUser(signUpEmail, PASSWORD, { preVerified: false }))
        .then(createUser(signInEmail, PASSWORD, { preVerified: true }))

        .then(openPage(SIGNIN_DESKTOP_URL, '#fxa-signin-header', {
          forceUA: UA_STRINGS['desktop_firefox']
        }))
        .then(respondToWebChannelMessage('fxaccounts:can_link_account', { ok: true } ))
        .then(fillOutSignIn(signInEmail, PASSWORD))
        .then(testElementExists(SELECTOR_CONFIRM_SIGNIN_HEADER))
        .then(openVerificationLinkInSameTab(signInEmail, 0))
        // Does not work for sign in, even if forced.
        .then(testElementExists(SELECTOR_SIGNIN_COMPLETE_HEADER))

        // NOW - go back and open the verification link for the sign up user in a
        // browser where another user is already signed in.
        .then(openVerificationLinkInSameTab(signUpEmail, 0))
        // User goes to the old "Account verified" screen.
        .then(testElementExists(SELECTOR_SIGNUP_COMPLETE_HEADER));
    },

    'sign up Fx Desktop, verify in Fennec': function () {
      // should navigate to sign in and have the email prefilled
      return this.remote
        .then(openPage(SIGNUP_DESKTOP_URL, '#fxa-signup-header', {
          forceUA: UA_STRINGS['desktop_firefox']
        }))
        .then(respondToWebChannelMessage('fxaccounts:can_link_account', { ok: true } ))
        // this tests needs to sign up so that we can check if the email gets prefilled
        .then(fillOutSignUp(email, PASSWORD))
        .then(testElementExists('#fxa-choose-what-to-sync-header'))
        .then(click('button[type=submit]'))

        .then(testElementExists('#fxa-confirm-header'))

        // clear browser state to synthesize verifying in an Android browser.
        .then(clearBrowserState())

        .then(openVerificationLinkInSameTab(email, 0, {
          query: {
            forceUA: UA_STRINGS['android_firefox']
          }
        }))
        .then(testElementExists(SELECTOR_SUCCESS_DIFFERENT_BROWSER))

        // ask "why must I do this?"
        .then(click(SELECTOR_WHY_CONNECT_ANOTHER_DEVICE))
        .then(testElementExists(SELECTOR_WHY_CONNECT_ANOTHER_DEVICE_HEADER))
        // leave the help text
        .then(click(SELECTOR_WHY_CONNECT_ANOTHER_DEVICE_CLOSE))

        .then(click(SELECTOR_CONTINUE_BUTTON))

        .then(testElementExists(SELECTOR_SIGNIN_HEADER))
        .then(testElementValueEquals('input[type=email]', email))
        .then(testUrlPathnameEquals('/signin'))
        .then(testUrlInclude(SYNC_CONTEXT_ANDROID))
        .then(testUrlInclude(SYNC_SERVICE))
        .then(testUrlInclude(CONNECT_ANOTHER_DEVICE_ENTRYPOINT));
    },


    'sign up Fx Desktop, verify in Fx for iOS': function () {
      return this.remote
        .then(openPage(SIGNUP_DESKTOP_URL, '#fxa-signup-header', {
          forceUA: UA_STRINGS['desktop_firefox']
        }))
        .then(respondToWebChannelMessage('fxaccounts:can_link_account', { ok: true } ))
        .then(fillOutSignUp(email, PASSWORD))
        .then(testElementExists('#fxa-choose-what-to-sync-header'))
        .then(click('button[type=submit]'))

        .then(testElementExists('#fxa-confirm-header'))

        // clear browser state to synthesize verifying in an Android browser.
        .then(clearBrowserState())

        .then(openVerificationLinkInSameTab(email, 0, {
          query: {
            forceUA: UA_STRINGS['ios_firefox']
          }
        }))
        .then(testElementExists(SELECTOR_SUCCESS_DIFFERENT_BROWSER))

        // ask "why must I do this?"
        .then(click(SELECTOR_WHY_CONNECT_ANOTHER_DEVICE))
        .then(testElementExists(SELECTOR_WHY_CONNECT_ANOTHER_DEVICE_HEADER))
        // leave the help text
        .then(click(SELECTOR_WHY_CONNECT_ANOTHER_DEVICE_CLOSE))

        .then(noSuchElement(SELECTOR_CONTINUE_BUTTON))
        .then(testElementExists(SELECTOR_SIGNIN_FXIOS))
        .then(noSuchElement(SELECTOR_MARKETING_LINK_ANDROID))
        .then(noSuchElement(SELECTOR_MARKETING_LINK_IOS));
    },

    'sign up Fx Desktop, verify in Android Chrome': function () {
      // should show adjust Google badge
      return this.remote
        .then(openPage(SIGNUP_DESKTOP_URL, '#fxa-signup-header', {
          forceUA: UA_STRINGS['desktop_firefox']
        }))
        .then(respondToWebChannelMessage('fxaccounts:can_link_account', { ok: true } ))
        .then(fillOutSignUp(email, PASSWORD))
        .then(testElementExists('#fxa-choose-what-to-sync-header'))
        .then(click('button[type=submit]'))

        .then(testElementExists('#fxa-confirm-header'))

        // clear browser state to synthesize verifying in an Android browser.
        .then(clearBrowserState())

        .then(openVerificationLinkInSameTab(email, 0, {
          query: {
            forceUA: UA_STRINGS['android_chrome']
          }
        }))
        .then(testElementExists(SELECTOR_SUCCESS_DIFFERENT_BROWSER))
        .then(testElementTextInclude(SELECTOR_SUCCESS_DIFFERENT_BROWSER, 'email verified'))

        // ask "why must I do this?"
        .then(click(SELECTOR_WHY_CONNECT_ANOTHER_DEVICE))
        .then(testElementExists(SELECTOR_WHY_CONNECT_ANOTHER_DEVICE_HEADER))
        // leave the help text
        .then(click(SELECTOR_WHY_CONNECT_ANOTHER_DEVICE_CLOSE))

        .then(noSuchElement(SELECTOR_CONTINUE_BUTTON))
        .then(testElementExists(SELECTOR_INSTALL_TEXT_ANDROID))
        .then(noSuchElement(SELECTOR_MARKETING_LINK_IOS))
        .then(testHrefEquals(SELECTOR_MARKETING_LINK_ANDROID, ADJUST_LINK_ANDROID))

        .refresh()

        .then(testElementExists(SELECTOR_SUCCESS_DIFFERENT_BROWSER))
        .then(testElementTextInclude(SELECTOR_SUCCESS_DIFFERENT_BROWSER, 'email verified'));
    },

    'sign up Fx Desktop, verify in Chrome Desktop': function () {
      // should show adjust Google badge
      return this.remote
        .then(openPage(SIGNUP_DESKTOP_URL, '#fxa-signup-header', {
          forceUA: UA_STRINGS['desktop_firefox']
        }))
        .then(respondToWebChannelMessage('fxaccounts:can_link_account', { ok: true } ))
        .then(fillOutSignUp(email, PASSWORD))
        .then(testElementExists('#fxa-choose-what-to-sync-header'))
        .then(click('button[type=submit]'))

        .then(testElementExists('#fxa-confirm-header'))

        // clear browser state to synthesize verifying in an Android browser.
        .then(clearBrowserState())

        .then(openVerificationLinkInSameTab(email, 0, {
          query: {
            forceUA: UA_STRINGS['desktop_chrome']
          }
        }))
        .then(testElementExists(SELECTOR_SUCCESS_DIFFERENT_BROWSER))

        // ask "why must I do this?"
        .then(click(SELECTOR_WHY_CONNECT_ANOTHER_DEVICE))
        .then(testElementExists(SELECTOR_WHY_CONNECT_ANOTHER_DEVICE_HEADER))
        // leave the help text
        .then(click(SELECTOR_WHY_CONNECT_ANOTHER_DEVICE_CLOSE))
        .then(noSuchElement(SELECTOR_CONTINUE_BUTTON))
        .then(testElementExists(SELECTOR_INSTALL_TEXT_OTHER))
        .then(testHrefEquals(SELECTOR_MARKETING_LINK_IOS, ADJUST_LINK_IOS))
        .then(testHrefEquals(SELECTOR_MARKETING_LINK_ANDROID, ADJUST_LINK_ANDROID));
    },

    'sign up Fx Desktop, verify in iOS Safari': function () {
      return this.remote
        .then(openPage(SIGNUP_DESKTOP_URL, '#fxa-signup-header', {
          forceUA: UA_STRINGS['desktop_firefox']
        }))
        .then(respondToWebChannelMessage('fxaccounts:can_link_account', { ok: true } ))
        .then(fillOutSignUp(email, PASSWORD))
        .then(testElementExists('#fxa-choose-what-to-sync-header'))
        .then(click('button[type=submit]'))

        .then(testElementExists('#fxa-confirm-header'))

        // clear browser state to synthesize verifying in an Android browser.
        .then(clearBrowserState())

        .then(openVerificationLinkInSameTab(email, 0, {
          query: {
            forceUA: UA_STRINGS['ios_safari']
          }
        }))
        .then(testElementExists(SELECTOR_SUCCESS_DIFFERENT_BROWSER))

        // ask "why must I do this?"
        .then(click(SELECTOR_WHY_CONNECT_ANOTHER_DEVICE))
        .then(testElementExists(SELECTOR_WHY_CONNECT_ANOTHER_DEVICE_HEADER))
        // leave the help text
        .then(click(SELECTOR_WHY_CONNECT_ANOTHER_DEVICE_CLOSE))

        .then(noSuchElement(SELECTOR_CONTINUE_BUTTON))
        .then(testElementExists(SELECTOR_INSTALL_TEXT_IOS))
        .then(noSuchElement(SELECTOR_MARKETING_LINK_ANDROID))
        .then(testHrefEquals(SELECTOR_MARKETING_LINK_IOS, ADJUST_LINK_IOS));
    },

    'sign up in Fennec, verify same browser': function () {
      // should have both links to mobile apps
      return this.remote
        .then(openPage(SIGNUP_FENNEC_URL, '#fxa-signup-header', {
          query: {
            forceUA: UA_STRINGS['android_firefox']
          }
        }))
        .then(respondToWebChannelMessage('fxaccounts:can_link_account', { ok: true } ))
        .then(fillOutSignUp(email, PASSWORD))
        .then(testElementExists('#fxa-choose-what-to-sync-header'))
        .then(click('button[type=submit]'))

        .then(testElementExists('#fxa-confirm-header'))

        .then(openVerificationLinkInSameTab(email, 0, {
          query: {
            forceUA: UA_STRINGS['android_firefox']
          }
        }))
        .then(testElementExists(SELECTOR_PAGE_LOADED))
        .then(testElementExists(SELECTOR_SUCCESS_SAME_BROWSER))

        .then(noSuchElement(SELECTOR_CONTINUE_BUTTON))
        .then(testElementExists(SELECTOR_INSTALL_TEXT_FROM_ANDROID))
        .then(testHrefEquals(SELECTOR_MARKETING_LINK_IOS, ADJUST_LINK_IOS))
        .then(testHrefEquals(SELECTOR_MARKETING_LINK_ANDROID, ADJUST_LINK_ANDROID));
    }
  });
});
