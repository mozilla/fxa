/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { renderHook } from '@testing-library/react-hooks';
import { useFxAStatus } from '.';
import { Constants } from '../../constants';
import firefox from '../../channels/firefox';
import { IntegrationType } from '../../../models';

jest.mock('../../channels/firefox', () => ({
  __esModule: true,
  default: {
    fxaStatus: jest.fn(),
  },
}));

describe('useFxAStatus', () => {
  beforeEach(() => {
    jest.resetAllMocks();
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

      const { waitForNextUpdate } = renderHook(() => useFxAStatus(integration));
      await waitForNextUpdate();

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

      const { waitForNextUpdate } = renderHook(() => useFxAStatus(integration));
      await waitForNextUpdate();

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

      const { result, waitForNextUpdate } = renderHook(() =>
        useFxAStatus(integration)
      );

      await waitForNextUpdate();
      expect(result.current.offeredSyncEngines).toEqual(
        expect.arrayContaining(['tabs', 'bookmarks', 'addons'])
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

      it('returns supportsKeysOptionalLogin: true when Relay or AiWindow service', async () => {
        const integration = {
          type: IntegrationType.OAuthNative,
          isSync: () => false,
          isFirefoxNonSync: () => true,
        };
        const { result, waitForNextUpdate } = renderHook(() =>
          useFxAStatus(integration)
        );

        await waitForNextUpdate();
        expect(result.current.supportsKeysOptionalLogin).toBe(true);
      });

      it('returns supportsKeysOptionalLogin: false for Sync', async () => {
        const integration = {
          type: IntegrationType.OAuthNative,
          isSync: () => true,
          isFirefoxNonSync: () => false,
        };
        const { result } = renderHook(() => useFxAStatus(integration));
        expect(result.current.supportsKeysOptionalLogin).toBe(false);
      });
    });
  });

  describe('Web integration', () => {
    it('does not call fxaStatus', () => {
      const integration = {
        type: IntegrationType.Web,
        isSync: () => false,
      };

      renderHook(() => useFxAStatus(integration));

      expect(firefox.fxaStatus).not.toHaveBeenCalled();
    });
  });
});
