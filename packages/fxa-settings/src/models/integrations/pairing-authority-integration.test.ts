/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { GenericData } from '../../lib/model-data';
import {
  AuthorityState,
  PairingAuthorityIntegration,
} from './pairing-authority-integration';
import { OAUTH_ERRORS } from '../../lib/oauth';

const CHANNEL_SERVER_URI = 'wss://channel.example.com';

const mockCreate = jest.fn().mockResolvedValue(undefined);
const mockChannelClose = jest.fn().mockResolvedValue(undefined);
const mockChannelSend = jest.fn().mockResolvedValue(undefined);
const mockRemoveEventListener = jest.fn();
let mockListeners: Record<string, Function[]> = {};

jest.mock('../../lib/channels/pairing-channel', () => {
  const actual = jest.requireActual('../../lib/channels/pairing-channel');
  return {
    ...actual,
    PairingChannelClient: jest.fn().mockImplementation(() => ({
      create: mockCreate,
      close: mockChannelClose,
      send: mockChannelSend,
      channelId: 'chan-1',
      channelKey: 'key-1',
      addEventListener: jest.fn((type: string, handler: Function) => {
        (mockListeners[type] ||= []).push(handler);
      }),
      removeEventListener: mockRemoveEventListener,
    })),
  };
});

/**
 * Derived by `PairingChannelClient` from the channel server's `sender`
 * envelope rather than read out of the payload — it is what the authority
 * shows so the user can confirm which device is asking.
 */
const MOCK_REMOTE_METADATA = {
  city: 'Vancouver',
  country: 'Canada',
  region: 'British Columbia',
  ipAddress: '127.0.0.1',
  ua: 'Mozilla/5.0 (Android 14; Mobile; rv:120.0) Gecko/120.0 Firefox/120.0',
};

/**
 * The OAuth params a supplicant sends in `pair:supp:request`. `keys_jwk` is the
 * one Firefox needs to wrap the scoped keys, so it has to survive the hop to
 * `pairOauthFinish`.
 */
const MOCK_SUPP_OAUTH_PARAMS = {
  client_id: 'a2270f727f45f648',
  scope: 'profile https://identity.mozilla.com/apps/oldsync',
  state: 'mock-supp-state',
  // A real S256 challenge is 43 base64url characters, which the validator
  // enforces — a placeholder short enough to be obviously fake would be
  // rejected before it ever reached `pairOauthFinish`.
  code_challenge: 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM',
  code_challenge_method: 'S256',
  keys_jwk: 'mock-keys-jwk',
};

/** A complete v2 supplicant request — nothing the authority needs is absent. */
const MOCK_SUPP_REQUEST = {
  ...MOCK_SUPP_OAUTH_PARAMS,
  remoteMetaData: MOCK_REMOTE_METADATA,
};

const MOCK_OAUTH_CODE = {
  code: 'mock-oauth-code',
  state: MOCK_SUPP_OAUTH_PARAMS.state,
};

/** Deliver a channel event the way `PairingChannelClient` would. */
function emit(type: string, detail?: unknown) {
  (mockListeners[type] || []).forEach((handler) =>
    handler(new CustomEvent(type, { detail }))
  );
}

/**
 * The authority acks a supplicant request with `pair:auth:metadata` and only
 * advances once that send resolves, so state assertions have to wait a
 * microtask past the emit.
 */
async function emitSuppRequest(detail: unknown = MOCK_SUPP_REQUEST) {
  emit('remote:pair:supp:request', detail);
  await Promise.resolve();
}

/** A copy of the request with one required field left out. */
function suppRequestWithout(field: string) {
  const partial: Record<string, unknown> = { ...MOCK_SUPP_REQUEST };
  delete partial[field];
  return partial;
}

const mockPairSupplicantMetadata = jest.fn();
const mockPairHeartbeat = jest.fn();
const mockPairAuthorize = jest.fn();
const mockPairOauthFinish = jest.fn();
const mockPairDecline = jest.fn();
const mockPairComplete = jest.fn();

jest.mock('../../lib/channels/firefox', () => ({
  firefox: {
    pairSupplicantMetadata: (...args: unknown[]) =>
      mockPairSupplicantMetadata(...args),
    pairHeartbeat: (...args: unknown[]) => mockPairHeartbeat(...args),
    pairAuthorize: (...args: unknown[]) => mockPairAuthorize(...args),
    pairOauthFinish: (...args: unknown[]) => mockPairOauthFinish(...args),
    pairDecline: (...args: unknown[]) => mockPairDecline(...args),
    pairComplete: (...args: unknown[]) => mockPairComplete(...args),
  },
}));

