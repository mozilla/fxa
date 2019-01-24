/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import a256gcm from 'lib/crypto/a256gcm';
import { assert } from 'chai';
import base64url from 'base64url';
import ChannelServerClient from 'lib/channel-server-client';
import { DEVICE_PAIRING_CHANNEL_KEY_BYTES } from 'lib/constants';
import sinon from 'sinon';
import { wrapAssertion } from '../../lib/helpers';
import ChannelServerClientErrors from '../../../scripts/lib/channel-server-client-errors';

describe('lib/channel-server-client', () => {
  let client;
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();

    client = new ChannelServerClient({
      channelId: 'c05d62ed4e1445089e9e2a33d148f906',
      channelKey: 'channel-key',
      channelServerUrl: 'wss://channel.server.url/v1/',
    });
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('_deriveEncryptionKey', () => {
    it('resolves to the encryption key', () => {
      const channelKeyBuffer = Buffer.from('channel key', 'utf8');
      const channelIdBuffer = Buffer.from('channel id', 'utf8');
      return client._deriveEncryptionKey(channelKeyBuffer, channelIdBuffer)
        .then(keyBuffer => {
          assert.lengthOf(keyBuffer, DEVICE_PAIRING_CHANNEL_KEY_BYTES);
          // python snippet to generate result:
          // >>> from tokenlib.utils import HKDF
          // >>> HKDF("channel key", "channel id", "identity.mozilla.com/picl/v1/pair/encryption-key", 32).encode('hex')
          // '0d91a09d8e04f34cdd3045026eb98d96c3e999908f58956fdba6a39b685472f8'
          assert.equal(keyBuffer.toString('hex'), '0d91a09d8e04f34cdd3045026eb98d96c3e999908f58956fdba6a39b685472f8');
        });
    });
  });

  describe('_deriveChannelJwk', () => {
    it('creates a Jwk', () => {
      const channelKeyBuffer = Buffer.from('channel key', 'utf8');
      const channelIdBuffer = Buffer.from('channel id', 'utf8');
      return Promise.all([
        client._deriveChannelJwk(channelKeyBuffer, channelIdBuffer),
        client._deriveEncryptionKey(channelKeyBuffer, channelIdBuffer),
      ]).then(([jwk, expectedKeyBuffer
      ]) => {
        assert.equal(jwk.length, 256);

        const jwkObj = jwk.toObject(true);
        assert.equal(jwkObj.alg, 'A256GCM');
        assert.equal(jwkObj.kty, 'oct');
        assert.equal(jwkObj.k.toString('hex'), expectedKeyBuffer.toString('hex'));
        assert.ok(jwk.kid);
      });
    });
  });

  describe('_deriveConfirmationCode', () => {
    it('returns an 8 character confirmation code', () => {
      const channelKeyBuffer = Buffer.from('channel key', 'utf8');
      const channelIdBuffer = Buffer.from('channel id', 'utf8');
      return client._deriveConfirmationCode(channelKeyBuffer, channelIdBuffer)
        .then(confirmationCode => {
          assert.lengthOf(confirmationCode, 8);
          // python snippet to generate result:
          // >>> from tokenlib.utils import HKDF
          // >>> HKDF("channel key", "channel id", "identity.mozilla.com/picl/v1/pair/confirmation-code", 4).encode('hex')
          // 'd45a83f6'
          assert.equal(confirmationCode, 'd45a83f6');
        });
    });
  });

  describe('_getChannelJwk', () => {
    it('gets the channel JWK, uses cached JWK afterwards', () => {
      sinon.spy(client, '_deriveChannelJwk');
      sinon.spy(client, '_deriveConfirmationCode');

      let firstJwk;

      const channelKeyBase64Url = 'YKR1mHPnuPgKHKjV6k46VtLFTUVU5LLWwSPuqaULNtc';
      // It's a hex string, but considered base64url until the channelserver updates.
      const channelIdUtf8 = '75be751212c4429d9d6f27abcc534d11';

      client.set('channelKey', channelKeyBase64Url);
      client.set('channelId', channelIdUtf8);

      return client._getChannelJwk().then(channelJwk => {
        assert.ok(channelJwk);

        const expectedChannelKeyHex = base64url.toBuffer(channelKeyBase64Url).toString('hex');
        const expectedChannelIdHex = base64url.toBuffer(channelIdUtf8).toString('hex');

        assert.isTrue(client._deriveChannelJwk.calledOnce);
        assert.equal(client._deriveChannelJwk.args[0][0].toString('hex'), expectedChannelKeyHex);
        assert.equal(client._deriveChannelJwk.args[0][1].toString('hex'), expectedChannelIdHex);

        assert.isTrue(client._deriveConfirmationCode.calledOnce);
        assert.equal(client._deriveConfirmationCode.args[0][0].toString('hex'), expectedChannelKeyHex);
        assert.equal(client._deriveConfirmationCode.args[0][1].toString('hex'), expectedChannelIdHex);

        firstJwk = channelJwk;
        return client._getChannelJwk();
      }).then(channelJwk => {
        assert.strictEqual(channelJwk, firstJwk);
        assert.isTrue(client._deriveChannelJwk.calledOnce);
      });
    });
  });

  describe('_encrypt', () => {
    const envelope = {
      key: 'value'
    };

    beforeEach(() => {
      sandbox.stub(client, '_getChannelJwk').callsFake(() => Promise.resolve('jwk'));
      sandbox.stub(a256gcm, 'encrypt').callsFake(() => 'encrypted text');
    });

    it('encrypts', () => {
      return client._encrypt(envelope)
        .then(ciphertext => {
          assert.equal(ciphertext, 'encrypted text');
          assert.isTrue(client._getChannelJwk.calledOnce);
          assert.isTrue(a256gcm.encrypt.calledOnceWith(JSON.stringify(envelope), 'jwk'));
        });
    });
  });

  describe('_decrypt', () => {
    const envelope = {
      key: 'value'
    };


    beforeEach(() => {
      sandbox.stub(client, '_getChannelJwk').callsFake(() => Promise.resolve('jwk'));
    });

    it('decrypts', () => {
      sandbox.stub(a256gcm, 'decrypt').callsFake(() => JSON.stringify(envelope));

      return client._decrypt('ciphertext')
        .then(result => {
          assert.deepEqual(result, envelope);
          assert.isTrue(client._getChannelJwk.calledOnce);
          assert.isTrue(a256gcm.decrypt.calledOnceWith('ciphertext', 'jwk'));
        });
    });

    it('converts JOSE errors to an internal error', () => {
      sandbox.stub(a256gcm, 'decrypt').callsFake(() => Promise.reject(new Error('uh oh')));
      return client._decrypt('ciphertext')
        .catch(err => {
          assert.isTrue(ChannelServerClientErrors.is(err, 'INVALID_MESSAGE'));
        });
    });
  });

  describe('_encrypt/_decrypt round trip', () => {
    const envelope = {
      key: 'value'
    };

    it('encrypts, then decrypts', () => {
      return client._encrypt(envelope)
        .then(ciphertext => {
          assert.ok(ciphertext);
          return client._decrypt(ciphertext);
        }).then(result => {
          assert.deepEqual(result, envelope);
        });
    });
  });

  describe('_encryptedMessageHandler', () => {
    it('triggers message if `_decryptAndParseMessageEvent` succeeds', (done) => {
      const remoteData = {};
      const event = { data: 'some JSON' };

      sandbox.stub(client, '_decryptAndParseMessageEvent').callsFake(() => {
        return Promise.resolve({
          data: remoteData,
          message: 'message-name'
        });
      });

      client.on('remote:message-name', (data) => wrapAssertion(() => {
        assert.deepEqual(data, remoteData);
        assert.isTrue(client._decryptAndParseMessageEvent.calledOnceWith(event));
      }, done));

      client._encryptedMessageHandler(event);
    });

    it('triggers `error` if _decryptAndParseMessageEvent fails', (done) => {
      const error = new Error('uh oh');
      const event = { data: 'some JSON' };

      sandbox.stub(client, '_decryptAndParseMessageEvent').callsFake(() => {
        return Promise.reject(error);
      });

      client.on('error', (_error) => wrapAssertion(() => {
        assert.strictEqual(_error, error);
        assert.isTrue(client._decryptAndParseMessageEvent.calledOnceWith(event));
      }, done));

      client._encryptedMessageHandler(event);
    });
  });

  describe('_decryptAndParseMessageEvent', () => {
    it('rejects if decrypted bundle `message` is empty', () => {
      sandbox.stub(client, '_decrypt').callsFake(() => {
        return Promise.resolve({
          message: ''
        });
      });

      return client._decryptAndParseMessageEvent({
        data: JSON.stringify({ message: 'ciphertext' })
      }).then(assert.fail, err => {
        assert.isTrue(ChannelServerClientErrors.is(err, 'INVALID_MESSAGE'));
      });
    });

    it('rejects if decrypted bundle `message` is missing', () => {
      sandbox.stub(client, '_decrypt').callsFake(() => {
        return Promise.resolve({ data: {} });
      });

      return client._decryptAndParseMessageEvent({
        data: JSON.stringify({ message: 'ciphertext' })
      }).then(assert.fail, err => {
        assert.isTrue(ChannelServerClientErrors.is(err, 'INVALID_MESSAGE'));
      });
    });

    it('parses and adds sender info to returned object', () => {
      const remoteData = {};
      sandbox.stub(client, '_decrypt').callsFake(() => {
        return Promise.resolve({
          data: remoteData,
          message: 'message-name'
        });
      });

      return client._decryptAndParseMessageEvent({
        data: JSON.stringify({
          message: 'ciphertext',
          sender: {
            city: 'London',
            country: 'United Kingdom',
            region: 'Greater London',
            ua: 'Firefox 63'
          }
        })
      }).then(result => {
        assert.isTrue(client._decrypt.calledOnceWith('ciphertext'));
      });
    });
  });

  describe('_proxySocketEvents', () => {
    let socket;

    beforeEach(() => {
      socket = {
        addEventListener: sinon.spy((message, callback) => {
          socket.callbacks[message] = callback;
        }),
        callbacks: {},
      };

      client._proxySocketEvents(socket);
    });

    it('hooks up the expected handlers', () => {
      const expectedEvents = [
        'close',
        'error',
        'message',
        'open',
      ];

      assert.equal(socket.addEventListener.callCount, expectedEvents.length);
      return Promise.all(expectedEvents.map((eventName, index) => {
        return new Promise((resolve, reject) => {
          assert.equal(socket.addEventListener.args[index][0], eventName);
          client.once(`socket:${eventName}`, resolve);
          socket.callbacks[eventName]();
        });
      }));
    });
  });

  describe('_getSocketUrl', () => {
    it('works with pathname, trailing slash', () => {
      assert.equal(
        client._getSocketUrl('wss://channel.server.url/v1/', 'c05d62ed4e1445089e9e2a33d148f906'),
        'wss://channel.server.url/v1/c05d62ed4e1445089e9e2a33d148f906'
      );
    });

    it('works with pathname, no trailing slash', () => {
      assert.equal(
        client._getSocketUrl('wss://channel.server.url/v1', 'c05d62ed4e1445089e9e2a33d148f906'),
        'wss://channel.server.url/v1/c05d62ed4e1445089e9e2a33d148f906'
      );
    });

    it('works without pathname, trailing slash', () => {
      assert.equal(
        client._getSocketUrl('wss://channel.server.url/', 'c05d62ed4e1445089e9e2a33d148f906'),
        'wss://channel.server.url/c05d62ed4e1445089e9e2a33d148f906'
      );
    });

    it('works without pathname, no trailing slash', () => {
      assert.equal(
        client._getSocketUrl('wss://channel.server.url', 'c05d62ed4e1445089e9e2a33d148f906'),
        'wss://channel.server.url/c05d62ed4e1445089e9e2a33d148f906'
      );
    });
  });

  describe('_checkFirstMessageDataValidity', () => {
    it('rejects if parsed data does not contain a link', () => {
      return client._checkFirstMessageDataValidity('{}', 'c05d62ed4e1445089e9e2a33d148f906')
        .then(assert.fail, err => {
          assert.isTrue(ChannelServerClientErrors.is(err, 'INVALID_MESSAGE'));
        });
    });

    it('rejects if link is malformed', () => {
      return client._checkFirstMessageDataValidity(JSON.stringify({ link: '/v1/ws/c05d62ed4e14450' }), 'c05d62ed4e1445089e9e2a33d148f906')
        .then(assert.fail, err => {
          assert.isTrue(ChannelServerClientErrors.is(err, 'INVALID_MESSAGE'));
        });
    });

    it('rejects if link contains an unexpected channelID', () => {
      return client._checkFirstMessageDataValidity(JSON.stringify({ link: '/v1/ws/d05d62ed4e1445089e9e2a33d148f905' }), 'c05d62ed4e1445089e9e2a33d148f906')
        .then(assert.fail, err => {
          assert.isTrue(ChannelServerClientErrors.is(err, 'CHANNEL_ID_MISMATCH'));
        });
    });

    it('resolves if all requirements met', () => {
      return client._checkFirstMessageDataValidity(JSON.stringify({ link: '/v1/ws/c05d62ed4e1445089e9e2a33d148f906' }), 'c05d62ed4e1445089e9e2a33d148f906');
    });
  });

  describe('open', () => {
    const socketMock = {
      addEventListener() {}
    };

    beforeEach(() => {
      sandbox.stub(client, '_createSocket').callsFake(() => socketMock);
    });

    it('rejects if already connected', () => {
      client.socket = {
        send: sinon.spy()
      };

      return client.open()
        .then(assert.fail, err => {
          assert.isFalse(client._createSocket.called);
          assert.isTrue(ChannelServerClientErrors.is(err, 'ALREADY_CONNECTED'));
        });
    });

    it('rejects if no channelServerUrl', () => {
      return client.open(null, 'c05d62ed4e1445089e9e2a33d148f906')
        .then(assert.fail, err => {
          assert.isTrue(ChannelServerClientErrors.is(err, 'INVALID_CONFIGURATION'));
        });
    });

    it('rejects if no channelId', () => {
      return client.open('wss://channel.server.url/', null)
        .then(assert.fail, err => {
          assert.isTrue(ChannelServerClientErrors.is(err, 'INVALID_CONFIGURATION'));
        });
    });

    it('opens a WebSocket connection to `channelId`, attaches listeners, resolves when first message received', () => {
      sandbox.stub(client, '_proxySocketEvents').callsFake(() => {
        // The first message causes `open` to resolve, the second message
        // causes `_encryptedMessageHandler` to be called.
        setImmediate(() => client.trigger('socket:message', { data: {} }));
      });

      sandbox.spy(client, 'trigger');

      sandbox.stub(client, '_getSocketUrl').callsFake(() => 'wss://some.socket.url/some/path');
      sandbox.stub(client, '_checkFirstMessageDataValidity').callsFake(() => Promise.resolve());

      return client.open('wss://channel.server.url/', 'c05d62ed4e1445089e9e2a33d148f906')
        .then(() => {
          assert.isTrue(client._getSocketUrl.calledOnceWith('wss://channel.server.url/', 'c05d62ed4e1445089e9e2a33d148f906'));
          assert.isTrue(client._createSocket.calledOnceWith('wss://some.socket.url/some/path'));
          assert.isTrue(client._proxySocketEvents.calledOnce);
          assert.isTrue(client.trigger.calledWith('connected'));

          // the second message causes _encryptedMessageHandler
          // to be called
          return new Promise((resolve, reject) => {
            sandbox.stub(client, '_encryptedMessageHandler').callsFake(resolve);
            client.trigger('socket:message');
          });
        });
    });

    it('rejects if `_checkFirstMessageDataValidity` rejects', () => {
      sandbox.stub(client, '_proxySocketEvents').callsFake(() => {
        // The first message causes `open` to resolve, the second message
        // causes `_encryptedMessageHandler` to be called.
        setImmediate(() => client.trigger('socket:message', { data: {} }));
      });
      sandbox.stub(client, '_checkFirstMessageDataValidity').callsFake(() => Promise.reject(ChannelServerClientErrors.toError('INVALID_MESSAGE')));
      return client.open('c05d62ed4e1445089e9e2a33d148f906')
        .then(assert.fail, err => {
          assert.isTrue(ChannelServerClientErrors.is(err, 'INVALID_MESSAGE'));
        });
    });

    it('rejects if socket close before first message', () => {
      sandbox.stub(client, '_proxySocketEvents').callsFake(() => {
        setImmediate(() => client.trigger('socket:close'));
      });

      return client.open('c05d62ed4e1445089e9e2a33d148f906')
        .then(assert.fail, err => {
          assert.isTrue(ChannelServerClientErrors.is(err, 'COULD_NOT_CONNECT'));
        });
    });

    it('rejects if socket error before first message', () => {
      sandbox.stub(client, '_proxySocketEvents').callsFake(() => {
        setImmediate(() => client.trigger('socket:error'));
      });

      return client.open('c05d62ed4e1445089e9e2a33d148f906')
        .then(assert.fail, err => {
          assert.isTrue(ChannelServerClientErrors.is(err, 'COULD_NOT_CONNECT'));
        });
    });
  });

  describe('close', () => {
    it('rejects if no socket', () => {
      delete client.socket;
      return client.close()
        .then(assert.fail, err => {
          assert.isTrue(ChannelServerClientErrors.is(err, 'NOT_CONNECTED'));
        });
    });

    it('rejects if error while closing', () => {
      const closeError = new Error('uh oh');
      client.socket = {
        close: sinon.spy(() => {
          setImmediate(() => client.trigger('socket:error', closeError));
        }),
      };
      return client.close()
        .then(assert.fail, err => {
          assert.strictEqual(err, closeError);
        });
    });

    it('calls close on the socket, resolves when complete', () => {
      client.socket = {
        close: sinon.spy(() => {
          setImmediate(() => client.trigger('socket:close'));
        }),
      };

      return client.close()
        .then(() => {
          assert.isTrue(client.socket.close.calledOnce);
        });
    });
  });

  describe('send', () => {
    it('rejects if no socket', () => {
      return client.send('message')
        .then(assert.fail, err => {
          assert.isTrue(ChannelServerClientErrors.is(err, 'NOT_CONNECTED'));
        });
    });

    it('throws if not connected', () => {
      client.socket = {
        send: sinon.spy()
      };
      client.set('isConnected', false);

      return client.send('message')
        .then(assert.fail, err => {
          assert.isTrue(ChannelServerClientErrors.is(err, 'NOT_CONNECTED'));
          assert.isFalse(client.socket.send.called);
        });
    });

    it('encrypts the message, sends the ciphertext to the remote', () => {
      client.socket = {
        send: sinon.spy()
      };
      client.set('isConnected', true);
      sandbox.stub(client, '_encrypt').callsFake(() => Promise.resolve('ciphertext'));

      const data = { key: 'value' };
      return client.send('message', data)
        .then(() => {
          assert.isTrue(client._encrypt.calledOnceWith({ data: data, message: 'message'}));
          assert.isTrue(client.socket.send.calledOnceWith('ciphertext'));
        });
    });
  });
});
