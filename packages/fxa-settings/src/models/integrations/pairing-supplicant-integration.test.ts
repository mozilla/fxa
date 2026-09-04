/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { waitFor } from '@testing-library/react';
import { GenericData } from '../../lib/model-data';
import {
  PAIR_COMPLETE_STORAGE_PREFIX,
  PairingSupplicantIntegration,
  SupplicantState,
} from './pairing-supplicant-integration';
import { firefox } from '../../lib/channels/firefox';

// Mock PairingChannelClient
const mockOpen = jest.fn().mockResolvedValue(undefined);
const mockSend = jest.fn().mockResolvedValue(undefined);
const mockClose = jest.fn().mockResolvedValue(undefined);
const listeners: Record<string, Function[]> = {};

// Only the client is stubbed; `toRemoteMetadata` is a pure helper the
// integration relies on for the device details it shows the user.
jest.mock('../../lib/channels/pairing-channel', () => ({
  ...jest.requireActual('../../lib/channels/pairing-channel'),
  PairingChannelClient: jest.fn().mockImplementation(() => ({
    open: mockOpen,
    send: mockSend,
    close: mockClose,
    addEventListener: jest.fn((type: string, handler: Function) => {
      if (!listeners[type]) listeners[type] = [];
      listeners[type].push(handler);
    }),
    removeEventListener: jest.fn(),
  })),
}));

jest.mock('../../lib/config', () => ({
  __esModule: true,
  default: { pairing: { clients: [] } },
}));

// Valid 43-char base64url code_challenge (SHA256 output length)
const VALID_CODE_CHALLENGE = 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM';

// Valid 64-char hex OAuth code (matches handleAuthAuthorize validation)
const VALID_OAUTH_CODE =
  'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2';

function createIntegration(
  dataOverrides: Record<string, string | undefined> = {}
) {
  // Keys must be snake_case to match @bind(T.snakeCase) decorators
  const data = new GenericData({
    client_id: '3c49430b43dfba77',
    scope: 'profile https://identity.mozilla.com/apps/oldsync',
    state: 'abc123',
    code_challenge: VALID_CODE_CHALLENGE,
    code_challenge_method: 'S256',
    keys_jwk: 'dGVzdGtleXM',
    access_type: 'offline',
    ...dataOverrides,
  });
  const storageData = new GenericData({});
  return new PairingSupplicantIntegration(data, storageData, {
    scopedKeysEnabled: true,
    scopedKeysValidation: {},
    isPromptNoneEnabled: false,
    isPromptNoneEnabledClientIds: [],
  });
}

function emit(eventName: string, detail?: unknown) {
  (listeners[eventName] || []).forEach((h) =>
    h(new CustomEvent(eventName, { detail }))
  );
}

