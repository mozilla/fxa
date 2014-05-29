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
  'tests/lib/helpers'
], function (intern, registerSuite, assert, require, nodeXMLHttpRequest, FxaClient, restmail, TestHelpers) {
  'use strict';

  var config = intern.config;
  //var OAUTH_APP = 'https://123done.dev.lcip.org/';
  var AUTH_SERVER_ROOT = config.fxaAuthRoot;
  var OAUTH_APP = config.fxaOauthApp;
  var EMAIL_SERVER_ROOT = config.fxaEmailRoot;
  var TOO_YOUNG_YEAR = new Date().getFullYear() - 13;

  var PAGE_URL = config.fxaContentRoot + 'signin';
  var PASSWORD = 'password';
  var user;
  var email;

  registerSuite({
    name: 'oauth sign up',

    setup: function () {
      email = TestHelpers.createEmail();
      user = TestHelpers.emailToUser(email);
    },

    teardown: function () {
      // clear localStorage to avoid polluting other tests.
      // Without the clear, /signup tests fail because of the info stored
      // in prefillEmail

      return this.get('remote')
        .get(require.toUrl(PAGE_URL))
        .waitForElementById('fxa-signin-header')
        .safeEval('sessionStorage.clear(); localStorage.clear();');

    },

    'basic sign up': function () {
      var client = new FxaClient(AUTH_SERVER_ROOT, {
        xhr: nodeXMLHttpRequest.XMLHttpRequest
      });

      var self = this;

      return this.get('remote')
        .get(require.toUrl(OAUTH_APP))
        .waitForVisibleByCssSelector('.signup')
        .elementByCssSelector('.signup')
          .click()
        .end()

        .waitForVisibleByCssSelector('#fxa-signup-header')
        .elementByCssSelector('#fxa-signup-header')
          .text()
          .then(function (text) {
            assert.ok(text.indexOf('Create a Firefox Account for ') > -1, 'Sign Up page should have a service header');
          })
        .end()
        .url()
        .then(function (url) {
          assert.ok(url.indexOf('client_id=') > -1);
          assert.ok(url.indexOf('redirect_uri=') > -1);
          assert.ok(url.indexOf('state=') > -1);
        })
        .end()

        .elementByCssSelector('form input.email')
          .click()
          .type(email)
        .end()

        .elementByCssSelector('form input.password')
          .click()
          .type(PASSWORD)
        .end()

        .elementByCssSelector('#fxa-age-year')
          .click()
        .end()

        .elementById('fxa-' + (TOO_YOUNG_YEAR - 1))
          .buttonDown()
          .buttonUp()
          .click()
        .end()

        .elementByCssSelector('button[type="submit"]')
          .click()
        .end()

        .waitForVisibleByCssSelector('#fxa-confirm-header')
        .url()
        .then(function (url) {
          assert.ok(url.indexOf('client_id=') > -1);
          assert.ok(url.indexOf('redirect_uri=') > -1);
          assert.ok(url.indexOf('state=') > -1);

          return restmail(EMAIL_SERVER_ROOT + '/mail/' + user)
            .then(function (emails) {
              var verifyUrl = emails[0].html.match(/Verify: ([A-Za-z0-9:\/\.\_\?\=\&]+)/)[1];

              return self.get('remote')
                .get(require.toUrl(verifyUrl))
            });
        })
        .end()

        .waitForVisibleByCssSelector('#redirectTo')
        .elementByCssSelector('#redirectTo')
          .click()
        .end();
    }
  });

});
