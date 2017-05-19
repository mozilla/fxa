/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define((require, exports, module) => {
  'use strict';

  const { assert } = require('chai');
  const FxSyncAuthenticationBroker = require('models/auth_brokers/fx-sync');
  const Metrics = require('lib/metrics');
  const sinon = require('sinon');
  const WindowMock = require('../../../mocks/window');

  describe('models/auth_brokers/fx-sync', () => {
    let account;
    let broker;
    let metrics;
    let windowMock;

    beforeEach(() => {
      account = {};
      metrics = new Metrics();
      windowMock = new WindowMock();

      broker = new FxSyncAuthenticationBroker({
        metrics,
        window: windowMock
      });
    });

    afterEach(() => {
      account = null;
      broker = null;
      metrics.destroy();
      metrics = null;
      windowMock = null;
    });

    describe('afterSignUpConfirmationPoll', () => {
      describe('broker has `cadAfterSignUpConfirmationPoll` capability', () => {
        it('sets the metrics viewName prefix, resolves to a `ConnectAnotherDeviceBehavior`', () => {
          broker.setCapability('cadAfterSignUpConfirmationPoll', true);
          sinon.spy(metrics, 'setViewNamePrefix');

          return broker.afterSignUpConfirmationPoll(account)
            .then((behavior) => {
              assert.equal(behavior.type, 'connect-another-device');

              assert.isTrue(metrics.setViewNamePrefix.calledOnce);
              assert.isTrue(metrics.setViewNamePrefix.calledWith('signup'));
            });
        });
      });

      describe('broker does not have `cadAfterSignUpConfirmationPoll` capability', () => {
        it('resolves to the default behavior', () => {
          sinon.spy(metrics, 'setViewNamePrefix');

          return broker.afterSignUpConfirmationPoll(account)
            .then((behavior) => {
              assert.equal(behavior.type, broker.getBehavior('afterSignUpConfirmationPoll').type);

              assert.isFalse(metrics.setViewNamePrefix.called);
            });
        });
      });
    });
  });
});
