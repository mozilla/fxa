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

  var CUTOFF_YEAR = new Date().getFullYear() - 13;
  var OLD_ENOUGH_YEAR = CUTOFF_YEAR - 1;

  var email;
  var PASSWORD = '12345678';
  var client;

  function fillOutSignUp(context, email, password, year) {
    return FunctionalHelpers.fillOutSignUp(context, email, password, year);
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

  function testVerifiedMessageVisible(context) {
    return context.remote
      .then(FunctionalHelpers.visibleByQSA('.success'))
      .findByCssSelector('.success')
        .getVisibleText()
        .then(function (text) {
          assert.ok(/verified/i.test(text));
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
      return fillOutSignUp(this, email, PASSWORD, OLD_ENOUGH_YEAR)
        .then(function () {
          return testAtConfirmScreen(self, email);
        })
        .then(function () {
          return FunctionalHelpers.openVerificationLinkSameBrowser(self, email, 0);
        })
        .switchToWindow('newwindow')

        .findByCssSelector('#fxa-settings-header')
        .end()

        .then(function () {
          return testVerifiedMessageVisible(self);
        })

        .closeCurrentWindow()

        // back to the original window
        .switchToWindow('')
        .end()

        .then(function () {
          return testVerifiedMessageVisible(self);
        });
    },

    'sign up, verify same browser with original tab closed': function () {
      var self = this;
      return fillOutSignUp(this, email, PASSWORD, OLD_ENOUGH_YEAR)
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

        .then(function () {
          return testVerifiedMessageVisible(self);
        })

        .closeCurrentWindow()

        // back to the original window
        .switchToWindow('')
        .end();
    },

    'sign up, verify same browser by replacing the original tab': function () {
      var self = this;
      return fillOutSignUp(this, email, PASSWORD, OLD_ENOUGH_YEAR)
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

        .then(function () {
          return testVerifiedMessageVisible(self);
        });
    },

    'signup, verify different browser - from original tab\'s P.O.V.': function () {
      var self = this;
      return fillOutSignUp(self, email, PASSWORD, OLD_ENOUGH_YEAR)
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

        .then(function () {
          return testVerifiedMessageVisible(self);
        });
    },

    'signup, verify different browser - from new browser\'s P.O.V.': function () {
      var self = this;
      return fillOutSignUp(self, email, PASSWORD, OLD_ENOUGH_YEAR)
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
      return fillOutSignUp(this, emailWithSpace, PASSWORD, OLD_ENOUGH_YEAR)
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
      return fillOutSignUp(this, emailWithSpace, PASSWORD, OLD_ENOUGH_YEAR)
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

    'select a year that is 1 year too young, no month/day picker is shown': function () {
      return fillOutSignUp(this, email, PASSWORD, CUTOFF_YEAR + 1)
        // Success is being redirected to the cannot create screen.
        .findById('fxa-cannot-create-account-header')
        .end();
    },

    'select an age that is one day too young': function () {
      var now = new Date();
      // the getDate/setDate bit causes the date to automatically wrap
      // on the month boundaries - see
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/setDate
      // If the dayValue is outside of the range of date values for the month,
      // setDate will update the Date object accordingly. For example, if 0 is
      // provided for dayValue, the date will be set to the last day of the
      // previous month.
      now.setDate(now.getDate() + 1);
      var monthToSelect = now.getMonth();
      var dateToSelect = now.getDate();

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

        .findByCssSelector('#fxa-age-year')
        .end()

        .findById('fxa-' + CUTOFF_YEAR)
          .click()
        .end()

        .findById('fxa-month-' + monthToSelect)
          .click()
        .end()

        .findById('fxa-day-' + dateToSelect)
          .click()
        .end()

        .findByCssSelector('button[type="submit"]')
          .click()
        .end()

        // Success is being redirected to the cannot create screen.
        .findById('fxa-cannot-create-account-header')
        .end();
    },

    'select a 13 year old, on their birthday': function () {
      var now = new Date();
      var monthToSelect = now.getMonth();
      var dateToSelect = now.getDate();

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

        .findByCssSelector('#fxa-age-year')
        .end()

        .findById('fxa-' + CUTOFF_YEAR)
          .click()
        .end()

        .findById('fxa-month-' + monthToSelect)
          .click()
        .end()

        .findById('fxa-day-' + dateToSelect)
          .click()
        .end()

        .findByCssSelector('button[type="submit"]')
          .click()
        .end()

        // A 13 year old is allowed, on their birthday
        .findByCssSelector('.verification-email-message')
          .getVisibleText()
          .then(function (resultText) {
            // check the email address was written
            assert.ok(resultText.indexOf(email) > -1);
          })
        .end();
    },

    'sign up with a verified account forces the user to sign in': function () {
      var self = this;

      return client.signUp(email, PASSWORD, { preVerified: true })
        .then(function () {
          return fillOutSignUp(self, email, PASSWORD, OLD_ENOUGH_YEAR)
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
          return fillOutSignUp(self, email, 'different password', OLD_ENOUGH_YEAR)
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
    }
  });

  function testRepopulateFields(dest, header) {
    var self = this;
    var year = OLD_ENOUGH_YEAR;

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

      .findByCssSelector('#fxa-age-year')
      .end()

      .findById('fxa-' + year)
        .click()
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

      .findByCssSelector('#fxa-age-year')
        .getProperty('value')
        .then(function (resultText) {
          // check the email address was re-populated
          assert.equal(resultText, year);
        })
      .end();
  }
});
