/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import Notifier from 'lib/channels/notifier';
import OAuthErrors from 'lib/oauth-errors';
import PairingChannelClient from 'lib/pairing-channel-client';
import sinon from 'sinon';
import { mockPairingChannel } from 'tests/mocks/pair';
import SupplicantBroker from 'models/auth_brokers/pairing/supplicant';
import SupplicantRelier from 'models/reliers/pairing/supplicant';
import WindowMock from '../../../mocks/window';

import {
  SupplicantState,
  WaitForConnectionToChannelServer,
  SendOAuthRequestWaitForAccountMetadata,
  WaitForAuthorizations,
  WaitForSupplicantAuthorize,
  WaitForAuthorityAuthorize,
  SendResultToRelier,
  SupplicantStateMachine,
} from 'models/pairing/supplicant-state-machine';
import PairingChannelClientErrors from 'lib/pairing-channel-client-errors';

describe('models/auth_brokers/pairing/supplicant-state-machine', function () {
  let state;
  let relier;
  let notifier;
  let broker;
  let mockChannelClient;
  let windowMock;
  const config = {
    pairingChannelServerUri: 'ws://test',
    pairingClients: ['3c49430b43dfba77'],
  };

  beforeEach(() => {
    relier = new SupplicantRelier();
    relier.set({
      channelId: '1',
      channelKey: 'dGVzdA==',
      clientId: '3c49430b43dfba77',
      redirectUri: 'https://example.com?code=1&state=2',
      state: 'state',
    });
    notifier = new Notifier();
    mockChannelClient = new PairingChannelClient();
    windowMock = new WindowMock();
    broker = new SupplicantBroker({
      config,
      importPairingChannel: mockPairingChannel,
      notifier,
      relier,
      window: windowMock,
    });
  });

  describe('SupplicantState', () => {
    beforeEach(function () {
      state = new SupplicantState(
        {},
        {
          pairingChannelClient: mockChannelClient,
        }
      );
      sinon.stub(state, 'navigate');
      sinon.spy(state, 'gotoState');
    });

    it('handles socketClosed', () => {
      state.socketClosed();
      assert.equal(state.navigate.args[0][0], 'pair/failure');
      assert.isTrue(
        PairingChannelClientErrors.is(
          state.navigate.args[0][1].error,
          'CONNECTION_CLOSED'
        )
      );
    });

    it('handles socketError', () => {
      const err = new Error('socker error;');
      state.socketError(err);
      assert.isTrue(
        state.navigate.calledOnceWith('pair/failure', {
          error: err,
        })
      );
    });
  });

  describe('WaitForConnectionToChannelServer', () => {
    it('transitions on connection', () => {
      state = new WaitForConnectionToChannelServer(
        {},
        {
          pairingChannelClient: mockChannelClient,
        }
      );
      sinon.spy(state, 'gotoState');

      mockChannelClient.trigger('connected');
      assert.isTrue(
        state.gotoState.calledOnceWith(SendOAuthRequestWaitForAccountMetadata)
      );
    });
  });

  describe('SendOAuthRequestWaitForAccountMetadata', () => {
    it('waits for account metadata', (done) => {
      sinon.stub(mockChannelClient, 'send').callsFake(() => {
        setTimeout(() => {
          mockChannelClient.trigger('remote:pair:auth:metadata', {
            remoteMetaData: {},
          });
        }, 3);
        return Promise.resolve();
      });
      state = new SendOAuthRequestWaitForAccountMetadata(
        {},
        {
          broker,
          pairingChannelClient: mockChannelClient,
          relier,
        }
      );
      sinon.spy(state, 'gotoState');

      setTimeout(() => {
        assert.isTrue(state.gotoState.calledOnceWith(WaitForAuthorizations));
        done();
      }, 7);
    });
  });

  describe('WaitForAuthorizations', () => {
    it('transitions to WaitForAuthorityAuthorize', (done) => {
      state = new WaitForAuthorizations(
        {},
        {
          broker,
          notifier,
          pairingChannelClient: mockChannelClient,
          relier,
        }
      );
      sinon.spy(state, 'gotoState');
      sinon.stub(mockChannelClient, 'send').callsFake(() => {
        return Promise.resolve();
      });

      notifier.trigger('pair:supp:authorize');

      setTimeout(() => {
        assert.isTrue(
          state.gotoState.calledOnceWith(WaitForAuthorityAuthorize)
        );
        done();
      }, 1);
    });

    it('transitions to WaitForSupplicantAuthorize', (done) => {
      state = new WaitForAuthorizations(
        {},
        {
          broker,
          notifier,
          pairingChannelClient: mockChannelClient,
          relier,
        }
      );
      sinon.spy(state, 'gotoState');
      mockChannelClient.trigger('remote:pair:auth:authorize', {
        code:
          'fc46f44802b2a2ce979f39b2187aa1c0fc46f44802b2a2ce979f39b2187aa1c0',
        state: 'state',
      });

      setTimeout(() => {
        assert.isTrue(
          state.gotoState.calledOnceWith(WaitForSupplicantAuthorize)
        );
        done();
      }, 1);
    });

    it('validates remote:pair:auth:authorize', (done) => {
      state = new WaitForAuthorizations(
        {},
        {
          broker,
          notifier,
          pairingChannelClient: mockChannelClient,
          relier,
        }
      );
      sinon.spy(state, 'trigger');
      sinon.spy(state, 'gotoState');
      mockChannelClient.trigger('remote:pair:auth:authorize', {
        code: 'garbage',
        state: 'state',
      });

      setTimeout(() => {
        assert.equal(state.trigger.args[0][0], 'error');
        assert.isTrue(
          OAuthErrors.is(state.trigger.args[0][1], 'INVALID_PARAMETER')
        );
        assert.isFalse(
          state.gotoState.calledOnceWith(WaitForSupplicantAuthorize)
        );
        done();
      }, 1);
    });
  });

  describe('WaitForSupplicantAuthorize', () => {
    it('goes to SendResultToRelier', (done) => {
      sinon.stub(mockChannelClient, 'send').callsFake(() => {
        return Promise.resolve();
      });
      state = new WaitForSupplicantAuthorize(
        {},
        {
          broker,
          notifier,
          pairingChannelClient: mockChannelClient,
          relier,
        }
      );
      sinon.spy(state, 'gotoState');

      notifier.trigger('pair:supp:authorize', {
        remoteMetaData: {},
      });

      setTimeout(() => {
        assert.isTrue(state.gotoState.calledOnceWith(SendResultToRelier));
        done();
      }, 1);
    });
  });

  describe('WaitForAuthorityAuthorize', () => {
    it('transitions to the SendResultToRelier', (done) => {
      state = new WaitForAuthorityAuthorize(
        {},
        {
          broker,
          notifier,
          pairingChannelClient: mockChannelClient,
          relier,
        }
      );
      sinon.spy(state, 'gotoState');
      mockChannelClient.trigger('remote:pair:auth:authorize', {
        code:
          'fc46f44802b2a2ce979f39b2187aa1c0fc46f44802b2a2ce979f39b2187aa1c0',
        state: 'state',
      });

      setTimeout(() => {
        assert.isTrue(state.gotoState.calledOnceWith(SendResultToRelier));
        done();
      }, 1);
    });

    it('validates code', (done) => {
      state = new WaitForAuthorityAuthorize(
        {},
        {
          broker,
          notifier,
          pairingChannelClient: mockChannelClient,
          relier,
        }
      );
      sinon.spy(state, 'trigger');
      sinon.spy(state, 'gotoState');
      mockChannelClient.trigger('remote:pair:auth:authorize', {
        code: 'garbage',
        state: 'state',
      });

      setTimeout(() => {
        assert.equal(state.trigger.args[0][0], 'error');
        assert.isTrue(
          OAuthErrors.is(state.trigger.args[0][1], 'INVALID_PARAMETER')
        );
        assert.isFalse(state.gotoState.calledOnceWith(SendResultToRelier));
        done();
      }, 1);
    });
  });

  describe('SendResultToRelier', () => {
    it('transitions to the next State', () => {
      sinon.spy(broker, 'sendCodeToRelier');
      state = new SendResultToRelier(
        {},
        {
          broker,
          notifier,
          pairingChannelClient: mockChannelClient,
          relier,
        }
      );

      assert.isTrue(broker.sendCodeToRelier.calledOnce);
    });
  });

  describe('SupplicantStateMachine', () => {
    it('is initialized', () => {
      state = new SupplicantStateMachine(
        {},
        {
          broker,
          notifier,
          pairingChannelClient: mockChannelClient,
          relier,
        }
      );

      assert.equal(state.constructor.name, 'SupplicantStateMachine');
    });
  });
});
