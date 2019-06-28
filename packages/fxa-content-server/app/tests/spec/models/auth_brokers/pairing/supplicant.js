/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import SupplicantBroker from 'models/auth_brokers/pairing/supplicant';
import Relier from 'models/reliers/relier';
import { mockPairingChannel } from 'tests/mocks/pair';
import Notifier from 'lib/channels/notifier';

import sinon from 'sinon';

describe('models/auth_brokers/pairing/supplicant', function() {
  let broker;
  let config;
  let relier;
  let notifier;

  beforeEach(function() {
    config = {
      pairingChannelServerUri: 'ws://test',
      pairingClients: ['3c49430b43dfba77'],
    };
    relier = new Relier();
    relier.set({
      channelId: '1',
      channelKey: 'dGVzdA==',
      clientId: '3c49430b43dfba77',
      redirectUri: 'https://example.com?code=1&state=2',
    });
    notifier = new Notifier();

    broker = new SupplicantBroker({
      config,
      importPairingChannel: mockPairingChannel,
      notifier,
      relier,
    });
  });

  describe('initialize', () => {
    it('creates a pairing channel and a state machine', () => {
      assert.ok(broker.pairingChannelClient);
      assert.ok(broker.suppStateMachine);
    });

    it('throws on bad initialization', () => {
      relier.set({
        channelId: null,
        channelKey: null,
      });

      assert.throws(() => {
        broker = new SupplicantBroker({
          config,
          notifier,
          relier,
        });
      }, 'Failed to initialize supplicant');
    });

    it('throws on bad clientId', () => {
      relier.set({
        clientId: 'c6d74070a481bc10',
      });

      assert.throws(() => {
        broker = new SupplicantBroker({
          config,
          importPairingChannel: mockPairingChannel,
          notifier,
          relier,
        });
      }, 'Invalid pairing client');
    });
  });

  describe('afterSupplicantApprove', () => {
    it('notifies', () => {
      sinon.spy(broker.notifier, 'trigger');

      return broker.afterSupplicantApprove().then(() => {
        assert.isTrue(
          broker.notifier.trigger.calledWith('pair:supp:authorize')
        );
      });
    });
  });

  describe('sendCodeToRelier', () => {
    it('sends result to relier', () => {
      sinon.stub(broker, 'sendOAuthResultToRelier');

      return broker.sendCodeToRelier().then(() => {
        assert.isTrue(
          broker.sendOAuthResultToRelier.calledWith({
            redirect: 'https://example.com?code=1&state=2',
          })
        );
      });
    });
  });
});
