/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import FxDesktopV3AuthenticationBroker from 'models/auth_brokers/fx-desktop-v3';
import WindowMock from '../../../mocks/window';

describe('models/auth_brokers/fx-desktop-v3', () => {
  var broker;
  var windowMock;

  beforeEach(() => {
    windowMock = new WindowMock();

    broker = new FxDesktopV3AuthenticationBroker({
      window: windowMock,
    });
  });

  describe('capabilities', () => {
    it('has the expected capabilities', () => {
      assert.isTrue(broker.hasCapability('allowUidChange'));
      assert.isTrue(broker.hasCapability('disableLegacySigninSignup'));
      assert.isTrue(broker.hasCapability('emailFirst'));
      assert.isTrue(broker.getCapability('openWebmailButtonVisible'));
      assert.isTrue(broker.getCapability('tokenCode'));
    });
  });
});
