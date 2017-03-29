/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern!object',
  'tests/lib/helpers',
  'tests/functional/lib/helpers'
], function (registerSuite, TestHelpers,  FunctionalHelpers) {
  var PASSWORD = 'password';
  var email;
  var bouncedEmail;

  var click = FunctionalHelpers.click;
  var clearBrowserState = FunctionalHelpers.clearBrowserState;
  var closeCurrentWindow = FunctionalHelpers.closeCurrentWindow;
  var createUser = FunctionalHelpers.createUser;
  var fillOutSignUp = FunctionalHelpers.fillOutSignUp;
  var getFxaClient = FunctionalHelpers.getFxaClient;
  var noEmailExpected = FunctionalHelpers.noEmailExpected;
  var noSuchElement = FunctionalHelpers.noSuchElement;
  var testElementValueEquals = FunctionalHelpers.testElementValueEquals;
  var openExternalSite = FunctionalHelpers.openExternalSite;
  var openFxaFromRp = FunctionalHelpers.openFxaFromRp;
  var openVerificationLinkInDifferentBrowser = FunctionalHelpers.openVerificationLinkInDifferentBrowser;
  var openVerificationLinkInNewTab = FunctionalHelpers.openVerificationLinkInNewTab;
  var openVerificationLinkInSameTab = FunctionalHelpers.openVerificationLinkInSameTab;
  var testElementExists = FunctionalHelpers.testElementExists;
  var testElementTextInclude = FunctionalHelpers.testElementTextInclude;
  var testUrlInclude = FunctionalHelpers.testUrlInclude;
  var testUrlPathnameEquals = FunctionalHelpers.testUrlPathnameEquals;
  var thenify = FunctionalHelpers.thenify;
  var type = FunctionalHelpers.type;
  var visibleByQSA = FunctionalHelpers.visibleByQSA;

  const signUpWithExistingAccount = thenify(function(email, firstPassword, secondPassword, options) {
    return this.parent
      .then(createUser(email, firstPassword, { preVerified: true }))
      .then(function () {
        return this.parent
          .then(openFxaFromRp('signup'));
      })
      .then(fillOutSignUp(email, secondPassword, options));
  });

  registerSuite({
    name: 'oauth signup',

    beforeEach: function () {
      email = TestHelpers.createEmail();
      bouncedEmail = TestHelpers.createEmail();

      // clear localStorage to avoid polluting other tests.
      // Without the clear, /signup tests fail because of the info stored
      // in prefillEmail
      return this.remote
        .then(clearBrowserState({
          '123done': true,
          contentServer: true
        }));
    },

    'signup, verify same browser': function () {
      return this.remote
        .then(openFxaFromRp('signup'))
        .then(testElementExists('#fxa-signup-header .service'))
        .then(testUrlInclude('client_id='))
        .then(testUrlInclude('redirect_uri='))
        .then(testUrlInclude('state='))

        .then(fillOutSignUp(email, PASSWORD))

        .then(testElementExists('#fxa-confirm-header'))
        .then(openVerificationLinkInNewTab(email, 0))

        .switchToWindow('newwindow')
        // wait for the verified window in the new tab
        .then(testElementExists('#fxa-sign-up-complete-header'))
        // user sees the name of the RP, but cannot redirect
        .then(testElementTextInclude('.account-ready-service', '123done'))

        // switch to the original window
        .then(closeCurrentWindow())
        .then(testElementExists('#loggedin'))

        // Do not expect a post-verification email, those are for Sync.
        .then(noEmailExpected(email, 1));
    },

    'signup, verify same browser with original tab closed': function () {
      return this.remote
        .then(openFxaFromRp('signup'))
        .then(fillOutSignUp(email, PASSWORD))

        .then(testElementExists('#fxa-confirm-header'))
        // user browses to another site.
        .switchToFrame(null)
        .then(openExternalSite())
        .then(openVerificationLinkInNewTab(email, 0))

        .switchToWindow('newwindow')
        .then(testElementExists('#fxa-sign-up-complete-header'))

        // switch to the original window
        .then(closeCurrentWindow());
    },

    'signup, verify same browser by replacing the original tab': function () {
      return this.remote
        .then(openFxaFromRp('signup'))
        .then(fillOutSignUp(email, PASSWORD))

        .then(testElementExists('#fxa-confirm-header'))
        .then(openVerificationLinkInSameTab(email, 0))

        .then(testElementExists('#loggedin'));
    },

    'signup, verify different browser - from original tab\'s P.O.V.': function () {
      return this.remote
        .then(openFxaFromRp('signup'))
        .then(fillOutSignUp(email, PASSWORD))

        .then(testElementExists('#fxa-confirm-header'))
        .then(openVerificationLinkInDifferentBrowser(email))

        // original tab redirects back to 123done
        .then(testElementExists('#loggedin'));
    },

    'signup, verify different browser - from new browser\'s P.O.V.': function () {
      return this.remote
        .then(openFxaFromRp('signup'))
        .then(fillOutSignUp(email, PASSWORD))

        .then(testElementExists('#fxa-confirm-header'))

        // clear browser state to simulate opening link in a new browser
        .then(clearBrowserState({
          '123done': true,
          contentServer: true
        }))

        .then(openVerificationLinkInSameTab(email, 0))
        // new browser dead ends at the 'account verified' screen.
        .then(testElementExists('#fxa-sign-up-complete-header'))
        .then(testElementTextInclude('.account-ready-service', '123done'))

        // make sure the relier name is not a link
        .then(noSuchElement('#redirectTo'));
    },

    'signup with existing account, coppa is valid': function () {
      return this.remote
        .then(signUpWithExistingAccount(email, PASSWORD, PASSWORD))

        // should have navigated to 123done
        .then(testElementExists('#loggedin'));
    },

    'signup with existing account, coppa is valid, credentials are wrong': function () {
      return this.remote
        .then(signUpWithExistingAccount(email, PASSWORD, 'bad' + PASSWORD))

        .then(visibleByQSA('.error'))
        .then(click('.error a[href^="/oauth/signin"]'))

        .then(testElementExists('#fxa-signin-header'))
        .then(testUrlPathnameEquals('/oauth/signin'))

        .then(testElementValueEquals('input[type=email]', email))
        .then(testElementValueEquals('input[type=password]', 'bad' + PASSWORD));
    },

    'signup with existing account, coppa is empty': function () {
      return this.remote
        .then(signUpWithExistingAccount(email, PASSWORD, PASSWORD, { age: ' ' }))

        // should have navigated to 123done
        .then(testElementExists('#loggedin'));
    },

    'signup with existing account, coppa is empty, credentials are wrong': function () {
      return this.remote
        .then(signUpWithExistingAccount(email, PASSWORD, 'bad' + PASSWORD, { age: ' ' }))

        .then(visibleByQSA('.error'))
        .then(click('.error a[href^="/oauth/signin"]'))

        .then(testElementExists('#fxa-signin-header'))
        .then(testUrlPathnameEquals('/oauth/signin'))

        // the email and password fields should be populated
        .then(testElementValueEquals('input[type=email]', email))
        .then(testElementValueEquals('input[type=password]', 'bad' + PASSWORD));
    },

    'signup with existing account, coppa is too young': function () {
      return this.remote
        .then(signUpWithExistingAccount(email, PASSWORD, PASSWORD, { age: 12 }))

        // should have navigated to 123done
        .then(testElementExists('#loggedin'));
    },

    'signup, bounce email, allow user to restart flow but force a different email': function () {
      this.timeout = 60 * 1000;

      return this.remote
        .then(openFxaFromRp('signup'))
        .then(fillOutSignUp(bouncedEmail, PASSWORD))

        .then(testElementExists('#fxa-confirm-header'))
        .then(function () {
          return getFxaClient().accountDestroy(bouncedEmail, PASSWORD);
        })

        .then(testElementExists('#fxa-signup-header'))
        // expect an error message to already be present on redirect
        .then(visibleByQSA('.tooltip'))
        .then(testElementExists('button[type="submit"].disabled'))

        .then(type('input[type="email"]', email))
        .then(click('button[type="submit"]'))

        .then(testElementExists('#fxa-confirm-header'))
        .then(openVerificationLinkInNewTab(email, 0))

        .switchToWindow('newwindow')
        // wait for the verification step to complete
        .then(testElementExists('.account-ready-service'))

        // user sees the name of the RP,
        // but cannot redirect
        .then(testElementTextInclude('.account-ready-service', '123done'))
        // switch to the original window
        .then(closeCurrentWindow())

        .then(testElementExists('#loggedin'));
    }

  });

});
