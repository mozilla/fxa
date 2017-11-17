/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function(require, exports, module) {
  'use strict';

  const { assert } = require('chai');
  const Cocktail = require('cocktail');
  const ConnectAnotherDeviceMixin = require('views/mixins/connect-another-device-mixin');
  const ConnectAnotherDeviceOnSigninBehavior = require('views/behaviors/connect-another-device-on-signin');
  const NullBehavior = require('views/behaviors/null');
  const sinon = require('sinon');

  describe('views/behaviors/connect-another-device-on-signin', () => {
    let account;
    let cadOnSigninBehavior;
    let defaultBehavior;

    before(() => {
      account = {};
      defaultBehavior = new NullBehavior();
      cadOnSigninBehavior = new ConnectAnotherDeviceOnSigninBehavior(defaultBehavior);
    });

    it('ensureConnectAnotherDeviceMixin adds the ConnectAnotherDeviceMixin to a view', () => {
      const view = {};
      cadOnSigninBehavior.ensureConnectAnotherDeviceMixin(view);
      assert.isFunction(view.isEligibleForConnectAnotherDevice);
      assert.isFunction(view.navigateToConnectAnotherDeviceScreen);
    });

    describe('eligible for CAD', () => {
      it('delegates to `view.navigateToConnectAnotherDeviceOnSigninScreen`', () => {
        const view = {
          hasNavigated: sinon.spy(() => false)
        };
        Cocktail.mixin(view, ConnectAnotherDeviceMixin);

        sinon.stub(view, 'isEligibleForConnectAnotherDeviceOnSignin').callsFake(() => true);
        sinon.stub(view, 'navigateToConnectAnotherDeviceOnSigninScreen').callsFake(() => {});

        return cadOnSigninBehavior(view, account)
          .then((behavior) => {
            assert.strictEqual(behavior, defaultBehavior);

            assert.isTrue(view.isEligibleForConnectAnotherDeviceOnSignin.calledOnce);
            assert.isTrue(view.isEligibleForConnectAnotherDeviceOnSignin.calledWith(account));

            assert.isTrue(view.navigateToConnectAnotherDeviceOnSigninScreen.calledOnce);
            assert.isTrue(view.navigateToConnectAnotherDeviceOnSigninScreen.calledWith(account));

            assert.isTrue(view.hasNavigated.calledOnce);
          });
      });
    });

    describe('ineligible for CAD', () => {
      it('invokes the defaultBehavior', () => {
        const view = {
          hasNavigated: sinon.spy(() => false)
        };
        Cocktail.mixin(view, ConnectAnotherDeviceMixin);

        sinon.stub(view, 'isEligibleForConnectAnotherDeviceOnSignin').callsFake(() => false);
        sinon.stub(view, 'navigateToConnectAnotherDeviceOnSigninScreen').callsFake(() => {});

        return cadOnSigninBehavior(view, account)
          .then((behavior) => {
            assert.strictEqual(behavior, defaultBehavior);

            assert.isTrue(view.isEligibleForConnectAnotherDeviceOnSignin.calledOnce);
            assert.isTrue(view.isEligibleForConnectAnotherDeviceOnSignin.calledWith(account));

            assert.isFalse(view.navigateToConnectAnotherDeviceOnSigninScreen.called);

            assert.isTrue(view.hasNavigated.calledOnce);
          });
      });
    });
  });
});
