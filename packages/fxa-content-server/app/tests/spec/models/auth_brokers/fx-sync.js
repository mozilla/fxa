/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define((require, exports, module) => {
  'use strict';

  const { assert } = require('chai');
  const FxSyncAuthenticationBroker = require('models/auth_brokers/fx-sync');
  const Metrics = require('lib/metrics');
  const p = require('lib/promise');
  const Relier = require('models/reliers/relier');
  const sinon = require('sinon');
  const WebChannel = require('lib/channels/web');
  const WindowMock = require('../../../mocks/window');

  describe('models/auth_brokers/fx-sync', () => {
    let account;
    let broker;
    let metrics;
    let notificationChannel;
    let relier;
    let supportsChooseWhatToSyncWebV1;
    let windowMock;

    const ChildBroker = FxSyncAuthenticationBroker.extend({
      defaultCapabilities: {
        get chooseWhatToSyncWebV1 () {
          return supportsChooseWhatToSyncWebV1;
        }
      }
    });

    function createBroker () {
      if (broker) {
        broker.destroy();
      }

      broker = new ChildBroker({
        metrics,
        notificationChannel,
        relier,
        window: windowMock
      });
    }

    beforeEach(() => {
      account = {};
      metrics = new Metrics();
      relier = new Relier();
      windowMock = new WindowMock();
      notificationChannel = new WebChannel('web_channel');
      notificationChannel.initialize({ window: windowMock });

      createBroker();
    });

    afterEach(() => {
      account = null;
      broker = null;
      metrics.destroy();
      metrics = null;
      notificationChannel = null;
      relier = null;
      windowMock = null;
    });

    describe('initialize', () => {
      describe('chooseWhatToSyncWebV1 not supported', () => {
        it('does not set `chooseWhatToSyncWebV1Engines`', () => {
          supportsChooseWhatToSyncWebV1 = false;
          createBroker();
          assert.notOk(broker.get('chooseWhatToSyncWebV1Engines'));
        });
      });

      describe('chooseWhatToSyncWebV1 supported', () => {
        it('sets `chooseWhatToSyncWebV1Engines`', () => {
          supportsChooseWhatToSyncWebV1 = true;
          createBroker();
          assert.ok(broker.get('chooseWhatToSyncWebV1Engines'));
        });
      });
    });

    describe('chooseWhatToSyncWebV1Engines', () => {
      let response;
      beforeEach(() => {
        response = {
          capabilities: {
            engines: ['creditcards']
          },
          signedInUser: {
            email: 'testuser@testuser.com'
          }
        };
        sinon.stub(notificationChannel, 'request', () => p(response));
        sinon.stub(notificationChannel, 'isFxaStatusSupported', () => true);
      });

      describe('chooseWhatToSyncWebV1 not supported', () => {
        it('does not add the additional engines', () => {
          supportsChooseWhatToSyncWebV1 = false;
          createBroker();

          return broker.fetch()
            .then(() => {
              const syncEngines = broker.get('chooseWhatToSyncWebV1Engines');
              assert.notOk(syncEngines);
            });
        });
      });

      describe('chooseWhatToSyncWebV1 supported', () => {
        it('add the additional engines', () => {
          supportsChooseWhatToSyncWebV1 = true;
          createBroker();

          return broker.fetch()
            .then(() => {
              const syncEngines = broker.get('chooseWhatToSyncWebV1Engines');
              assert.ok(syncEngines.get('creditcards'));
            });
        });
      });
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
