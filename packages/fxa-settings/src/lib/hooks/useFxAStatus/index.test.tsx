/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { renderHook, waitFor } from '@testing-library/react';
import { useFxAStatus, UseFxAStatusResult } from '.';
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

// `pairingEnabled` is undefined until the fxa_status response is processed, so it
// doubles as the signal that the hook has consumed the browser's answer. Tests
// whose expected value equals the hook's initial state need this — waiting on the
// assertion itself would pass before the browser ever replied.
const waitForBrowserResponse = (result: { current: UseFxAStatusResult }) =>
  waitFor(() => expect(result.current.pairingEnabled).toBeDefined());

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
        isPairing: () => false,
      };

      renderHook(() => useFxAStatus(integration));

      await waitFor(() =>
        expect(firefox.fxaStatus).toHaveBeenCalledWith({
          context: Constants.FX_DESKTOP_V3_CONTEXT,
          isPairing: false,
          service: Constants.SYNC_SERVICE,
        })
      );
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
        isPairing: () => false,
      };

      renderHook(() => useFxAStatus(integration));

      await waitFor(() =>
        expect(firefox.fxaStatus).toHaveBeenCalledWith({
          context: Constants.OAUTH_CONTEXT,
          isPairing: false,
          service: Constants.SYNC_SERVICE,
        })
      );
    });

    // The browser answers a pairing request differently, so the flag has to
    // reach it rather than being hardcoded false as it was before pairing v2.
    it('sends isPairing: true for a pairing integration', async () => {
      (firefox.fxaStatus as jest.Mock).mockResolvedValue({
        capabilities: { engines: [] },
      });

      const integration = {
        type: IntegrationType.PairingAuthority,
        isSync: () => true,
        isFirefoxNonSync: () => false,
        isPairing: () => true,
      };

      renderHook(() => useFxAStatus(integration));

      await waitFor(() =>
        expect(firefox.fxaStatus).toHaveBeenCalledWith({
          context: Constants.OAUTH_CONTEXT,
          isPairing: true,
          service: Constants.SYNC_SERVICE,
        })
      );
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
        isPairing: () => false,
      };

      const { result } = renderHook(() => useFxAStatus(integration));

      await waitFor(() =>
        expect(result.current.offeredSyncEngines).toEqual(
          expect.arrayContaining(['tabs', 'bookmarks', 'addons'])
        )
      );

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
          isPairing: () => false,
        };
        const { result } = renderHook(() => useFxAStatus(integration));

        await waitFor(() =>
          expect(result.current.supportsKeysOptionalLogin).toBe(true)
        );
      });

      it('returns supportsKeysOptionalLogin: false for Sync', async () => {
        const integration = {
          type: IntegrationType.OAuthNative,
          isSync: () => true,
          isFirefoxNonSync: () => false,
          isPairing: () => false,
        };
        const { result } = renderHook(() => useFxAStatus(integration));

        await waitForBrowserResponse(result);
        expect(result.current.supportsKeysOptionalLogin).toBe(false);
      });
    });
  });

  describe('pairing capabilities', () => {
    const integration = {
      type: IntegrationType.OAuthNative,
      isSync: () => true,
      isFirefoxNonSync: () => false,
      isPairing: () => false,
    };

    const mockCapabilities = (
      capabilities: Record<string, unknown> | undefined
    ) => {
      (firefox.fxaStatus as jest.Mock).mockResolvedValue({ capabilities });
    };

    it('returns pairingEnabled: true when the browser reports the pairing capability', async () => {
      mockCapabilities({ engines: [], pairing: true });

      const { result } = renderHook(() => useFxAStatus(integration));

      await waitFor(() => expect(result.current.pairingEnabled).toBe(true));
    });

    it('returns pairingEnabled: false when the pairing capability is absent', async () => {
      mockCapabilities({ engines: [] });

      const { result } = renderHook(() => useFxAStatus(integration));

      await waitFor(() => expect(result.current.pairingEnabled).toBe(false));
    });

    it('returns the pairingVersion reported by the browser', async () => {
      mockCapabilities({ engines: [], pairing: true, pairingVersion: 2 });

      const { result } = renderHook(() => useFxAStatus(integration));

      await waitFor(() => expect(result.current.pairingVersion).toBe(2));
    });

    it('defaults pairingVersion to 1 when the browser omits it', async () => {
      mockCapabilities({ engines: [], pairing: true });

      const { result } = renderHook(() => useFxAStatus(integration));

      await waitFor(() => expect(result.current.pairingVersion).toBe(1));
    });

    it('defaults pairingVersion to 1 when the browser reports version 0', async () => {
      mockCapabilities({ engines: [], pairing: true, pairingVersion: 0 });

      const { result } = renderHook(() => useFxAStatus(integration));

      await waitFor(() => expect(result.current.pairingVersion).toBe(1));
    });

    it('returns the hasSyncKeys when browser reports true', async () => {
      mockCapabilities({ engines: [], hasSyncKeys: true });

      const { result } = renderHook(() => useFxAStatus(integration));

      await waitFor(() => expect(result.current.hasSyncKeys).toBe(true));
    });

    it('returns the hasSyncKeys when browser reports false', async () => {
      mockCapabilities({ engines: [], hasSyncKeys: false });

      const { result } = renderHook(() => useFxAStatus(integration));

      await waitFor(() => expect(result.current.hasSyncKeys).toBe(false));
    });

    it('returns the hasSyncKeys when browser does not report', async () => {
      mockCapabilities({ engines: [] });

      const { result } = renderHook(() => useFxAStatus(integration));

      await waitForBrowserResponse(result);
      expect(result.current.hasSyncKeys).toBe(undefined);
    });

    // Very old versions of Firefox iOS omit `capabilities` entirely.
    it('returns the pairing defaults when the response has no capabilities', async () => {
      mockCapabilities(undefined);

      const { result } = renderHook(() => useFxAStatus(integration));

      await waitFor(() => expect(result.current.pairingEnabled).toBe(false));
      expect(result.current.pairingVersion).toBe(1);
    });
  });

  describe('Web integration', () => {
    it('does not call fxaStatus', () => {
      const integration = {
        type: IntegrationType.Web,
        isSync: () => false,
        isFirefoxNonSync: () => false,
        isPairing: () => false,
      };

      renderHook(() => useFxAStatus(integration));

      expect(firefox.fxaStatus).not.toHaveBeenCalled();
    });

    it('returns the pairing defaults without querying the browser', () => {
      const integration = {
        type: IntegrationType.Web,
        isSync: () => false,
        isFirefoxNonSync: () => false,
        isPairing: () => false,
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
        isPairing: () => false,
      };

      renderHook(() => useFxAStatus(integration));
      expect(firefox.fxaStatus).not.toHaveBeenCalled();
    });
  });
});
