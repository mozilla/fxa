/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { GenericData } from '../../lib/model-data';
import {
  PairingSupplicantIntegration,
  SupplicantState,
} from './pairing-supplicant-integration';

// Mock PairingChannelClient
const mockOpen = jest.fn().mockResolvedValue(undefined);
const mockSend = jest.fn().mockResolvedValue(undefined);
const mockClose = jest.fn().mockResolvedValue(undefined);
const listeners: Record<string, Function[]> = {};

jest.mock('../../lib/channels/pairing-channel', () => ({
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

function createIntegration(dataOverrides: Record<string, string> = {}) {
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
  });

  describe('openChannel', () => {
    it('transitions to WaitingForMetadata on connect and sends OAuth params', async () => {
      const integration = createIntegration();
      expect(integration.state).toBe(SupplicantState.Connecting);

      await integration.openChannel('wss://ch.example.com', 'chan1', 'key1');
      emit('connected');

      expect(integration.state).toBe(SupplicantState.WaitingForMetadata);
      expect(mockSend).toHaveBeenCalledWith(
        'pair:supp:request',
        expect.objectContaining({ client_id: '3c49430b43dfba77' })
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

      emit('remote:pair:auth:authorize', { code: 'c0de', state: 'abc123' });
      expect(integration.state).toBe(SupplicantState.Complete);
    });

    it('authority first → WaitingForSupplicant → supplicant → Complete', async () => {
      const integration = await setupAtWaiting();
      emit('remote:pair:auth:authorize', { code: 'c0de', state: 'abc123' });
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
      emit('remote:pair:auth:authorize', { code: 'c0de', state: 'abc123' });
      await integration.supplicantApprove();
      expect(integration.state).toBe(SupplicantState.Complete);

      const onError = jest.fn();
      integration.onError = onError;
      emit('close');
      // Should stay Complete, not transition to Failed
      expect(integration.state).toBe(SupplicantState.Complete);
      expect(onError).not.toHaveBeenCalled();
    });

    it('channel error → Failed', async () => {
      const integration = createIntegration();
      await integration.openChannel('wss://ch.example.com', 'c', 'k');
      emit('error', new Error('WebSocket failed'));
      expect(integration.state).toBe(SupplicantState.Failed);
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

      await integration.supplicantApprove();
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