describe('PairingSupplicantIntegration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.keys(listeners).forEach((k) => delete listeners[k]);
    sessionStorage.clear();
  });

  describe('openChannel', () => {
    it('transitions to WaitingForMetadata on connect and sends OAuth params', async () => {
      const integration = createIntegration();
      expect(integration.state).toBe(SupplicantState.Connecting);

      await integration.openChannel('wss://ch.example.com', 'chan1', 'key1');
      emit('connected');

      expect(integration.state).toBe(SupplicantState.WaitingForMetadata);
      // The params are resolved before the request goes out, so the send lands
      // a microtask after the state change rather than with it.
      await waitFor(() =>
        expect(mockSend).toHaveBeenCalledWith(
          'pair:supp:request',
          expect.objectContaining({ client_id: '3c49430b43dfba77' })
        )
      );
    });

    it('does not open a second channel', async () => {
      const integration = createIntegration();
      await integration.openChannel('wss://ch.example.com', 'chan1', 'key1');
      await integration.openChannel('wss://ch.example.com', 'chan2', 'key2');
      expect(mockOpen).toHaveBeenCalledTimes(1);
    });
  });

  describe('handleAuthMetadata', () => {
    it('extracts email, deviceName, and remote metadata with OS normalization', async () => {
      const integration = createIntegration();
      await integration.openChannel('wss://ch.example.com', 'chan1', 'key1');
      emit('connected');

      emit('remote:pair:auth:metadata', {
        email: 'user@example.com',
        deviceName: "Alice's Firefox",
        remoteMetaData: {
          ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:125.0) Gecko/20100101 Firefox/125.0',
          city: 'Portland',
          country: 'US',
          region: 'Oregon',
          ipAddress: '1.2.3.4',
        },
      });

      expect(integration.state).toBe(SupplicantState.WaitingForAuthorizations);
      expect(integration.email).toBe('user@example.com');
      expect(integration.deviceName).toBe("Alice's Firefox");
      expect(integration.remoteMetadata).toMatchObject({
        city: 'Portland',
        deviceFamily: 'Firefox',
        deviceOS: 'macOS',
        deviceName: "Alice's Firefox",
      });
    });
  });

  describe('approval state machine', () => {
    async function setupAtWaiting() {
      const integration = createIntegration();
      await integration.openChannel('wss://ch.example.com', 'c', 'k');
      emit('connected');
      emit('remote:pair:auth:metadata', {
        email: 'u@e.com',
        remoteMetaData: { ua: '' },
      });
      return integration;
    }

    it('supplicant first → WaitingForAuthority → authority → Complete', async () => {
      const integration = await setupAtWaiting();
      await integration.supplicantApprove();
      expect(integration.state).toBe(SupplicantState.WaitingForAuthority);

      emit('remote:pair:auth:authorize', {
        code: VALID_OAUTH_CODE,
        state: 'abc123',
      });
      expect(integration.state).toBe(SupplicantState.Complete);
    });

    it('authority first → WaitingForSupplicant → supplicant → Complete', async () => {
      const integration = await setupAtWaiting();
      emit('remote:pair:auth:authorize', {
        code: VALID_OAUTH_CODE,
        state: 'abc123',
      });
      expect(integration.state).toBe(SupplicantState.WaitingForSupplicant);

      await integration.supplicantApprove();
      expect(integration.state).toBe(SupplicantState.Complete);
    });

    it('authority authorize without code → Failed', async () => {
      const integration = await setupAtWaiting();
      emit('remote:pair:auth:authorize', {});
      expect(integration.state).toBe(SupplicantState.Failed);
      expect(integration.error?.message).toContain('without providing');
    });

    it('sets sessionStorage completion marker on Complete', async () => {
      const integration = createIntegration();
      await integration.openChannel('wss://ch.example.com', 'chan-42', 'k');
      emit('connected');
      emit('remote:pair:auth:metadata', {
        email: 'u@e.com',
        remoteMetaData: { ua: '' },
      });
      emit('remote:pair:auth:authorize', {
        code: VALID_OAUTH_CODE,
        state: 'abc123',
      });
      await integration.supplicantApprove();

      expect(integration.state).toBe(SupplicantState.Complete);
      expect(
        sessionStorage.getItem(PAIR_COMPLETE_STORAGE_PREFIX + 'chan-42')
      ).toBe('1');
    });
  });

  // A v2 supplicant reached by a scanned QR has no OAuth params in its URL and
  // asks the browser for them, so the state to check `pair:auth:authorize`
  // against is the one `pairOauthStart` handed back, not `this.data.state`.
  describe('v2 approval state machine', () => {
    const BROWSER_STATE = 'browser-generated-state';

    async function setupV2(): Promise<PairingSupplicantIntegration> {
      jest.spyOn(firefox, 'pairOauthStart').mockResolvedValue({
        state: BROWSER_STATE,
        scope: 'profile https://identity.mozilla.com/apps/oldsync',
        code_challenge: VALID_CODE_CHALLENGE,
        code_challenge_method: 'S256',
        keys_jwk: 'dGVzdGtleXM',
      });
      jest.spyOn(firefox, 'fxaOAuthLogin').mockImplementation(() => {});

      // No `state` query param, which is what a real v2 supplicant URL looks
      // like — the whole point is that the check cannot lean on it.
      const integration = createIntegration({ state: '' });
      await integration.openChannel('wss://ch.example.com', 'c', 'k', 2);
      emit('connected');
      await waitFor(() =>
        expect(mockSend).toHaveBeenCalledWith(
          'pair:supp:request',
          expect.objectContaining({ state: BROWSER_STATE })
        )
      );
      emit('remote:pair:auth:metadata', {
        email: 'u@e.com',
        remoteMetaData: { ua: '' },
      });
      return integration;
    }

    it('completes when the authority echoes back the state we sent', async () => {
      const integration = await setupV2();

      emit('remote:pair:auth:authorize', {
        code: VALID_OAUTH_CODE,
        state: BROWSER_STATE,
      });

      expect(integration.state).toBe(SupplicantState.Complete);
      expect(firefox.fxaOAuthLogin).toHaveBeenCalledWith(
        expect.objectContaining({ code: VALID_OAUTH_CODE, action: 'pairing' })
      );
    });

    it('fails on a state that is not the one we asked for', async () => {
      const integration = await setupV2();

      emit('remote:pair:auth:authorize', {
        code: VALID_OAUTH_CODE,
        state: 'some-other-flows-state',
      });

      expect(integration.state).toBe(SupplicantState.Failed);
      expect(integration.error?.message).toBe('OAuth state mismatch');
      expect(firefox.fxaOAuthLogin).not.toHaveBeenCalled();
    });

    // Arrives before `pairOauthStart` has resolved, so there is no state to
    // compare against and the message cannot be an answer to our request.
    it('fails on an authorize that arrives before we sent a request', async () => {
      jest
        .spyOn(firefox, 'pairOauthStart')
        .mockReturnValue(new Promise(() => {}));
      const integration = createIntegration({ state: '' });
      await integration.openChannel('wss://ch.example.com', 'c', 'k', 2);
      emit('connected');

      emit('remote:pair:auth:authorize', {
        code: VALID_OAUTH_CODE,
        state: BROWSER_STATE,
      });

      expect(integration.state).toBe(SupplicantState.Failed);
      expect(integration.error?.message).toContain('no request state recorded');
    });
  });

  // The mobile app's own QR scanner runs OAuth start itself and opens the page
  // with the params in the URL. Asking the browser for a second set there would
  // strand the verifier the app is holding for the code it expects back.
  describe('v2 with OAuth params in the URL', () => {
    beforeEach(() => {
      jest.spyOn(firefox, 'pairOauthStart').mockResolvedValue({
        state: 'browser-generated-state',
        scope: 'profile',
        code_challenge: VALID_CODE_CHALLENGE,
        code_challenge_method: 'S256',
        keys_jwk: 'dGVzdGtleXM',
      });
    });

    it('requests with the URL params rather than asking the browser', async () => {
      const integration = createIntegration();
      await integration.openChannel('wss://ch.example.com', 'c', 'k', 2);
      emit('connected');

      await waitFor(() =>
        expect(mockSend).toHaveBeenCalledWith('pair:supp:request', {
          access_type: 'offline',
          client_id: '3c49430b43dfba77',
          code_challenge: VALID_CODE_CHALLENGE,
          code_challenge_method: 'S256',
          keys_jwk: 'dGVzdGtleXM',
          scope: 'profile https://identity.mozilla.com/apps/oldsync',
          state: 'abc123',
        })
      );
      expect(firefox.pairOauthStart).not.toHaveBeenCalled();
    });

    it('checks the authorize against the URL state', async () => {
      jest.spyOn(firefox, 'fxaOAuthLogin').mockImplementation(() => {});
      const integration = createIntegration();
      await integration.openChannel('wss://ch.example.com', 'c', 'k', 2);
      emit('connected');
      await waitFor(() => expect(mockSend).toHaveBeenCalled());

      emit('remote:pair:auth:authorize', {
        code: VALID_OAUTH_CODE,
        state: 'abc123',
      });

      expect(integration.state).toBe(SupplicantState.Complete);
    });

    // What a scanned QR produces: the bare URL from the code, carrying no OAuth
    // request. `client_id` stays because a real supplicant falls back to
    // deriving it from its user agent, which jsdom cannot stand in for.
    it('asks the browser when the URL carries no OAuth request', async () => {
      const integration = createIntegration({
        scope: undefined,
        state: undefined,
        code_challenge: undefined,
        code_challenge_method: undefined,
        keys_jwk: undefined,
      });
      await integration.openChannel('wss://ch.example.com', 'c', 'k', 2);
      emit('connected');

      await waitFor(() =>
        expect(mockSend).toHaveBeenCalledWith(
          'pair:supp:request',
          expect.objectContaining({ state: 'browser-generated-state' })
        )
      );
    });
  });

  describe('error handling', () => {
    it('channel close before completion → Failed with errno 1006', async () => {
      const integration = createIntegration();
      const onError = jest.fn();
      integration.onError = onError;

      await integration.openChannel('wss://ch.example.com', 'c', 'k');
      emit('connected');
      emit('close');

      expect(integration.state).toBe(SupplicantState.Failed);
      expect(onError).toHaveBeenCalled();
    });

    it('channel close in terminal state does not re-fail', async () => {
      const integration = createIntegration();
      await integration.openChannel('wss://ch.example.com', 'c', 'k');
      emit('connected');
      emit('remote:pair:auth:metadata', {
        email: 'u@e.com',
        remoteMetaData: { ua: '' },
      });
      emit('remote:pair:auth:authorize', {
        code: VALID_OAUTH_CODE,
        state: 'abc123',
      });
      await integration.supplicantApprove();
      expect(integration.state).toBe(SupplicantState.Complete);

      const onError = jest.fn();
      integration.onError = onError;
      emit('close');
      // Should stay Complete, not transition to Failed
      expect(integration.state).toBe(SupplicantState.Complete);
      expect(onError).not.toHaveBeenCalled();
    });

    it('channel error after connect → Failed', async () => {
      const integration = createIntegration();
      await integration.openChannel('wss://ch.example.com', 'c', 'k');
      emit('connected');
      emit('error', new Error('WebSocket failed'));
      expect(integration.state).toBe(SupplicantState.Failed);
    });

    it('channel close while still Connecting → Failed when no completion marker', async () => {
      // Without the post-completion sessionStorage marker, a close during
      // initial connect is a real failure and must surface — otherwise the
      // user sits on the loading screen forever.
      const integration = createIntegration();
      const onError = jest.fn();
      integration.onError = onError;

      await integration.openChannel('wss://ch.example.com', 'c', 'k');
      // Do NOT emit 'connected'
      emit('close');

      expect(integration.state).toBe(SupplicantState.Failed);
      expect(onError).toHaveBeenCalled();
    });

    it('channel error while still Connecting → Failed when no completion marker', async () => {
      const integration = createIntegration();
      const onError = jest.fn();
      integration.onError = onError;

      await integration.openChannel('wss://ch.example.com', 'c', 'k');
      emit('error', new Error('WebSocket failed'));

      expect(integration.state).toBe(SupplicantState.Failed);
      expect(onError).toHaveBeenCalled();
    });

    it('channel close while still Connecting is ignored when completion marker is set', async () => {
      // Matches legacy WaitForConnectionToChannelServer.socketClosed() no-op.
      // Covers the Android Firefox post-OAuth reload case where the QR URL
      // is re-entered after the channel has already been consumed.
      sessionStorage.setItem(PAIR_COMPLETE_STORAGE_PREFIX + 'c', '1');
      const integration = createIntegration();
      const onError = jest.fn();
      const onStateChange = jest.fn();
      integration.onError = onError;
      integration.onStateChange = onStateChange;

      await integration.openChannel('wss://ch.example.com', 'c', 'k');
      // Do NOT emit 'connected' — simulate channel rejecting the reconnection
      emit('close');

      expect(integration.state).toBe(SupplicantState.Connecting);
      expect(onError).not.toHaveBeenCalled();
      expect(onStateChange).not.toHaveBeenCalled();
    });

    it('channel error while still Connecting is ignored when completion marker is set', async () => {
      sessionStorage.setItem(PAIR_COMPLETE_STORAGE_PREFIX + 'c', '1');
      const integration = createIntegration();
      const onError = jest.fn();
      integration.onError = onError;

      await integration.openChannel('wss://ch.example.com', 'c', 'k');
      emit('error', new Error('WebSocket failed'));

      expect(integration.state).toBe(SupplicantState.Connecting);
      expect(onError).not.toHaveBeenCalled();
    });

    it('supplicantApprove send failure → Failed', async () => {
      mockSend.mockRejectedValueOnce(new Error('send failed'));
      const integration = createIntegration();
      await integration.openChannel('wss://ch.example.com', 'c', 'k');
      emit('connected');
      emit('remote:pair:auth:metadata', {
        email: 'u@e.com',
        remoteMetaData: { ua: '' },
      });

      // The rejection is rethrown so the caller can navigate to the failure
      // screen; the integration records the failure either way.
      await expect(integration.supplicantApprove()).rejects.toThrow(
        'send failed'
      );
      expect(integration.state).toBe(SupplicantState.Failed);
      expect(integration.error?.message).toBe('send failed');
    });

    it('onStateChange callback fires on transitions', async () => {
      const integration = createIntegration();
      const onStateChange = jest.fn();
      integration.onStateChange = onStateChange;

      await integration.openChannel('wss://ch.example.com', 'c', 'k');
      emit('connected');

      expect(onStateChange).toHaveBeenCalledWith(
        SupplicantState.WaitingForMetadata
      );
    });

    it('open failure transitions to Failed', async () => {
      mockOpen.mockRejectedValueOnce(new Error('ws connect failed'));
      const integration = createIntegration();
      const onError = jest.fn();
      integration.onError = onError;

      await integration.openChannel('wss://ch.example.com', 'c', 'k');
      expect(integration.state).toBe(SupplicantState.Failed);
      expect(onError).toHaveBeenCalled();
    });
  });

  describe('isPairing', () => {
    it('returns true', () => {
      expect(createIntegration().isPairing()).toBe(true);
    });
  });

  describe('validatePairingClient', () => {
    it('returns true when allowlist is empty', () => {
      expect(createIntegration().validatePairingClient()).toBe(true);
    });

    it('validates against allowlist when populated', () => {
      const config = require('../../lib/config').default;
      config.pairing.clients = ['3c49430b43dfba77'];

      expect(
        createIntegration({
          client_id: '3c49430b43dfba77',
        }).validatePairingClient()
      ).toBe(true);
      expect(
        createIntegration({
          client_id: 'a2270f727f45f648',
        }).validatePairingClient()
      ).toBe(false);

      config.pairing.clients = [];
    });
  });

  describe('destroy', () => {
    it('cleans up channel and callbacks', async () => {
      const integration = createIntegration();
      integration.onStateChange = jest.fn();
      integration.onError = jest.fn();
      await integration.openChannel('wss://ch.example.com', 'c', 'k');

      await integration.destroy();

      expect(mockClose).toHaveBeenCalled();
      expect(integration.onStateChange).toBeNull();
      expect(integration.onError).toBeNull();
    });
  });
});
