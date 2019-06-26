/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const TestHelpers = require('../lib/helpers');
const FunctionalHelpers = require('./lib/helpers');
const selectors = require('./lib/selectors');
const config = intern._config;

var PASSWORD = 'password';
const SUCCESS_URL = config.fxaContentRoot + 'oauth/success/dcdb5ae7add825d2';
var email;
var bouncedEmail;

const {
  click,
  clearBrowserState,
  closeCurrentWindow,
  createUser,
  fillOutSignUp,
  getFxaClient,
  noEmailExpected,
  noSuchElement,
  testElementValueEquals,
  openExternalSite,
  openFxaFromRp,
  openPage,
  openVerificationLinkInDifferentBrowser,
  openVerificationLinkInNewTab,
  openVerificationLinkInSameTab,
  switchToWindow,
  testElementExists,
  testElementTextInclude,
  testUrlInclude,
  testUrlPathnameEquals,
  thenify,
  type,
  visibleByQSA,
} = FunctionalHelpers;

const signUpWithExistingAccount = thenify(function(
  email,
  firstPassword,
  secondPassword,
  options
) {
  return this.parent
    .then(createUser(email, firstPassword, { preVerified: true }))
    .then(function() {
      return this.parent.then(openFxaFromRp('signup'));
    })
    .then(fillOutSignUp(email, secondPassword, options));
});

