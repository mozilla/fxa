/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const TestHelpers = require('../lib/helpers');
const FunctionalHelpers = require('./lib/helpers');
var config = intern._config;
var CONTENT_SERVER = config.fxaContentRoot;
var APPS_SETTINGS_URL = CONTENT_SERVER + 'settings/clients?forceDeviceList=1';
var UNTRUSTED_OAUTH_APP = config.fxaUntrustedOauthApp;

var PASSWORD = 'password';

const {
  clearBrowserState,
  click,
  closeCurrentWindow,
  fillOutSignUp,
  openFxaFromRp,
  openPage,
  openTab,
  openVerificationLinkInSameTab,
  pollUntilGoneByQSA,
  switchToWindow,
  testElementExists,
  type,
} = FunctionalHelpers;

var email;

registerSuite('oauth settings clients', {
  beforeEach: function() {
    email = TestHelpers.createEmail();

    return this.remote.then(
      clearBrowserState({
        '123done': true,
        contentServer: true,
      })
    );
  },
  tests: {
    'rp listed in apps, can be deleted': function() {
      var self = this;
      self.timeout = 90 * 1000;

      return (
        this.remote
          .then(openFxaFromRp('signup'))
          .then(fillOutSignUp(email, PASSWORD))
          .then(testElementExists('#fxa-confirm-header'))
          .then(openVerificationLinkInSameTab(email, 0))
          .then(testElementExists('#loggedin'))

          // lists the first client
          .then(openPage(APPS_SETTINGS_URL, '.client-disconnect'))

          // sign in into another app
          .then(openTab(UNTRUSTED_OAUTH_APP))
          .then(switchToWindow(1))

          // cannot use the helper method here, the helper method uses $ (jQuery)
          // 123Done loads jQuery in the <body> this leads to '$ is undefined' error
          // when running tests, because jQuery can be slow to load
          .findByCssSelector('.ready')
          .end()

          .findByCssSelector('.signin')
          .click()
          .end()

          .then(type('#password', PASSWORD))
          .then(click('#submit-btn'))

          .then(testElementExists('#fxa-permissions-header'))
          .then(click('#accept'))
          .then(testElementExists('#loggedin'))

          .then(closeCurrentWindow())

          // second app should show up using 'refresh'
          .then(click('.clients-refresh'))

          .then(testElementExists('li.client-oAuthApp[data-name^="321"]'))

          .then(
            click('li.client-oAuthApp[data-name^="123"] .client-disconnect')
          )
          // wait for the element to be gone or else it's possible for the subsequent
          // `click` can fail with a StaleElementReference because click on 123Done's
          // button happens, the XHR request takes a bit of time, the reference to the
          // 321Done button is fetched, the XHR request completes and updates the DOM,
          // making the reference to the 321Done button stale.
          .then(pollUntilGoneByQSA('li.client-oAuthApp[data-name^="123"]'))
          .then(
            click('li.client-oAuthApp[data-name^="321"] .client-disconnect')
          )
          .then(pollUntilGoneByQSA('li.client-oAuthApp'))
      );
    },
  },
});
