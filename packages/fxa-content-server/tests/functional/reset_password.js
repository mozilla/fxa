/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern!object',
  'intern/chai!assert',
  'require',
  'intern/node_modules/dojo/node!xmlhttprequest',
  'app/bower_components/fxa-js-client/fxa-client',
  'intern/node_modules/dojo/Deferred',
  'tests/lib/restmail',
  'tests/lib/helpers',
], function (registerSuite, assert, require, nodeXMLHttpRequest, FxaClient, Deferred, restmail, TestHelpers) {
  'use strict';

  var AUTH_SERVER_ROOT = 'http://127.0.0.1:9000/v1';
  var EMAIL_SERVER_ROOT = 'http://127.0.0.1:9001';
  var RESET_PAGE_URL = 'http://localhost:3030/reset_password';
  var CONFIRM_PAGE_URL = 'http://localhost:3030/confirm_reset_password';
  var COMPLETE_PAGE_URL_ROOT = 'http://localhost:3030/complete_reset_password';
  var PASSWORD = 'password';
  var user;
  var email;
  var code;
  var token;
  var client;

  var createRandomHexString = TestHelpers.createRandomHexString;

  function setTokenAndCodeFromEmail(user, emailNumber) {
    var fetchCount = emailNumber + 1;
    return restmail(EMAIL_SERVER_ROOT + '/mail/' + user, fetchCount)
      .then(function (emails) {
        // token and code are hex values
        token = emails[emailNumber].html.match(/token=([a-fa-f0-9]+)/)[1];
        code = emails[emailNumber].html.match(/code=([a-za-z0-9]+)/)[1];
      });
  }


  registerSuite({
    name: 'reset_password same browser flow',

    setup: function () {
      // timeout after 90 seconds
      this.timeout = 90000;

      user = 'signin' + Math.random();
      email = user + '@restmail.net';
      client = new FxaClient(AUTH_SERVER_ROOT, {
        xhr: nodeXMLHttpRequest.XMLHttpRequest
      });
      return client.signUp(email, PASSWORD, { preVerified: true });
    },

    'open reset_password page': function () {
      return this.get('remote')
        .get(require.toUrl(RESET_PAGE_URL))
        .waitForElementById('fxa-reset-password-header')

        .elementByCssSelector('form input.email')
          .click()
          .type(email)
        .end()

        .elementByCssSelector('button[type="submit"]')
          .click()
        .end()

        .waitForElementById('fxa-confirm-reset-password-header')
        .end();
    },

    'open confirm_reset_password page, click resend': function () {
      return this.get('remote')
        .get(require.toUrl(CONFIRM_PAGE_URL))
        .waitForElementById('fxa-confirm-reset-password-header')

        .elementById('resend')
          .click()
        .end()

        .waitForVisibleByClassName('success')

        // Success is showing the success message
        .elementByCssSelector('.success').isDisplayed()
          .then(function (isDisplayed) {
            assert.isTrue(isDisplayed);
          })
        .end()

        .elementById('resend')
          .click()
        .end()

        .elementById('resend')
          .click()
        .end()

        // Stills shows success message
        .elementByCssSelector('.success').isDisplayed()
          .then(function (isDisplayed) {
            assert.isTrue(isDisplayed);
          })
        .end();
    },

    'start verifiction - get token and code from email': function () {
      return setTokenAndCodeFromEmail(user, 1);
    },

    'open complete page with missing token shows damaged screen': function () {
      var url = COMPLETE_PAGE_URL_ROOT + '?code=' + code + '&email=' + encodeURIComponent(email);

      return this.get('remote')
        .get(require.toUrl(url))
        .waitForElementById('fxa-verification-link-damaged-header')

        .end();
    },

    'open complete page with malformed token shows damaged screen': function () {
      var malformedToken = createRandomHexString(token.length - 1);
      var url = COMPLETE_PAGE_URL_ROOT + '?token=' + malformedToken + '&code=' + code + '&email=' + encodeURIComponent(email);

      return this.get('remote')
        .get(require.toUrl(url))
        .waitForElementById('fxa-verification-link-damaged-header')

        .end();
    },

    'open complete page with invalid token shows expired screen': function () {
      var invalidToken = createRandomHexString(token.length);

      var url = COMPLETE_PAGE_URL_ROOT + '?token=' + invalidToken + '&code=' + code + '&email=' + encodeURIComponent(email);

      return this.get('remote')
        .get(require.toUrl(url))
        .waitForElementById('fxa-verification-link-expired-header')

        .end();
    },

    'open complete page with missing code shows damaged screen': function () {
      var url = COMPLETE_PAGE_URL_ROOT + '?token=' + token + '&email=' + encodeURIComponent(email);

      return this.get('remote')
        .get(require.toUrl(url))
        .waitForElementById('fxa-verification-link-damaged-header')

        .end();
    },

    'open complete page with malformed code shows damanged screen': function () {
      var malformedCode = createRandomHexString(code.length - 1);

      var url = COMPLETE_PAGE_URL_ROOT + '?token=' + token + '&code=' + malformedCode + '&email=' + encodeURIComponent(email);

      return this.get('remote')
        .get(require.toUrl(url))
        .waitForElementById('fxa-verification-link-damaged-header')

        .end();
    },

    'open complete page with missing email shows damaged screen': function () {
      var url = COMPLETE_PAGE_URL_ROOT + '?token=' + token + '&code=' + code;

      return this.get('remote')
        .get(require.toUrl(url))
        .waitForElementById('fxa-verification-link-damaged-header')

        .end();
    },

    'open complete page with malformed email shows damaged screen': function () {
      var url = COMPLETE_PAGE_URL_ROOT + '?token=' + token + '&code=' + code + '&email=invalidemail';

      return this.get('remote')
        .get(require.toUrl(url))
        .waitForElementById('fxa-verification-link-damaged-header')

        .end();
    },

    'open complete page with valid parameters': function () {
      var url = COMPLETE_PAGE_URL_ROOT + '?token=' + token + '&code=' + code + '&email=' + encodeURIComponent(email);

      return this.get('remote')
        .get(require.toUrl(url))
        .waitForElementById('fxa-complete-reset-password-header')

        .elementByCssSelector('form input#password')
          .click()
          .type(PASSWORD)
        .end()

        .elementByCssSelector('form input#vpassword')
          .click()
          .type(PASSWORD)
        .end()

        .elementByCssSelector('button[type="submit"]')
          .click()
        .end()

        .waitForElementById('fxa-reset-password-complete-header')
        .end();
    }

  });

  registerSuite({
    name: 'try to re-use a link',

    setup: function () {
      // timeout after 90 seconds
      this.timeout = 90000;

      user = 'signin' + Math.random();
      email = user + '@restmail.net';
      client = new FxaClient(AUTH_SERVER_ROOT, {
        xhr: nodeXMLHttpRequest.XMLHttpRequest
      });

      return client.signUp(email, PASSWORD, { preVerified: true })
          .then(function () {
            return client.passwordForgotSendCode(email);
          })
          .then(function () {
            return setTokenAndCodeFromEmail(user, 0);
          });
    },

    'complete verification': function () {
      var url = COMPLETE_PAGE_URL_ROOT + '?token=' + token + '&code=' + code + '&email=' + encodeURIComponent(email);

      return this.get('remote')
        .get(require.toUrl(url))
        .waitForElementById('fxa-complete-reset-password-header')

        .elementByCssSelector('form input#password')
          .click()
          .type(PASSWORD)
        .end()

        .elementByCssSelector('form input#vpassword')
          .click()
          .type(PASSWORD)
        .end()

        .elementByCssSelector('button[type="submit"]')
          .click()
        .end()

        .waitForElementById('fxa-reset-password-complete-header')
        .end();
    },

    'attempt to complete page with already used link, click resend': function () {
      var url = COMPLETE_PAGE_URL_ROOT + '?token=' + token + '&code=' + code + '&email=' + encodeURIComponent(email);

      return this.get('remote')
        .get(require.toUrl(url))
        .waitForElementById('fxa-verification-link-expired-header')
        .end()

        .elementById('resend')
          .click()
        .end()

        .waitForElementById('fxa-confirm-reset-password-header')
        .end();
    }
  });


  registerSuite({
    name: 'reset_password with email specified on URL',

    setup: function () {
      email = 'signin' + Math.random() + '@restmail.net';
      var client = new FxaClient(AUTH_SERVER_ROOT, {
        xhr: nodeXMLHttpRequest.XMLHttpRequest
      });
      return client.signUp(email, PASSWORD, { preVerified: true });
    },

    'open page with email on query params': function () {
      var url = RESET_PAGE_URL + '?email=' + email;
      return this.get('remote')
        .get(require.toUrl(url))
        .waitForElementById('fxa-reset-password-header')

        .elementByCssSelector('form input.email')
          .getAttribute('value')
          .then(function (resultText) {
            // email address should be pre-filled from the query param.
            assert.equal(resultText, email);
          })
        .end()

        .elementByCssSelector('button[type="submit"]')
          .click()
        .end()

        .waitForElementById('fxa-confirm-reset-password-header')
        .end();
    }
  });


  registerSuite({
    name: 'confirm_password page transition',

    setup: function () {
      var user = 'signin' + Math.random();
      email = user + '@restmail.net';

      client = new FxaClient(AUTH_SERVER_ROOT, {
        xhr: nodeXMLHttpRequest.XMLHttpRequest
      });

      return client.signUp(email, PASSWORD, { preVerified: true });
    },

    'page transitions after completion': function () {
      return this.get('remote')
        .get(require.toUrl(RESET_PAGE_URL))
        .waitForElementById('fxa-reset-password-header')

        .elementByCssSelector('form input.email')
          .click()
          .type(email)
        .end()

        .elementByCssSelector('button[type="submit"]')
          .click()
        .end()

        .waitForElementById('fxa-confirm-reset-password-header')
          .then(function () {
            return client.passwordChange(email, PASSWORD, 'newpassword');
          })
        .end()

        .waitForElementById('fxa-signin-header')
        .end();
    }
  });
});
