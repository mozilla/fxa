/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import Account from 'models/account';
import FxSyncAuthenticationBroker from 'models/auth_brokers/fx-sync';
import Metrics from 'lib/metrics';
import Relier from 'models/reliers/relier';
import sinon from 'sinon';
import WebChannel from 'lib/channels/web';
import WindowMock from '../../../mocks/window';

describe('models/auth_brokers/fx-sync', () => {
  let account;
  let broker;
  let metrics;
  let notificationChannel;
  let relier;
  let windowMock;

  const ChildBroker = FxSyncAuthenticationBroker.extend({});

  function createBroker() {
    if (broker) {
      broker.destroy();
    }

    broker = new ChildBroker({
      metrics,
      notificationChannel,
      relier,
      window: windowMock,
    });
  }

  beforeEach(() => {
    account = new Account();
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

  describe('chooseWhatToSyncWebV1Engines', () => {
    let response;
    beforeEach(() => {
      response = {
        capabilities: {
          engines: ['creditcards'],
        },
        signedInUser: {
          email: 'testuser@testuser.com',
        },
      };
      sinon
        .stub(notificationChannel, 'request')
        .callsFake(() => Promise.resolve(response));
      sinon
        .stub(notificationChannel, 'isFxaStatusSupported')
        .callsFake(() => true);
    });

    it('add the additional engines', () => {
      createBroker();

      return broker.fetch().then(() => {
        const syncEngines = broker.get('chooseWhatToSyncWebV1Engines');
        assert.ok(syncEngines.get('creditcards'));
      });
    });
  });

  describe('afterSignUpConfirmationPoll', () => {
    describe('broker does not have `browserTransitionsAfterEmailVerification` capability', () => {
      it('sets the metrics viewName prefix, resolves to a `ConnectAnotherDeviceBehavior`', () => {
        broker.setCapability('browserTransitionsAfterEmailVerification', false);
        sinon.spy(metrics, 'setViewNamePrefix');

        return broker.afterSignUpConfirmationPoll(account).then(behavior => {
          assert.equal(behavior.type, 'connect-another-device');

          assert.isTrue(metrics.setViewNamePrefix.calledOnce);
          assert.isTrue(metrics.setViewNamePrefix.calledWith('signup'));
        });
      });
    });

    describe('afterSignInConfirmationPoll', () => {
      describe('broker does not have `browserTransitionsAfterEmailVerification` capability', () => {
        it('sets the metrics viewName prefix, resolves to a `ConnectAnotherDeviceBehavior`', () => {
          broker.setCapability(
            'browserTransitionsAfterEmailVerification',
            false
          );
          sinon.spy(metrics, 'setViewNamePrefix');

          return broker.afterSignInConfirmationPoll(account).then(behavior => {
            assert.equal(behavior.type, 'connect-another-device');

            assert.isTrue(metrics.setViewNamePrefix.calledOnce);
            assert.isTrue(metrics.setViewNamePrefix.calledWith('signin'));
          });
        });
      });

      describe('broker has `browserTransitionsAfterEmailVerification` capability', () => {
        it('resolves to the default behavior', () => {
          broker.setCapability(
            'browserTransitionsAfterEmailVerification',
            true
          );
          sinon.spy(metrics, 'setViewNamePrefix');

          return broker.afterSignInConfirmationPoll(account).then(behavior => {
            assert.equal(
              behavior.type,
              broker.getBehavior('afterSignInConfirmationPoll').type
            );

            assert.isFalse(metrics.setViewNamePrefix.called);
          });
        });
      });
    });

    describe('afterCompleteSignUp', () => {
      it('returns a ConnectAnotherDeviceBehavior', () => {
        return broker.afterCompleteSignUp(account).then(behavior => {
          assert.equal(behavior.type, 'connect-another-device');
        });
      });
    });

    describe('afterCompleteSignIn', () => {
      it('returns a ConnectAnotherDeviceBehavior', () => {
        return broker.afterCompleteSignIn(account).then(behavior => {
          assert.equal(behavior.type, 'connect-another-device');
        });
      });
    });
  });

  describe('afterCompleteSignUp', () => {
    it('resolves to a `ConnectAnotherDeviceBehavior`', () => {
      account.get = sinon.spy();
      return broker.afterCompleteSignUp(account).then(behavior => {
        assert.equal(behavior.type, 'connect-another-device');
      });
    });
  });
});
