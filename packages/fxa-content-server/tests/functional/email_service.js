/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const assert = intern.getPlugin('chai').assert;
const FunctionalHelpers = require('./lib/helpers');
const selectors = require('./lib/selectors');

const {
  clearBrowserState,
  createEmail,
  fillOutEmailFirstSignUp,
  getEmailHeaders,
  openPage,
} = FunctionalHelpers;

const config = intern._config;
const ENTER_EMAIL_URL = config.fxaContentRoot;
const PASSWORD = 'password12345678';

registerSuite('email_service', {
  beforeEach: function() {
    return this.remote.then(clearBrowserState());
  },

  tests: {
    'email_service works': function() {
      const email = createEmail('emailservice.{id}');

      return this.remote
        .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
        .then(fillOutEmailFirstSignUp(email, PASSWORD))
        .then(getEmailHeaders(email, 0))
        .then(headers => {
          assert.equal(
            headers['x-email-service'],
            'fxa-email-service',
            'email service was used'
          );
        });
    },
  },
});
