/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  PairingChannelClient,
  PairingChannelError,
  toRemoteMetadata,
} from './pairing-channel';

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
  _channelId?: string;
  _channelKey?: Uint8Array;
  closed?: boolean;
};

jest.mock(
  'fxa-pairing-channel/dist/FxAccountsPairingChannel.babel.umd.js',
  () => ({
    PairingChannel: {
      connect: jest.fn(() => Promise.resolve(mockChannel)),
      create: jest.fn(() => Promise.resolve(mockChannel)),
    },
  })
);

jest.mock('fxa-shared/sentry/browser', () => ({
  captureException: jest.fn(),
}));

function getMockHandler(eventName: string) {
  return mockChannel.addEventListener.mock.calls.find(
    ([type]: [string]) => type === eventName
  )?.[1];
}

describe('PairingChannelClient', () => {
  let client: PairingChannelClient;

  beforeEach(() => {
    mockChannel = {
      send: jest.fn().mockResolvedValue(undefined),
      close: jest.fn().mockResolvedValue(undefined),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      // 'testkey1' — the same bytes VALID_KEY decodes to.
      _channelId: CHAN,
      _channelKey: new TextEncoder().encode('testkey1'),
      closed: false,
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

  // The authority mints a channel rather than joining one, so the ids come back
  // on the client and get encoded into the QR the supplicant scans.
  describe('create', () => {
    it('connects and dispatches connected event', async () => {
      const onConnected = jest.fn();
      client.addEventListener('connected', onConnected);

      await client.create(SERVER);

      expect(client.isConnected).toBe(true);
      expect(onConnected).toHaveBeenCalled();
    });

    it('passes the channel server uri to the pairing channel bundle', async () => {
      const {
        PairingChannel,
      } = require('fxa-pairing-channel/dist/FxAccountsPairingChannel.babel.umd.js');

      await client.create(SERVER);

      expect(PairingChannel.create).toHaveBeenCalledWith(SERVER);
    });

    it('exposes the channel id and base64url-encoded key', async () => {
      await client.create(SERVER);

      expect(client.channelId).toBe(CHAN);
      expect(client.channelKey).toBe(VALID_KEY);
    });

    it('has no channel id or key before a channel exists', () => {
      expect(client.channelId).toBeNull();
      expect(client.channelKey).toBeNull();
    });

    it('has no channel id or key after close', async () => {
      await client.create(SERVER);
      await client.close();

      expect(client.channelId).toBeNull();
      expect(client.channelKey).toBeNull();
    });

    it('throws for a missing channel server uri', async () => {
      await expect(client.create('')).rejects.toThrow(
        'Invalid channel server configuration'
      );
    });

    it('throws if already connected', async () => {
      await client.create(SERVER);

      await expect(client.create(SERVER)).rejects.toThrow('Already connected');
    });

    // The caller has to be able to tell a failed create from a successful one:
    // resolving anyway would encode `channel_id=null` into a real QR code.
    it('rethrows and dispatches error when the bundle rejects', async () => {
      const {
        PairingChannel,
      } = require('fxa-pairing-channel/dist/FxAccountsPairingChannel.babel.umd.js');
      const err = new Error('channel server unreachable');
      PairingChannel.create.mockRejectedValueOnce(err);
      const onError = jest.fn();
      client.addEventListener('error', onError);

      await expect(client.create(SERVER)).rejects.toThrow(
        'channel server unreachable'
      );
      expect(client.isConnected).toBe(false);
      expect(onError).toHaveBeenCalled();
    });

    it('allows a retry after a failed create', async () => {
      const {
        PairingChannel,
      } = require('fxa-pairing-channel/dist/FxAccountsPairingChannel.babel.umd.js');
      PairingChannel.create.mockRejectedValueOnce(new Error('nope'));
      await expect(client.create(SERVER)).rejects.toThrow('nope');

      await client.create(SERVER);

      expect(client.isConnected).toBe(true);
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

    it('throws CONNECTION_CLOSED when the channel is torn down', async () => {
      await client.open(SERVER, CHAN, VALID_KEY);
      mockChannel.closed = true;

      await expect(client.send('pair:supp:authorize')).rejects.toMatchObject({
        errno: 1006,
      });
      expect(mockChannel.send).not.toHaveBeenCalled();
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

      const messageHandler = getMockHandler('message');
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

      const messageHandler = getMockHandler('message');

      const onError = jest.fn();
      client.addEventListener('error', onError);
      messageHandler(new CustomEvent('message', { detail: null }));

      expect(onError).toHaveBeenCalled();
    });
  });

  describe('error event from channel', () => {
    it('dispatches wrapped UNEXPECTED_ERROR', async () => {
      await client.open(SERVER, CHAN, VALID_KEY);

      const errorHandler = getMockHandler('error');
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

      const closeHandler = getMockHandler('close');
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

// Both sides of the flow show the remote device's details so the user can
// confirm which device is asking, so the derivation is shared.
describe('toRemoteMetadata', () => {
  const FIREFOX_IOS_UA =
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/119.0 Mobile/15E148 Safari/605.1.15';
  const REMOTE = {
    city: 'Vancouver',
    country: 'Canada',
    region: 'British Columbia',
    ipAddress: '127.0.0.1',
    ua: FIREFOX_IOS_UA,
  };

  it('derives the device family and OS from the user agent', () => {
    expect(toRemoteMetadata(REMOTE)).toEqual({
      city: 'Vancouver',
      country: 'Canada',
      region: 'British Columbia',
      ipAddress: '127.0.0.1',
      deviceFamily: 'Firefox',
      deviceOS: 'iOS',
      deviceName: 'Firefox',
    });
  });

  it('prefers an explicit device name over the browser name', () => {
    expect(toRemoteMetadata(REMOTE, "Dana's iPhone").deviceName).toBe(
      "Dana's iPhone"
    );
  });

  it('normalizes the OS name reported by the user agent', () => {
    const androidUa =
      'Mozilla/5.0 (Android 14; Mobile; rv:120.0) Gecko/120.0 Firefox/120.0';

    expect(toRemoteMetadata({ ...REMOTE, ua: androidUa }).deviceOS).toBe(
      'Android'
    );
  });

  // The channel server does not guarantee any of the sender fields, and a
  // blank heading in the UI is worse than a generic one.
  it('falls back to Unknown when the user agent cannot be parsed', () => {
    expect(toRemoteMetadata({ ...REMOTE, ua: 'not-a-user-agent' })).toEqual({
      city: 'Vancouver',
      country: 'Canada',
      region: 'British Columbia',
      ipAddress: '127.0.0.1',
      deviceFamily: 'Unknown',
      deviceOS: 'Unknown',
      deviceName: 'Unknown',
    });
  });

  it('defaults a missing ip address to an empty string', () => {
    expect(toRemoteMetadata({ ua: FIREFOX_IOS_UA }).ipAddress).toBe('');
  });
});
