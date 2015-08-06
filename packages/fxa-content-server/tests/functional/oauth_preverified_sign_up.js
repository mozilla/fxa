/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'intern/chai!assert',
  'require',
  'tests/lib/helpers',
  'tests/functional/lib/helpers'
], function (intern, registerSuite, assert, require, TestHelpers, FunctionalHelpers) {
  var config = intern.config;
  var OAUTH_APP = config.fxaOauthApp;
  var TOO_YOUNG_YEAR = new Date().getFullYear() - 13;

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
        contentServer: true,
        '123done': true
      });
    },

    'preverified sign up': function () {
      var self = this;

      var SIGNUP_URL = OAUTH_APP + 'api/preverified-signup?' +
                        'email=' + encodeURIComponent(email);

      return self.remote
        .get(require.toUrl(SIGNUP_URL))
        .setFindTimeout(intern.config.pageLoadTimeout)

        .findByCssSelector('#fxa-signup-header')
        .end()

        .findByCssSelector('form input.password')
          .click()
          .type(PASSWORD)
        .end()

        .findByCssSelector('#fxa-age-year')
        .end()

        .findById('fxa-' + (TOO_YOUNG_YEAR - 1))
          .click()
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
