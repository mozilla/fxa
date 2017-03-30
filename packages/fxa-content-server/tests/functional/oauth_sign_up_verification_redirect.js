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
  var PASSWORD = 'password';
  var email;

  const OAUTH_APP_URL = intern.config.fxaOauthApp;
  const OAUTH_API_URL = `${OAUTH_APP_URL}api/oauth`;

  var clearBrowserState = FunctionalHelpers.clearBrowserState;
  var click = FunctionalHelpers.click;
  var closeCurrentWindow = FunctionalHelpers.closeCurrentWindow;
  var fillOutSignUp = FunctionalHelpers.fillOutSignUp;
  var pollUntilGoneByQSA = FunctionalHelpers.pollUntilGoneByQSA;
  var openExternalSite = FunctionalHelpers.openExternalSite;
  var openFxaFromRp = FunctionalHelpers.openFxaFromRp;
  var openVerificationLinkInNewTab = FunctionalHelpers.openVerificationLinkInNewTab;
  var openVerificationLinkInSameTab = FunctionalHelpers.openVerificationLinkInSameTab;
  var testElementExists = FunctionalHelpers.testElementExists;
  var waitForUrl = FunctionalHelpers.waitForUrl;

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
        .then(openFxaFromRp('signup', {
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

      var badRequestCount = 0;
      var signedInCount = 0;

      function countSignInAndInvalidState() {
        return function () {
          return this.parent
            // This test can do redirecting. We want to make sure all redirections
            // have completed. The user will either finish at 123done's logged in
            // screen, or 123done's /api/oauth endpoint where an error message will
            // be displayed.
            // As ugly as it is, wait a few seconds for the redirects to finish.
            // Check which URL the user is at. If they are at the /api/oauth endpoint,
            // check for the error message. If they are at 123done, then check for
            // the #loggedin element.

            .sleep(5000) // <--- GROSS!!! Read above.
            .getCurrentUrl()
            .then(function (currentUrl) {
              // ditch the query params or else an exact match is not possible at the API endpoint.
              currentUrl = currentUrl.split('?')[0];
              if (currentUrl === OAUTH_API_URL) {
                return this.parent
                  .findByCssSelector('body')
                    .getVisibleText()
                    .then(function (text) {
                      var isBadRequest = text === 'Bad request - missing code - missing state';
                      if (isBadRequest) {
                        badRequestCount++;
                      }
                    })
                  .end();
              } else if (currentUrl === OAUTH_APP_URL) {
                return this.parent
                  .setFindTimeout(0)
                  .findByCssSelector('#loggedin')
                    .then(function () {
                      signedInCount++;
                    }, function (err) {
                      if (/NoSuchElement/.test(String(err))) {
                        // swallow the error
                        return;
                      }

                      throw err;
                    })
                  .end();
              }
            })
            .end();
        };
      }

      return this.remote
        .then(openVerificationLinkInNewTab(email, 0))
        .then(pollUntilGoneByQSA('#fxa-confirm-header'))

        .then(countSignInAndInvalidState())

        .switchToWindow('newwindow')
        .then(countSignInAndInvalidState())
        .then(closeCurrentWindow())
        .then(function () {
          // at least one window will sign in, possibly two.
          if (! signedInCount) {
            assert.fail('at least one sign in expected');
          } else if (badRequestCount === 0 && signedInCount === 2) {
            assert.ok('this is expected');
          } else if (badRequestCount === 1 && signedInCount === 1) {
            assert.ok('this is expected');
          } else if (badRequestCount === 2) {
            assert.fail('2 bad requests are unexpected');
          }
        });
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
        .then(waitForUrl(OAUTH_API_URL))
        .findByCssSelector('body')
        .getVisibleText()
        .then(function (text) {
          assert.equal(text, 'Bad request - missing code - missing state');
        })
        .end();
    }
  });
});
