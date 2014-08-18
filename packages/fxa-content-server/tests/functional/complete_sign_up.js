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
  'app/scripts/lib/constants',
  'tests/lib/restmail',
  'tests/lib/helpers',
  'tests/functional/lib/helpers'
], function (intern, registerSuite, assert, require, nodeXMLHttpRequest, FxaClient, Constants, restmail, TestHelpers, FunctionalHelpers) {
  'use strict';

  var config = intern.config;
  var AUTH_SERVER_ROOT = config.fxaAuthRoot;
  var EMAIL_SERVER_ROOT = config.fxaEmailRoot;
  var PAGE_URL_ROOT = config.fxaContentRoot + 'verify_email';
  var SIGNUP_PAGE_URL = config.fxaContentRoot + 'signup';

  var TOO_YOUNG_YEAR = new Date().getFullYear() - 13;

  var PASSWORD = 'password';
  var user;
  var email;
  var accountData;
  var client;
  var code;
  var uid;

  var createRandomHexString = TestHelpers.createRandomHexString;

  registerSuite({
    name: 'complete_sign_up',

    setup: function () {
      email = TestHelpers.createEmail();
      user = TestHelpers.emailToUser(email);
      client = new FxaClient(AUTH_SERVER_ROOT, {
        xhr: nodeXMLHttpRequest.XMLHttpRequest
      });
      return client.signUp(email, PASSWORD)
        .then(function (result) {
          accountData = result;
          uid = accountData.uid;
        })
        .then(function () {
          return restmail(EMAIL_SERVER_ROOT + '/mail/' + user);
        })
        .then(function (emails) {
          code = emails[0].html.match(/code=([A-Za-z0-9]+)/)[1];
        });
    },

    'open verification link with malformed code': function () {
      var code = createRandomHexString(Constants.CODE_LENGTH - 1);
      var uid = accountData.uid;
      var url = PAGE_URL_ROOT + '?uid=' + uid + '&code=' + code;

      return this.get('remote')
        .setFindTimeout(intern.config.pageLoadTimeout)
        .get(require.toUrl(url))

        // a successful user is immediately redirected to the
        // sign-up-complete page.
        .findById('fxa-verification-link-damaged-header')
        .end();
    },

    'open verification link with server reported bad code': function () {
      var code = createRandomHexString(Constants.CODE_LENGTH);
      var uid = accountData.uid;
      var url = PAGE_URL_ROOT + '?uid=' + uid + '&code=' + code;

      return this.get('remote')
        .get(require.toUrl(url))

        // a successful user is immediately redirected to the
        // sign-up-complete page.
        .findById('fxa-verification-link-damaged-header')
        .end();
    },

    'open verification link with malformed uid': function () {
      var uid = createRandomHexString(Constants.UID_LENGTH - 1);
      var url = PAGE_URL_ROOT + '?uid=' + uid + '&code=' + code;

      return this.get('remote')
        .get(require.toUrl(url))

        // a successful user is immediately redirected to the
        // sign-up-complete page.
        .findById('fxa-verification-link-damaged-header')
        .end();
    },

    'open verification link with server reported bad uid': function () {
      var uid = createRandomHexString(Constants.UID_LENGTH);
      var url = PAGE_URL_ROOT + '?uid=' + uid + '&code=' + code;

      return this.get('remote')
        .get(require.toUrl(url))

        // a successful user is immediately redirected to the
        // sign-up-complete page.
        .findById('fxa-verification-link-expired-header')
        .end();
    },

    'open valid email verification link': function () {
      var url = PAGE_URL_ROOT + '?uid=' + uid + '&code=' + code;

      return this.get('remote')
        .get(require.toUrl(url))

        // a successful user is immediately redirected to the
        // sign-up-complete page.
        .findById('fxa-sign-up-complete-header')
        .end();
    }
  });

  registerSuite({
    name: 'complete_sign_up with expired link, but without signing up in browser',

    setup: function () {
      email = TestHelpers.createEmail();
      user = TestHelpers.emailToUser(email);
      client = new FxaClient(AUTH_SERVER_ROOT, {
        xhr: nodeXMLHttpRequest.XMLHttpRequest
      });
      return client.signUp(email, PASSWORD)
        .then(function (result) {
          accountData = result;
          uid = accountData.uid;
        })
        .then(function () {
          return restmail(EMAIL_SERVER_ROOT + '/mail/' + user);
        })
        .then(function (emails) {
          code = emails[0].html.match(/code=([A-Za-z0-9]+)/)[1];

          return client.signUp(email, 'secondpassword');
        });
    },

    'open expired email verification link': function () {
      var url = PAGE_URL_ROOT + '?uid=' + uid + '&code=' + code;

      return this.get('remote')
        .get(require.toUrl(url))

        .findById('fxa-verification-link-expired-header')
        .end()

        // Give resend time to show up
        .setFindTimeout(200)
        .findById('resend')
        .then(function () {
          assert.fail('resend link should not be present');
        }, function (err) {
          assert.strictEqual(err.name, 'NoSuchElement');
          return true;
        })
        .end();
    }
  });

  registerSuite({
    name: 'complete_sign_up with expired link and click resend',

    setup: function () {
      email = TestHelpers.createEmail();
      user = TestHelpers.emailToUser(email);
      client = new FxaClient(AUTH_SERVER_ROOT, {
        xhr: nodeXMLHttpRequest.XMLHttpRequest
      });
      return client.signUp(email, PASSWORD)
        .then(function (result) {
          accountData = result;
          uid = accountData.uid;
        })
        .then(function () {
          return restmail(EMAIL_SERVER_ROOT + '/mail/' + user);
        })
        .then(function (emails) {
          code = emails[0].html.match(/code=([A-Za-z0-9]+)/)[1];
        });
    },

    'open expired email verification link': function () {
      var self = this;
      var completeUrl = PAGE_URL_ROOT + '?uid=' + uid + '&code=' + code;

      return client.signUp(email, PASSWORD)
        .then(function () {
          return self.get('remote')
            .get(require.toUrl(SIGNUP_PAGE_URL))
            .setFindTimeout(intern.config.pageLoadTimeout)
            .findById('fxa-signup-header')
            .end()

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

            .findById('fxa-' + (TOO_YOUNG_YEAR - 1))
              .pressMouseButton()
              .releaseMouseButton()
              .click()
            .end()

            .findByCssSelector('button[type="submit"]')
              .click()
            .end()

            // Being pushed to the confirmation screen is success.
            .findById('fxa-confirm-header')
            .end()

            .get(require.toUrl(completeUrl))

            .findById('fxa-verification-link-expired-header')
            .end()

            .findById('resend')
              .click()
            .end()

            .findByClassName('success')
            .end()

            .then(FunctionalHelpers.visibleByQSA('.success'))

            // Success is showing the success message
            .findByCssSelector('.success').isDisplayed()
              .then(function (isDisplayed) {
                assert.isTrue(isDisplayed);
              })
            .end()

            .findById('resend')
              .click()
            .end()

            .findById('resend')
              .click()
            .end()

            // Stills shows success message
            .findByCssSelector('.success').isDisplayed()
              .then(function (isDisplayed) {
                assert.isTrue(isDisplayed);
              })
            .end();
        });

    }
  });
});
