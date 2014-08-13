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
  'tests/lib/restmail',
  'tests/lib/helpers',
  'tests/functional/lib/helpers'
], function (intern, registerSuite, assert, require, nodeXMLHttpRequest, FxaClient, restmail, TestHelpers, FunctionalHelpers) {
  'use strict';

  var config = intern.config;
  var AUTH_SERVER_ROOT = config.fxaAuthRoot;
  var EMAIL_SERVER_ROOT = config.fxaEmailRoot;
  var PAGE_SIGNIN = config.fxaContentRoot + 'signin';
  var PAGE_SIGNUP = config.fxaContentRoot + 'signup';
  var TOO_YOUNG_YEAR = new Date().getFullYear() - 13;
  var PASSWORD = 'password';
  var user;
  var user2;
  var email;
  var email2;
  var accountData;
  var client;

  registerSuite({
    name: 'sign in cached',

    beforeEach: function () {
      email = TestHelpers.createEmail();
      user = TestHelpers.emailToUser(email);
      email2 = TestHelpers.createEmail();
      user2 = TestHelpers.emailToUser(email2);
      client = new FxaClient(AUTH_SERVER_ROOT, {
        xhr: nodeXMLHttpRequest.XMLHttpRequest
      });
      var self = this;
      return client.signUp(email, PASSWORD)
        .then(function (result) {
          accountData = result;
          return result;
        })
        .then(function () {
          return restmail(EMAIL_SERVER_ROOT + '/mail/' + user)
            .then(function (emails) {

              return self.get('remote')
                .get(require.toUrl(emails[0].headers['x-link']));
            });
        })
        // create a second user for testing
        .then(function () {
          return client.signUp(email2, PASSWORD);
        })
        .then(function (result) {
          accountData = result;
          return result;
        })
        .then(function () {
          return restmail(EMAIL_SERVER_ROOT + '/mail/' + user2)
            .then(function (emails) {

              return self.get('remote')
                .get(require.toUrl(emails[0].headers['x-link']));
            });
        })
        .then(function () {
          return self.get('remote')
            .setFindTimeout(intern.config.pageLoadTimeout)
            // wait for confirmation
            .findById('fxa-sign-up-complete-header')
            .end()
            .then(function () {
              // clear localStorage to avoid pollution from other tests.
              return FunctionalHelpers.clearBrowserState(self);
            });
        });

    },

    teardown: function () {
      return FunctionalHelpers.clearBrowserState(this);
    },

    'sign in twice, second attempt is going to be cached': function () {
      return this.get('remote')
        .get(require.toUrl(PAGE_SIGNIN))
        .findByCssSelector('form input.email')
        .click()
        .type(email)
        .end()

        .findByCssSelector('form input.password')
        .click()
        .type(PASSWORD)
        .end()

        .findByCssSelector('button[type="submit"]')
        .click()
        .end()

        .findById('fxa-settings-header')
        .end()

        .get(require.toUrl(PAGE_SIGNIN))

        .findByCssSelector('.use-logged-in')
        .click()
        .end()

        .findById('fxa-settings-header')
        .end();
    },
    'sign in once, use a different account': function () {
      return this.get('remote')
        .get(require.toUrl(PAGE_SIGNIN))
        .findByCssSelector('form input.email')
        .click()
        .type(email)
        .end()

        .findByCssSelector('form input.password')
        .click()
        .type(PASSWORD)
        .end()

        .findByCssSelector('button[type="submit"]')
        .click()
        .end()

        .findById('fxa-settings-header')
        .end()

        .get(require.toUrl(PAGE_SIGNIN))

        // testing to make sure "Use different account" button works
        .findByCssSelector('.use-different')
        .click()
        .end()

        .findByCssSelector('form input.email')
        .clearValue()
        .click()
        .type(email2)
        .end()

        .findByCssSelector('form input.password')
        .click()
        .type(PASSWORD)
        .end()

        .findByCssSelector('button[type="submit"]')
        .click()
        .end()

        .findById('fxa-settings-header')
        .end()

        // testing to make sure cached signin comes back after a refresh
        .get(require.toUrl(PAGE_SIGNIN))

        .findByCssSelector('.use-different')
        .click()
        .end()

        .findByCssSelector('form input.email')
        .end()

        .refresh()

        .findByCssSelector('.use-different')
        .end();
    },
    'sign in with cached credentials but with an expired session': function () {
      return this.get('remote')
        .get(require.toUrl(PAGE_SIGNIN))
        // signin normally, nothing in session yet
        .findByCssSelector('form input.email')
        .click()
        .type(email)
        .end()

        .findByCssSelector('form input.password')
        .click()
        .type(PASSWORD)
        .end()

        .findByCssSelector('button[type="submit"]')
        .click()
        .end()

        .findById('fxa-settings-header')
        .end()

        .execute(function (email) {
            /* global localStorage */
          localStorage.setItem('__fxa_session', '{"email":"' + email + '", "sessionToken":"eeead2b45791360e00b162ed37f118abbdae6ee8d3997f4eb48ee31dbdf53802"}');
          return true;
        }, [ email ])

        .get(require.toUrl(PAGE_SIGNIN))
        .findByCssSelector('.use-logged-in')
        .click()
        .end()

        // Session expired error should show.
        .then(FunctionalHelpers.visibleByQSA('.error'))

        .findByCssSelector('.error').isDisplayed()
        .then(function (isDisplayed) {
          assert.isTrue(isDisplayed);
        })
        .end()

        .findByCssSelector('form input.password')
        .click()
        .type(PASSWORD)
        .end()

        .findByCssSelector('button[type="submit"]')
        .click()
        .end()

        .findById('fxa-settings-header')
        .end();
    },
    'unverified cached signin redirects to confirm email': function () {
      var email = TestHelpers.createEmail();

      return this.get('remote')
        .get(require.toUrl(PAGE_SIGNUP))
        .findByCssSelector('form input.email')
        .clearValue()
        .click()
        .type(email)
        .end()

        .findByCssSelector('form input.password')
        .click()
        .type(PASSWORD)
        .end()

        .findByCssSelector('#fxa-age-year')
        .click()
        .end()

        .findById('fxa-' + (TOO_YOUNG_YEAR - 1))
        .pressMouseButton()
        .releaseMouseButton()
        .click()
        .end()

        .findByCssSelector('button[type="submit"]')
        .click()
        .end()

        .findById('fxa-confirm-header')
        .end()

        .get(require.toUrl(PAGE_SIGNIN))

        // cached login should still go to email confirmation screen for unverified accounts
        .findByCssSelector('.use-logged-in')
        .click()
        .end()

        .findById('fxa-confirm-header')
        .end();
    }
  });
});
