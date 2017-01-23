/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'intern/chai!assert',
  'intern/browser_modules/dojo/node!xmlhttprequest',
  'app/bower_components/fxa-js-client/fxa-client',
  'tests/lib/helpers',
  'tests/functional/lib/helpers'
], function (intern, registerSuite, assert, nodeXMLHttpRequest, FxaClient, TestHelpers,  FunctionalHelpers) {
  var config = intern.config;
  var AUTH_SERVER_ROOT = config.fxaAuthRoot;

  var PASSWORD = 'password';
  var email;
  var bouncedEmail;

  var click = FunctionalHelpers.click;
  var clearBrowserState = FunctionalHelpers.clearBrowserState;
  var closeCurrentWindow = FunctionalHelpers.closeCurrentWindow;
  var createUser = FunctionalHelpers.createUser;
  var fillOutSignUp = FunctionalHelpers.fillOutSignUp;
  var noEmailExpected = FunctionalHelpers.noEmailExpected;
  var noSuchElement = FunctionalHelpers.noSuchElement;
  var testElementValueEquals = FunctionalHelpers.testElementValueEquals;
  var openFxaFromRp = FunctionalHelpers.openFxaFromRp;
  var openVerificationLinkInDifferentBrowser = FunctionalHelpers.openVerificationLinkInDifferentBrowser;
  var openVerificationLinkInNewTab = FunctionalHelpers.openVerificationLinkInNewTab;
  var openVerificationLinkInSameTab = FunctionalHelpers.openVerificationLinkInSameTab;
  var testElementExists = FunctionalHelpers.testElementExists;
  var testElementTextInclude = FunctionalHelpers.testElementTextInclude;
  var testUrlPathnameEquals = FunctionalHelpers.testUrlPathnameEquals;
  var type = FunctionalHelpers.type;
  var visibleByQSA = FunctionalHelpers.visibleByQSA;

  function signUpWithExistingAccount (context, email, firstPassword, secondPassword, options) {
    return context.remote
      .then(createUser(email, firstPassword, { preVerified: true }))
      .then(function () {
        return this.parent
          .then(openFxaFromRp('signup'));
      })
      .then(fillOutSignUp(email, secondPassword, options));
  }

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
        .findByCssSelector('#fxa-signup-header .service')
        .end()

        .getCurrentUrl()
        .then(function (url) {
          assert.ok(url.indexOf('client_id=') > -1);
          assert.ok(url.indexOf('redirect_uri=') > -1);
          assert.ok(url.indexOf('state=') > -1);
        })
        .end()

        .then(fillOutSignUp(email, PASSWORD))

        .findByCssSelector('#fxa-confirm-header')
        .end()

        .then(openVerificationLinkInNewTab(email, 0))

        .switchToWindow('newwindow')
        // wait for the verified window in the new tab
        .findById('fxa-sign-up-complete-header')
        .end()

        .findByCssSelector('.account-ready-service')
        .getVisibleText()
        .then(function (text) {
          // user sees the name of the RP,
          // but cannot redirect
          assert.ok(/123done/i.test(text));
        })
        .end()

        // switch to the original window
        .then(closeCurrentWindow())

        .findByCssSelector('#loggedin')
        .end()

        // Do not expect a post-verification email, those are for Sync.
        .then(noEmailExpected(email, 1));
    },

    'signup, verify same browser with original tab closed': function () {
      return this.remote
        .then(openFxaFromRp('signup'))

        .then(fillOutSignUp(email, PASSWORD))

        .findByCssSelector('#fxa-confirm-header')
        .end()

        // user browses to another site.
        .switchToFrame(null)

        .then(FunctionalHelpers.openExternalSite())

        .then(openVerificationLinkInNewTab(email, 0))

        .switchToWindow('newwindow')

        .findByCssSelector('#fxa-sign-up-complete-header')
        .end()

        // switch to the original window
        .then(closeCurrentWindow());
    },

    'signup, verify same browser by replacing the original tab': function () {
      return this.remote
        .then(openFxaFromRp('signup'))

        .then(fillOutSignUp(email, PASSWORD))

        .findByCssSelector('#fxa-confirm-header')
        .end()

        .then(openVerificationLinkInSameTab(email, 0))
        .then(testElementExists('#loggedin'));
    },

    'signup, verify different browser - from original tab\'s P.O.V.': function () {
      return this.remote
        .then(openFxaFromRp('signup'))
        .then(fillOutSignUp(email, PASSWORD))

        .findByCssSelector('#fxa-confirm-header')
        .end()

        .then(openVerificationLinkInDifferentBrowser(email))

        // original tab redirects back to 123done
        .findByCssSelector('#loggedin')
        .end();
    },

    'signup, verify different browser - from new browser\'s P.O.V.': function () {
      return this.remote
        .then(openFxaFromRp('signup'))
        .then(fillOutSignUp(email, PASSWORD))

        .findByCssSelector('#fxa-confirm-header')
        .end()

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
      return signUpWithExistingAccount(this, email, PASSWORD, PASSWORD)

        // should have navigated to 123done
        .then(testElementExists('#loggedin'));
    },

    'signup with existing account, coppa is valid, credentials are wrong': function () {
      return signUpWithExistingAccount(this, email, PASSWORD, 'bad' + PASSWORD)

        .then(visibleByQSA('.error'))
        .then(click('.error a[href^="/oauth/signin"]'))

        // should have navigated to sign-in view
        .then(testElementExists('#fxa-signin-header'))

        // should be /oauth/signin route
        .then(testUrlPathnameEquals('/oauth/signin'))

        // the email and password fields should be populated
        .then(testElementValueEquals('input[type=email]', email))
        .then(testElementValueEquals('input[type=password]', 'bad' + PASSWORD));
    },

    'signup with existing account, coppa is empty': function () {
      return signUpWithExistingAccount(this, email, PASSWORD, PASSWORD, { age: ' ' })

        // should have navigated to 123done
        .then(testElementExists('#loggedin'));
    },

    'signup with existing account, coppa is empty, credentials are wrong': function () {
      return signUpWithExistingAccount(this, email, PASSWORD, 'bad' + PASSWORD, { age: ' ' })

        .then(visibleByQSA('.error'))
        .then(click('.error a[href^="/oauth/signin"]'))

        // should have navigated to sign-in view
        .then(testElementExists('#fxa-signin-header'))

        // should be /oauth/signin route
        .then(testUrlPathnameEquals('/oauth/signin'))

        // the email and password fields should be populated
        .then(testElementValueEquals('input[type=email]', email))
        .then(testElementValueEquals('input[type=password]', 'bad' + PASSWORD));
    },

    'signup with existing account, coppa is too young': function () {
      return signUpWithExistingAccount(this, email, PASSWORD, PASSWORD, { age: 12 })

        // should have navigated to 123done
        .then(testElementExists('#loggedin'));
    },

    'signup, bounce email, allow user to restart flow but force a different email': function () {
      this.timeout = 60 * 1000;

      var client = new FxaClient(AUTH_SERVER_ROOT, {
        xhr: nodeXMLHttpRequest.XMLHttpRequest
      });

      return this.remote
        .then(openFxaFromRp('signup'))

        .then(fillOutSignUp(bouncedEmail, PASSWORD))

        .then(testElementExists('#fxa-confirm-header'))

        .then(function () {
          return client.accountDestroy(bouncedEmail, PASSWORD);
        })

        .then(testElementExists('#fxa-signup-header'))

        // expect an error message to already be present on redirect
        .then(visibleByQSA('.tooltip'))

        // submit button should be disabled.
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
