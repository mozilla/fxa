/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const FunctionalHelpers = require('./lib/helpers');
const selectors = require('./lib/selectors');

const ENTER_EMAIL_URL = `${intern._config.fxaContentRoot}?automatedBrowser=true`;

const {
  clearBrowserState,
  openPage,
  testAreEventsLogged,
  testElementExists,
} = FunctionalHelpers;

registerSuite('refreshing a screen logs a refresh event', {
  beforeEach: function() {
    return this.remote.then(clearBrowserState());
  },
  tests: {
    'refreshing the signup screen': function() {
      return (
        this.remote
          .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))

          .refresh()
          .then(testElementExists(selectors.ENTER_EMAIL.HEADER))
          // Unload the page to flush the metrics
          .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
          .then(
            testAreEventsLogged([
              'screen.enter-email',
              'screen.enter-email',
              'enter-email.refresh',
            ])
          )
      );
    },
  },
});
