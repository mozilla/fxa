/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const assert = intern.getPlugin('chai').assert;
const TestHelpers = require('../lib/helpers');
const FunctionalHelpers = require('./lib/helpers');

const fillOutSignUp = FunctionalHelpers.fillOutSignUp;
const getEmailHeaders = FunctionalHelpers.getEmailHeaders;

const PASSWORD = '12345678';

registerSuite('email_service', {
  tests: {
    'email_service works': function() {
      const email = TestHelpers.createEmail('emailservice.{id}');
      const user = TestHelpers.emailToUser(email);

      return this.remote
        .then(fillOutSignUp(email, PASSWORD))
        .then(getEmailHeaders(user, 0))
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
