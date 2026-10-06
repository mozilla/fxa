/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { act, renderHook, waitFor } from '@testing-library/react';
import {
  PAIRING_FXA_STATUS_TIMEOUT_MS,
  isPairingEntryPathname,
  useFxAStatus,
} from '.';
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

const FIREFOX_DESKTOP_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:158.0) ' +
  'Gecko/20100101 Firefox/158.0';
const FIREFOX_ANDROID_UA =
  'Mozilla/5.0 (Android 14; Mobile; rv:158.0) Gecko/158.0 Firefox/158.0';

describe('useFxAStatus', () => {
  // jsdom's own user agent names no Firefox flavour, so a test that depends on
  // the device sets one and gets the real value back afterwards.
  const realUserAgent = navigator.userAgent;
  const withUserAgent = (value: string) => {
    Object.defineProperty(navigator, 'userAgent', {
      value,
      configurable: true,
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (isProbablyFirefox as jest.Mock).mockImplementation(() => true);
  });

  afterEach(() => {
    withUserAgent(realUserAgent);
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
        isPairing: () => false,
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
      await waitFor(() => {
        expect(firefox.fxaStatus).toHaveBeenCalled();
      });

      expect(firefox.fxaStatus).toHaveBeenCalledWith({
        context: Constants.OAUTH_CONTEXT,
        isPairing: true,
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
        isPairing: () => false,
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
          isPairing: () => false,
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
          isPairing: () => false,
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
      isPairing: () => false,
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

      expect(result.current.fxaStatus?.capabilities.pairing).toBe(true);
    });

    it('returns pairingEnabled: false when the pairing capability is absent', async () => {
      mockCapabilities({ engines: [] });

      const result = await renderSettled();

      expect(result.current.fxaStatus?.capabilities.pairing).toBe(false);
    });

    it('returns the pairingVersion reported by the browser', async () => {
      mockCapabilities({ engines: [], pairing: true, pairingVersion: 2 });

      const result = await renderSettled();

      expect(result.current.fxaStatus?.capabilities.pairingVersion).toBe(2);
    });

    it('defaults pairingVersion to 1 when the browser omits it', async () => {
      mockCapabilities({ engines: [], pairing: true });

      const result = await renderSettled();

      expect(result.current.fxaStatus?.capabilities.pairingVersion).toBe(1);
    });

    it('defaults pairingVersion to 1 when the browser reports version 0', async () => {
      mockCapabilities({ engines: [], pairing: true, pairingVersion: 0 });

      const result = await renderSettled();

      expect(result.current.fxaStatus?.capabilities.pairingVersion).toBe(1);
    });

    it('returns the hasSyncKeys when browser reports true', async () => {
      mockCapabilities({ engines: [], hasSyncKeys: true });

      const result = await renderSettled();

      expect(result.current.fxaStatus?.capabilities.hasSyncKeys).toBe(true);
    });

    it('returns the hasSyncKeys when browser reports false', async () => {
      mockCapabilities({ engines: [], hasSyncKeys: false });

      const result = await renderSettled();

      expect(result.current.fxaStatus?.capabilities.hasSyncKeys).toBe(false);
    });

    it('returns the hasSyncKeys when browser does not report', async () => {
      mockCapabilities({ engines: [] });

      const result = await renderSettled();

      expect(result.current.fxaStatus?.capabilities.hasSyncKeys).toBe(
        undefined
      );
    });

    // Very old versions of Firefox iOS omit `capabilities` entirely.
    it('returns the pairing defaults when the response has no capabilities', async () => {
      mockCapabilities(undefined);

      const result = await renderSettled();

      expect(result.current.fxaStatus?.capabilities.pairing).toBe(false);
      expect(result.current.fxaStatus?.capabilities.pairingVersion).toBe(1);
    });
  });

  // firefox.fxaStatus gives up after a bounded number of attempts, and callers
  // like Pair/Index render a spinner while `fxaStatus` is undefined. Settling on
  // the defaults is what keeps a dropped web channel message from hanging them.
  describe('browser never answers', () => {
    const integration = {
      type: IntegrationType.PairingAuthority,
      isSync: () => true,
      isFirefoxNonSync: () => false,
      isPairing: () => true,
    };

    it('settles on the defaults instead of leaving fxaStatus undefined', async () => {
      (firefox.fxaStatus as jest.Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useFxAStatus(integration));

      await waitFor(() => {
        expect(result.current.fxaStatus).toEqual({
          capabilities: {
            engines: [],
            multiService: false,
            pairing: false,
            pairingVersion: 1,
          },
        });
      });
      expect(result.current.supportsKeysOptionalLogin).toBe(false);
      expect(result.current.supportsCanLinkAccountUid).toBe(false);
    });

    it('reports unanswered once the attempts are exhausted', async () => {
      (firefox.fxaStatus as jest.Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useFxAStatus(integration));

      await waitFor(() => {
        expect(result.current.fxaStatusState).toBe('unanswered');
      });
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

      expect(result.current.fxaStatus?.capabilities.pairing).toBe(false);
      expect(result.current.fxaStatus?.capabilities.pairingVersion).toBe(1);
    });
  });

  // A plain /pair with no context builds a Web integration, but the page still
  // has to negotiate the pairing version with the browser.
  describe('Web integration on a pairing entry page', () => {
    const integration = {
      type: IntegrationType.Web,
      isSync: () => false,
      isFirefoxNonSync: () => false,
      isPairing: () => false,
    };

    it('asks the browser as a pairing flow', async () => {
      (firefox.fxaStatus as jest.Mock).mockResolvedValue({
        capabilities: { engines: [], pairing: true, pairingVersion: 2 },
      });

      const { result } = renderHook(() =>
        useFxAStatus(integration, { pathname: '/pair' })
      );
      expect(result.current.fxaStatusState).toBe('pending');
      expect(result.current.fxaStatus).toBeUndefined();

      await waitFor(() => {
        expect(result.current.fxaStatusState).toBe('answered');
      });
      expect(firefox.fxaStatus).toHaveBeenCalledWith(
        expect.objectContaining({ isPairing: true })
      );
      expect(result.current.fxaStatus?.capabilities.pairingVersion).toBe(2);
    });

    it('gives up on a browser that never answers', () => {
      jest.useFakeTimers();
      (firefox.fxaStatus as jest.Mock).mockReturnValue(new Promise(() => {}));

      const { result } = renderHook(() =>
        useFxAStatus(integration, { pathname: '/connect_another_device' })
      );
      act(() => {
        jest.advanceTimersByTime(PAIRING_FXA_STATUS_TIMEOUT_MS);
      });

      expect(result.current.fxaStatusState).toBe('unanswered');
      jest.useRealTimers();
    });
  });

  describe('isPairingEntryPathname', () => {
    it.each(['/pair', '/pair/', '/connect_another_device'])(
      'matches %s',
      (pathname) => {
        expect(isPairingEntryPathname(pathname)).toBe(true);
      }
    );

    it.each(['/pair/supp', '/pair/authority/scan_qr', '/settings', undefined])(
      'does not match %s',
      (pathname) => {
        expect(isPairingEntryPathname(pathname)).toBe(false);
      }
    );
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

  describe('fxaStatusState', () => {
    const pairingIntegration = {
      type: IntegrationType.PairingSupplicant,
      isSync: () => false,
      isFirefoxNonSync: () => false,
      isPairing: () => true,
    };
    const syncIntegration = {
      type: IntegrationType.SyncDesktopV3,
      isSync: () => true,
      isFirefoxNonSync: () => false,
      isPairing: () => false,
    };

    it('settles on unanswered without asking a browser that is not Firefox', () => {
      (isProbablyFirefox as jest.Mock).mockImplementation(() => false);

      const { result } = renderHook(() => useFxAStatus(pairingIntegration));

      expect(result.current.fxaStatusState).toBe('unanswered');
      expect(firefox.fxaStatus).not.toHaveBeenCalled();
    });

    it('reports answered once the browser replies', async () => {
      (firefox.fxaStatus as jest.Mock).mockResolvedValue({
        capabilities: { engines: [], pairing: true, pairingVersion: 2 },
      });

      const { result } = renderHook(() => useFxAStatus(pairingIntegration));

      await waitFor(() => {
        expect(result.current.fxaStatusState).toBe('answered');
      });
    });

    describe('when the browser looks like Firefox but never answers', () => {
      beforeEach(() => {
        jest.useFakeTimers();
        // Never settles — an in-app WebView or a spoofed user agent.
        (firefox.fxaStatus as jest.Mock).mockReturnValue(new Promise(() => {}));
      });

      afterEach(() => {
        jest.useRealTimers();
      });

      it('stays pending until the deadline passes', () => {
        const { result } = renderHook(() => useFxAStatus(pairingIntegration));

        act(() => {
          jest.advanceTimersByTime(PAIRING_FXA_STATUS_TIMEOUT_MS - 1);
        });

        expect(result.current.fxaStatusState).toBe('pending');
      });

      it('settles on unanswered with the defaults once the deadline passes', () => {
        const { result } = renderHook(() => useFxAStatus(pairingIntegration));

        act(() => {
          jest.advanceTimersByTime(PAIRING_FXA_STATUS_TIMEOUT_MS);
        });

        expect(result.current.fxaStatusState).toBe('unanswered');
        expect(result.current.fxaStatus?.capabilities.pairingVersion).toBe(1);
      });

      // The deadline must never cost a real Firefox its capabilities, which is
      // why it lives here rather than as a race inside firefox.fxaStatus().
      it('lets a reply that lands after the deadline win', async () => {
        let reply: (value: unknown) => void = () => {};
        (firefox.fxaStatus as jest.Mock).mockReturnValue(
          new Promise((resolve) => {
            reply = resolve;
          })
        );

        const { result } = renderHook(() => useFxAStatus(pairingIntegration));

        act(() => {
          jest.advanceTimersByTime(PAIRING_FXA_STATUS_TIMEOUT_MS);
        });
        expect(result.current.fxaStatusState).toBe('unanswered');

        // The reply resolves a promise rather than firing a timer, so flush
        // microtasks inside act() instead of waiting on fake timers.
        await act(async () => {
          reply({
            capabilities: { engines: [], pairing: true, pairingVersion: 2 },
          });
        });

        expect(result.current.fxaStatusState).toBe('answered');
        expect(result.current.fxaStatus?.capabilities.pairingVersion).toBe(2);
      });

      // Only pairing blocks the page on the reply, so only pairing pays a
      // deadline. Everywhere else a discarded reply would be a regression.
      it('never schedules a deadline for a non-pairing sync flow', () => {
        const { result } = renderHook(() => useFxAStatus(syncIntegration));

        expect(jest.getTimerCount()).toBe(0);

        act(() => {
          jest.advanceTimersByTime(PAIRING_FXA_STATUS_TIMEOUT_MS * 10);
        });

        expect(result.current.fxaStatusState).toBe('pending');
      });

      it('still pays the deadline on Firefox for Android', () => {
        withUserAgent(FIREFOX_ANDROID_UA);
        const { result } = renderHook(() => useFxAStatus(pairingIntegration));

        act(() => {
          jest.advanceTimersByTime(PAIRING_FXA_STATUS_TIMEOUT_MS);
        });

        expect(result.current.fxaStatusState).toBe('unanswered');
      });

      // Several /pair tabs opened at once answer well after the deadline, and a
      // default taken before then routes a v2 desktop down the v1 flow.
      describe('on Firefox desktop', () => {
        beforeEach(() => {
          withUserAgent(FIREFOX_DESKTOP_UA);
        });

        it('never schedules a deadline', () => {
          const { result } = renderHook(() => useFxAStatus(pairingIntegration));

          expect(jest.getTimerCount()).toBe(0);

          act(() => {
            jest.advanceTimersByTime(PAIRING_FXA_STATUS_TIMEOUT_MS * 10);
          });

          expect(result.current.fxaStatusState).toBe('pending');
          expect(result.current.fxaStatus).toBeUndefined();
        });

        it('settles on the reply however late it lands', async () => {
          let reply: (value: unknown) => void = () => {};
          (firefox.fxaStatus as jest.Mock).mockReturnValue(
            new Promise((resolve) => {
              reply = resolve;
            })
          );

          const { result } = renderHook(() => useFxAStatus(pairingIntegration));

          act(() => {
            jest.advanceTimersByTime(PAIRING_FXA_STATUS_TIMEOUT_MS * 10);
          });
          await act(async () => {
            reply({
              capabilities: { engines: [], pairing: true, pairingVersion: 2 },
            });
          });

          expect(result.current.fxaStatusState).toBe('answered');
          expect(result.current.fxaStatus?.capabilities.pairingVersion).toBe(2);
        });

        it('settles on unanswered once firefox.fxaStatus gives up', async () => {
          let giveUp: (value: unknown) => void = () => {};
          (firefox.fxaStatus as jest.Mock).mockReturnValue(
            new Promise((resolve) => {
              giveUp = resolve;
            })
          );

          const { result } = renderHook(() => useFxAStatus(pairingIntegration));

          await act(async () => {
            giveUp(undefined);
          });

          expect(result.current.fxaStatusState).toBe('unanswered');
          expect(result.current.fxaStatus?.capabilities.pairingVersion).toBe(1);
        });
      });
    });
  });
});
