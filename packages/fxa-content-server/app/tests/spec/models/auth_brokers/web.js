/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import WebBroker from 'models/auth_brokers/web';

describe('models/auth_brokers/web', function() {
  let broker;

  beforeEach(() => {
    broker = new WebBroker({});
  });

  function testRedirectsToSettings(brokerMethod) {
    it(`${brokerMethod} returns a NavigateBehavior to settings`, () => {
      return broker[brokerMethod]({ get: () => {} }).then(behavior => {
        assert.equal(behavior.type, 'navigate');
        assert.equal(behavior.endpoint, 'settings');
      });
    });
  }

  function testRedirectsToSettingsIfSignedIn(brokerMethod) {
    it(`${brokerMethod} returns a SettingsIfSignedInBehavior`, () => {
      return broker[brokerMethod]({ get: () => {} }).then(behavior => {
        assert.equal(behavior.type, 'settings');
      });
    });
  }

  testRedirectsToSettings('afterCompleteResetPassword');
  testRedirectsToSettings('afterForceAuth');
  testRedirectsToSettings('afterResetPasswordConfirmationPoll');
  testRedirectsToSettings('afterSignIn');
  testRedirectsToSettings('afterSignInConfirmationPoll');
  testRedirectsToSettings('afterSignUpConfirmationPoll');

  testRedirectsToSettingsIfSignedIn('afterCompleteSignIn');
  testRedirectsToSettingsIfSignedIn('afterCompleteSignUp');
});
