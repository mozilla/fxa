/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import AuthorityBroker from 'models/auth_brokers/pairing/authority';
import Relier from 'models/reliers/relier';
import Notifier from 'lib/channels/notifier';
import sinon from 'sinon';
import WebChannel from 'lib/channels/web';
import WindowMock from '../../../../mocks/window';

const CHANNEL_ID = 'channelId';

describe('models/auth_brokers/pairing/authority', function() {
  let broker;
  let config;
  let relier;
  let notifier;
  let notificationChannel;
  let windowMock;

  beforeEach(function() {
    windowMock = new WindowMock();
    notificationChannel = new WebChannel('web_channel');
    notificationChannel.initialize({ window: windowMock });
    sinon.stub(notificationChannel, 'request').callsFake(command => {
      let response;
      switch (command) {
        case 'fxaccounts:pair_supplicant_metadata':
          response = {
            city: 'Toronto',
            country: 'Canada',
            ipAddress: '1.1.1.1',
            region: 'Ontario',
            ua: 'Firefox 1.0',
          };
          break;
        case 'fxaccounts:fxa_status':
        case 'fxaccounts:pair_authorize':
        case 'fxaccounts:pair_complete':
        case 'fxaccounts:pair_decline':
        case 'fxaccounts:pair_heartbeat':
          response = {};
          break;
        default:
          throw new Error(`Bad Command: ${command}`);
      }

      return Promise.resolve(response);
    });

    config = {
      pairingClients: ['3c49430b43dfba77'],
    };
    relier = new Relier();
    relier.set({
      channelId: CHANNEL_ID,
      clientId: '3c49430b43dfba77',
    });
    notifier = new Notifier();

    broker = new AuthorityBroker({
      config,
      notificationChannel,
      notifier,
      relier: relier,
      window: windowMock,
    });
    sinon.spy(broker, 'startHeartbeat');
    sinon.spy(broker, 'getSupplicantMetadata');
  });

  it('creates the state machine', () => {
    assert.ok(broker.stateMachine);
  });

  describe('initialize', () => {
    it('validates the client id', () => {
      relier.set({
        clientId: 'c6d74070a481bc10',
      });

      assert.throws(() => {
        broker = new AuthorityBroker({
          config,
          notificationChannel,
          notifier,
          relier: relier,
          window: windowMock,
        });
      }, 'Invalid pairing client');
    });
  });

  describe('fetch', () => {
    it('gets metadata and starts heartbeat', () => {
      return broker.fetch().then(() => {
        assert.isTrue(broker.getSupplicantMetadata.calledOnce);
        assert.isTrue(broker.startHeartbeat.calledOnce);
        assert.deepEqual(broker.get('remoteMetaData'), {
          city: 'Toronto',
          country: 'Canada',
          deviceType: 'desktop',
          family: undefined,
          ipAddress: '1.1.1.1',
          OS: 'Unknown',
          region: 'Ontario',
          ua: 'Firefox 1.0',
        });
      });
    });
  });

  describe('hearbeat', () => {
    it('heartbeats', done => {
      broker.startHeartbeat(5);
      sinon.spy(broker, 'request');
      setTimeout(() => {
        assert.isTrue(
          broker.request.calledWith(notificationChannel.COMMANDS.PAIR_HEARTBEAT)
        );
        broker.stopHeartbeat();
        done();
      }, 10);
    });
  });

  describe('afterPairAuthAllow', () => {
    it('sends authorization', () => {
      sinon.spy(broker, 'request');

      return broker.afterPairAuthAllow().then(() => {
        assert.isTrue(
          broker.request.calledOnceWith(
            notificationChannel.COMMANDS.PAIR_AUTHORIZE
          )
        );
      });
    });
  });

  describe('afterPairAuthDecline', () => {
    it('sends decline', () => {
      sinon.spy(broker, 'request');

      return broker.afterPairAuthDecline().then(() => {
        assert.isTrue(
          broker.request.calledOnceWith(
            notificationChannel.COMMANDS.PAIR_DECLINE
          )
        );
      });
    });
  });

  describe('afterPairAuthComplete', () => {
    it('sends complete', () => {
      sinon.spy(broker, 'request');

      return broker.afterPairAuthComplete().then(() => {
        assert.isTrue(
          broker.request.calledOnceWith(
            notificationChannel.COMMANDS.PAIR_COMPLETE
          )
        );
      });
    });
  });

  describe('request', () => {
    it('sends a request with a channel_id', () => {
      return broker
        .request(notificationChannel.COMMANDS.PAIR_AUTHORIZE, { data: true })
        .then(() => {
          assert.isTrue(
            broker._notificationChannel.request.calledOnceWith(
              notificationChannel.COMMANDS.PAIR_AUTHORIZE,
              {
                channel_id: CHANNEL_ID, // eslint-disable-line camelcase
                data: true,
              }
            )
          );
        });
    });
  });
});
