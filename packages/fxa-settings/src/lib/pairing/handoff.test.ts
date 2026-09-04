/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Devices } from '../utilities';
import {
  claimAutoAttempt,
  HANDOFF_ATTEMPT_KEY_PREFIX,
  planPairingHandoff,
  shouldAutoAttempt,
  StoreLinks,
} from './handoff';

const MOCK_TARGET =
  'https://accounts.firefox.com/pair#channel_id=chan-1&channel_key=key-1&v=2';
const MOCK_OTHER_TARGET =
  'https://accounts.firefox.com/pair#channel_id=chan-2&channel_key=key-2&v=2';
const MOCK_KEY = `${HANDOFF_ATTEMPT_KEY_PREFIX}${MOCK_TARGET}`;
const MOCK_STORE_LINKS: StoreLinks = {
  ios: 'https://apps.apple.com/app/firefox/id989804926',
  android: 'https://play.google.com/store/apps/details?id=org.mozilla.firefox',
};

/** In-memory stand-in for sessionStorage, per test. */
function createStorage(seed: Record<string, string> = {}) {
  const values = new Map(Object.entries(seed));
  return {
    getItem: jest.fn((key: string) => values.get(key) ?? null),
    setItem: jest.fn((key: string, value: string) => {
      values.set(key, value);
    }),
    values,
  };
}

/** Hand-off enabled on both platforms; the iOS gate has its own tests. */
const plan = (device: Devices, storage = createStorage()) =>
  planPairingHandoff({
    device,
    targetUrl: MOCK_TARGET,
    storeLinks: MOCK_STORE_LINKS,
    storage,
    build: 'firefox',
    iosHandoff: true,
  });

describe('planPairingHandoff', () => {
  // Inside Firefox there is nothing to hand off to and `firefox://` is a no-op;
  // on desktop there is no app to open.
  it.each([
    Devices.FIREFOX_ANDROID,
    Devices.FIREFOX_DESKTOP,
    Devices.FIREFOX_IOS,
    Devices.OTHER,
  ])('plans no hand-off for %s', (device) => {
    expect(plan(device)).toEqual({ kind: 'none' });
  });

  it('plans no hand-off when there is no target to hand off', () => {
    expect(
      planPairingHandoff({
        device: Devices.OTHER_IOS,
        targetUrl: '',
        storeLinks: MOCK_STORE_LINKS,
        build: 'firefox',
      })
    ).toEqual({ kind: 'none' });
  });

  describe('on a non-Firefox iOS browser', () => {
    it('opens the target through the Firefox custom scheme', () => {
      expect(plan(Devices.OTHER_IOS)).toEqual({
        kind: 'ios',
        deepLink: `firefox://open-url?url=${encodeURIComponent(MOCK_TARGET)}`,
        storeUrl: MOCK_STORE_LINKS.ios,
      });
    });

    // The fragment carries the pairing channel; losing it in transit would open
    // Firefox on a /pair page with nothing to pair.
    it('percent-encodes the target so its fragment survives', () => {
      const { deepLink } = plan(Devices.OTHER_IOS) as { deepLink: string };
      const url = new URL(deepLink.replace('firefox://', 'https://'));
      expect(url.searchParams.get('url')).toBe(MOCK_TARGET);
    });

    // Firefox iOS cannot finish a pairing it did not start, so handing the URL
    // over only adds a tap in front of /pair/unsupported.
    it('plans no hand-off when the Firefox app cannot act on one', () => {
      expect(
        planPairingHandoff({
          device: Devices.OTHER_IOS,
          targetUrl: MOCK_TARGET,
          storeLinks: MOCK_STORE_LINKS,
          storage: createStorage(),
          build: 'firefox',
          iosHandoff: false,
        })
      ).toEqual({ kind: 'none' });
    });

    it('plans no hand-off by default', () => {
      expect(
        planPairingHandoff({
          device: Devices.OTHER_IOS,
          targetUrl: MOCK_TARGET,
          storeLinks: MOCK_STORE_LINKS,
          storage: createStorage(),
          build: 'firefox',
        })
      ).toEqual({ kind: 'none' });
    });
  });

  describe('on a non-Firefox Android browser', () => {
    it('pins the intent to the Firefox package and carries a store fallback', () => {
      expect(plan(Devices.OTHER_ANDROID)).toEqual({
        kind: 'android',
        deepLink:
          'intent://accounts.firefox.com/pair#channel_id=chan-1&channel_key=key-1&v=2' +
          '#Intent;scheme=https;package=org.mozilla.firefox' +
          `;S.browser_fallback_url=${encodeURIComponent(
            MOCK_STORE_LINKS.android
          )};end`,
        storeUrl: MOCK_STORE_LINKS.android,
        target: MOCK_TARGET,
        autoAttempt: true,
      });
    });

    // Every Firefox iOS flavour registers `firefox`, so a release install and a
    // local build both answer it. The scheme is the only way to pin which one.
    it('defaults the iOS deep link to the release scheme', () => {
      const { deepLink } = plan(Devices.OTHER_IOS) as { deepLink: string };

      expect(deepLink).toBe(
        `firefox://open-url?url=${encodeURIComponent(MOCK_TARGET)}`
      );
    });

    it('opens a build-specific iOS scheme when one is configured', () => {
      const { deepLink } = planPairingHandoff({
        device: Devices.OTHER_IOS,
        targetUrl: MOCK_TARGET,
        storeLinks: MOCK_STORE_LINKS,
        storage: createStorage(),
        build: 'firefox',
        iosScheme: 'fennec',
        iosHandoff: true,
      }) as { deepLink: string };

      expect(deepLink).toBe(
        `fennec://open-url?url=${encodeURIComponent(MOCK_TARGET)}`
      );
    });

    // `;` separates intent extras, so an unencoded store URL would terminate the
    // extra early and let the rest of the URL become extras of its own.
    it('encodes a store URL containing & and ; into a single extra', () => {
      const storeLinks = {
        ...MOCK_STORE_LINKS,
        android: 'https://play.google.com/store?id=firefox&hl=en;end',
      };
      const { deepLink } = planPairingHandoff({
        device: Devices.OTHER_ANDROID,
        targetUrl: MOCK_TARGET,
        storeLinks,
        storage: createStorage(),
        build: 'firefox',
      }) as { deepLink: string };

      expect(deepLink).toContain(
        `;S.browser_fallback_url=${encodeURIComponent(storeLinks.android)};end`
      );
      // The encoded fallback plus the trailing terminator, and nothing more.
      expect(deepLink.split(';end').length - 1).toBe(1);
    });

    it('hands off even while the iOS hand-off is disabled', () => {
      expect(
        planPairingHandoff({
          device: Devices.OTHER_ANDROID,
          targetUrl: MOCK_TARGET,
          storeLinks: MOCK_STORE_LINKS,
          storage: createStorage(),
          build: 'firefox',
          iosHandoff: false,
        })
      ).toEqual(expect.objectContaining({ kind: 'android' }));
    });

    it('does not auto-attempt once the token for this target is spent', () => {
      expect(
        plan(Devices.OTHER_ANDROID, createStorage({ [MOCK_KEY]: '1' }))
      ).toEqual(expect.objectContaining({ autoAttempt: false }));
    });
  });
});

