/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { renderHook, waitFor } from '@testing-library/react';
import { useFxAStatus } from '.';
import { Constants } from '../../constants';
import firefox from '../../channels/firefox';
import { IntegrationType, isProbablyFirefox } from '../../../models';

jest.mock('../../channels/firefox', () => ({
  __esModule: true,
  default: {
    fxaStatus: jest.fn(),
  },
}));

jest.mock('../../../models', () => {
  const actual = jest.requireActual('../../../models');
  return {
    ...actual,
    isProbablyFirefox: jest.fn(() => true),
  };
});

describe('useFxAStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (isProbablyFirefox as jest.Mock).mockImplementation(() => true);
  });

  describe('SyncDesktopV3 integration', () => {
    it('calls fxaStatus with correct args', async () => {
      (firefox.fxaStatus as jest.Mock).mockResolvedValue({
        capabilities: {
          engines: ['bookmarks'],
          choose_what_to_sync: true,
        },
      });

      const integration = {
        type: IntegrationType.SyncDesktopV3,
        isSync: () => true,
        isFirefoxNonSync: () => false,
      };

      renderHook(() => useFxAStatus(integration));
      await waitFor(() => {
        expect(firefox.fxaStatus).toHaveBeenCalled();
      });

      expect(firefox.fxaStatus).toHaveBeenCalledWith({
        context: Constants.FX_DESKTOP_V3_CONTEXT,
        isPairing: false,
        service: Constants.SYNC_SERVICE,
      });
    });
  });

  describe('OAuth native integration', () => {
    it('calls fxaStatus with correct args', async () => {
      (firefox.fxaStatus as jest.Mock).mockResolvedValue({
        capabilities: {
          engines: ['history'],
          choose_what_to_sync: true,
        },
      });

      const integration = {
        type: IntegrationType.OAuthNative,
        isSync: () => true,
        isFirefoxNonSync: () => false,
      };

      renderHook(() => useFxAStatus(integration));
      await waitFor(() => {
        expect(firefox.fxaStatus).toHaveBeenCalled();
      });

      expect(firefox.fxaStatus).toHaveBeenCalledWith({
        context: Constants.OAUTH_CONTEXT,
        isPairing: false,
        service: Constants.SYNC_SERVICE,
      });
    });

    it('returns expected data', async () => {
      (firefox.fxaStatus as jest.Mock).mockResolvedValue({
        capabilities: {
          engines: ['tabs', 'bookmarks', 'addons'],
          choose_what_to_sync: true,
        },
      });

      const integration = {
        type: IntegrationType.OAuthNative,
        isSync: () => true,
        isFirefoxNonSync: () => false,
      };

      const { result } = renderHook(() => useFxAStatus(integration));

      await waitFor(() => {
        expect(result.current.offeredSyncEngines).toEqual(
          expect.arrayContaining(['tabs', 'bookmarks', 'addons'])
        );
      });

      expect(result.current.selectedEnginesForGlean).toEqual({
        tabs: true,
        bookmarks: true,
        addons: true,
      });
    });

    describe('keys_optional capability', () => {
      beforeEach(() => {
        (firefox.fxaStatus as jest.Mock).mockResolvedValue({
          capabilities: {
            engines: [],
            keys_optional: true,
          },
        });
      });

      it('returns supportsKeysOptionalLogin: true when Relay or SmartWindow service', async () => {
        const integration = {
          type: IntegrationType.OAuthNative,
          isSync: () => false,
          isFirefoxNonSync: () => true,
        };
        const { result } = renderHook(() => useFxAStatus(integration));

        await waitFor(() => {
          expect(result.current.supportsKeysOptionalLogin).toBe(true);
        });
      });

      it('returns supportsKeysOptionalLogin: false for Sync', async () => {
        const integration = {
          type: IntegrationType.OAuthNative,
          isSync: () => true,
          isFirefoxNonSync: () => false,
        };
        const { result } = renderHook(() => useFxAStatus(integration));

        // supportsKeysOptionalLogin also starts false, so waiting on it
        // directly would pass before the response landed. Wait on a value that
        // only becomes defined once it has, then assert it stayed false.
        await waitFor(() => {
          expect(result.current.supportsCanLinkAccountUid).toBeDefined();
        });
        expect(result.current.supportsKeysOptionalLogin).toBe(false);
      });
    });
  });

  describe('pairing capabilities', () => {
    const integration = {
      type: IntegrationType.OAuthNative,
      isSync: () => true,
      isFirefoxNonSync: () => false,
    };

    const mockCapabilities = (
      capabilities: Record<string, unknown> | undefined
    ) => {
      (firefox.fxaStatus as jest.Mock).mockResolvedValue({ capabilities });
    };

    // pairingEnabled/pairingVersion/hasSyncKeys start at false/1/undefined,
    // which several cases below also expect as their result. Waiting on those
    // values directly would pass before the response was ever applied, so wait
    // on supportsCanLinkAccountUid instead: it starts undefined and is set on
    // every response path, making it a true "settled" signal.
    const renderSettled = async () => {
      const { result } = renderHook(() => useFxAStatus(integration));
      await waitFor(() => {
        expect(result.current.supportsCanLinkAccountUid).toBeDefined();
      });
      return result;
    };

    it('returns pairingEnabled: true when the browser reports the pairing capability', async () => {
      mockCapabilities({ engines: [], pairing: true });

      const result = await renderSettled();

      expect(result.current.pairingEnabled).toBe(true);
    });

    it('returns pairingEnabled: false when the pairing capability is absent', async () => {
      mockCapabilities({ engines: [] });

      const result = await renderSettled();

      expect(result.current.pairingEnabled).toBe(false);
    });

    it('returns the pairingVersion reported by the browser', async () => {
      mockCapabilities({ engines: [], pairing: true, pairingVersion: 2 });

      const result = await renderSettled();

      expect(result.current.pairingVersion).toBe(2);
    });

    it('defaults pairingVersion to 1 when the browser omits it', async () => {
      mockCapabilities({ engines: [], pairing: true });

      const result = await renderSettled();

      expect(result.current.pairingVersion).toBe(1);
    });

    it('defaults pairingVersion to 1 when the browser reports version 0', async () => {
      mockCapabilities({ engines: [], pairing: true, pairingVersion: 0 });

      const result = await renderSettled();

      expect(result.current.pairingVersion).toBe(1);
    });

    it('returns the hasSyncKeys when browser reports true', async () => {
      mockCapabilities({ engines: [], hasSyncKeys: true });

      const result = await renderSettled();

      expect(result.current.hasSyncKeys).toBe(true);
    });

    it('returns the hasSyncKeys when browser reports false', async () => {
      mockCapabilities({ engines: [], hasSyncKeys: false });

      const result = await renderSettled();

      expect(result.current.hasSyncKeys).toBe(false);
    });

    it('returns the hasSyncKeys when browser does not report', async () => {
      mockCapabilities({ engines: [] });

      const result = await renderSettled();

      expect(result.current.hasSyncKeys).toBe(undefined);
    });

    // Very old versions of Firefox iOS omit `capabilities` entirely.
    it('returns the pairing defaults when the response has no capabilities', async () => {
      mockCapabilities(undefined);

      const result = await renderSettled();

      expect(result.current.pairingEnabled).toBe(false);
      expect(result.current.pairingVersion).toBe(1);
    });
  });

  describe('Web integration', () => {
    it('does not call fxaStatus', () => {
      const integration = {
        type: IntegrationType.Web,
        isSync: () => false,
        isFirefoxNonSync: () => false,
      };

      renderHook(() => useFxAStatus(integration));

      expect(firefox.fxaStatus).not.toHaveBeenCalled();
    });

    it('returns the pairing defaults without querying the browser', () => {
      const integration = {
        type: IntegrationType.Web,
        isSync: () => false,
        isFirefoxNonSync: () => false,
      };

      const { result } = renderHook(() => useFxAStatus(integration));

      expect(result.current.pairingEnabled).toBe(false);
      expect(result.current.pairingVersion).toBe(1);
    });
  });

  describe('Non-Firefox browser', () => {
    it('does not call fxaStatus when isProbablyFirefox returns false', () => {
      (isProbablyFirefox as jest.Mock).mockReturnValueOnce(false);

      const integration = {
        type: IntegrationType.SyncDesktopV3,
        isSync: () => true,
        isFirefoxNonSync: () => false,
      };

      renderHook(() => useFxAStatus(integration));
      expect(firefox.fxaStatus).not.toHaveBeenCalled();
    });
  });
});
