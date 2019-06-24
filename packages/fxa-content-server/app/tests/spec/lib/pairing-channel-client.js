/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import PairingChannelClient from 'lib/pairing-channel-client';
import sinon from 'sinon';
import PairingChannelClientErrors from '../../../scripts/lib/pairing-channel-client-errors';
import { mockPairingChannel } from 'tests/mocks/pair';

describe('lib/pairing-channel-client', () => {
  let client;
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('open', () => {
    beforeEach(() => {
      client = new PairingChannelClient(
        {},
        {
          importPairingChannel: mockPairingChannel,
        }
      );
    });

    it('rejects if no channelServerUri', () => {
      return client
        .open(null, 'c05d62ed4e1445089e9e2a33d148f906')
        .then(assert.fail, err => {
          assert.isTrue(
            PairingChannelClientErrors.is(err, 'INVALID_CONFIGURATION')
          );
        });
    });

    it('rejects if no channelId', () => {
      return client
        .open('wss://channel.server.url/', null)
        .then(assert.fail, err => {
          assert.isTrue(
            PairingChannelClientErrors.is(err, 'INVALID_CONFIGURATION')
          );
        });
    });

    it('rejects if no channelKey', () => {
      return client
        .open('wss://channel.server.url/', 'c05d62ed4e1445089e9e2a33d148f906')
        .then(assert.fail, err => {
          assert.isTrue(
            PairingChannelClientErrors.is(err, 'INVALID_CONFIGURATION')
          );
        });
    });

    it('sets connected if channel resolves', () => {
      client.set = sinon.spy();
      client.trigger = sinon.spy();

      return client
        .open(
          'wss://channel.server.url/',
          'c05d62ed4e1445089e9e2a33d148f906',
          '1111'
        )
        .then(() => {
          assert.isTrue(client.trigger.calledOnceWith('connected'));
        });
    });

    it('rejects if already connected', () => {
      return client
        .open(
          'wss://channel.server.url/',
          'c05d62ed4e1445089e9e2a33d148f906',
          '1111'
        )
        .then(() => {
          return client
            .open(
              'wss://channel.server.url/',
              'c05d62ed4e1445089e9e2a33d148f906',
              '1111'
            )
            .then(assert.fail, err => {
              assert.isTrue(
                PairingChannelClientErrors.is(err, 'ALREADY_CONNECTED')
              );
            });
        });
    });
  });

  describe('close', () => {
    beforeEach(() => {
      client = new PairingChannelClient(
        {},
        {
          importPairingChannel: mockPairingChannel,
        }
      );
    });

    it('rejects if no channel', () => {
      delete client.channel;
      return client.close().then(assert.fail, err => {
        assert.isTrue(PairingChannelClientErrors.is(err, 'NOT_CONNECTED'));
      });
    });

    it('rejects if error while closing', () => {
      const closeError = new Error('uh oh');
      client.channel = {
        close: sinon.spy(() => {
          throw closeError;
        }),
      };

      return client.close().then(assert.fail, err => {
        assert.strictEqual(err, closeError);
      });
    });

    it('calls close on the channel', () => {
      return client
        .open(
          'wss://channel.server.url/',
          'c05d62ed4e1445089e9e2a33d148f906',
          '1111'
        )
        .then(() => {
          client.set = sinon.spy();

          return client.close().then(() => {
            assert.equal(client.channel, null);
          });
        });
    });
  });

  describe('send', () => {
    beforeEach(() => {
      client = new PairingChannelClient(
        {},
        {
          importPairingChannel: mockPairingChannel,
        }
      );
    });

    it('rejects if no socket', () => {
      delete client.channel;
      return client.send('message').then(assert.fail, err => {
        assert.isTrue(PairingChannelClientErrors.is(err, 'NOT_CONNECTED'));
      });
    });

    it('rejects if no message', () => {
      return client
        .open(
          'wss://channel.server.url/',
          'c05d62ed4e1445089e9e2a33d148f906',
          '1111'
        )
        .then(() => {
          return client.send();
        })
        .then(assert.fail, err => {
          assert.isTrue(
            PairingChannelClientErrors.is(err, 'INVALID_OUTBOUND_MESSAGE')
          );
        });
    });

    it('sends data over', () => {
      const testData = { data: true };

      return client
        .open(
          'wss://channel.server.url/',
          'c05d62ed4e1445089e9e2a33d148f906',
          '1111'
        )
        .then(() => {
          return client.send('message', testData);
        })
        .then(() => {
          assert.isFalse(
            client.channel.send.calledOnceWith('message', testData)
          );
        });
    });
  });

  describe('_messageHandler', () => {
    beforeEach(() => {
      client = new PairingChannelClient(
        {},
        {
          importPairingChannel: mockPairingChannel,
        }
      );
      sinon.spy(client, 'trigger');
    });

    it('handles proper messages', () => {
      client._messageHandler({
        detail: {
          data: {
            message: 'msg',
          },
          sender: {
            city: 'a',
            country: 'a',
            region: 'a',
            remote: 'a',
            ua: 'a',
          },
        },
      });
      assert.isFalse(
        PairingChannelClientErrors.is(
          client.trigger.args[0][1],
          'INVALID_MESSAGE'
        )
      );
    });

    it('handles proper messages with data', () => {
      client._messageHandler({
        detail: {
          data: {
            data: {
              stuff: 'here',
            },
            message: 'msg',
          },
          sender: {
            city: 'a',
            country: 'a',
            region: 'a',
            remote: 'a',
            ua: 'a',
          },
        },
      });
      assert.isFalse(
        PairingChannelClientErrors.is(
          client.trigger.args[0][1],
          'INVALID_MESSAGE'
        )
      );
    });

    it('handles bad sender structure', () => {
      client._messageHandler({
        detail: {
          data: {
            message: 'msg',
          },
          sender: {
            city: 'a',
            country: 'a',
            region: 'a',
            something: 'strange',
            ua: 'a',
          },
        },
      });
      assert.isTrue(
        PairingChannelClientErrors.is(
          client.trigger.args[0][1],
          'INVALID_MESSAGE'
        )
      );
    });

    it('validates empty events', () => {
      client._messageHandler({
        detail: {},
      });
      assert.isTrue(
        PairingChannelClientErrors.is(
          client.trigger.args[0][1],
          'INVALID_MESSAGE'
        )
      );
    });

    it('handles no message', () => {
      client._messageHandler({
        detail: {
          data: {},
        },
      });
      assert.isTrue(
        PairingChannelClientErrors.is(
          client.trigger.args[0][1],
          'INVALID_MESSAGE'
        )
      );
    });
  });
});
