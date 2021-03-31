/* eslint-disable indent */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const FunctionalHelpers = require('./lib/helpers');
var config = intern._config;
var CONTENT_SERVER = config.fxaContentRoot;
var APPS_SETTINGS_URL = CONTENT_SERVER + 'settings#connected-services';
var UNTRUSTED_OAUTH_APP = config.fxaUntrustedOauthApp;
const selectors = require('./lib/selectors');

var PASSWORD = 'password123456789';

const {
  clearBrowserState,
  click,
  closeCurrentWindow,
  createEmail,
  fillOutEmailFirstSignUp,
  fillOutSignUpCode,
  noSuchElement,
  openFxaFromRp,
  openPage,
  openTab,
  pollUntilGoneByQSA,
  switchToWindow,
  testElementExists,
} = FunctionalHelpers;

var email;

registerSuite('oauth settings clients', {
  beforeEach: function () {
    email = createEmail();

    return this.remote.then(
      clearBrowserState({
        '123done': true,
        contentServer: true,
      })
    );
  },
  tests: {
    'rp listed in apps, can be deleted': function () {
      var self = this;
      self.timeout = 90 * 1000;

      return (
        this.remote
          .then(openFxaFromRp('enter-email'))
          .then(fillOutEmailFirstSignUp(email, PASSWORD))
          .then(testElementExists(selectors.CONFIRM_SIGNUP_CODE.HEADER))
          .then(fillOutSignUpCode(email, 0))
          .then(testElementExists(selectors['123DONE'].AUTHENTICATED))

          // lists the first client
          .then(openPage(APPS_SETTINGS_URL, selectors.SETTINGS_CLIENTS.HEADER))

          // sign in into another app
          .then(openTab(UNTRUSTED_OAUTH_APP))
          .then(switchToWindow(1))

          // cannot use the helper method here, the helper method uses $ (jQuery)
          // 123Done loads jQuery in the <body> this leads to '$ is undefined' error
          // when running tests, because jQuery can be slow to load

          .then(click(selectors['123DONE'].BUTTON_SIGNIN))

          .then(click(selectors.SIGNIN_PASSWORD.SUBMIT_USE_SIGNED_IN))

          .then(testElementExists(selectors.OAUTH_PERMISSIONS.HEADER))
          .then(click(selectors.OAUTH_PERMISSIONS.SUBMIT))
          .then(testElementExists(selectors['123DONE'].AUTHENTICATED))

          .then(closeCurrentWindow())

          // second app should show up using 'refresh'
          .then(click(selectors.SETTINGS_CLIENTS.BUTTON_REFRESH))

          .then(
            testElementExists(
              '[data-testid=settings-connected-service][data-name^="321"]'
            )
          )

          .then(
            click(
              '[data-testid=settings-connected-service][data-name^="123"] [data-testid=connected-service-sign-out]'
            )
          )
          // wait for the element to be gone or else it's possible for the subsequent
          // `click` can fail with a StaleElementReference because click on 123Done's
          // button happens, the XHR request takes a bit of time, the reference to the
          // 321Done button is fetched, the XHR request completes and updates the DOM,
          // making the reference to the 321Done button stale.
          .then(
            pollUntilGoneByQSA(
              '[data-testid=settings-connected-service][data-name^="123"]'
            )
          )
          .then(
            click(
              '[data-testid=settings-connected-service][data-name^="321"] [data-testid=connected-service-sign-out]'
            )
          )
          .then(pollUntilGoneByQSA(selectors.SETTINGS_CLIENTS.OAUTH_CLIENT))

          // the deleted clients should not show up again, this ensures
          // that access tokens are deleted along with the refresh tokens.
          .then(click(selectors.SETTINGS_CLIENTS.BUTTON_REFRESH))
          .then(
            pollUntilGoneByQSA(
              '[data-testid=settings-connected-service][data-name^="321"]'
            )
          )

          .then(noSuchElement(selectors.SETTINGS_CLIENTS.OAUTH_CLIENT))
      );
    },
  },
});
