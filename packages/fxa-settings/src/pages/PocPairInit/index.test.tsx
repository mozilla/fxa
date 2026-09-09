/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*
 * FXA-13863 — covers only the Android auto-attempt guard, not the whole
 * (throwaway) page. That guard is worth pinning because every way it can break is
 * silent and user-visible: too permissive and Back from the Play Store bounces the
 * user straight back out; too strict and Android silently regresses to needing a
 * tap. The iOS blur/focus state machine is deliberately not covered here — it is
 * device behaviour a jsdom test cannot honestly assert.
 */

import {
  AUTO_ATTEMPT_KEY_PREFIX,
  claimAutoAttempt,
  shouldAutoAttempt,
} from '.';

const MOCK_TARGET =
  'https://accounts.firefox.com/poc_pair_start?channel_id=abc';
const MOCK_OTHER_TARGET =
  'https://accounts.firefox.com/poc_pair_start?channel_id=xyz';
const MOCK_KEY = `${AUTO_ATTEMPT_KEY_PREFIX}${MOCK_TARGET}`;

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

const ANDROID_CHROME = {
  isAndroid: true,
  isFirefox: false,
  autoAttempt: true,
  target: MOCK_TARGET,
};

describe('shouldAutoAttempt', () => {
  it('auto-attempts on Android when no attempt has been recorded', () => {
    expect(
      shouldAutoAttempt({ ...ANDROID_CHROME, storage: createStorage() })
    ).toBe(true);
  });

  it('does not auto-attempt when this target was already attempted', () => {
    const storage = createStorage({ [MOCK_KEY]: '1' });
    expect(shouldAutoAttempt({ ...ANDROID_CHROME, storage })).toBe(false);
  });

  it('auto-attempts for a different target than the one already attempted', () => {
    const storage = createStorage({ [MOCK_KEY]: '1' });
    expect(
      shouldAutoAttempt({
        ...ANDROID_CHROME,
        target: MOCK_OTHER_TARGET,
        storage,
      })
    ).toBe(true);
  });

  it('does not auto-attempt on iOS, where the hand-off must come from the tap', () => {
    expect(
      shouldAutoAttempt({
        ...ANDROID_CHROME,
        isAndroid: false,
        storage: createStorage(),
      })
    ).toBe(false);
  });

  it('does not auto-attempt inside Firefox, which navigates to the target directly', () => {
    expect(
      shouldAutoAttempt({
        ...ANDROID_CHROME,
        isFirefox: true,
        storage: createStorage(),
      })
    ).toBe(false);
  });

  it('does not auto-attempt when ?auto=0 opts out', () => {
    expect(
      shouldAutoAttempt({
        ...ANDROID_CHROME,
        autoAttempt: false,
        storage: createStorage(),
      })
    ).toBe(false);
  });

  it('does not auto-attempt when storage is unavailable', () => {
    expect(shouldAutoAttempt({ ...ANDROID_CHROME, storage: undefined })).toBe(
      false
    );
  });

  it('does not auto-attempt when reading storage throws', () => {
    const storage = createStorage();
    storage.getItem.mockImplementation(() => {
      throw new DOMException('SecurityError');
    });
    expect(shouldAutoAttempt({ ...ANDROID_CHROME, storage })).toBe(false);
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
    expect(shouldAutoAttempt({ ...ANDROID_CHROME, storage })).toBe(false);
  });

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
