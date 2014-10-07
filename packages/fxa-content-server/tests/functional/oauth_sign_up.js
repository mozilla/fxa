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
  var OAUTH_APP = config.fxaOauthApp;
  var TOO_YOUNG_YEAR = new Date().getFullYear() - 13;
  var AUTH_SERVER_ROOT = config.fxaAuthRoot;

  var PASSWORD = 'password';
  var user;
  var email;
  var fxaClient;

  registerSuite({
    name: 'oauth sign up',

    beforeEach: function () {
      email = TestHelpers.createEmail();
      user = TestHelpers.emailToUser(email);
      fxaClient = new FxaClient(AUTH_SERVER_ROOT, {
        xhr: nodeXMLHttpRequest.XMLHttpRequest
      });

      // clear localStorage to avoid polluting other tests.
      // Without the clear, /signup tests fail because of the info stored
      // in prefillEmail
      return FunctionalHelpers.clearBrowserState(this);
    },

    'basic signup, from first tab\'s perspective - tab should redirect to RP automatically': function () {
      return this.get('remote')
        .get(require.toUrl(OAUTH_APP))
        .setFindTimeout(intern.config.pageLoadTimeout)
        .findByCssSelector('.signup')
          .click()
        .end()

        .findByCssSelector('#fxa-signup-header .service')
        .end()
        .getCurrentUrl()
        .then(function (url) {
          assert.ok(url.indexOf('client_id=') > -1);
          assert.ok(url.indexOf('redirect_uri=') > -1);
          assert.ok(url.indexOf('state=') > -1);
        })
        .end()

        .findByCssSelector('form input.email')
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

        .findByCssSelector('#fxa-confirm-header')
        .end()

        .then(function () {
          // simulate the verification in a second browser,
          // though the effect should be the same if we open
          // in the same browser. I'm just not sure how to get
          // selenium to open a second tab.
          return FunctionalHelpers.getVerificationHeaders(user, 0)
            .then(function (headers) {
              var uid = headers['x-uid'];
              var code = headers['x-verify-code'];
              return fxaClient.verifyCode(uid, code);
            });
        })
        .end()

        // user auto-redirects to 123done

        // let items load
        .findByCssSelector('#todolist li')
        .end()

        .findByCssSelector('#loggedin')
        .end()

        .findByCssSelector('#logout')
        .click()
        .end()

        .findByCssSelector('#loggedin')
        .getVisibleText()
        .then(function (text) {
          // confirm logged out
          assert.ok(text.length === 0);
        })
        .end();
    },


    'verify in the same browser - from second tab\'s perspective - link to redirect to RP': function () {
      var self = this;

      return this.get('remote')
        .get(require.toUrl(OAUTH_APP))
        .setFindTimeout(intern.config.pageLoadTimeout)
        .findByCssSelector('.signup')
          .click()
        .end()

        .findByCssSelector('#fxa-signup-header .service')
        .end()
        .getCurrentUrl()
        .then(function (url) {
          assert.ok(url.indexOf('client_id=') > -1);
          assert.ok(url.indexOf('redirect_uri=') > -1);
          assert.ok(url.indexOf('state=') > -1);
        })
        .end()

        .findByCssSelector('form input.email')
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

        .findByCssSelector('#fxa-confirm-header')
        .getCurrentUrl()
        .then(function (url) {
          assert.ok(url.indexOf('client_id=') > -1);
          assert.ok(url.indexOf('redirect_uri=') > -1);
          assert.ok(url.indexOf('state=') > -1);

          return FunctionalHelpers.getVerificationLink(user, 0)
            .then(function (verificationLink) {
              // overwrite the url in the same browser simulates
              // the second tab's perspective
              return self.get('remote').get(verificationLink);
            });
        })
        .end()

        .findByCssSelector('.account-ready-service')
        .getVisibleText()
        .then(function (text) {
          // user sees the name of the RP,
          // but cannot redirect
          assert.ok(/123done/i.test(text));
        })
        .end();
    },

    'verify in a second browser - from the second browser\'s perspective - no option to redirect to RP': function () {
      var self = this;

      return this.get('remote')
        .get(require.toUrl(OAUTH_APP))
        .setFindTimeout(intern.config.pageLoadTimeout)
        .findByCssSelector('.signup')
          .click()
        .end()

        .findByCssSelector('#fxa-signup-header .service')
        .end()
        .getCurrentUrl()
        .then(function (url) {
          assert.ok(url.indexOf('client_id=') > -1);
          assert.ok(url.indexOf('redirect_uri=') > -1);
          assert.ok(url.indexOf('state=') > -1);
        })
        .end()

        .findByCssSelector('form input.email')
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

        .findByCssSelector('#fxa-confirm-header')
        .end()

        .then(function () {
          // clear browser state to simulate opening link in a new browser
          return FunctionalHelpers.clearBrowserState(self);
        })

        .then(function () {
          return FunctionalHelpers.getVerificationLink(user, 0)
            .then(function (verificationLink) {
              return self.get('remote').get(verificationLink);
            });
        })

        // user is shown the ready page, without an option to redirect
        .findById('fxa-sign-up-complete-header')
        .end()

        .findByCssSelector('.account-ready-service')
        .getVisibleText()
        .then(function (text) {
          // user sees the name of the rp,
          // but cannot redirect
          assert.isTrue(/123done/i.test(text));
        })
        .end();
    }
  });

});
