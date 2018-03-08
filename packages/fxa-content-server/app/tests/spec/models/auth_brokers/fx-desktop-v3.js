/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const { assert } = require('chai');
  const FxDesktopV3AuthenticationBroker = require('models/auth_brokers/fx-desktop-v3');
  const sinon = require('sinon');
  const WindowMock = require('../../../mocks/window');

  describe('models/auth_brokers/fx-desktop-v3', () => {
    var broker;
    var windowMock;

    beforeEach(() => {
      windowMock = new WindowMock();

      broker = new FxDesktopV3AuthenticationBroker({
        window: windowMock
      });
    });

    describe('capabilities', () => {
      it('has the expected capabilities', () => {
        assert.isTrue(broker.hasCapability('allowUidChange'));
        assert.isTrue(broker.hasCapability('emailFirst'));
        assert.isTrue(broker.hasCapability('tokenCode'));
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
            isFirefoxDesktop: () => true
          };
        });

        return broker.fetch()
          .then(() => {
            assert.isFalse(broker.getCapability('browserTransitionsAfterEmailVerification'));
          });
      });
    });
  });
});
