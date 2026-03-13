/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { PairingChannelClient, PairingChannelError } from './pairing-channel';

// Valid base64url key (decodes to 'testkey1')
const VALID_KEY = 'dGVzdGtleTE';
const SERVER = 'wss://channel.example.com';
const CHAN = 'channel-id-123';

// Mock the fxa-pairing-channel UMD module
let mockChannel: {
  send: jest.Mock;
  close: jest.Mock;
  addEventListener: jest.Mock;
  removeEventListener: jest.Mock;
};

jest.mock(
  'fxa-pairing-channel/dist/FxAccountsPairingChannel.babel.umd.js',
  () => ({
    PairingChannel: {
      connect: jest.fn(() => Promise.resolve(mockChannel)),
    },
  })
);

jest.mock('fxa-shared/sentry/browser', () => ({
  captureException: jest.fn(),
}));

describe('PairingChannelClient', () => {
  let client: PairingChannelClient;

  beforeEach(() => {
    mockChannel = {
      send: jest.fn().mockResolvedValue(undefined),
      close: jest.fn().mockResolvedValue(undefined),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    };
    jest.clearAllMocks();
    client = new PairingChannelClient();
  });

  describe('open', () => {
    it('connects and dispatches connected event', async () => {
      const onConnected = jest.fn();
      client.addEventListener('connected', onConnected);
      await client.open(SERVER, CHAN, VALID_KEY);

      expect(client.isConnected).toBe(true);
      expect(onConnected).toHaveBeenCalled();
    });

    it('throws for missing params', async () => {
      await expect(client.open('', CHAN, VALID_KEY)).rejects.toThrow(
        'Invalid channel server configuration'
      );
    });

    it('throws if already connected', async () => {
      await client.open(SERVER, CHAN, VALID_KEY);
      await expect(client.open(SERVER, CHAN, VALID_KEY)).rejects.toThrow(
        'Already connected'
      );
    });
  });

  describe('send', () => {
    it('sends message with data', async () => {
      await client.open(SERVER, CHAN, VALID_KEY);
      await client.send('pair:supp:request', { client_id: 'abc' });

      expect(mockChannel.send).toHaveBeenCalledWith({
        message: 'pair:supp:request',
        data: { client_id: 'abc' },
      });
    });

    it('throws when not connected', async () => {
      await expect(client.send('msg')).rejects.toThrow('Not connected');
    });

    it('throws for empty message', async () => {
      await client.open(SERVER, CHAN, VALID_KEY);
      await expect(client.send('')).rejects.toThrow('malformed message');
    });
  });

  describe('open failure', () => {
    it('dispatches error when connect rejects', async () => {
      const {
        PairingChannel,
      } = require('fxa-pairing-channel/dist/FxAccountsPairingChannel.babel.umd.js');
      PairingChannel.connect.mockRejectedValueOnce(
        new Error('connection refused')
      );

      const onError = jest.fn();
      client.addEventListener('error', onError);
      await client.open(SERVER, CHAN, VALID_KEY);

      expect(client.isConnected).toBe(false);
      expect(onError).toHaveBeenCalled();
    });

    it('rejects concurrent open during in-flight connect', async () => {
      const {
        PairingChannel,
      } = require('fxa-pairing-channel/dist/FxAccountsPairingChannel.babel.umd.js');
      let resolveConnect: Function;
      PairingChannel.connect.mockImplementationOnce(
        () =>
          new Promise((r) => {
            resolveConnect = r;
          })
      );

      const openPromise = client.open(SERVER, CHAN, VALID_KEY);
      await expect(client.open(SERVER, CHAN, VALID_KEY)).rejects.toThrow(
        'Already connected'
      );
      resolveConnect!(mockChannel);
      await openPromise;
    });
  });

  describe('close', () => {
    it('cleans up channel', async () => {
      await client.open(SERVER, CHAN, VALID_KEY);
      await client.close();

      expect(client.isConnected).toBe(false);
      expect(mockChannel.close).toHaveBeenCalled();
      expect(mockChannel.removeEventListener).toHaveBeenCalled();
    });

    it('is safe when already closed', async () => {
      await client.close();
      expect(client.isConnected).toBe(false);
    });

    it('swallows errors from underlying channel.close()', async () => {
      mockChannel.close.mockRejectedValueOnce(new Error('close failed'));
      await client.open(SERVER, CHAN, VALID_KEY);
      await expect(client.close()).resolves.toBeUndefined();
      expect(client.isConnected).toBe(false);
    });
  });

  describe('incoming messages', () => {
    it('dispatches remote:<message> events with sender metadata', async () => {
      await client.open(SERVER, CHAN, VALID_KEY);

      const messageHandler = mockChannel.addEventListener.mock.calls.find(
        ([type]: [string]) => type === 'message'
      )?.[1];
      expect(messageHandler).toBeDefined();

      const onRemote = jest.fn();
      client.addEventListener('remote:pair:auth:metadata', onRemote);

      messageHandler(
        new CustomEvent('message', {
          detail: {
            data: {
              message: 'pair:auth:metadata',
              data: { email: 'test@example.com' },
            },
            sender: { city: 'Portland', ua: 'Firefox/125' },
          },
        })
      );

      expect(onRemote).toHaveBeenCalled();
      const detail = onRemote.mock.calls[0][0].detail;
      expect(detail.email).toBe('test@example.com');
      expect(detail.remoteMetaData.city).toBe('Portland');
    });

    it('dispatches error for invalid messages', async () => {
      await client.open(SERVER, CHAN, VALID_KEY);

      const messageHandler = mockChannel.addEventListener.mock.calls.find(
        ([type]: [string]) => type === 'message'
      )?.[1];

      const onError = jest.fn();
      client.addEventListener('error', onError);
      messageHandler(new CustomEvent('message', { detail: null }));

      expect(onError).toHaveBeenCalled();
    });
  });

  describe('error event from channel', () => {
    it('dispatches wrapped UNEXPECTED_ERROR', async () => {
      await client.open(SERVER, CHAN, VALID_KEY);

      const errorHandler = mockChannel.addEventListener.mock.calls.find(
        ([type]: [string]) => type === 'error'
      )?.[1];
      expect(errorHandler).toBeDefined();

      const onError = jest.fn();
      client.addEventListener('error', onError);
      errorHandler(new CustomEvent('error', { detail: new Error('ws fail') }));

      expect(onError).toHaveBeenCalled();
      const detail = onError.mock.calls[0][0].detail;
      expect(detail.errno).toBe(999);
    });
  });

  describe('close event from channel', () => {
    it('dispatches close and marks disconnected', async () => {
      await client.open(SERVER, CHAN, VALID_KEY);

      const closeHandler = mockChannel.addEventListener.mock.calls.find(
        ([type]: [string]) => type === 'close'
      )?.[1];
      expect(closeHandler).toBeDefined();

      const onClose = jest.fn();
      client.addEventListener('close', onClose);
      closeHandler();

      expect(client.isConnected).toBe(false);
      expect(onClose).toHaveBeenCalled();
    });
  });
});

describe('PairingChannelError', () => {
  it('has correct errno and message', () => {
    const err = new PairingChannelError('NOT_CONNECTED');
    expect(err.errno).toBe(1002);
    expect(err.message).toBe('Not connected to channel server');
    expect(err.name).toBe('PairingChannelError');
  });
});