describe('shouldAutoAttempt', () => {
  it('auto-attempts when no attempt has been recorded', () => {
    expect(
      shouldAutoAttempt({ target: MOCK_TARGET, storage: createStorage() })
    ).toBe(true);
  });

  it('does not auto-attempt when this target was already attempted', () => {
    const storage = createStorage({ [MOCK_KEY]: '1' });
    expect(shouldAutoAttempt({ target: MOCK_TARGET, storage })).toBe(false);
  });

  it('auto-attempts for a different target than the one already attempted', () => {
    const storage = createStorage({ [MOCK_KEY]: '1' });
    expect(shouldAutoAttempt({ target: MOCK_OTHER_TARGET, storage })).toBe(
      true
    );
  });

  // Without a spent-token record we cannot stop a Play Store bounce loop, so
  // the manual CTA is the safe way to fail.
  it('does not auto-attempt when storage is unavailable', () => {
    expect(shouldAutoAttempt({ target: MOCK_TARGET })).toBe(false);
  });

  it('does not auto-attempt when reading storage throws', () => {
    const storage = createStorage();
    storage.getItem.mockImplementation(() => {
      throw new DOMException('SecurityError');
    });
    expect(shouldAutoAttempt({ target: MOCK_TARGET, storage })).toBe(false);
  });
});

describe('claimAutoAttempt', () => {
  it('records the attempt against the target key', () => {
    const storage = createStorage();
    claimAutoAttempt(MOCK_TARGET, storage);
    expect(storage.setItem).toHaveBeenCalledWith(MOCK_KEY, '1');
  });

  it('returns true when the attempt was recorded', () => {
    expect(claimAutoAttempt(MOCK_TARGET, createStorage())).toBe(true);
  });

  it('makes a second shouldAutoAttempt for the same target return false', () => {
    const storage = createStorage();
    claimAutoAttempt(MOCK_TARGET, storage);
    expect(shouldAutoAttempt({ target: MOCK_TARGET, storage })).toBe(false);
  });

  // A getItem that works alongside a setItem that throws would otherwise
  // re-attempt forever.
  it('returns false when writing throws, so the caller does not navigate', () => {
    const storage = createStorage();
    storage.setItem.mockImplementation(() => {
      throw new DOMException('QuotaExceededError');
    });
    expect(claimAutoAttempt(MOCK_TARGET, storage)).toBe(false);
  });

  it('returns false when storage is unavailable', () => {
    expect(claimAutoAttempt(MOCK_TARGET, undefined)).toBe(false);
  });
});
