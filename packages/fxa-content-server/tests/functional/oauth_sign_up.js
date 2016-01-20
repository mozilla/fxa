/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'intern/chai!assert',
  'require',
  'intern/node_modules/dojo/node!xmlhttprequest',
  'app/bower_components/fxa-js-client/fxa-client',
  'tests/lib/helpers',
  'tests/functional/lib/test',
  'tests/functional/lib/helpers'
], function (intern, registerSuite, assert, require, nodeXMLHttpRequest, FxaClient, TestHelpers, Test, FunctionalHelpers) {
  var config = intern.config;
  var SIGNUP_ROOT = config.fxaContentRoot + 'oauth/signup';
  var AUTH_SERVER_ROOT = config.fxaAuthRoot;

  var PASSWORD = 'password';
  var email;
  var bouncedEmail;
  var fxaClient;

  function signUpWithExistingAccount (context, email, firstPassword, secondPassword, options) {
    return FunctionalHelpers.openFxaFromRp(context, 'signup')
      .then(function () {
        return FunctionalHelpers.fillOutSignUp(context, email, firstPassword);
      })

      .findByCssSelector('#fxa-confirm-header')
      .end()
      .then(function () {
        return FunctionalHelpers.getVerificationLink(email, 0);
      })
      .then(function (verificationLink) {
        return context.remote.get(require.toUrl(verificationLink));
      })

      .findByCssSelector('#loggedin')
      .end()

      .findByCssSelector('#logout')
        .click()
      .end()

      .findByCssSelector('.sign-in-button.signup')
        .click()
      .end()

      .then(function () {
        return FunctionalHelpers.fillOutSignUp(context, email, secondPassword, options);
      });
  }

  registerSuite({
    name: 'oauth sign up',

    beforeEach: function () {
      email = TestHelpers.createEmail();
      bouncedEmail = TestHelpers.createEmail();
      fxaClient = new FxaClient(AUTH_SERVER_ROOT, {
        xhr: nodeXMLHttpRequest.XMLHttpRequest
      });

      // clear localStorage to avoid polluting other tests.
      // Without the clear, /signup tests fail because of the info stored
      // in prefillEmail
      return FunctionalHelpers.clearBrowserState(this, {
        '123done': true,
        contentServer: true
      });
    },
    'with missing client_id': function () {
      return this.remote.get(require.toUrl(SIGNUP_ROOT + '?scope=profile'))
        .findByCssSelector('#fxa-400-header')
        .end();
    },

    'with missing scope': function () {
      return this.remote.get(require.toUrl(SIGNUP_ROOT + '?client_id=client_id'))
        .findByCssSelector('#fxa-400-header')
        .end();
    },

    'with invalid client_id': function () {
      return this.remote.get(require.toUrl(SIGNUP_ROOT + '?client_id=invalid_client_id&scope=profile'))
        .findByCssSelector('#fxa-400-header')
        .end();
    },

    'signup, verify same browser': function () {
      var self = this;
      return FunctionalHelpers.openFxaFromRp(self, 'signup')
        .findByCssSelector('#fxa-signup-header .service')
        .end()

        .getCurrentUrl()
        .then(function (url) {
          assert.ok(url.indexOf('client_id=') > -1);
          assert.ok(url.indexOf('redirect_uri=') > -1);
          assert.ok(url.indexOf('state=') > -1);
        })
        .end()

        .then(function () {
          return FunctionalHelpers.fillOutSignUp(self, email, PASSWORD);
        })

        .findByCssSelector('#fxa-confirm-header')
        .end()

        .then(function () {
          return FunctionalHelpers.openVerificationLinkInNewTab(
                      self, email, 0);
        })

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
        .closeCurrentWindow()
        .switchToWindow('')

        .findByCssSelector('#loggedin')
        .end();
    },

    'signup, verify same browser with original tab closed': function () {
      var self = this;

      return FunctionalHelpers.openFxaFromRp(self, 'signup')

        .then(function () {
          return FunctionalHelpers.fillOutSignUp(self, email, PASSWORD);
        })

        .findByCssSelector('#fxa-confirm-header')
        .end()

        // user browses to another site.
        .switchToFrame(null)

        .then(FunctionalHelpers.openExternalSite(self))

        .then(function () {
          return FunctionalHelpers.openVerificationLinkInNewTab(
                      self, email, 0);
        })

        .switchToWindow('newwindow')

        .findByCssSelector('#fxa-sign-up-complete-header')
        .end()

        // switch to the original window
        .closeCurrentWindow()
        .switchToWindow('');
    },

    'signup, verify same browser by replacing the original tab': function () {
      var self = this;

      return FunctionalHelpers.openFxaFromRp(self, 'signup')

        .then(function () {
          return FunctionalHelpers.fillOutSignUp(self, email, PASSWORD);
        })

        .findByCssSelector('#fxa-confirm-header')
        .end()

        .then(function () {
          return FunctionalHelpers.getVerificationLink(email, 0);
        })
        .then(function (verificationLink) {
          return self.remote.get(require.toUrl(verificationLink));
        })

        .findByCssSelector('#loggedin')
        .end();
    },

    'signup, verify different browser - from original tab\'s P.O.V.': function () {
      var self = this;

      return FunctionalHelpers.openFxaFromRp(self, 'signup')
        .then(function () {
          return FunctionalHelpers.fillOutSignUp(self, email, PASSWORD);
        })

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

      return FunctionalHelpers.openFxaFromRp(self, 'signup')
        .then(function () {
          return FunctionalHelpers.fillOutSignUp(self, email, PASSWORD);
        })

        .findByCssSelector('#fxa-confirm-header')
        .end()

        .then(function () {
          // clear browser state to simulate opening link in a new browser
          return FunctionalHelpers.clearBrowserState(self, {
            '123done': true,
            contentServer: true
          });
        })

        .then(function () {
          return FunctionalHelpers.getVerificationLink(email, 0);
        })
        .then(function (verificationLink) {
          return self.remote.get(require.toUrl(verificationLink));
        })

        // new browser dead ends at the 'account verified' screen.
        .findByCssSelector('#fxa-sign-up-complete-header')
        .end()

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

    'sign up with existing account, coppa is valid': function () {
      return signUpWithExistingAccount(this, email, PASSWORD, PASSWORD)

        // should have navigated to 123done
        .findByCssSelector('#loggedin')
        .end();
    },

    'sign up with existing account, coppa is valid, credentials are wrong': function () {
      return signUpWithExistingAccount(this, email, PASSWORD, 'bad' + PASSWORD)

        // should have navigated to sign-in view
        .findByCssSelector('#fxa-signin-header')
        .end()

        // should be /oauth/signin route
        .getCurrentUrl()
          .then(function (url) {
            assert.ok(url.indexOf('/oauth/signin') > -1);
          })
        .end()

        // an error should be visible
        .then(FunctionalHelpers.testErrorWasShown(this))

        // the email field should be populated
        .findByCssSelector('input[type=email]')
          .getAttribute('value')
          .then(function (resultText) {
            assert.equal(resultText, email);
          })
        .end()

          // the password field should be populated
        .findByCssSelector('input[type=password]')
          .getAttribute('value')
          .then(function (resultText) {
            assert.equal(resultText, 'bad' + PASSWORD);
          })
        .end();
    },

    'sign up with existing account, coppa is empty': function () {
      return signUpWithExistingAccount(this, email, PASSWORD, PASSWORD, { age: ' ' })

        // should have navigated to 123done
        .findByCssSelector('#loggedin')
        .end();
    },

    'sign up with existing account, coppa is empty, credentials are wrong': function () {
      return signUpWithExistingAccount(this, email, PASSWORD, 'bad' + PASSWORD, { age: ' ' })

        // should have navigated to sign-in view
        .findByCssSelector('#fxa-signin-header')
        .end()

        // should be /oauth/signin route
        .getCurrentUrl()
          .then(function (url) {
            assert.ok(url.indexOf('/oauth/signin') > -1);
          })
        .end()

        // an error should be visible
        .then(FunctionalHelpers.testErrorWasShown(this))

        // the email field should be populated
        .findByCssSelector('input[type=email]')
          .getAttribute('value')
          .then(function (resultText) {
            assert.equal(resultText, email);
          })
        .end()

          // the password field should be populated
        .findByCssSelector('input[type=password]')
          .getAttribute('value')
          .then(function (resultText) {
            assert.equal(resultText, 'bad' + PASSWORD);
          })
        .end();
    },

    'sign up with existing account, coppa is too young': function () {
      return signUpWithExistingAccount(this, email, PASSWORD, PASSWORD, { age: 12 })

        // should have navigated to 123done
        .findByCssSelector('#loggedin')
        .end();
    },

    'sign up, bounce email, allow user to restart flow but force a different email': function () {
      var self = this;
      var client = new FxaClient(AUTH_SERVER_ROOT, {
        xhr: nodeXMLHttpRequest.XMLHttpRequest
      });

      return FunctionalHelpers.openFxaFromRp(self, 'signup')
        .then(function () {
          return FunctionalHelpers.fillOutSignUp(self, bouncedEmail, PASSWORD);
        })

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

        .findByCssSelector('input[type="email"]')
          .clearValue()
          .click()
          .type(email)
        .end()

        .findByCssSelector('button[type="submit"]')
          .click()
        .end()

        .findById('fxa-confirm-header')
        .end()

        .then(function () {
          return FunctionalHelpers.openVerificationLinkInNewTab(
                      self, email, 0);
        })

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
        .closeCurrentWindow()
        .switchToWindow('')

        .findByCssSelector('#loggedin')
        .end();
    }

  });

});
