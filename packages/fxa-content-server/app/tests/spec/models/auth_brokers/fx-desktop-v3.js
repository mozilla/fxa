/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import FxDesktopV3AuthenticationBroker from 'models/auth_brokers/fx-desktop-v3';
import sinon from 'sinon';
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
      assert.isTrue(broker.hasCapability('emailFirst'));
    });
  });

  describe('fetch', () => {
    it('sets `browserTransitionsAfterEmailVerification` to false if Fx >= 58', () => {
      sinon.stub(broker.environment, 'isAboutAccounts').callsFake(() => true);
      sinon.stub(broker, 'getUserAgent').callsFake(() => {
        return {
          parseVersion() {
            return { major: 58 };
          },
          isFirefoxDesktop: () => true,
        };
      });

      return broker.fetch().then(() => {
        assert.isFalse(
          broker.getCapability('browserTransitionsAfterEmailVerification')
        );
      });
    });
  });
});