registerSuite('oauth signup', {
  beforeEach: function() {
    email = TestHelpers.createEmail();
    bouncedEmail = TestHelpers.createEmail();

    // clear localStorage to avoid polluting other tests.
    // Without the clear, /signup tests fail because of the info stored
    // in prefillEmail
    return this.remote.then(
      clearBrowserState({
        '123done': true,
        contentServer: true,
      })
    );
  },
  tests: {
    'signup, verify same browser': function() {
      return (
        this.remote
          .then(openFxaFromRp('signup'))
          .then(testElementExists('#fxa-signup-header .service'))
          .then(testUrlInclude('client_id='))
          .then(testUrlInclude('redirect_uri='))
          .then(testUrlInclude('state='))

          .then(fillOutSignUp(email, PASSWORD))

          .then(testElementExists('#fxa-confirm-header'))
          .then(openVerificationLinkInNewTab(email, 0))

          .then(switchToWindow(1))
          // wait for the verified window in the new tab
          .then(testElementExists('#fxa-sign-up-complete-header'))
          // user sees the name of the RP, but cannot redirect
          .then(testElementTextInclude('.account-ready-service', '123done'))

          // switch to the original window
          .then(closeCurrentWindow())
          .then(testElementExists('#loggedin'))

          // Do not expect a post-verification email, those are for Sync.
          .then(noEmailExpected(email, 1))
      );
    },

    'signup in Chrome for Android, verify same browser': function() {
      return (
        this.remote
          .then(
            openFxaFromRp('signup', {
              query: {
                forceUA:
                  'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Mobile Safari/537.36',
              },
            })
          )
          .then(testElementTextInclude(selectors.SIGNUP.SUB_HEADER, '123done'))
          .then(testUrlInclude('client_id='))
          .then(testUrlInclude('state='))

          .then(fillOutSignUp(email, PASSWORD))

          .then(testElementExists(selectors.CONFIRM_SIGNUP.HEADER))
          .then(openVerificationLinkInNewTab(email, 0))

          .then(switchToWindow(1))
          // wait for the verified window in the new tab
          .then(testElementExists(selectors.SIGNUP_COMPLETE.HEADER))
          .then(noSuchElement(selectors.SIGNUP_COMPLETE.CONTINUE_BUTTON))
          // user sees the name of the RP, but cannot redirect
          .then(
            testElementTextInclude(
              selectors.SIGNUP_COMPLETE.SERVICE_NAME,
              '123done'
            )
          )

          // switch to the original window
          .then(closeCurrentWindow())

          .then(testElementExists(selectors.SIGNUP_COMPLETE.HEADER))
          .then(click(selectors.SIGNUP_COMPLETE.CONTINUE_BUTTON))

          .then(testElementExists(selectors['123DONE'].AUTHENTICATED))
      );
    },

    'signup, verify same browser with original tab closed': function() {
      return (
        this.remote
          .then(openFxaFromRp('signup'))
          .then(fillOutSignUp(email, PASSWORD))

          .then(testElementExists('#fxa-confirm-header'))
          // user browses to another site.
          .switchToFrame(null)
          .then(openExternalSite())
          .then(openVerificationLinkInNewTab(email, 0))

          .then(switchToWindow(1))
          .then(testElementExists('#fxa-sign-up-complete-header'))

          // switch to the original window
          .then(closeCurrentWindow())
      );
    },

    'signup, verify same browser by replacing the original tab': function() {
      return this.remote
        .then(openFxaFromRp('signup'))
        .then(fillOutSignUp(email, PASSWORD))

        .then(testElementExists('#fxa-confirm-header'))
        .then(openVerificationLinkInSameTab(email, 0))

        .then(testElementExists('#loggedin'));
    },

    "signup, verify different browser - from original tab's P.O.V.": function() {
      return (
        this.remote
          .then(openFxaFromRp('signup'))
          .then(fillOutSignUp(email, PASSWORD))

          .then(testElementExists('#fxa-confirm-header'))
          .then(openVerificationLinkInDifferentBrowser(email))

          // original tab redirects back to 123done
          .then(testElementExists('#loggedin'))
      );
    },

    "signup, verify different browser - from new browser's P.O.V.": function() {
      return (
        this.remote
          .then(openFxaFromRp('signup'))
          .then(fillOutSignUp(email, PASSWORD))

          .then(testElementExists('#fxa-confirm-header'))

          // clear browser state to simulate opening link in a new browser
          .then(
            clearBrowserState({
              '123done': true,
              contentServer: true,
            })
          )

          .then(openVerificationLinkInSameTab(email, 0))
          // new browser dead ends at the 'account verified' screen.
          .then(testElementExists('#fxa-sign-up-complete-header'))
          .then(testElementTextInclude('.account-ready-service', '123done'))

          // make sure the relier name is not a link
          .then(noSuchElement('#redirectTo'))
      );
    },

    'signup with existing account, coppa is valid': function() {
      return (
        this.remote
          .then(signUpWithExistingAccount(email, PASSWORD, PASSWORD))

          // should have navigated to 123done
          .then(testElementExists('#loggedin'))
      );
    },

    'signup with existing account, coppa is valid, credentials are wrong': function() {
      return this.remote
        .then(signUpWithExistingAccount(email, PASSWORD, 'bad' + PASSWORD))

        .then(visibleByQSA('.error'))
        .then(click('.error a[href^="/oauth/signin"]'))

        .then(testElementExists('#fxa-signin-header'))
        .then(testUrlPathnameEquals('/oauth/signin'))

        .then(testElementValueEquals('input[type=email]', email))
        .then(testElementValueEquals('input[type=password]', 'bad' + PASSWORD));
    },

    'signup with existing account, coppa is empty': function() {
      return (
        this.remote
          .then(
            signUpWithExistingAccount(email, PASSWORD, PASSWORD, { age: ' ' })
          )

          // should have navigated to 123done
          .then(testElementExists('#loggedin'))
      );
    },

    'signup with existing account, coppa is empty, credentials are wrong': function() {
      return (
        this.remote
          .then(
            signUpWithExistingAccount(email, PASSWORD, 'bad' + PASSWORD, {
              age: ' ',
            })
          )

          .then(visibleByQSA('.error'))
          .then(click('.error a[href^="/oauth/signin"]'))

          .then(testElementExists('#fxa-signin-header'))
          .then(testUrlPathnameEquals('/oauth/signin'))

          // the email and password fields should be populated
          .then(testElementValueEquals('input[type=email]', email))
          .then(
            testElementValueEquals('input[type=password]', 'bad' + PASSWORD)
          )
      );
    },

    'signup with existing account, coppa is too young': function() {
      return (
        this.remote
          .then(
            signUpWithExistingAccount(email, PASSWORD, PASSWORD, { age: 12 })
          )

          // should have navigated to 123done
          .then(testElementExists('#loggedin'))
      );
    },

    'signup, bounce email, allow user to restart flow but force a different email': function() {
      this.timeout = 60 * 1000;

      return (
        this.remote
          .then(openFxaFromRp('signup'))
          .then(fillOutSignUp(bouncedEmail, PASSWORD))

          .then(testElementExists('#fxa-confirm-header'))
          .then(function() {
            return getFxaClient().accountDestroy(bouncedEmail, PASSWORD);
          })

          .then(testElementExists('#fxa-signup-header'))
          // expect an error message to already be present on redirect
          .then(visibleByQSA('.tooltip'))
          .then(testElementExists('button[type="submit"]'))

          .then(type('input[type="email"]', email))
          .then(click('button[type="submit"]'))

          .then(testElementExists('#fxa-confirm-header'))
          .then(openVerificationLinkInNewTab(email, 0))

          .then(switchToWindow(1))
          // wait for the verification step to complete
          .then(testElementExists('.account-ready-service'))

          // user sees the name of the RP,
          // but cannot redirect
          .then(testElementTextInclude('.account-ready-service', '123done'))
          // switch to the original window
          .then(closeCurrentWindow())

          .then(testElementExists('#loggedin'))
      );
    },

    'a success screen is available': function() {
      return this.remote.then(
        openPage(SUCCESS_URL, '#fxa-oauth-success-header')
      );
    },
  },
});
