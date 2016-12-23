/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern!object',
  'intern/chai!assert',
  'tests/lib/helpers',
  'tests/functional/lib/helpers'
], function (registerSuite, assert, TestHelpers, FunctionalHelpers) {
  var PASSWORD = 'password';
  var email;

  var thenify = FunctionalHelpers.thenify;

  var clearBrowserState = FunctionalHelpers.clearBrowserState;
  var click = FunctionalHelpers.click;
  var closeCurrentWindow = FunctionalHelpers.closeCurrentWindow;
  var fillOutSignUp = FunctionalHelpers.fillOutSignUp;
  var openExternalSite = FunctionalHelpers.openExternalSite;
  var openFxaFromRp = thenify(FunctionalHelpers.openFxaFromRp);
  var openVerificationLinkInNewTab = FunctionalHelpers.openVerificationLinkInNewTab;
  var openVerificationLinkInSameTab = FunctionalHelpers.openVerificationLinkInSameTab;
  var testElementExists = FunctionalHelpers.testElementExists;

  registerSuite({
    name: 'oauth sign up verification_redirect',

    beforeEach: function () {
      email = TestHelpers.createEmail();
      // clear localStorage to avoid polluting other tests.
      // Without the clear, /signup tests fail because of the info stored
      // in prefillEmail
      return this.remote
        .then(clearBrowserState({
          '123done': true,
          contentServer: true
        }))
        .then(openFxaFromRp(this.parent, 'signup', {
          query: {
            verification_redirect: 'always ' //eslint-disable-line camelcase
          }
        }))
        .then(fillOutSignUp(email, PASSWORD))
        .then(testElementExists('#fxa-confirm-header'));
    },

    'signup, same browser same window, verification_redirect=always': function () {
      return this.remote
        .then(openVerificationLinkInSameTab(email, 0))

        // should redirect back to 123done
        .then(testElementExists('#loggedin'));
    },

    'signup, same browser, original tab closed, verification_redirect=always': function () {
      return this.remote
        // closes the original tab
        .then(openExternalSite())

        .then(openVerificationLinkInNewTab(email, 0))
        .switchToWindow('newwindow')

        // should redirect back to 123done
        .then(testElementExists('#loggedin'))
        .then(closeCurrentWindow());
    },

    'signup, same browser different window, verification_redirect=always': function () {
      this.timeout = 90 * 1000;

      return this.remote
        .then(openVerificationLinkInNewTab(email, 0))

        // wait for the original tab to login
        .then(testElementExists('#loggedin'))

        .switchToWindow('newwindow')
        // this is an verification-redirect flow, both windows should login
        .then(testElementExists('#loggedin'))
        .then(closeCurrentWindow());
    },

    'signup, verify different browser, verification_redirect=always': function () {
      return this.remote
        // clear browser state to simulate opening link in a new browser
        .then(clearBrowserState({
          '123done': true,
          contentServer: true
        }))

        .then(openVerificationLinkInSameTab(email, 0))
        // new browser provides a proceed link to the relier
        .then(click('#proceed'))

        // Note: success is 123done giving a bad request because this is a different browser
        .findByCssSelector('body')
        .getVisibleText()
        .then(function (text) {
          assert.equal(text, 'Bad request - missing code - missing state');
        })
        .end();
    }
  });
});
