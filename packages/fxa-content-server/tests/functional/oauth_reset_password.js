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

  var AUTH_SERVER_ROOT = config.fxaAuthRoot;
  var CONTENT_SERVER = config.fxaContentRoot;
  var EMAIL_SERVER_ROOT = config.fxaEmailRoot;
  var COMPLETE_PAGE_URL_ROOT = CONTENT_SERVER + 'complete_reset_password';

  var PASSWORD = 'password';
  var user;
  var email;
  var code;
  var token;
  var service;
  var client;
  var accountData;

  function setTokenAndCodeFromEmail(user, emailNumber) {
    var fetchCount = emailNumber + 1;
    return restmail(EMAIL_SERVER_ROOT + '/mail/' + user, fetchCount)
      .then(function (emails) {
        // token and code are hex values
        try {
          token = emails[emailNumber].html.match(/token=([a-f\d]+)/)[1];
          code = emails[emailNumber].html.match(/code=([a-f\d]+)/)[1];
          service = emails[emailNumber].html.match(/service=([a-f\d]+)/)[1];
        } catch (e) {
          console.error(emails);
        }
      });
  }

  registerSuite({
    name: 'oauth reset password',

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
          return self.get('remote')
            // always go to the content server so the browser state is cleared
            .get(require.toUrl(CONTENT_SERVER))
            .setFindTimeout(intern.config.pageLoadTimeout)
            .then(function () {
              return FunctionalHelpers.clearBrowserState(self);
            });
        });
    },

    teardown: function () {
      // clear localStorage to avoid polluting other tests.
      return FunctionalHelpers.clearBrowserState(this);
    },

    'oath reset password': function () {
      var self = this;

      // verify account
      return restmail(EMAIL_SERVER_ROOT + '/mail/' + user)
        .then(function (emails) {
          var code = emails[0].html.match(/code=([A-Za-z0-9]+)/)[1];
          return client.verifyCode(accountData.uid, code);
        })
        .then(function () {
          return self.get('remote')
            .get(require.toUrl(OAUTH_APP))
            .setFindTimeout(intern.config.pageLoadTimeout)
            .findByCssSelector('.signin')
            .click()
            .end()

            .findByCssSelector('#fxa-signin-header')
            .getCurrentUrl()
            .then(function (url) {
              assert.ok(url.indexOf('oauth/signin?') > -1);
              assert.ok(url.indexOf('client_id=') > -1);
              assert.ok(url.indexOf('redirect_uri=') > -1);
              assert.ok(url.indexOf('state=') > -1);
            })
            .end()

            .findByCssSelector('#fxa-signin-header .service')
            .end()

            .findByCssSelector('a[href="/reset_password"]')
            .click()
            .end()

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
              return setTokenAndCodeFromEmail(user, 1);
            })
            .then(function () {
              var url = COMPLETE_PAGE_URL_ROOT +
                '?token=' + token +
                '&code=' + code +
                '&service=' + service +
                '&email=' + encodeURIComponent(email);
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

            .findByCssSelector('#redirectTo')
            .click()
            .end()

            // let items load
            .findByCssSelector('#todolist li')
            .end()

            .findByCssSelector('#loggedin')
            .getCurrentUrl()
            .then(function (url) {
              // redirected back to the App
              assert.ok(url.indexOf(OAUTH_APP) > -1);
            })
            .end()

            .findByCssSelector('#loggedin span')
            .getVisibleText()
            .then(function (text) {
              // confirm logged in email
              assert.ok(text.indexOf(email) > -1);
            })
            .end()

            .findByCssSelector('#logout')
            .click()
            .end()

            .findByCssSelector('.signup')
            .end()

            .findByCssSelector('#loggedin')
            .getVisibleText()
            .then(function (text) {
              // confirm logged out
              assert.ok(text.length === 0);
            })
            .end();
        });
    }

  });

});
