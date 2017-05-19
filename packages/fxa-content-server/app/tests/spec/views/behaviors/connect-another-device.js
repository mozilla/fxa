/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define((require, exports, module) => {
  'use strict';

  const { assert } = require('chai');
  const ConnectAnotherDeviceBehavior = require('views/behaviors/connect-another-device');
  const NullBehavior = require('views/behaviors/null');
  const sinon = require('sinon');

  describe('views/behaviors/connect-another-device', () => {
    let account;
    let cadBehavior;
    let defaultBehavior;

    before(() => {
      account = {};
      defaultBehavior = new NullBehavior();
      cadBehavior = new ConnectAnotherDeviceBehavior(defaultBehavior);
    });

    describe('eligible for CAD', () => {
      it('delegates to `view.navigateToConnectAnotherDeviceScreen`', () => {
        const view = {
          invokeBehavior: sinon.spy(),
          isEligibleForConnectAnotherDevice: sinon.spy(() => true),
          navigateToConnectAnotherDeviceScreen: sinon.spy()
        };

        cadBehavior(view, account);

        assert.isTrue(view.isEligibleForConnectAnotherDevice.calledOnce);
        assert.isTrue(view.isEligibleForConnectAnotherDevice.calledWith(account));

        assert.isTrue(view.navigateToConnectAnotherDeviceScreen.calledOnce);
        assert.isTrue(view.navigateToConnectAnotherDeviceScreen.calledWith(account));

        assert.isFalse(view.invokeBehavior.called);
      });
    });

    describe('ineligible for CAD', () => {
      it('invokes the defaultBehavior', () => {
        const view = {
          invokeBehavior: sinon.spy(),
          isEligibleForConnectAnotherDevice: sinon.spy(() => false),
          navigateToConnectAnotherDeviceScreen: sinon.spy()
        };

        cadBehavior(view, account);

        assert.isTrue(view.isEligibleForConnectAnotherDevice.calledOnce);
        assert.isTrue(view.isEligibleForConnectAnotherDevice.calledWith(account));

        assert.isFalse(view.navigateToConnectAnotherDeviceScreen.called);

        assert.isTrue(view.invokeBehavior.calledOnce);
        assert.isTrue(view.invokeBehavior.calledWith(defaultBehavior, account));
      });
    });
  });
});
