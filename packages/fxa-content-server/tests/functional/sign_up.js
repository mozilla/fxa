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
          return FunctionalHelpers.openVerificationLinkSameBrowser(self, email, 0);
        })
        .switchToWindow('newwindow')

        .findByCssSelector('#fxa-settings-header')
        .end()

        .then(FunctionalHelpers.testSuccessWasShown(this))

        .closeCurrentWindow()

        // back to the original window
        .switchToWindow('')
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
          return FunctionalHelpers.openVerificationLinkSameBrowser(self, email, 0);
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

    'coppa does not allow sign up if younger than 13 years old': function () {
      return this.remote
        .get(require.toUrl(PAGE_URL))
        .findByCssSelector('form input.email')
          .click()
          .type(email)
        .end()

        .findByCssSelector('form input.password')
          .click()
          .type(PASSWORD)
        .end()

        .findByCssSelector('#age')
        // XXX: Bug in Selenium 2.47.1, if Firefox is out of focus it will just type 1 number,
        // split the type commands for each character to avoid issues with the test runner
        .type('1')
        .type('2')
        .end()

        .findByCssSelector('button[type="submit"]')
          .click()
        .end()

        // Success is being redirected to the cannot create screen.
        .findById('fxa-cannot-create-account-header')
        .end();
    },


    'sign up with a verified account forces the user to sign in': function () {
      var self = this;

      return client.signUp(email, PASSWORD, { preVerified: true })
        .then(function () {
          return fillOutSignUp(self, email, PASSWORD)
            // The error area shows a link to /signin
            .then(FunctionalHelpers.visibleByQSA('.error a[href="/signin"]'))
            .findByCssSelector('.error a[href="/signin"]')
              .click()
            .end()

            .findByCssSelector('input[type=email]')
              .getAttribute('value')
              .then(function (resultText) {
                // check the email address carried over.
                assert.equal(resultText, email);
              })
            .end()

            .findByCssSelector('input[type=password]')
              .getAttribute('value')
              .then(function (resultText) {
                // check the password carried over.
                assert.equal(resultText, PASSWORD);
              })
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
    }
  });

  function testRepopulateFields(dest, header) {
    var self = this;

    return self.remote
      .get(require.toUrl(PAGE_URL))
      .findByCssSelector('input[type=email]')
        .clearValue()
        .click()
        .type(email)
      .end()

      .findByCssSelector('input[type=password]')
        .clearValue()
        .click()
        .type(PASSWORD)
      .end()

      .findByCssSelector('#age')
      // XXX: Bug in Selenium 2.47.1, if Firefox is out of focus it will just type 1 number,
      // split the type commands for each character to avoid issues with the test runner
      .type('2')
      .type('4')
      .end()

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
