/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const { assert } = require('chai');
  const WebBroker = require('models/auth_brokers/web');

  describe('models/auth_brokers/web', function () {
    let broker;

    beforeEach(() => {
      broker = new WebBroker({});
    });

    function testRedirectsToSettings(brokerMethod) {
      describe(brokerMethod, () => {
        it('returns a NavigateBehavior to settings', () => {
          return broker[brokerMethod]({ get: () => {} })
            .then((behavior) => {
              assert.equal(behavior.type, 'navigate');
              assert.equal(behavior.endpoint, 'settings');
            });
        });
      });
    }

    testRedirectsToSettings('afterCompleteResetPassword');
    testRedirectsToSettings('afterResetPasswordConfirmationPoll');
    testRedirectsToSettings('afterSignInConfirmationPoll');
    testRedirectsToSettings('afterSignUpConfirmationPoll');
  });
});


