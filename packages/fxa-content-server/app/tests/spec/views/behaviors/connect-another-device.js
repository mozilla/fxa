/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import Cocktail from 'cocktail';
import ConnectAnotherDeviceBehavior from 'views/behaviors/connect-another-device';
import ConnectAnotherDeviceMixin from 'views/mixins/connect-another-device-mixin';
import NullBehavior from 'views/behaviors/null';
import sinon from 'sinon';

describe('views/behaviors/connect-another-device', () => {
  let account;
  let cadBehavior;
  let defaultBehavior;

  before(() => {
    account = {};
    defaultBehavior = new NullBehavior();
    cadBehavior = new ConnectAnotherDeviceBehavior(defaultBehavior);
  });

  it('ensureConnectAnotherDeviceMixin adds the ConnectAnotherDeviceMixin to a view', () => {
    const view = {};
    cadBehavior.ensureConnectAnotherDeviceMixin(view);
    assert.isFunction(view.isEligibleForConnectAnotherDevice);
    assert.isFunction(view.navigateToConnectAnotherDeviceScreen);
  });

  describe('eligible for CAD', () => {
    it('delegates to `view.navigateToConnectAnotherDeviceScreen`', () => {
      const view = {
        hasNavigated: sinon.spy(() => false),
      };
      Cocktail.mixin(view, ConnectAnotherDeviceMixin);

      sinon
        .stub(view, 'isEligibleForConnectAnotherDevice')
        .callsFake(() => true);
      sinon
        .stub(view, 'navigateToConnectAnotherDeviceScreen')
        .callsFake(() => {});

      return cadBehavior(view, account).then(behavior => {
        assert.strictEqual(behavior, defaultBehavior);

        assert.isTrue(view.isEligibleForConnectAnotherDevice.calledOnce);
        assert.isTrue(
          view.isEligibleForConnectAnotherDevice.calledWith(account)
        );

        assert.isTrue(view.navigateToConnectAnotherDeviceScreen.calledOnce);
        assert.isTrue(
          view.navigateToConnectAnotherDeviceScreen.calledWith(account)
        );

        assert.isTrue(view.hasNavigated.calledOnce);
      });
    });
  });

  describe('ineligible for CAD', () => {
    it('invokes the defaultBehavior', () => {
      const view = {
        hasNavigated: sinon.spy(() => false),
      };
      Cocktail.mixin(view, ConnectAnotherDeviceMixin);

      sinon
        .stub(view, 'isEligibleForConnectAnotherDevice')
        .callsFake(() => false);
      sinon
        .stub(view, 'navigateToConnectAnotherDeviceScreen')
        .callsFake(() => {});

      return cadBehavior(view, account).then(behavior => {
        assert.strictEqual(behavior, defaultBehavior);

        assert.isTrue(view.isEligibleForConnectAnotherDevice.calledOnce);
        assert.isTrue(
          view.isEligibleForConnectAnotherDevice.calledWith(account)
        );

        assert.isFalse(view.navigateToConnectAnotherDeviceScreen.called);

        assert.isTrue(view.hasNavigated.calledOnce);
      });
    });
  });
});
