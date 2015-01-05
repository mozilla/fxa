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
  'intern/node_modules/dojo/Deferred',
  'tests/lib/restmail',
  'tests/lib/helpers',
  'tests/functional/lib/helpers'
], function (intern, registerSuite, assert, require, nodeXMLHttpRequest, FxaClient, Deferred, restmail, TestHelpers, FunctionalHelpers) {
  'use strict';

  var config = intern.config;
  var AUTH_SERVER_ROOT = config.fxaAuthRoot;
  var FORCE_AUTH_URL = config.fxaContentRoot + 'force_auth';

  var PASSWORD = 'password';
  var email;
  var client;

  function openFxa(self, email) {
    return self.get('remote')
      .setFindTimeout(intern.config.pageLoadTimeout)
      .get(require.toUrl(FORCE_AUTH_URL + '?email=' + email))

      .findByCssSelector('#fxa-force-auth-header')
      .end();
  }

  function attemptSignIn(self) {
    return self.get('remote')
      // user should be at the force-auth screen
      .findByCssSelector('#fxa-force-auth-header')
      .end()

      .findByCssSelector('input[type=password]')
        .click()
        .type(PASSWORD)
      .end()

      .findByCssSelector('button[type="submit"]')
        .click()
      .end();
  }


  registerSuite({
    name: 'force_auth with an existing user',

    beforeEach: function () {
      email = TestHelpers.createEmail();
      client = new FxaClient(AUTH_SERVER_ROOT, {
        xhr: nodeXMLHttpRequest.XMLHttpRequest
      });
      var self = this;
      return client.signUp(email, PASSWORD, { preVerified: true })
        .then(function () {
          // clear localStorage to avoid polluting other tests.
          return FunctionalHelpers.clearBrowserState(self);
        });
    },

    'sign in via force-auth': function () {
      var self = this;
      return openFxa(self, email)

        .then(function () {
          return attemptSignIn(self);
        })

        .findById('fxa-settings-header')
        .end();
    },

    'forgot password flow via force-auth goes directly to confirm email screen': function () {
      var self = this;
      return openFxa(self, email)
        .findByCssSelector('.reset-password')
          .click()
        .end()

        .findById('fxa-confirm-reset-password-header')
        .end()

        // user remembers her password, clicks the "sign in" link. They
        // should go back to the /force_auth screen.
        .findByClassName('sign-in')
          .click()
        .end()

        .findById('fxa-force-auth-header');
    },

    'visiting the tos/pp links saves information for return': function () {
      var self = this;
      return testRepopulateFields.call(self, '/legal/terms', 'fxa-tos-header')
        .then(function () {
          return testRepopulateFields.call(self, '/legal/privacy', 'fxa-pp-header');
        });
    }
  });

  registerSuite({
    name: 'force_auth with an unregistered user',

    beforeEach: function () {
      email = TestHelpers.createEmail();
      // clear localStorage to avoid polluting other tests.
      return FunctionalHelpers.clearBrowserState(this);
    },

    'sign in shows an error message': function () {
      var self = this;
      return openFxa(self, email)

        .then(function () {
          return attemptSignIn(self);
        })

        .then(FunctionalHelpers.visibleByQSA('.error'))
        .end();
    },

    'reset password shows an error message': function () {
      var self = this;
      return openFxa(self, email)
        .findByCssSelector('a[href="/confirm_reset_password"]')
          .click()
        .end()

        .then(FunctionalHelpers.visibleByQSA('.error'))
        .end();
    }
  });


  function testRepopulateFields(dest, header) {
    /*jshint validthis: true*/
    var self = this;

    return openFxa(self, email)

      .findByCssSelector('input[type=password]')
        .clearValue()
        .click()
        .type(PASSWORD)
      .end()

      .findByCssSelector('a[href="' + dest + '"]')
        .click()
      .end()

      .findById(header)
      .end()

      .findByCssSelector('.back')
        .click()
      .end()

      .findById('fxa-force-auth-header')
      .end()

      .findByCssSelector('input[type=password]')
        .getProperty('value')
        .then(function (resultText) {
          // check the email address was re-populated
          assert.equal(resultText, PASSWORD);
        })
      .end();
  }
});
