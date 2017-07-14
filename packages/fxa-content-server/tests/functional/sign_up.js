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
  var config = intern.config;
  var fxaProduction = intern.config.fxaProduction;
  var PAGE_URL = config.fxaContentRoot + 'signup';

  var email;
  var PASSWORD = '12345678';

  var click = FunctionalHelpers.click;
  var clearBrowserState = FunctionalHelpers.clearBrowserState;
  var closeCurrentWindow = FunctionalHelpers.closeCurrentWindow;
  var createUser = FunctionalHelpers.createUser;
  var fillOutSignIn = FunctionalHelpers.fillOutSignIn;
  var fillOutSignInUnblock = FunctionalHelpers.fillOutSignInUnblock;
  var fillOutSignUp = FunctionalHelpers.fillOutSignUp;
  var noPageTransition = FunctionalHelpers.noPageTransition;
  var noSuchElement = FunctionalHelpers.noSuchElement;
  var openPage = FunctionalHelpers.openPage;
  var openSignUpInNewTab = FunctionalHelpers.openSignUpInNewTab;
  var openVerificationLinkInDifferentBrowser = FunctionalHelpers.openVerificationLinkInDifferentBrowser;
  var openVerificationLinkInNewTab = FunctionalHelpers.openVerificationLinkInNewTab;
  var openVerificationLinkInSameTab = FunctionalHelpers.openVerificationLinkInSameTab;
  var testAttributeMatches = FunctionalHelpers.testAttributeMatches;
  var testElementExists = FunctionalHelpers.testElementExists;
  var testElementTextInclude = FunctionalHelpers.testElementTextInclude;
  var testElementValueEquals = FunctionalHelpers.testElementValueEquals;
  var testErrorTextInclude = FunctionalHelpers.testErrorTextInclude;
  var testSuccessWasShown = FunctionalHelpers.testSuccessWasShown;
  var testUrlInclude = FunctionalHelpers.testUrlInclude;
  var type = FunctionalHelpers.type;
  var visibleByQSA = FunctionalHelpers.visibleByQSA;

  const SELECTOR_SIGNUP_HEADER = '#fxa-signup-header';
  const SELECTOR_SUGGEST_SYNC = '#suggest-sync';
  const SELECTOR_SUGGEST_SYNC_LINK = '#suggest-sync a';
  const SELECTOR_SYNC_SIGNUP_HEADER = '#fxa-signup-header .service';
  const SELECTOR_MOZILLA_ORG_SYNC_HEADER = '.header-content';

  var SIGNUP_ENTRYPOINT = 'entrypoint=' + encodeURIComponent('fxa:signup');
  var SYNC_CONTEXT_ANDROID = 'context=fx_fennec_v1';
  var SYNC_CONTEXT_DESKTOP = 'context=fx_desktop_v3';
  var SYNC_SERVICE = 'service=sync';

  function testAtConfirmScreen (email) {
    return function () {
      return this.parent
        .then(testElementExists('#fxa-confirm-header'))
        .then(testElementTextInclude('.verification-email-message', email));
    };
  }

  function signUpWithExistingAccount (context, email, firstPassword, secondPassword, options) {
    return context.remote
      .then(createUser(email, firstPassword, { preVerified: true }))
      .then(fillOutSignUp(email, secondPassword, options));
  }

  registerSuite({
    name: 'sign_up',

    beforeEach: function () {
      email = TestHelpers.createEmail();
      return this.remote.then(clearBrowserState());
    },

    afterEach: function () {
      return this.remote.then(clearBrowserState());
    },

    'with an invalid email': function () {
      return this.remote
        .then(openPage(PAGE_URL + '?email=invalid', '#fxa-400-header'))
        .then(testErrorTextInclude('invalid'))
        .then(testErrorTextInclude('email'));
    },

    'with an empty email': function () {
      return this.remote
        .then(openPage(PAGE_URL + '?email=', '#fxa-400-header'))
        .then(testErrorTextInclude('invalid'))
        .then(testErrorTextInclude('email'));
    },

    'signup, verify same browser': function () {
      return this.remote
        .then(openPage(PAGE_URL, SELECTOR_SIGNUP_HEADER))
        .then(visibleByQSA(SELECTOR_SUGGEST_SYNC))
        .then(fillOutSignUp(email, PASSWORD))
        .then(testAtConfirmScreen(email))
        .then(openVerificationLinkInNewTab(email, 0))

        .switchToWindow('newwindow')
        .then(testElementExists('#fxa-settings-header'))
        .then(testSuccessWasShown())
        .then(closeCurrentWindow())

        .then(testElementExists('#fxa-settings-header'))
        .then(testSuccessWasShown());
    },

    'signup, verify same browser with original tab closed, sign out': function () {
      return this.remote
        .then(fillOutSignUp(email, PASSWORD))
        .then(testAtConfirmScreen(email))

        .then(FunctionalHelpers.openExternalSite())
        .then(openVerificationLinkInNewTab(email, 0))

        .switchToWindow('newwindow')
        .then(testElementExists('#fxa-settings-header'))

        .then(testSuccessWasShown())

        // Ref https://github.com/mozilla/fxa-content-server/issues/3187
        // Ensure the signin screen shows if the user signs out after
        // verification.
        .then(click('#signout'))

        .then(testElementExists('#fxa-signin-header'))
        // `visibleByQSA` is used to ensure visibility. With the bug in #3187
        // referenced above, the signin screen is drawn, but invisible
        .then(visibleByQSA('#fxa-signin-header'))
        .end()

        .then(closeCurrentWindow());
    },

    'signup, verify and sign out of two accounts, all in the same tab, then sign in to the first account': function () {
      // https://github.com/mozilla/fxa-content-server/issues/2209
      var secondEmail = TestHelpers.createEmail();
      this.timeout = 90000;

      return this.remote
        .then(fillOutSignUp(email, PASSWORD))
        .then(testAtConfirmScreen(email))
        .then(openVerificationLinkInSameTab(email, 0))

        .then(testElementExists('#fxa-settings-header'))
        .then(testSuccessWasShown())
        .then(click('#signout'))

        .then(testElementExists('#fxa-signin-header'))

        .then(fillOutSignUp(secondEmail, PASSWORD))
        .then(testAtConfirmScreen(secondEmail))
        .then(openVerificationLinkInSameTab(secondEmail, 0))

        .then(testElementExists('#fxa-settings-header'))
        .then(testSuccessWasShown())
        .then(click('#signout'))

        .then(testElementExists('#fxa-signin-header'))
        .then(fillOutSignIn(email, PASSWORD))
        .then(testElementExists('#fxa-settings-header'));
    },

    'signup, verify same browser by replacing the original tab': function () {
      return this.remote
        .then(fillOutSignUp(email, PASSWORD))
        .then(testAtConfirmScreen(email))
        .then(openVerificationLinkInSameTab(email, 0))

        .then(testElementExists('#fxa-settings-header'))
        .then(testSuccessWasShown());
    },

    'signup, verify different browser - from original tab\'s P.O.V.': function () {
      return this.remote
        .then(fillOutSignUp(email, PASSWORD))
        .then(testAtConfirmScreen(email))

        .then(openVerificationLinkInDifferentBrowser(email))

        // The original tab should transition to the settings page w/ success
        // message.
        .then(testElementExists('#fxa-settings-header'))
        .then(testSuccessWasShown());
    },

    'signup, verify different browser - from new browser\'s P.O.V.': function () {
      return this.remote
        .then(fillOutSignUp(email, PASSWORD))
        .then(testAtConfirmScreen(email))

        // clear local/sessionStorage to synthesize continuing in
        // a separate browser.
        .then(clearBrowserState())
        .then(openVerificationLinkInSameTab(email, 0))

        // user cannot be signed in and redirected to the settings page
        // automatically, just show the signup complete screen.
        .then(testElementExists('#fxa-sign-up-complete-header'));
    },

    'signup with email with leading whitespace on the email': function () {
      var emailWithoutSpace = email;
      var emailWithSpace = ('   ' + email);
      return this.remote
        .then(fillOutSignUp(emailWithSpace, PASSWORD))
        .then(testAtConfirmScreen(emailWithoutSpace))
        .then(clearBrowserState())
        .then(fillOutSignIn(emailWithoutSpace, PASSWORD))

        // user is not confirmed, success is seeing the confirm screen.
        .then(testElementExists('#fxa-confirm-header'));
    },

    'signup with email with trailing whitespace on the email': function () {
      var emailWithoutSpace = email;
      var emailWithSpace = ('   ' + email);

      return this.remote
        .then(fillOutSignUp(emailWithSpace, PASSWORD))
        .then(testAtConfirmScreen(emailWithoutSpace))
        .then(clearBrowserState())
        .then(fillOutSignIn(emailWithoutSpace, PASSWORD))

        // user is not confirmed, success is seeing the confirm screen.
        .then(testElementExists('#fxa-confirm-header'));
    },

    'signup with invalid email address': function () {
      return this.remote
        .then(fillOutSignUp(email + '-', PASSWORD))

        // wait five seconds to allow any errant navigation to occur
        .then(noPageTransition(SELECTOR_SIGNUP_HEADER, 5000))

        // the validation tooltip should be visible
        .then(visibleByQSA('.tooltip'));
    },

    'signup with existing account, coppa is valid, credentials are correct': function () {
      return signUpWithExistingAccount(this, email, PASSWORD, PASSWORD)

        // should have navigated to settings view
        .then(testElementExists('#fxa-settings-header'));
    },

    'signup with existing account, coppa is valid, credentials are wrong': function () {
      return signUpWithExistingAccount(this, email, PASSWORD, 'bad' + PASSWORD)

        .then(visibleByQSA('.error'))
        .then(click('.error a[href="/signin"]'))

        .then(testElementExists('#fxa-signin-header'))

        // the email and password fields should be populated
        .then(testElementValueEquals('input[type=email]', email))
        .then(testElementValueEquals('input[type=password]', 'bad' + PASSWORD));
    },

    'signup with existing account, coppa is empty, credentials are correct': function () {
      return signUpWithExistingAccount(this, email, PASSWORD, PASSWORD, { age: ' ' })

        // should have navigated to settings view
        .then(testElementExists('#fxa-settings-header'));
    },

    'signup with existing account, coppa is empty, credentials are wrong': function () {
      return signUpWithExistingAccount(this, email, PASSWORD, 'bad' + PASSWORD, { age: ' ' })

        .then(visibleByQSA('.error'))
        .then(click('.error a[href="/signin"]'))

        .then(testElementExists('#fxa-signin-header'))

        // the email and password fields should be populated
        .then(testElementValueEquals('input[type=email]', email))
        .then(testElementValueEquals('input[type=password]', 'bad' + PASSWORD));
    },

    'blocked - signup with existing account, coppa is empty, credentials are correct': function () {
      email = TestHelpers.createEmail('blocked{id}');

      return signUpWithExistingAccount(this, email, PASSWORD, PASSWORD, { age: ' ' })

        // should have navigated to settings view
        .then(testElementExists('#fxa-signin-unblock-header'))
        .then(testElementTextInclude('.verification-email-message', email))
        .then(fillOutSignInUnblock(email, 0))

        .then(testElementExists('#fxa-settings-header'));
    },

    'blocked - signup with existing account, coppa is empty, credentials are wrong': function () {
      email = TestHelpers.createEmail('blocked{id}');

      return signUpWithExistingAccount(this, email, PASSWORD, 'bad' + PASSWORD, { age: ' ' })

        // should have navigated to settings view
        .then(testElementExists('#fxa-signin-unblock-header'))
        .then(testElementTextInclude('.verification-email-message', email))
        .then(fillOutSignInUnblock(email, 0))

        .then(testElementExists('#fxa-signin-header'))
        .then(type('input[type=password]', PASSWORD))
        .then(click('button[type=submit]'))

        .then(testElementExists('#fxa-signin-unblock-header'))
        .then(testElementTextInclude('.verification-email-message', email))
        .then(fillOutSignInUnblock(email, 1))

        .then(testElementExists('#fxa-settings-header'));
    },


    'signup with new account, coppa is empty': function () {
      return this.remote
        .then(fillOutSignUp(email, PASSWORD, { age: ' ' }))

        // navigation should not occur
        .then(noPageTransition(SELECTOR_SIGNUP_HEADER))

        // an error should be visible
        .then(visibleByQSA('.tooltip'));
    },

    'signup with existing account, coppa is too young, credentials are correct': function () {
      return signUpWithExistingAccount(this, email, PASSWORD, PASSWORD, { age: 12 })

        // should have navigated to settings view
        .then(testElementExists('#fxa-settings-header'));
    },

    'signup with existing account, coppa is too young, credentials are wrong': function () {
      return signUpWithExistingAccount(this, email, PASSWORD, 'bad' + PASSWORD, { age: 12 })

        .then(visibleByQSA('.error'))
        .then(click('.error a[href="/signin"]'))

        .then(testElementExists('#fxa-signin-header'))
        .then(testElementValueEquals('input[type=email]', email))
        .then(testElementValueEquals('input[type=password]', 'bad' + PASSWORD));
    },

    'signup with new account, coppa is too young': function () {
      return this.remote
        .then(fillOutSignUp(email, PASSWORD, { age: 12 }))

        // should have navigated to cannot-create-account view
        .then(testElementExists('#fxa-cannot-create-account-header'));
    },

    'signup with a verified account signs the user in': function () {
      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(fillOutSignUp(email, PASSWORD))

        // should have navigated to settings view
        .then(testElementExists('#fxa-settings-header'));
    },

    'signup with an unverified account and different password re-signs up user': function () {
      return this.remote
        .then(createUser(email, PASSWORD))
        .then(fillOutSignUp(email, 'different password'))

        // Being pushed to the confirmation screen is success.
        .then(testElementTextInclude('.verification-email-message', email));
    },

    'visiting the pp links saves information for return': function () {
      return testRepopulateFields.call(this, '/legal/terms', 'fxa-tos-header');
    },

    'visiting the tos links saves information for return': function () {
      return testRepopulateFields.call(this, '/legal/privacy', 'fxa-pp-header');
    },

    'form prefill information is cleared after signup->sign out': function () {
      return this.remote
        .then(fillOutSignUp(email, PASSWORD))
        .then(testAtConfirmScreen(email))

        .then(openVerificationLinkInDifferentBrowser(email))

        // The original tab should transition to the settings page w/ success
        // message.
        .then(testElementExists('#fxa-settings-header'))
        .then(click('#signout'))

        .then(testElementExists('#fxa-signin-header'))
        // check the email address was cleared
        .then(testElementValueEquals('input[type=email]', ''))
        // check the password was cleared
        .then(testElementValueEquals('input[type=password]', ''));
    },

    'signup, open sign-up in second tab, verify in original tab': function () {
      var windowName = 'sign-up inter-tab functional test';
      return this.remote
        .then(fillOutSignUp(email, PASSWORD))
        .then(testAtConfirmScreen(email))
        .then(openSignUpInNewTab(windowName))
        .switchToWindow(windowName)

        .then(testElementExists(SELECTOR_SIGNUP_HEADER))

        .switchToWindow('')
        .then(openVerificationLinkInSameTab(email, 0))
        .switchToWindow(windowName)
        .then(testElementExists('#fxa-settings-header'))
        .then(closeCurrentWindow())

        .then(testElementExists('#fxa-settings-header'));
    },

    'signup, open verification link, open verification link again': function () {
      return this.remote
        .then(fillOutSignUp(email, PASSWORD))
        .then(testAtConfirmScreen(email))
        .then(openVerificationLinkInNewTab(email, 0))

        .switchToWindow('newwindow')
        .then(testElementExists('#fxa-settings-header'))
        .then(testSuccessWasShown())
        .then(closeCurrentWindow())

        // open verification link again, no error should occur.
        .then(openVerificationLinkInNewTab(email, 0))

        .switchToWindow('newwindow')
        .then(testElementExists('#fxa-settings-header'))
        .then(testSuccessWasShown())
        .then(closeCurrentWindow())

        .then(testElementExists('#fxa-settings-header'))
        .then(testSuccessWasShown());
    },

    'data-flow-begin attribute is set': function () {
      return this.remote
        .then(openPage(PAGE_URL, SELECTOR_SIGNUP_HEADER))
        .then(testAttributeMatches('body', 'data-flow-begin', /^[1-9][0-9]{12,}$/));
    },

    'integrity attribute is set on scripts and css': function () {
      return this.remote
        .then(openPage(PAGE_URL, SELECTOR_SIGNUP_HEADER))
        .then(testAttributeMatches('script', 'integrity', /^sha512-/))
        .then(testAttributeMatches('link', 'integrity', /^sha512-/))
        .catch(function (err) {
          // this tests only in production
          if (fxaProduction || err.name !== 'AssertionError') {
            throw err;
          }
        });
    },

    'sync suggestion for Fx Desktop': function () {
      return this.remote
        .then(openPage(PAGE_URL, SELECTOR_SIGNUP_HEADER, {
          query: {
            forceUA: UA_STRINGS['desktop_firefox']
          }
        }))
        .then(click(SELECTOR_SUGGEST_SYNC_LINK))

        .then(testElementExists(SELECTOR_SYNC_SIGNUP_HEADER))
        .then(noSuchElement(SELECTOR_SUGGEST_SYNC))
        .then(testUrlInclude(SYNC_CONTEXT_DESKTOP))
        .then(testUrlInclude(SYNC_SERVICE))
        .then(testUrlInclude(SIGNUP_ENTRYPOINT));
    },

    'sync suggestion for Fennec': function () {
      return this.remote
        .then(openPage(PAGE_URL, SELECTOR_SIGNUP_HEADER, {
          query: {
            forceUA: UA_STRINGS['android_firefox']
          }
        }))
        .then(click(SELECTOR_SUGGEST_SYNC_LINK))

        .then(testElementExists(SELECTOR_SYNC_SIGNUP_HEADER))
        .then(noSuchElement(SELECTOR_SUGGEST_SYNC))
        .then(testUrlInclude(SYNC_CONTEXT_ANDROID))
        .then(testUrlInclude(SYNC_SERVICE))
        .then(testUrlInclude(SIGNUP_ENTRYPOINT));
    },

    'sync suggestion for everyone else': function () {
      return this.remote
        .then(openPage(PAGE_URL, SELECTOR_SIGNUP_HEADER, {
          query: {
            forceUA: UA_STRINGS['desktop_chrome']
          }
        }))
        .then(click(SELECTOR_SUGGEST_SYNC_LINK))
        .then(testElementExists(SELECTOR_MOZILLA_ORG_SYNC_HEADER));
    }
  });

  function testRepopulateFields(dest, header) {
    return this.remote
      .then(openPage(PAGE_URL, SELECTOR_SIGNUP_HEADER))
      .then(fillOutSignUp(email, PASSWORD, { submit: false }))

      .then(click('a[href="' + dest + '"]'))
      .then(testElementExists(`#${header}`))
      .then(click('.back'))

      .then(testElementValueEquals('input[type=email]', email))
      .then(testElementValueEquals('input[type=password]', PASSWORD))
      .then(testElementValueEquals('#age', '24'));
  }
});
