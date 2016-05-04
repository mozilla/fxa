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
  'tests/functional/lib/helpers'
], function (intern, registerSuite, assert, require, nodeXMLHttpRequest, FxaClient, TestHelpers, FunctionalHelpers) {
  var config = intern.config;
  var AUTH_SERVER_ROOT = config.fxaAuthRoot;
  var PAGE_URL = config.fxaContentRoot + 'signup';

  var email;
  var PASSWORD = '12345678';
  var client;

  var thenify = FunctionalHelpers.thenify;

  var click = FunctionalHelpers.click;
  var clearBrowserState = thenify(FunctionalHelpers.clearBrowserState);
  var createUser = FunctionalHelpers.createUser;
  var fillOutSignIn = thenify(FunctionalHelpers.fillOutSignIn);
  var fillOutSignUp = thenify(FunctionalHelpers.fillOutSignUp);
  var openPage = FunctionalHelpers.openPage;
  var testAttributeMatches = FunctionalHelpers.testAttributeMatches;
  var testElementValueEquals = FunctionalHelpers.testElementValueEquals;
  var visibleByQSA = FunctionalHelpers.visibleByQSA;

  function testAtConfirmScreen (email) {
    return function () {
      return this.parent
        .findByCssSelector('.verification-email-message')
          .getVisibleText()
          .then(function (resultText) {
            // check the email address was written
            assert.ok(resultText.indexOf(email) > -1);
          })
        .end();
    };
  }

  function signUpWithExistingAccount (context, email, firstPassword, secondPassword, options) {
    return context.remote
      .then(createUser(email, firstPassword, { preVerified: true }))
      .then(fillOutSignUp(context, email, secondPassword, options));
  }

  registerSuite({
    name: 'signup',

    beforeEach: function () {
      client = new FxaClient(AUTH_SERVER_ROOT, {
        xhr: nodeXMLHttpRequest.XMLHttpRequest
      });
      email = TestHelpers.createEmail();
      return FunctionalHelpers.clearBrowserState(this);
    },

    afterEach: function () {
      return FunctionalHelpers.clearBrowserState(this);
    },

    'signup, verify same browser': function () {
      var self = this;
      return this.remote
        .then(fillOutSignUp(this, email, PASSWORD))
        .then(testAtConfirmScreen(email))
        .then(function () {
          return FunctionalHelpers.openVerificationLinkInNewTab(self, email, 0);
        })
        .switchToWindow('newwindow')

        .findByCssSelector('#fxa-settings-header')
        .end()

        .then(FunctionalHelpers.testSuccessWasShown(this))

        .closeCurrentWindow()

        // back to the original window
        .switchToWindow('')

        .findByCssSelector('#fxa-settings-header')
        .end()

        .then(FunctionalHelpers.testSuccessWasShown(this));
    },

    'signup, verify same browser with original tab closed, sign out': function () {
      var self = this;
      return this.remote
        .then(fillOutSignUp(this, email, PASSWORD))
        .then(testAtConfirmScreen(email))

        .then(FunctionalHelpers.openExternalSite(self))

        .then(function () {
          return FunctionalHelpers.openVerificationLinkInNewTab(self, email, 0);
        })

        .switchToWindow('newwindow')
        .findByCssSelector('#fxa-settings-header')
        .end()

        .then(FunctionalHelpers.testSuccessWasShown(this))

        // Ref https://github.com/mozilla/fxa-content-server/issues/3187
        // Ensure the signin screen shows if the user signs out after
        // verification.
        .then(click('#signout'))

        .findByCssSelector('#fxa-signin-header')
        .end()

        // `visibleByQSA` is used to ensure visibility. With the bug in #3187
        // referenced above, the signin screen is drawn, but invisible
        .then(visibleByQSA('#fxa-signin-header'))
        .end()

        .closeCurrentWindow()

        // back to the original window
        .switchToWindow('')
        .end();
    },

    'signup, verify and sign out of two accounts, all in the same tab, then sign in to the first account': function () {
      // https://github.com/mozilla/fxa-content-server/issues/2209
      var secondEmail = TestHelpers.createEmail();
      var self = this;
      return this.remote
        .then(fillOutSignUp(this, email, PASSWORD))
        .then(testAtConfirmScreen(email))
        .then(function () {
          return FunctionalHelpers.getVerificationLink(email, 0);
        })
        .then(function (verificationLink) {
          return self.remote.get(require.toUrl(verificationLink));
        })

        .findByCssSelector('#fxa-settings-header')
        .end()

        .then(FunctionalHelpers.testSuccessWasShown(self))

        .then(click('#signout'))

        .findByCssSelector('#fxa-signin-header')
        .end()

        .then(fillOutSignUp(self, secondEmail, PASSWORD))
        .then(testAtConfirmScreen(secondEmail))
        .then(function () {
          return FunctionalHelpers.getVerificationLink(secondEmail, 0);
        })
        .then(function (verificationLink) {
          return self.remote.get(require.toUrl(verificationLink));
        })

        .findByCssSelector('#fxa-settings-header')
        .end()

        .then(FunctionalHelpers.testSuccessWasShown(self))

        .then(click('#signout'))

        .findByCssSelector('#fxa-signin-header')
        .end()

        .then(fillOutSignIn(self, email, PASSWORD))

        .findByCssSelector('#fxa-settings-header')
        .end();
    },

    'signup, verify same browser by replacing the original tab': function () {
      var self = this;
      return this.remote
        .then(fillOutSignUp(this, email, PASSWORD))
        .then(testAtConfirmScreen(email))

        .then(function () {
          return FunctionalHelpers.getVerificationLink(email, 0);
        })
        .then(function (verificationLink) {
          return self.remote.get(require.toUrl(verificationLink));
        })

        .findByCssSelector('#fxa-settings-header')
        .end()

        .then(FunctionalHelpers.testSuccessWasShown(this));
    },

    'signup, verify different browser - from original tab\'s P.O.V.': function () {
      return this.remote
        .then(fillOutSignUp(this, email, PASSWORD))
        .then(testAtConfirmScreen(email))

        .then(function () {
          return FunctionalHelpers.openVerificationLinkDifferentBrowser(client, email);
        })

        // The original tab should transition to the settings page w/ success
        // message.
        .findByCssSelector('#fxa-settings-header')
        .end()

        .then(FunctionalHelpers.testSuccessWasShown(this));
    },

    'signup, verify different browser - from new browser\'s P.O.V.': function () {
      var self = this;
      return this.remote
        .then(fillOutSignUp(this, email, PASSWORD))
        .then(testAtConfirmScreen(email))

        // clear local/sessionStorage to synthesize continuing in
        // a separate browser.
        .then(clearBrowserState(self))

        // verify the user
        .then(function () {
          return FunctionalHelpers.getVerificationLink(email, 0);
        })
        .then(function (link) {
          return self.remote.get(link);
        })

        // user cannot be signed in and redirected to the settings page
        // automatically, just show the signup complete screen.
        .findById('fxa-sign-up-complete-header')
        .end();
    },

    'signup with email with leading whitespace on the email': function () {
      var emailWithoutSpace = email;
      var emailWithSpace = ('   ' + email);
      var self = this;
      return this.remote
        .then(fillOutSignUp(this, emailWithSpace, PASSWORD))
        .then(testAtConfirmScreen(emailWithoutSpace))
        .then(clearBrowserState(self))
        .then(fillOutSignIn(self, emailWithoutSpace, PASSWORD))

        // user is not confirmed, success is seeing the confirm screen.
        .findById('fxa-confirm-header')
        .end();
    },

    'signup with email with trailing whitespace on the email': function () {
      var emailWithoutSpace = email;
      var emailWithSpace = ('   ' + email);

      var self = this;
      return this.remote
        .then(fillOutSignUp(this, emailWithSpace, PASSWORD))
        .then(testAtConfirmScreen(emailWithoutSpace))
        .then(clearBrowserState(self))
        .then(fillOutSignIn(self, emailWithoutSpace, PASSWORD))

        // user is not confirmed, success is seeing the confirm screen.
        .findById('fxa-confirm-header')
        .end();
    },

    'signup with invalid email address': function () {
      return this.remote
        .then(fillOutSignUp(this, email + '-', PASSWORD))

        // wait five seconds to allow any errant navigation to occur
        .sleep(5000)

        // navigation should not occur
        .findByCssSelector('#fxa-signup-header')
        .end()

        // the validation tooltip should be visible
        .then(visibleByQSA('.tooltip'));
    },

    'signup with existing account, coppa is valid, credentials are correct': function () {
      return signUpWithExistingAccount(this, email, PASSWORD, PASSWORD)

        // should have navigated to settings view
        .findByCssSelector('#fxa-settings-header')
        .end();
    },

    'signup with existing account, coppa is valid, credentials are wrong': function () {
      return signUpWithExistingAccount(this, email, PASSWORD, 'bad' + PASSWORD)

        .then(visibleByQSA('.error'))
        .then(click('.error a[href="/signin"]'))

        .findByCssSelector('#fxa-signin-header')
        .end()

        // the email and password fields should be populated
        .then(testElementValueEquals('input[type=email]', email))
        .then(testElementValueEquals('input[type=password]', 'bad' + PASSWORD));
    },

    'signup with existing account, coppa is empty, credentials are correct': function () {
      return signUpWithExistingAccount(this, email, PASSWORD, PASSWORD, { age: ' ' })

        // should have navigated to settings view
        .findByCssSelector('#fxa-settings-header')
        .end();
    },

    'signup with existing account, coppa is empty, credentials are wrong': function () {
      return signUpWithExistingAccount(this, email, PASSWORD, 'bad' + PASSWORD, { age: ' ' })

        .then(visibleByQSA('.error'))
        .then(click('.error a[href="/signin"]'))

        .findByCssSelector('#fxa-signin-header')
        .end()

        // the email and password fields should be populated
        .then(testElementValueEquals('input[type=email]', email))
        .then(testElementValueEquals('input[type=password]', 'bad' + PASSWORD));
    },

    'signup with new account, coppa is empty': function () {
      return this.remote
        .then(fillOutSignUp(this, email, PASSWORD, { age: ' ' }))

        // navigation should not occur
        .findByCssSelector('#fxa-signup-header')
        .end()

        // an error should be visible
        .then(visibleByQSA('.error'));
    },

    'signup with existing account, coppa is too young, credentials are correct': function () {
      return signUpWithExistingAccount(this, email, PASSWORD, PASSWORD, { age: 12 })

        // should have navigated to settings view
        .findByCssSelector('#fxa-settings-header')
        .end();
    },

    'signup with existing account, coppa is too young, credentials are wrong': function () {
      return signUpWithExistingAccount(this, email, PASSWORD, 'bad' + PASSWORD, { age: 12 })

        .then(visibleByQSA('.error'))
        .then(click('.error a[href="/signin"]'))

        .findByCssSelector('#fxa-signin-header')
        .end()

        .then(testElementValueEquals('input[type=email]', email))
        .then(testElementValueEquals('input[type=password]', 'bad' + PASSWORD));
    },

    'signup with new account, coppa is too young': function () {
      return this.remote
        .then(fillOutSignUp(this, email, PASSWORD, { age: 12 }))

        // should have navigated to cannot-create-account view
        .findByCssSelector('#fxa-cannot-create-account-header')
        .end();
    },

    'signup with a verified account signs the user in': function () {
      var self = this;

      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(fillOutSignUp(self, email, PASSWORD))

        // should have navigated to settings view
        .findByCssSelector('#fxa-settings-header')
        .end();
    },

    'signup with an unverified account and different password re-signs up user': function () {

      var self = this;

      return this.remote
        .then(createUser(email, PASSWORD))
        .then(fillOutSignUp(self, email, 'different password'))

        // Being pushed to the confirmation screen is success.
        .findByCssSelector('.verification-email-message')
          .getVisibleText()
          .then(function (resultText) {
            // check the email address was written
            assert.ok(resultText.indexOf(email) > -1);
          })
        .end();
    },

    'visiting the pp links saves information for return': function () {
      return testRepopulateFields.call(this, '/legal/terms', 'fxa-tos-header');
    },

    'visiting the tos links saves information for return': function () {
      return testRepopulateFields.call(this, '/legal/privacy', 'fxa-pp-header');
    },

    'form prefill information is cleared after signup->sign out': function () {
      var self = this;
      return this.remote
        .then(fillOutSignUp(self, email, PASSWORD))
        .then(testAtConfirmScreen(email))

        .then(function () {
          return FunctionalHelpers.openVerificationLinkDifferentBrowser(client, email);
        })

        // The original tab should transition to the settings page w/ success
        // message.
        .findByCssSelector('#fxa-settings-header')
        .end()

        .then(click('#signout'))

        .findByCssSelector('#fxa-signin-header')
        .end()

        // check the email address was cleared
        .then(testElementValueEquals('input[type=email]', ''))
        // check the password was cleared
        .then(testElementValueEquals('input[type=password]', ''));
    },

    'signup, open sign-in in second tab, verify in third tab': function () {
      var windowName = 'sign-up inter-tab functional test';
      var self = this;
      return self.remote
        .then(fillOutSignUp(this, email, PASSWORD))
        .then(testAtConfirmScreen(email))
        .then(function () {
          return FunctionalHelpers.openSignInInNewTab(self, windowName);
        })
        .switchToWindow(windowName)

        .findByCssSelector('#fxa-signin-header')
        .end()

        .then(function () {
          return FunctionalHelpers.openVerificationLinkInNewTab(self, email, 0);
        })
        .switchToWindow('newwindow')

        .findByCssSelector('#fxa-settings-header')
        .end()

        .closeCurrentWindow()
        .switchToWindow(windowName)

        .findByCssSelector('#fxa-settings-header')
        .end()

        .closeCurrentWindow()
        .switchToWindow('')

        .findByCssSelector('#fxa-settings-header')
        .end();
    },

    'signup, open sign-up in second tab, verify in original tab': function () {
      var windowName = 'sign-up inter-tab functional test';
      var self = this;
      return this.remote
        .then(fillOutSignUp(this, email, PASSWORD))
        .then(testAtConfirmScreen(email))
        .then(function () {
          return FunctionalHelpers.openSignUpInNewTab(self, windowName);
        })
        .switchToWindow(windowName)

        .findByCssSelector('#fxa-signup-header')
        .end()

        .switchToWindow('')
        .then(function () {
          return FunctionalHelpers.getVerificationLink(email, 0);
        })
        .then(function (verificationLink) {
          return self.remote.get(require.toUrl(verificationLink));
        })
        .switchToWindow(windowName)

        .findByCssSelector('#fxa-settings-header')
        .end()

        .closeCurrentWindow()
        .switchToWindow('')

        .findByCssSelector('#fxa-settings-header')
        .end();
    },

    'data-flow-begin attribute is set': function () {
      this.remote
        .then(testAttributeMatches('body', 'data-flow-begin', /^[1-9][0-9]{13,}$/));
    }
  });

  function testRepopulateFields(dest, header) {
    var self = this;

    return openPage(self, PAGE_URL, '#fxa-signup-header')

      .then(fillOutSignUp(self, email, PASSWORD, { submit: false }))

      .then(click('a[href="' + dest + '"]'))

      .findById(header)
      .end()

      .then(click('.back'))

      .then(testElementValueEquals('input[type=email]', email))
      .then(testElementValueEquals('input[type=password]', PASSWORD))
      .then(testElementValueEquals('#age', '24'));
  }
});
