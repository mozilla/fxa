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
  var PAGE_URL = config.fxaContentRoot + 'reset_password?context=fx_desktop_v1&service=sync';

  var AUTH_SERVER_ROOT = config.fxaAuthRoot;
  var EMAIL_SERVER_ROOT = config.fxaEmailRoot;

  var PASSWORD = 'password';
  var user;
  var email;
  var client;
  var accountData;

  registerSuite({
    name: 'Firefox Desktop Sync reset password',

    setup: function () {
      // timeout after 90 seconds
      this.timeout = 90000;

      client = new FxaClient(AUTH_SERVER_ROOT, {
        xhr: nodeXMLHttpRequest.XMLHttpRequest
      });
    },

    beforeEach: function () {
      email = TestHelpers.createEmail();
      user = TestHelpers.emailToUser(email);
      var self = this;

      return client.signUp(email, PASSWORD)
        .then(function (result) {
          accountData = result;
        })
        .then(function () {
          // clear localStorage to avoid polluting other tests.
          return FunctionalHelpers.clearBrowserState(self);
        });
    },

    teardown: function () {
      // clear localStorage to avoid polluting other tests.
      return FunctionalHelpers.clearBrowserState(this);
    },

    'sync reset password, verify same browswer': function () {
      var self = this;

      // verify account
      return restmail(EMAIL_SERVER_ROOT + '/mail/' + user)
        .then(function (emails) {
          var code = emails[0].html.match(/code=([A-Za-z0-9]+)/)[1];
          return client.verifyCode(accountData.uid, code);
        })
        .then(function () {
          return self.get('remote')
            .get(require.toUrl(PAGE_URL))
            .setFindTimeout(intern.config.pageLoadTimeout)

            .findById('fxa-reset-password-header')
            .end()

            .findByCssSelector('input[type=email]')
            .click()
            .type(email)
            .end()

            .findByCssSelector('button[type="submit"]')
            .click()
            .end()

            .findById('fxa-confirm-reset-password-header')
            .then(function () {
              return FunctionalHelpers.getVerificationLink(user, 1);
            })
            .then(function (url) {
              return self.get('remote').get(require.toUrl(url));
            })
            .end()

            .findById('fxa-complete-reset-password-header')
            .end()

            .findByCssSelector('form input#password')
            .click()
            .type(PASSWORD)
            .end()

            .findByCssSelector('form input#vpassword')
            .click()
            .type(PASSWORD)
            .end()

            .findByCssSelector('button[type="submit"]')
            .click()
            .end()

            .findById('fxa-reset-password-complete-header')
            .end()

            .findByCssSelector('.account-ready-service')
            .getVisibleText()
            .then(function (text) {
              assert.ok(text.indexOf('Firefox Sync') > -1);
            })

            .end();
        });
    },

    'sync reset password, verify in a second browser': function () {
      var self = this;

      // verify account
      return restmail(EMAIL_SERVER_ROOT + '/mail/' + user)
        .then(function (emails) {
          var code = emails[0].html.match(/code=([A-Za-z0-9]+)/)[1];
          return client.verifyCode(accountData.uid, code);
        })
        .then(function () {
          return self.get('remote')
            .get(require.toUrl(PAGE_URL))
            .setFindTimeout(intern.config.pageLoadTimeout)

            .findById('fxa-reset-password-header')
            .end()

            .findByCssSelector('input[type=email]')
            .click()
            .type(email)
            .end()

            .findByCssSelector('button[type="submit"]')
            .click()
            .end()

            .findById('fxa-confirm-reset-password-header')
            .then(function () {
              // clear all browser state, simulate opening in a new
              // browser
              return FunctionalHelpers.clearBrowserState(self);
            })
            .then(function () {
              return FunctionalHelpers.getVerificationLink(user, 1);
            })
            .then(function (url) {
              return self.get('remote').get(require.toUrl(url));
            })
            .end()

            .findById('fxa-complete-reset-password-header')
            .end()

            .findByCssSelector('form input#password')
            .click()
            .type(PASSWORD)
            .end()

            .findByCssSelector('form input#vpassword')
            .click()
            .type(PASSWORD)
            .end()

            .findByCssSelector('button[type="submit"]')
            .click()
            .end()

            .findById('fxa-reset-password-complete-header')
            .end()

            .findByCssSelector('.account-ready-service')
            .getVisibleText()
            .then(function (text) {
              assert.ok(text.indexOf('Firefox Sync') > -1);
            })

            .end();
        });
    }

  });

});
