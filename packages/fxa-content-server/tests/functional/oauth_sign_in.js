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
  var EMAIL_SERVER_ROOT = config.fxaEmailRoot;

  var PASSWORD = 'password';
  var TOO_YOUNG_YEAR = new Date().getFullYear() - 13;
  var user;
  var email;

  registerSuite({
    name: 'oauth sign in',

    setup: function () {
    },

    beforeEach: function () {
      email = TestHelpers.createEmail();
      user = TestHelpers.emailToUser(email);
      var self = this;

      return FunctionalHelpers.clearBrowserState(this)
        .then(function () {
          return self.get('remote')
            // sign up, do not verify steps
            .get(require.toUrl(OAUTH_APP))
            .setFindTimeout(intern.config.pageLoadTimeout)
            .findByCssSelector('#splash .signup')
            .click()
            .end()

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

            .findByCssSelector('#fxa-confirm-header')
            .end();
        });
    },

    'verified': function () {
      var self = this;
      // verify account
      return restmail(EMAIL_SERVER_ROOT + '/mail/' + user)
        .then(function (emails) {

          return self.get('remote')
            .get(require.toUrl(emails[0].headers['x-link']))

            // wait for confirmation
            .findById('fxa-sign-up-complete-header')
            .end()
            // sign in with a verified account
            .get(require.toUrl(OAUTH_APP))
            .findByCssSelector('#splash .signin')
            .click()
            .end()

            .findByCssSelector('#fxa-signin-header .service')
            .end()

            .getCurrentUrl()
            .then(function (url) {
              assert.ok(url.indexOf('oauth/signin?') > -1);
              assert.ok(url.indexOf('client_id=') > -1);
              assert.ok(url.indexOf('redirect_uri=') > -1);
              assert.ok(url.indexOf('state=') > -1);
            })
            .end()

            .findByCssSelector('form input.email')
            .clearValue()
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

            .findByCssSelector('#loggedin')
            .getCurrentUrl()
            .then(function (url) {
              // redirected back to the App
              assert.ok(url.indexOf(OAUTH_APP) > -1);
            })
            .end()

            // let items load
            .findByCssSelector('#todolist li')
            .end()

            .findByCssSelector('#loggedin')
            .getVisibleText()
            .then(function (text) {
              // confirm logged in email
              assert.ok(text.indexOf(email) > -1);
            })
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
        });


    },

    'unverified': function () {
      var self = this;

      return this.get('remote')
        // Step 2: Try to sign in, unverified
        .get(require.toUrl(OAUTH_APP))
        .findByCssSelector('#splash .signin')
        .click()
        .end()

        .findByCssSelector('#fxa-signin-header .service')
        .end()

        .getCurrentUrl()
        .then(function (url) {
          assert.ok(url.indexOf('oauth/signin?') > -1);
          assert.ok(url.indexOf('client_id=') > -1);
          assert.ok(url.indexOf('redirect_uri=') > -1);
          assert.ok(url.indexOf('state=') > -1);
        })
        .end()

        .findByCssSelector('form input.email')
        .clearValue()
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

        .findByCssSelector('#fxa-confirm-header')
        .then(function () {
          return restmail(EMAIL_SERVER_ROOT + '/mail/' + user)
            .then(function (emails) {
              var verifyUrl = emails[0].headers['x-link'];
              return self.get('remote')
                .get(require.toUrl(verifyUrl))
                .findByCssSelector('#redirectTo')
                .click()
                .end()

                .findByCssSelector('#loggedin')
                .getCurrentUrl()
                .then(function (url) {
                  // redirected back to the App
                  assert.ok(url.indexOf(OAUTH_APP) > -1);
                })
                .end()

                // let items load
                .findByCssSelector('#todolist li')
                .end()

                .findByCssSelector('#loggedin')
                .getVisibleText()
                .then(function (text) {
                  // confirm logged in email
                  assert.ok(text.indexOf(email) > -1);
                })
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
            });

        });
    }
  });

});