jest.mock('../../lib/config', () => ({
  __esModule: true,
  default: {
    pairing: { clients: [], serverBaseUri: 'wss://channel.example.com' },
  },
}));

function createIntegration(
  dataOverrides: Record<string, string> = {},
  channelDataOverrides: Record<string, string> = {}
) {
  const data = new GenericData({
    client_id: '3c49430b43dfba77',
    scope: 'profile',
    // Provide valid code_challenge to pass model validation
    code_challenge: 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM',
    code_challenge_method: 'S256',
    ...dataOverrides,
  });
  const channelData = new GenericData({
    channel_id: 'test-channel-id',
    ...channelDataOverrides,
  });
  const storageData = new GenericData({});
  return new PairingAuthorityIntegration(data, channelData, storageData, {
    scopedKeysEnabled: true,
    scopedKeysValidation: {},
    isPromptNoneEnabled: true,
    isPromptNoneEnabledClientIds: [],
  });
}

describe('PairingAuthorityIntegration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockListeners = {};
    mockCreate.mockResolvedValue(undefined);
    mockChannelClose.mockResolvedValue(undefined);
    mockChannelSend.mockResolvedValue(undefined);
    mockPairOauthFinish.mockResolvedValue(MOCK_OAUTH_CODE);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('creates successfully', () => {
    expect(createIntegration()).toBeDefined();
  });

  describe('validatePairingClient', () => {
    it('returns true when allowlist is empty', () => {
      expect(createIntegration().validatePairingClient()).toBe(true);
    });

    it('validates against populated allowlist', () => {
      const config = require('../../lib/config').default;
      config.pairing.clients = ['3c49430b43dfba77'];

      expect(createIntegration().validatePairingClient()).toBe(true);
      expect(
        createIntegration({
          client_id: 'a2270f727f45f648',
        }).validatePairingClient()
      ).toBe(false);

      config.pairing.clients = [];
    });
  });

  describe('getServiceName', () => {
    it('returns Firefox Sync service name', () => {
      expect(createIntegration().getServiceName()).toBe('Firefox Sync');
    });
  });

  describe('getSupplicantMetadata', () => {
    it('fetches and parses supplicant metadata with OS normalization', async () => {
      mockPairSupplicantMetadata.mockResolvedValue({
        ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Gecko/20100101 Firefox/125.0',
        city: 'Seattle',
        country: 'US',
        region: 'WA',
        ipAddress: '10.0.0.1',
      });

      const integration = createIntegration();
      const metadata = await integration.getSupplicantMetadata();

      expect(metadata.city).toBe('Seattle');
      expect(metadata.deviceFamily).toBe('Firefox');
      expect(metadata.deviceOS).toBe('Windows');
      expect(metadata.ipAddress).toBe('10.0.0.1');
    });

    it('retries after failure', async () => {
      mockPairSupplicantMetadata
        .mockRejectedValueOnce(new Error('network error'))
        .mockResolvedValueOnce({
          ua: '',
          city: 'Portland',
          country: 'US',
          region: 'OR',
          ipAddress: '',
        });

      const integration = createIntegration();
      await expect(integration.getSupplicantMetadata()).rejects.toThrow(
        'network error'
      );
      const metadata = await integration.getSupplicantMetadata();
      expect(metadata.city).toBe('Portland');
    });

    it('caches metadata on subsequent calls', async () => {
      mockPairSupplicantMetadata.mockResolvedValue({
        ua: '',
        city: '',
        country: '',
        region: '',
        ipAddress: '',
      });

      const integration = createIntegration();
      await integration.getSupplicantMetadata();
      await integration.getSupplicantMetadata();

      expect(mockPairSupplicantMetadata).toHaveBeenCalledTimes(1);
    });
  });

  describe('heartbeat', () => {
    it('polls and detects suppAuthorized', async () => {
      mockPairHeartbeat.mockResolvedValue({ suppAuthorized: true });

      const integration = createIntegration();
      const onSuppAuthorized = jest.fn();
      integration.onSuppAuthorized = onSuppAuthorized;

      integration.startHeartbeat();
      jest.advanceTimersByTime(1000);
      // Let the async heartbeat resolve
      await Promise.resolve();

      expect(onSuppAuthorized).toHaveBeenCalled();
      expect(integration.suppAuthorized).toBe(true);
      integration.stopHeartbeat();
    });

    it('stops on heartbeat error', async () => {
      mockPairHeartbeat.mockResolvedValue({
        err: { errno: 1006, message: 'closed' },
      });

      const integration = createIntegration();
      const onHeartbeatError = jest.fn();
      integration.onHeartbeatError = onHeartbeatError;

      integration.startHeartbeat();
      jest.advanceTimersByTime(1000);
      await Promise.resolve();

      expect(onHeartbeatError).toHaveBeenCalled();
      await integration.destroy();
    });

    it('does not start twice', () => {
      const integration = createIntegration();
      integration.startHeartbeat();
      integration.startHeartbeat();
      // Only one interval should be active — stopHeartbeat clears it
      integration.stopHeartbeat();
    });

    it('calls onHeartbeatError when channelId is missing', async () => {
      // No channel_id in URL or channelData
      Object.defineProperty(window, 'location', {
        value: { search: '' },
        writable: true,
      });
      const integration = createIntegration({}, { channel_id: '' });
      const onHeartbeatError = jest.fn();
      integration.onHeartbeatError = onHeartbeatError;

      integration.startHeartbeat();

      expect(onHeartbeatError).toHaveBeenCalled();
      expect(mockPairHeartbeat).not.toHaveBeenCalled();
      await integration.destroy();
    });

    it('stops heartbeat when pairHeartbeat rejects', async () => {
      mockPairHeartbeat.mockRejectedValue(new Error('network error'));

      const integration = createIntegration();
      const onHeartbeatError = jest.fn();
      integration.onHeartbeatError = onHeartbeatError;

      integration.startHeartbeat();
      jest.advanceTimersByTime(1000);
      await Promise.resolve();

      expect(onHeartbeatError).toHaveBeenCalled();
      await integration.destroy();
    });

    it('skips overlapping heartbeat ticks', async () => {
      let resolveHeartbeat: Function;
      mockPairHeartbeat.mockImplementation(
        () =>
          new Promise((r) => {
            resolveHeartbeat = r;
          })
      );

      const integration = createIntegration();
      integration.startHeartbeat();

      // First tick starts, second tick should be skipped
      jest.advanceTimersByTime(1000);
      jest.advanceTimersByTime(1000);

      expect(mockPairHeartbeat).toHaveBeenCalledTimes(1);
      resolveHeartbeat!({ suppAuthorized: false });
      await Promise.resolve();
      integration.stopHeartbeat();
    });

    it('tolerates null/undefined response', async () => {
      mockPairHeartbeat.mockResolvedValue(undefined);

      const integration = createIntegration();
      integration.startHeartbeat();
      jest.advanceTimersByTime(1000);
      await Promise.resolve();

      // Should not crash — no callback fired
      expect(integration.suppAuthorized).toBe(false);
      integration.stopHeartbeat();
    });
  });

  describe('actions', () => {
    it('authorize sends WebChannel command', async () => {
      const integration = createIntegration();
      await integration.authorize();
      expect(integration.authAuthorized).toBe(true);
      expect(mockPairAuthorize).toHaveBeenCalledWith('test-channel-id');
    });

    it('decline stops heartbeat and sends command', async () => {
      const integration = createIntegration();
      integration.startHeartbeat();
      await integration.decline();
      expect(mockPairDecline).toHaveBeenCalledWith('test-channel-id');
    });

    it('complete stops heartbeat and sends command', async () => {
      const integration = createIntegration();
      integration.startHeartbeat();
      await integration.complete();
      expect(mockPairComplete).toHaveBeenCalledWith('test-channel-id');
    });
  });

  describe('isPairing', () => {
    it('returns true', () => {
      expect(createIntegration().isPairing()).toBe(true);
    });
  });

  describe('pairing channel', () => {
    let integration: PairingAuthorityIntegration;
    let onStateChange: jest.Mock;
    let onError: jest.Mock;

    beforeEach(() => {
      integration = createIntegration();
      onStateChange = jest.fn();
      onError = jest.fn();
      integration.onStateChange = onStateChange;
      integration.onError = onError;
    });

    describe('createChannel', () => {
      it('creates a channel against the configured channel server', async () => {
        await integration.createChannel();

        expect(mockCreate).toHaveBeenCalledWith(CHANNEL_SERVER_URI);
        expect(integration.hasChannel()).toBe(true);
      });

      it('does not create a second channel', async () => {
        await integration.createChannel();
        await integration.createChannel();

        expect(mockCreate).toHaveBeenCalledTimes(1);
      });

      it('rethrows and fails when the channel cannot be created', async () => {
        const err = new Error('channel server unreachable');
        mockCreate.mockRejectedValueOnce(err);

        await expect(integration.createChannel()).rejects.toThrow(
          'channel server unreachable'
        );
        expect(integration.state).toBe(AuthorityState.Failed);
        expect(onError).toHaveBeenCalledWith(err);
      });

      it('drops the channel after a failed create so it can be retried', async () => {
        mockCreate.mockRejectedValueOnce(new Error('nope'));
        await expect(integration.createChannel()).rejects.toThrow('nope');

        expect(integration.hasChannel()).toBe(false);

        await integration.createChannel();
        expect(mockCreate).toHaveBeenCalledTimes(2);
      });
    });

    describe('getPairUrl', () => {
      it('encodes the channel credentials in the fragment', async () => {
        await integration.createChannel();

        expect(integration.getPairUrl('2')).toBe(
          `${window.location.origin}/pair#channel_id=chan-1&channel_key=key-1&v=2`
        );
      });

      // Better to fail loudly than to render a QR that scans to a channel the
      // supplicant cannot join.
      it('throws before the channel exists', () => {
        expect(() => integration.getPairUrl('2')).toThrow(
          'Cannot build a pair URL before the channel is created.'
        );
      });
    });

    describe('state machine', () => {
      beforeEach(async () => {
        await integration.createChannel();
      });

      it('waits for metadata once connected', () => {
        emit('connected');

        expect(integration.state).toBe(AuthorityState.WaitingForMetadata);
        expect(onStateChange).toHaveBeenCalledWith(
          AuthorityState.WaitingForMetadata
        );
      });

      // The supplicant's request carries no email or device name — it is not
      // signed in yet — so only the sender envelope is consumed.
      it('records the supplicant device details from its request', async () => {
        emit('connected');

        await emitSuppRequest();

        expect(integration.remoteMetadata).toEqual({
          city: 'Vancouver',
          country: 'Canada',
          region: 'British Columbia',
          ipAddress: '127.0.0.1',
          deviceFamily: 'Firefox',
          deviceOS: 'Android',
          deviceName: 'Firefox',
        });
      });

      it('acks the request so the supplicant can approve', async () => {
        emit('connected');

        await emitSuppRequest();

        expect(mockChannelSend).toHaveBeenCalledWith('pair:auth:metadata', {});
      });

      it('waits for both approvals once the request is acked', async () => {
        emit('connected');

        await emitSuppRequest();

        expect(integration.state).toBe(AuthorityState.WaitingForAuthorizations);
      });

      // Until the ack lands the supplicant has nothing to approve, so showing
      // the approval screen would invite the user to act on a dead channel.
      it('does not advance until the ack resolves', () => {
        emit('connected');

        emit('remote:pair:supp:request', MOCK_SUPP_REQUEST);

        expect(integration.state).toBe(AuthorityState.WaitingForMetadata);
      });

      it('supplicant first: waits for the authority, then completes', async () => {
        emit('connected');
        await emitSuppRequest();

        emit('remote:pair:supp:authorize');
        expect(integration.state).toBe(AuthorityState.WaitingForAuthority);

        await integration.authorize();
        expect(integration.state).toBe(AuthorityState.Complete);
      });

      // Firefox only wraps the scoped keys into `keys_jwe` when it is handed a
      // `keys_jwk`. Drop it and the supplicant gets a code granting the sync
      // scope with no sync key behind it, which fails silently long after
      // pairing looks like it worked.
      it('forwards the whole supplicant OAuth request', async () => {
        emit('connected');
        await emitSuppRequest();

        await integration.authorize();

        expect(mockPairOauthFinish).toHaveBeenCalledWith(
          MOCK_SUPP_OAUTH_PARAMS
        );
      });

      it('relays the granted code and state to the supplicant', async () => {
        emit('connected');
        await emitSuppRequest();

        await integration.authorize();

        expect(mockChannelSend).toHaveBeenCalledWith(
          'pair:auth:authorize',
          MOCK_OAUTH_CODE
        );
      });

      // The v1 heartbeat reports the same fact, so the two sources must not
      // each fire the callback.
      it('signals supplicant approval once', async () => {
        const onSuppAuthorized = jest.fn();
        integration.onSuppAuthorized = onSuppAuthorized;
        emit('connected');
        await emitSuppRequest();

        emit('remote:pair:supp:authorize');
        emit('remote:pair:supp:authorize');

        expect(onSuppAuthorized).toHaveBeenCalledTimes(1);
        expect(integration.suppAuthorized).toBe(true);
      });
    });

    // Every one of these fields is needed to mint the OAuth code. A partial
    // request used to be logged and waved through, which surfaced as a signin
    // that either dies at `pairOauthFinish` or hands the supplicant a code
    // with no sync key behind it — both long after pairing looked fine.
    describe('incomplete supplicant request', () => {
      beforeEach(async () => {
        await integration.createChannel();
        emit('connected');
      });

      // A throw from inside a channel listener reaches no caller: the flow
      // would stall with no failure state and nothing in Sentry. Rejections
      // route through fail() instead, which the containers already navigate on.
      it.each([
        'client_id',
        'code_challenge',
        'code_challenge_method',
        'keys_jwk',
        'scope',
        'state',
      ])('fails without throwing when %s is missing', (field) => {
        expect(() =>
          emit('remote:pair:supp:request', suppRequestWithout(field))
        ).not.toThrow();

        expect(integration.state).toBe(AuthorityState.Failed);
        expect(onError).toHaveBeenCalledWith(
          expect.objectContaining({ errno: OAUTH_ERRORS.INVALID_PARAMETER.errno })
        );
      });

      // Rules beyond presence live in pairing-request-validation.test.ts; these
      // two only prove the authority is wired to the validator rather than to
      // its own truthiness checks.
      it.each([
        { label: 'a client that cannot pair', field: 'client_id', value: '0123456789abcdef' },
        { label: 'a PKCE method other than S256', field: 'code_challenge_method', value: 'plain' },
      ])('fails on $label', ({ field, value }) => {
        emit('remote:pair:supp:request', { ...MOCK_SUPP_REQUEST, [field]: value });

        expect(integration.state).toBe(AuthorityState.Failed);
      });

      // remoteMetaData is derived from the channel server's sender envelope
      // rather than the payload, so its absence says nothing about the request.
      it('still accepts a request that carries no sender metadata', async () => {
        emit('remote:pair:supp:request', MOCK_SUPP_OAUTH_PARAMS);
        await Promise.resolve();

        expect(integration.remoteMetadata).toBeNull();
        expect(integration.state).toBe(AuthorityState.WaitingForAuthorizations);
      });

      it('does not ack a request it rejected', () => {
        emit('remote:pair:supp:request', suppRequestWithout('keys_jwk'));

        expect(mockChannelSend).not.toHaveBeenCalled();
      });

      // Nothing was forwarded to Firefox, so there is no request to authorize
      // against — and no code may be minted from a stale one.
      it('cannot authorize after a rejected request', async () => {
        emit('remote:pair:supp:request', suppRequestWithout('client_id'));

        await expect(integration.authorize()).resolves.toBeUndefined();
        expect(mockPairOauthFinish).not.toHaveBeenCalled();
        expect(integration.state).toBe(AuthorityState.Failed);
      });
    });

    describe('failures', () => {
      beforeEach(async () => {
        await integration.createChannel();
        emit('connected');
      });

      it('fails with errno 1006 when the channel closes before completion', () => {
        emit('close');

        expect(integration.state).toBe(AuthorityState.Failed);
        expect(onError).toHaveBeenCalledWith({
          errno: 1006,
          message: 'Connection to remote device closed, please try again',
        });
      });

      it('fails with the channel error detail', () => {
        const err = new Error('socket exploded');

        emit('error', err);

        expect(integration.state).toBe(AuthorityState.Failed);
        expect(onError).toHaveBeenCalledWith(err);
      });

      it('normalizes a non-Error channel failure', () => {
        emit('error', 'something went wrong');

        expect(onError).toHaveBeenCalledWith(
          expect.objectContaining({ message: 'something went wrong' })
        );
      });

      // A close after the handshake is the expected teardown, not a failure.
      it('ignores a close once the flow has completed', async () => {
        await emitSuppRequest();
        emit('remote:pair:supp:authorize');
        await integration.authorize();
        expect(integration.state).toBe(AuthorityState.Complete);

        emit('close');

        expect(integration.state).toBe(AuthorityState.Complete);
        expect(onError).not.toHaveBeenCalled();
      });

      // The supplicant is waiting on this ack; without it neither side can
      // move, so the authority has to surface the error rather than sit on
      // the approval screen.
      it('fails when the metadata ack cannot be sent', async () => {
        const err = new Error('socket closed');
        mockChannelSend.mockRejectedValueOnce(err);

        await emitSuppRequest();

        expect(integration.state).toBe(AuthorityState.Failed);
        expect(onError).toHaveBeenCalledWith(err);
      });

      it('fails when the granted code cannot be relayed', async () => {
        const err = new Error('socket closed');
        mockChannelSend.mockImplementation((command: string) =>
          command === 'pair:auth:authorize'
            ? Promise.reject(err)
            : Promise.resolve()
        );
        await emitSuppRequest();

        await integration.authorize();

        expect(integration.state).toBe(AuthorityState.Failed);
        expect(onError).toHaveBeenCalledWith(err);
      });

      // The approve handler does not await authorize(), so a rejection escaping
      // this method is an unhandled rejection that leaves the user waiting on
      // the approval screen. It has to come back as Failed instead.
      it('fails rather than rejecting when Firefox cannot finish the oauth pair', async () => {
        const err = new Error('web channel timed out');
        mockPairOauthFinish.mockRejectedValue(err);
        await emitSuppRequest();

        await expect(integration.authorize()).resolves.toBeUndefined();

        expect(integration.state).toBe(AuthorityState.Failed);
        expect(onError).toHaveBeenCalledWith(err);
      });

      // A resolved-but-empty response is what the web channel returns when it
      // times out, so it must not be relayed as if it were a grant.
      it.each([
        { label: 'no response at all', result: undefined },
        { label: 'no code', result: { state: MOCK_SUPP_OAUTH_PARAMS.state } },
        { label: 'no state', result: { code: 'mock-oauth-code' } },
      ])('fails when the oauth finish returns $label', async ({ result }) => {
        mockPairOauthFinish.mockResolvedValue(result);
        await emitSuppRequest();
        mockChannelSend.mockClear();

        await integration.authorize();

        expect(integration.state).toBe(AuthorityState.Failed);
        expect(mockChannelSend).not.toHaveBeenCalledWith(
          'pair:auth:authorize',
          expect.anything()
        );
      });

      it('does not re-fail once already failed', () => {
        emit('close');
        emit('error', new Error('and again'));

        expect(onError).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('destroy', () => {
    it('cleans up timers and callbacks', async () => {
      const integration = createIntegration();
      integration.onSuppAuthorized = jest.fn();
      integration.onHeartbeatError = jest.fn();
      integration.startHeartbeat();

      await integration.destroy();

      expect(integration.onSuppAuthorized).toBeNull();
      expect(integration.onHeartbeatError).toBeNull();
    });

    it('clears the pairing callbacks', async () => {
      const integration = createIntegration();
      integration.onStateChange = jest.fn();
      integration.onError = jest.fn();

      await integration.destroy();

      expect(integration.onStateChange).toBeNull();
      expect(integration.onError).toBeNull();
    });

    it('closes the channel and drops it', async () => {
      const integration = createIntegration();
      await integration.createChannel();

      await integration.destroy();

      expect(mockChannelClose).toHaveBeenCalled();
      expect(integration.hasChannel()).toBe(false);
    });

    // A listener left on a closed channel would keep the integration alive and
    // able to fire callbacks the page has already torn down.
    it('removes every channel listener it registered', async () => {
      const integration = createIntegration();
      await integration.createChannel();

      await integration.destroy();

      expect(
        mockRemoveEventListener.mock.calls.map(([type]: [string]) => type)
      ).toEqual([
        'connected',
        'close',
        'error',
        'remote:pair:supp:request',
        'remote:pair:supp:authorize',
      ]);
    });

    // Callers tear down in effect cleanup and cannot handle a rejection.
    it('reports a failed close rather than rejecting', async () => {
      const integration = createIntegration();
      await integration.createChannel();
      mockChannelClose.mockRejectedValueOnce(new Error('close failed'));

      await expect(integration.destroy()).resolves.toBeUndefined();
      expect(integration.hasChannel()).toBe(false);
    });

    it('is safe to call when no channel was ever created', async () => {
      await expect(createIntegration().destroy()).resolves.toBeUndefined();
      expect(mockChannelClose).not.toHaveBeenCalled();
    });
  });
});
