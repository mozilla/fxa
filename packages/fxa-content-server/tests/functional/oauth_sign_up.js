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
  'tests/functional/lib/test',
  'tests/functional/lib/helpers'
], function (intern, registerSuite, assert, nodeXMLHttpRequest, FxaClient, TestHelpers, Test, FunctionalHelpers) {
  var config = intern.config;
  var AUTH_SERVER_ROOT = config.fxaAuthRoot;

  var PASSWORD = 'password';
  var email;
  var bouncedEmail;
  var fxaClient;

  var thenify = FunctionalHelpers.thenify;

  var click = FunctionalHelpers.click;
  var clearBrowserState = thenify(FunctionalHelpers.clearBrowserState);
  var closeCurrentWindow = FunctionalHelpers.closeCurrentWindow;
  var createUser = FunctionalHelpers.createUser;
  var fillOutSignUp = thenify(FunctionalHelpers.fillOutSignUp);
  var getVerificationLink = thenify(FunctionalHelpers.getVerificationLink);
  var noEmailExpected = FunctionalHelpers.noEmailExpected;
  var testElementValueEquals = FunctionalHelpers.testElementValueEquals;
  var openFxaFromRp = FunctionalHelpers.openFxaFromRp;
  var openPage = FunctionalHelpers.openPage;
  var openVerificationLinkInNewTab = thenify(FunctionalHelpers.openVerificationLinkInNewTab);
  var testUrlPathnameEquals = FunctionalHelpers.testUrlPathnameEquals;
  var type = FunctionalHelpers.type;
  var visibleByQSA = FunctionalHelpers.visibleByQSA;

  function signUpWithExistingAccount (context, email, firstPassword, secondPassword, options) {
    return context.remote
      .then(createUser(email, firstPassword, { preVerified: true }))
      .then(function () {
        return openFxaFromRp(context, 'signup');
      })
      .then(fillOutSignUp(context, email, secondPassword, options));
  }

  registerSuite({
    name: 'oauth signup',

    beforeEach: function () {
      email = TestHelpers.createEmail();
      bouncedEmail = TestHelpers.createEmail();
      fxaClient = new FxaClient(AUTH_SERVER_ROOT, {
        xhr: nodeXMLHttpRequest.XMLHttpRequest
      });

      // clear localStorage to avoid polluting other tests.
      // Without the clear, /signup tests fail because of the info stored
      // in prefillEmail
      return this.remote
        .then(clearBrowserState(this, {
          '123done': true,
          contentServer: true
        }));
    },

    'signup, verify same browser': function () {
      var self = this;
      return openFxaFromRp(self, 'signup')
        .findByCssSelector('#fxa-signup-header .service')
        .end()

        .getCurrentUrl()
        .then(function (url) {
          assert.ok(url.indexOf('client_id=') > -1);
          assert.ok(url.indexOf('redirect_uri=') > -1);
          assert.ok(url.indexOf('state=') > -1);
        })
        .end()

        .then(fillOutSignUp(self, email, PASSWORD))

        .findByCssSelector('#fxa-confirm-header')
        .end()

        .then(openVerificationLinkInNewTab(self, email, 0))

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
      var self = this;

      return openFxaFromRp(self, 'signup')

        .then(fillOutSignUp(self, email, PASSWORD))

        .findByCssSelector('#fxa-confirm-header')
        .end()

        // user browses to another site.
        .switchToFrame(null)

        .then(FunctionalHelpers.openExternalSite(self))

        .then(openVerificationLinkInNewTab(self, email, 0))

        .switchToWindow('newwindow')

        .findByCssSelector('#fxa-sign-up-complete-header')
        .end()

        // switch to the original window
        .then(closeCurrentWindow());
    },

    'signup, verify same browser by replacing the original tab': function () {
      var self = this;

      return openFxaFromRp(self, 'signup')

        .then(fillOutSignUp(self, email, PASSWORD))

        .findByCssSelector('#fxa-confirm-header')
        .end()

        .then(getVerificationLink(email, 0))
        .then(function (verificationLink) {
          return openPage(self, verificationLink, '#loggedin');
        });
    },

    'signup, verify different browser - from original tab\'s P.O.V.': function () {
      var self = this;

      return openFxaFromRp(self, 'signup')
        .then(fillOutSignUp(self, email, PASSWORD))

        .findByCssSelector('#fxa-confirm-header')
        .end()

        .then(function () {
          return FunctionalHelpers.openVerificationLinkDifferentBrowser(fxaClient, email);
        })

        // original tab redirects back to 123done
        .findByCssSelector('#loggedin')
        .end();
    },

    'signup, verify different browser - from new browser\'s P.O.V.': function () {
      var self = this;

      return openFxaFromRp(self, 'signup')
        .then(fillOutSignUp(self, email, PASSWORD))

        .findByCssSelector('#fxa-confirm-header')
        .end()

        // clear browser state to simulate opening link in a new browser
        .then(clearBrowserState(self, {
          '123done': true,
          contentServer: true
        }))

        .then(getVerificationLink(email, 0))
        .then(function (verificationLink) {
          // new browser dead ends at the 'account verified' screen.
          return openPage(self, verificationLink,
            '#fxa-sign-up-complete-header');
        })

        .findByCssSelector('.account-ready-service')
        .getVisibleText()
        .then(function (text) {
          // user sees the name of the rp,
          // but cannot redirect
          assert.isTrue(/123done/i.test(text));
        })
        .end()

        // make sure the relier name is not a link
        .then(Test.noElementById(self, 'redirectTo'));
    },

    'signup with existing account, coppa is valid': function () {
      return signUpWithExistingAccount(this, email, PASSWORD, PASSWORD)

        // should have navigated to 123done
        .findByCssSelector('#loggedin')
        .end();
    },

    'signup with existing account, coppa is valid, credentials are wrong': function () {
      return signUpWithExistingAccount(this, email, PASSWORD, 'bad' + PASSWORD)

        .then(visibleByQSA('.error'))
        .then(click('.error a[href="/oauth/signin"]'))

        // should have navigated to sign-in view
        .findByCssSelector('#fxa-signin-header')
        .end()

        // should be /oauth/signin route
        .then(testUrlPathnameEquals('/oauth/signin'))

        // the email and password fields should be populated
        .then(testElementValueEquals('input[type=email]', email))
        .then(testElementValueEquals('input[type=password]', 'bad' + PASSWORD));
    },

    'signup with existing account, coppa is empty': function () {
      return signUpWithExistingAccount(this, email, PASSWORD, PASSWORD, { age: ' ' })

        // should have navigated to 123done
        .findByCssSelector('#loggedin')
        .end();
    },

    'signup with existing account, coppa is empty, credentials are wrong': function () {
      return signUpWithExistingAccount(this, email, PASSWORD, 'bad' + PASSWORD, { age: ' ' })

        .then(visibleByQSA('.error'))
        .then(click('.error a[href="/oauth/signin"]'))

        // should have navigated to sign-in view
        .findByCssSelector('#fxa-signin-header')
        .end()

        // should be /oauth/signin route
        .then(testUrlPathnameEquals('/oauth/signin'))

        // the email and password fields should be populated
        .then(testElementValueEquals('input[type=email]', email))
        .then(testElementValueEquals('input[type=password]', 'bad' + PASSWORD));
    },

    'signup with existing account, coppa is too young': function () {
      return signUpWithExistingAccount(this, email, PASSWORD, PASSWORD, { age: 12 })

        // should have navigated to 123done
        .findByCssSelector('#loggedin')
        .end();
    },

    'signup, bounce email, allow user to restart flow but force a different email': function () {
      var self = this;
      var client = new FxaClient(AUTH_SERVER_ROOT, {
        xhr: nodeXMLHttpRequest.XMLHttpRequest
      });

      return openFxaFromRp(self, 'signup')
        .then(fillOutSignUp(self, bouncedEmail, PASSWORD))

        .findById('fxa-confirm-header')
        .end()

        .then(function () {
          return client.accountDestroy(bouncedEmail, PASSWORD);
        })

        .findById('fxa-signup-header')
        .end()

        // expect an error message to already be present on redirect
        .then(FunctionalHelpers.visibleByQSA('.tooltip'))

        // submit button should be disabled.
        .findByCssSelector('button[type="submit"].disabled')
        .end()

        .then(type('input[type="email"]', email))
        .then(click('button[type="submit"]'))

        .findById('fxa-confirm-header')
        .end()

        .then(openVerificationLinkInNewTab(self, email, 0))

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
        .end();
    }

  });

});
