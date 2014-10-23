/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'intern/chai!assert',
  'require',
  'intern/node_modules/dojo/node!xmlhttprequest',
  'intern/node_modules/dojo/node!leadfoot/helpers/pollUntil',
  'app/bower_components/fxa-js-client/fxa-client',
  'tests/lib/helpers',
  'tests/functional/lib/helpers'
], function (intern, registerSuite, assert, require, nodeXMLHttpRequest, pollUntil, FxaClient, TestHelpers, FunctionalHelpers) {
  'use strict';

  var config = intern.config;
  var AUTH_SERVER_ROOT = config.fxaAuthRoot;
  var PAGE_URL = config.fxaContentRoot + 'signup';

  var CUTOFF_YEAR = new Date().getFullYear() - 13;

  var email;
  var PASSWORD = '12345678';

  function fillOutSignUpPage(context, email, password, year) {
    return context.get('remote')
      .get(require.toUrl(PAGE_URL))
      .setFindTimeout(intern.config.pageLoadTimeout)

      .findByCssSelector('form input.email')
        .click()
        .type(email)
      .end()

      .findByCssSelector('form input.password')
        .click()
        .type(password)
      .end()

      .findByCssSelector('#fxa-age-year')
        .click()
      .end()

      .findById('fxa-' + year)
        .pressMouseButton()
        .releaseMouseButton()
        .click()
      .end()

      .findByCssSelector('button[type="submit"]')
        .click()
      .end();
  }

  function testAtConfirmScreen(context, email) {
    return context.get('remote')
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
      email = TestHelpers.createEmail();
      return FunctionalHelpers.clearBrowserState(this);
    },

    teardown: function () {
      return FunctionalHelpers.clearBrowserState(this);
    },

    'sign up': function () {
      var self = this;
      return fillOutSignUpPage(this, email, PASSWORD, CUTOFF_YEAR - 1)
        .then(function () {
          return testAtConfirmScreen(self, email);
        });
    },

    'sign up with email with leading whitespace on the email': function () {
      email = ('   ' + email);
      var self = this;
      return fillOutSignUpPage(this, email, PASSWORD, CUTOFF_YEAR - 1)
        .then(function () {
          return testAtConfirmScreen(self, email.trim());
        });
    },

    'sign up with email with trailing whitespace on the email': function () {
      email = (email + '   ');
      var self = this;
      return fillOutSignUpPage(this, email, PASSWORD, CUTOFF_YEAR - 1)
        .then(function () {
          return testAtConfirmScreen(self, email.trim());
        });
    },

    'select a year that is 1 year too young, no month/day picker is shown': function () {
      return fillOutSignUpPage(this, email, PASSWORD, CUTOFF_YEAR + 1)
        // Success is being redirected to the cannot create screen.
        .findById('fxa-cannot-create-account-header')
        .end();
    },

    'select an age that is one day too young': function () {
      var email = TestHelpers.createEmail();
      var password = '12345678';

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

      return this.get('remote')
        .get(require.toUrl(PAGE_URL))
        .findByCssSelector('form input.email')
          .click()
          .type(email)
        .end()

        .findByCssSelector('form input.password')
          .click()
          .type(password)
        .end()

        .findByCssSelector('#fxa-age-year')
          .click()
        .end()

        .findById('fxa-' + CUTOFF_YEAR)
          .pressMouseButton()
          .releaseMouseButton()
          .click()
        .end()

        .findById('fxa-month-' + monthToSelect)
          .pressMouseButton()
          .releaseMouseButton()
          .click()
        .end()

        .findById('fxa-day-' + dateToSelect)
          .pressMouseButton()
          .releaseMouseButton()
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
      var email = TestHelpers.createEmail();
      var password = '12345678';

      var now = new Date();
      var monthToSelect = now.getMonth();
      var dateToSelect = now.getDate();

      return this.get('remote')
        .get(require.toUrl(PAGE_URL))
        .findByCssSelector('form input.email')
          .click()
          .type(email)
        .end()

        .findByCssSelector('form input.password')
          .click()
          .type(password)
        .end()

        .findByCssSelector('#fxa-age-year')
          .click()
        .end()

        .findById('fxa-' + CUTOFF_YEAR)
          .pressMouseButton()
          .releaseMouseButton()
          .click()
        .end()

        .findById('fxa-month-' + monthToSelect)
          .pressMouseButton()
          .releaseMouseButton()
          .click()
        .end()

        .findById('fxa-day-' + dateToSelect)
          .pressMouseButton()
          .releaseMouseButton()
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

    'choose option to customize sync': function () {
      var urlForSync = PAGE_URL + '?service=sync';

      var email = TestHelpers.createEmail();
      var password = '12345678';

      return this.get('remote')
        .get(require.toUrl(urlForSync))
        .findByCssSelector('form input.email')
          .click()
          .type(email)
        .end()

        .findByCssSelector('form input.password')
          .click()
          .type(password)
        .end()

        .findByCssSelector('#fxa-age-year')
          .click()
        .end()

        .findById('fxa-' + (CUTOFF_YEAR - 1))
          .pressMouseButton()
          .releaseMouseButton()
          .click()
        .end()

        .findByCssSelector('form input.customize-sync')
          .click()
        .end()

        .findByCssSelector('button[type="submit"]')
          .click()
        .end()

        // Being pushed to the confirmation screen is success.
        .findById('fxa-confirm-header')
        .end();
    },

    'sign up with a verified account forces the user to sign in': function () {

      var self = this;
      var email = TestHelpers.createEmail();
      var password = '12345678';

      var client = new FxaClient(AUTH_SERVER_ROOT, {
        xhr: nodeXMLHttpRequest.XMLHttpRequest
      });

      return client.signUp(email, password, { preVerified: true })
        .then(function () {
          return self.get('remote')
            .get(require.toUrl(PAGE_URL))
            .findByCssSelector('input[type=email]')
              .click()
              .clearValue()
              .type(email)
            .end()

            .findByCssSelector('input[type=password]')
              .click()
              .type(password)
            .end()

            .findByCssSelector('#fxa-age-year')
              .click()
            .end()

            .findById('fxa-' + (CUTOFF_YEAR - 1))
              .pressMouseButton()
              .releaseMouseButton()
              .click()
            .end()

            .findByCssSelector('button[type="submit"]')
              .click()
            .end()

            // The error area shows a link to /signin
            .then(FunctionalHelpers.visibleByQSA('.error a[href="/signin"]'))
            .findByCssSelector('.error a[href="/signin"]')
              .moveMouseTo()
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
                assert.equal(resultText, password);
              })
            .end();
        });
    },

    'sign up with an unverified account and different password re-signs up user': function () {

      var self = this;
      var email = TestHelpers.createEmail();
      var password = '12345678';

      var client = new FxaClient(AUTH_SERVER_ROOT, {
        xhr: nodeXMLHttpRequest.XMLHttpRequest
      });

      return client.signUp(email, password)
        .then(function () {
          return self.get('remote')
            .get(require.toUrl(PAGE_URL))
            .findByCssSelector('input[type=email]')
              .click()
              .type(email)
            .end()

            .findByCssSelector('input[type=password]')
              .click()
              .type('different_password')
            .end()

            .findByCssSelector('#fxa-age-year')
              .click()
            .end()

            .findById('fxa-' + (CUTOFF_YEAR - 1))
              .pressMouseButton()
              .releaseMouseButton()
              .click()
            .end()

            .findByCssSelector('button[type="submit"]')
              .click()
            .end()

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
    /*jshint validthis: true*/
    var self = this;
    var email = TestHelpers.createEmail();
    var password = '12345678';
    var year = CUTOFF_YEAR - 1;

    return self.get('remote')
      .get(require.toUrl(PAGE_URL))
      .findByCssSelector('input[type=email]')
        .clearValue()
        .click()
        .type(email)
      .end()

      .findByCssSelector('input[type=password]')
        .clearValue()
        .click()
        .type(password)
      .end()

      .findByCssSelector('#fxa-age-year')
        .click()
      .end()

      .findById('fxa-' + year)
        .pressMouseButton()
        .releaseMouseButton()
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
          assert.equal(resultText, password);
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
