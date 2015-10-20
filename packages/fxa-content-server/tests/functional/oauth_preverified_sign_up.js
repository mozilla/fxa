/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'intern/chai!assert',
  'tests/lib/helpers',
  'tests/functional/lib/helpers'
], function (intern, registerSuite, assert, TestHelpers, FunctionalHelpers) {
  var config = intern.config;
  var OAUTH_APP = config.fxaOauthApp;

  var PASSWORD = 'password';
  var email;

  registerSuite({
    name: 'preverified oauth sign up',

    beforeEach: function () {
      email = TestHelpers.createEmail();
      // clear localStorage to avoid polluting other tests.
      // Without the clear, /signup tests fail because of the info stored
      // in prefillEmail
      return FunctionalHelpers.clearBrowserState(this, {
        '123done': true,
        contentServer: true
      });
    },

    'preverified sign up': function () {
      var self = this;

      var SIGNUP_URL = OAUTH_APP + 'api/preverified-signup?' +
                        'email=' + encodeURIComponent(email);

      return FunctionalHelpers.openPage(self, SIGNUP_URL, '#fxa-signup-header')

        .findByCssSelector('form input.password')
          .click()
          .type(PASSWORD)
        .end()

        .findByCssSelector('#age')
          // XXX: Bug in Selenium 2.47.1, if Firefox is out of focus it will just type 1 number,
          // split the type commands for each character to avoid issues with the test runner
          .type('2')
          .type('4')
        .end()

        .findByCssSelector('button[type="submit"]')
          .click()
        .end()


        // user is redirected to 123done, wait for the footer first,
        // and then for the loggedin user to be visible. If we go
        // straight for the loggedin user, visibleByQSA blows up
        // because 123done isn't loaded yet and it complains about
        // the unload event of the content server.
        .findByCssSelector('#footer-main')
        .end()

        // user is pre-verified and sent directly to the RP.
        .then(FunctionalHelpers.visibleByQSA('#loggedin'))
        .end()

        .findByCssSelector('#loggedin')
        .getVisibleText()
        .then(function (text) {
          // user is signed in as pre-verified email
          assert.equal(text, email);
        })
        .end();
    }
  });

});
