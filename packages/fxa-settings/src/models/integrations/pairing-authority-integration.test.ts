/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { GenericData } from '../../lib/model-data';
import { PairingAuthorityIntegration } from './pairing-authority-integration';

const mockPairSupplicantMetadata = jest.fn();
const mockPairHeartbeat = jest.fn();
const mockPairAuthorize = jest.fn();
const mockPairDecline = jest.fn();
const mockPairComplete = jest.fn();

jest.mock('../../lib/channels/firefox', () => ({
  firefox: {
    pairSupplicantMetadata: (...args: unknown[]) =>
      mockPairSupplicantMetadata(...args),
    pairHeartbeat: (...args: unknown[]) => mockPairHeartbeat(...args),
    pairAuthorize: (...args: unknown[]) => mockPairAuthorize(...args),
    pairDecline: (...args: unknown[]) => mockPairDecline(...args),
    pairComplete: (...args: unknown[]) => mockPairComplete(...args),
  },
}));

jest.mock('../../lib/config', () => ({
  __esModule: true,
  default: { pairing: { clients: [] } },
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
      integration.destroy();
    });

    it('does not start twice', () => {
      const integration = createIntegration();
      integration.startHeartbeat();
      integration.startHeartbeat();
      // Only one interval should be active — stopHeartbeat clears it
      integration.stopHeartbeat();
    });

    it('calls onHeartbeatError when channelId is missing', () => {
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
      integration.destroy();
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
      integration.destroy();
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
    it('authorize sends WebChannel command', () => {
      const integration = createIntegration();
      integration.authorize();
      expect(integration.authAuthorized).toBe(true);
      expect(mockPairAuthorize).toHaveBeenCalledWith('test-channel-id');
    });

    it('decline stops heartbeat and sends command', () => {
      const integration = createIntegration();
      integration.startHeartbeat();
      integration.decline();
      expect(mockPairDecline).toHaveBeenCalledWith('test-channel-id');
    });

    it('complete stops heartbeat and sends command', () => {
      const integration = createIntegration();
      integration.startHeartbeat();
      integration.complete();
      expect(mockPairComplete).toHaveBeenCalledWith('test-channel-id');
    });
  });

  describe('destroy', () => {
    it('cleans up timers and callbacks', () => {
      const integration = createIntegration();
      integration.onSuppAuthorized = jest.fn();
      integration.onHeartbeatError = jest.fn();
      integration.startHeartbeat();

      integration.destroy();

      expect(integration.onSuppAuthorized).toBeNull();
      expect(integration.onHeartbeatError).toBeNull();
    });
  });
});
