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
  var CONTENT_SERVER = config.fxaContentRoot;
  var OAUTH_APP = config.fxaOauthApp;
  var EMAIL_SERVER_ROOT = config.fxaEmailRoot;
  var TOO_YOUNG_YEAR = new Date().getFullYear() - 13;

  var PASSWORD = 'password';
  var user;
  var email;

  registerSuite({
    name: 'oauth sign up',

    setup: function () {
      email = TestHelpers.createEmail();
      user = TestHelpers.emailToUser(email);
    },

    beforeEach: function () {
      var self = this;
      // clear localStorage to avoid polluting other tests.
      // Without the clear, /signup tests fail because of the info stored
      // in prefillEmail
      return self.get('remote')
        // always go to the content server so the browser state is cleared
        .get(require.toUrl(CONTENT_SERVER))
        .setFindTimeout(intern.config.pageLoadTimeout)
        .then(function () {
          return FunctionalHelpers.clearBrowserState(self);
        });
    },

    'basic sign up': function () {
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

          return restmail(EMAIL_SERVER_ROOT + '/mail/' + user)
            .then(function (emails) {
              return self.get('remote')
                .get(require.toUrl(emails[0].headers['x-link']));
            });
        })
        .end()

        .findByCssSelector('#redirectTo')
          .click()
        .end()

        // let items load
        .findByCssSelector('#todolist li')
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
    }
  });

});
