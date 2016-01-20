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

  function fillOutSignUp(context, email, password) {
    return FunctionalHelpers.fillOutSignUp(context, email, password);
  }

  function fillOutSignIn(context, email, password) {
    return FunctionalHelpers.fillOutSignIn(context, email, password);
  }

  function testAtConfirmScreen(context, email) {
    return context.remote
      .findByCssSelector('.verification-email-message')
        .getVisibleText()
        .then(function (resultText) {
          // check the email address was written
          assert.ok(resultText.indexOf(email) > -1);
        })
      .end();
  }

  function signUpWithExistingAccount (context, email, firstPassword, secondPassword, options) {
    return fillOutSignUp(context, email, firstPassword)
      .then(function () {
        return testAtConfirmScreen(context, email);
      })
      .then(function () {
        return FunctionalHelpers.getVerificationLink(email, 0);
      })
      .then(function (verificationLink) {
        return context.remote.get(require.toUrl(verificationLink));
      })

      .findByCssSelector('#fxa-settings-header')
      .end()

      .then(FunctionalHelpers.testSuccessWasShown(context))

      .findByCssSelector('#signout')
        .click()
      .end()

      .findByCssSelector('#fxa-signin-header')
      .end()

      .then(function () {
        return FunctionalHelpers.fillOutSignUp(context, email, secondPassword, options);
      });
  }

  registerSuite({
    name: 'sign_up',

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

    'sign up, verify same browser': function () {
      var self = this;
      return fillOutSignUp(this, email, PASSWORD)
        .then(function () {
          return testAtConfirmScreen(self, email);
        })
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

    'sign up, verify same browser with original tab closed, sign out': function () {
      var self = this;
      return fillOutSignUp(this, email, PASSWORD)
        .then(function () {
          return testAtConfirmScreen(self, email);
        })

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
        .findByCssSelector('#signout')
          .click()
        .end()

        .findByCssSelector('#fxa-signin-header')
        .end()

        // `visibleByQSA` is used to ensure visibility. With the bug in #3187
        // referenced above, the signin screen is drawn, but invisible
        .then(FunctionalHelpers.visibleByQSA('#fxa-signin-header'))
        .end()

        .closeCurrentWindow()

        // back to the original window
        .switchToWindow('')
        .end();
    },

    'sign up, verify and sign out of two accounts, all in the same tab, then sign in to the first account': function () {
      // https://github.com/mozilla/fxa-content-server/issues/2209
      var secondEmail = TestHelpers.createEmail();
      var self = this;
      return fillOutSignUp(this, email, PASSWORD)
        .then(function () {
          return testAtConfirmScreen(self, email);
        })
        .then(function () {
          return FunctionalHelpers.getVerificationLink(email, 0);
        })
        .then(function (verificationLink) {
          return self.remote.get(require.toUrl(verificationLink));
        })

        .findByCssSelector('#fxa-settings-header')
        .end()

        .then(FunctionalHelpers.testSuccessWasShown(self))

        .findByCssSelector('#signout')
          .click()
        .end()

        .findByCssSelector('#fxa-signin-header')
        .end()

        .then(function () {
          return fillOutSignUp(self, secondEmail, PASSWORD);
        })
        .then(function () {
          return testAtConfirmScreen(self, secondEmail);
        })
        .then(function () {
          return FunctionalHelpers.getVerificationLink(secondEmail, 0);
        })
        .then(function (verificationLink) {
          return self.remote.get(require.toUrl(verificationLink));
        })

        .findByCssSelector('#fxa-settings-header')
        .end()

        .then(FunctionalHelpers.testSuccessWasShown(self))

        .findByCssSelector('#signout')
          .click()
        .end()

        .findByCssSelector('#fxa-signin-header')
        .end()

        .then(function () {
          return fillOutSignIn(self, email, PASSWORD);
        })

        .findByCssSelector('#fxa-settings-header')
        .end();
    },

    'sign up, verify same browser by replacing the original tab': function () {
      var self = this;
      return fillOutSignUp(this, email, PASSWORD)
        .then(function () {
          return testAtConfirmScreen(self, email);
        })

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
      var self = this;
      return fillOutSignUp(self, email, PASSWORD)
        .then(function () {
          return testAtConfirmScreen(self, email);
        })

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
      return fillOutSignUp(self, email, PASSWORD)
        .then(function () {
          return testAtConfirmScreen(self, email);
        })

        // clear local/sessionStorage to synthesize continuing in
        // a separate browser.
        .then(function () {
          return FunctionalHelpers.clearBrowserState(self);
        })

        // verify the user
        .then(function () {
          return FunctionalHelpers.getVerificationLink(email, 0);
        })
        .then(function (link) {
          return self.remote.get(link);
        })

        // user cannot be signed in and redirected to the settings page
        // automatically, just show the sign up complete screen.
        .findById('fxa-sign-up-complete-header')
        .end();
    },

    'sign up with email with leading whitespace on the email': function () {
      var emailWithoutSpace = email;
      var emailWithSpace = ('   ' + email);
      var self = this;
      return fillOutSignUp(this, emailWithSpace, PASSWORD)
        .then(function () {
          return testAtConfirmScreen(self, emailWithoutSpace);
        })
        .then(function () {
          return FunctionalHelpers.clearBrowserState(self);
        })
        .then(function () {
          return fillOutSignIn(self, emailWithoutSpace, PASSWORD);
        })

        // user is not confirmed, success is seeing the confirm screen.
        .findById('fxa-confirm-header')
        .end();
    },

    'sign up with email with trailing whitespace on the email': function () {
      var emailWithoutSpace = email;
      var emailWithSpace = ('   ' + email);

      var self = this;
      return fillOutSignUp(this, emailWithSpace, PASSWORD)
        .then(function () {
          return testAtConfirmScreen(self, emailWithoutSpace);
        })
        .then(function () {
          return FunctionalHelpers.clearBrowserState(self);
        })
        .then(function () {
          return fillOutSignIn(self, emailWithoutSpace, PASSWORD);
        })

        // user is not confirmed, success is seeing the confirm screen.
        .findById('fxa-confirm-header')
        .end();
    },

    'sign up with existing account, coppa is valid, credentials are correct': function () {
      return signUpWithExistingAccount(this, email, PASSWORD, PASSWORD)

        // should have navigated to settings view
        .findByCssSelector('#fxa-settings-header')
        .end();
    },

    'sign up with existing account, coppa is valid, credentials are wrong': function () {
      return signUpWithExistingAccount(this, email, PASSWORD, 'bad' + PASSWORD)

        // should have navigated to sign-in view
        .findByCssSelector('#fxa-signin-header')
        .end()

        // should be /signin route
        .getCurrentUrl()
          .then(function (url) {
            assert.ok(url.indexOf('/signin') > -1);
            assert.equal(url.indexOf('/oauth/signin'), -1);
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

    'sign up with existing account, coppa is empty, credentials are correct': function () {
      return signUpWithExistingAccount(this, email, PASSWORD, PASSWORD, { age: ' ' })

        // should have navigated to settings view
        .findByCssSelector('#fxa-settings-header')
        .end();
    },

    'sign up with existing account, coppa is empty, credentials are wrong': function () {
      return signUpWithExistingAccount(this, email, PASSWORD, 'bad' + PASSWORD, { age: ' ' })

        // should have navigated to sign-in view
        .findByCssSelector('#fxa-signin-header')
        .end()

        // should be /signin route
        .getCurrentUrl()
          .then(function (url) {
            assert.ok(url.indexOf('/signin') > -1);
            assert.equal(url.indexOf('/oauth/signin'), -1);
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

    'sign up with new account, coppa is empty': function () {
      return FunctionalHelpers.fillOutSignUp(this, email, PASSWORD, { age: ' ' })

        // navigation should not occur
        .findByCssSelector('#fxa-signup-header')
        .end()

        // an error should be visible
        .then(FunctionalHelpers.testErrorWasShown(this));
    },

    'sign up with existing account, coppa is too young, credentials are correct': function () {
      return signUpWithExistingAccount(this, email, PASSWORD, PASSWORD, { age: 12 })

        // should have navigated to settings view
        .findByCssSelector('#fxa-settings-header')
        .end();
    },

    'sign up with existing account, coppa is too young, credentials are wrong': function () {
      return signUpWithExistingAccount(this, email, PASSWORD, 'bad' + PASSWORD, { age: 12 })

        // should have navigated to sign-in view
        .findByCssSelector('#fxa-signin-header')
        .end()

        // should be /signin route
        .getCurrentUrl()
          .then(function (url) {
            assert.ok(url.indexOf('/signin') > -1);
            assert.equal(url.indexOf('/oauth/signin'), -1);
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

    'sign up with new account, coppa is too young': function () {
      return FunctionalHelpers.fillOutSignUp(this, email, PASSWORD, { age: 12 })

        // should have navigated to cannot-create-account view
        .findByCssSelector('#fxa-cannot-create-account-header')
        .end();
    },

    'sign up with a verified account signs the user in': function () {
      var self = this;

      return client.signUp(email, PASSWORD, { preVerified: true })
        .then(function () {
          return fillOutSignUp(self, email, PASSWORD)

            // should have navigated to settings view
            .findByCssSelector('#fxa-settings-header')
            .end();
        });
    },

    'sign up with an unverified account and different password re-signs up user': function () {

      var self = this;

      return client.signUp(email, PASSWORD)
        .then(function () {
          return fillOutSignUp(self, email, 'different password')
            // Being pushed to the confirmation screen is success.
            .findByCssSelector('.verification-email-message')
              .getVisibleText()
              .then(function (resultText) {
                // check the email address was written
                assert.ok(resultText.indexOf(email) > -1);
              })
            .end();
        });
    },

    'visiting the pp links saves information for return': function () {
      return testRepopulateFields.call(this, '/legal/terms', 'fxa-tos-header');
    },

    'visiting the tos links saves information for return': function () {
      return testRepopulateFields.call(this, '/legal/privacy', 'fxa-pp-header');
    },

    'form prefill information is cleared after sign up->sign out': function () {
      var self = this;
      return fillOutSignUp(self, email, PASSWORD)
        .then(function () {
          return testAtConfirmScreen(self, email);
        })

        .then(function () {
          return FunctionalHelpers.openVerificationLinkDifferentBrowser(client, email);
        })

        // The original tab should transition to the settings page w/ success
        // message.
        .findByCssSelector('#fxa-settings-header')
        .end()

        .findByCssSelector('#signout')
          .click()
        .end()

        .findByCssSelector('#fxa-signin-header')
        .end()

        .findByCssSelector('input[type=email]')
          .getProperty('value')
          .then(function (resultText) {
            // check the email address was cleared
            assert.equal(resultText, '');
          })
        .end()

        .findByCssSelector('input[type=password]')
          .getProperty('value')
          .then(function (resultText) {
            // check the password address was cleared
            assert.equal(resultText, '');
          })
        .end();
    },

    'sign up, open sign-in in second tab, verify in third tab': function () {
      var windowName = 'sign-up inter-tab functional test';
      var self = this;
      return fillOutSignUp(this, email, PASSWORD)
        .then(function () {
          return testAtConfirmScreen(self, email);
        })
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

    'sign up, open sign-up in second tab, verify in original tab': function () {
      var windowName = 'sign-up inter-tab functional test';
      var self = this;
      return fillOutSignUp(this, email, PASSWORD)
        .then(function () {
          return testAtConfirmScreen(self, email);
        })
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
    }
  });

  function testRepopulateFields(dest, header) {
    var self = this;

    return FunctionalHelpers.openPage(self, PAGE_URL, '#fxa-signup-header')

      .then(function () {
        return FunctionalHelpers.fillOutSignUp(self, email, PASSWORD, { submit: false });
      })

      .findByCssSelector('a[href="' + dest + '"]')
        .click()
      .end()

      .findById(header)
      .end()

      .findByCssSelector('.back')
        .click()
      .end()

      .findByCssSelector('input[type=email]')
        .getProperty('value')
        .then(function (resultText) {
          // check the email address was re-populated
          assert.equal(resultText, email);
        })
      .end()

      .findByCssSelector('input[type=password]')
        .getProperty('value')
        .then(function (resultText) {
          // check the email address was re-populated
          assert.equal(resultText, PASSWORD);
        })
      .end()

      .findByCssSelector('#age')
        .getProperty('value')
        .then(function (resultText) {
          // check the email address was re-populated
          assert.equal(resultText, '24');
        })
      .end();
  }
});
