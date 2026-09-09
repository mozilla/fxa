/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*
 * These tests assert how we react to a sequence of events, not that iOS
 * produces that sequence — the latter is device behaviour a jsdom test cannot
 * honestly assert. The sequences below are the ones recorded on-device in the
 * module's header comment.
 */

import {
  armStoreFallback,
  STORE_FALLBACK_GRACE_MS,
  STORE_FALLBACK_TIMEOUT_MS,
} from './store-fallback';

/**
 * A stand-in for window/document that lets a test drive the exact event order
 * iOS produces, and inspect listener bookkeeping.
 */
function createHost() {
  const listeners = new Map<string, Set<EventListener>>();
  let visibility: DocumentVisibilityState = 'visible';

  const add = (type: string, fn: EventListener) => {
    const set = listeners.get(type) ?? new Set();
    set.add(fn);
    listeners.set(type, set);
  };
  const remove = (type: string, fn: EventListener) => {
    listeners.get(type)?.delete(fn);
  };

  const target = {
    addEventListener: jest.fn(add),
    removeEventListener: jest.fn(remove),
    setTimeout: ((fn: () => void, ms?: number) =>
      setTimeout(fn, ms)) as unknown as Window['setTimeout'],
    clearTimeout: ((id?: number) =>
      clearTimeout(id)) as unknown as Window['clearTimeout'],
  };

  const doc = {
    addEventListener: jest.fn(add),
    removeEventListener: jest.fn(remove),
    get hidden() {
      return visibility === 'hidden';
    },
    get visibilityState() {
      return visibility;
    },
  } as unknown as Document;

  return {
    win: target,
    doc,
    listenerCount: () =>
      [...listeners.values()].reduce((total, set) => total + set.size, 0),
    setVisibility(next: DocumentVisibilityState) {
      visibility = next;
    },
    fire(type: string) {
      [...(listeners.get(type) ?? [])].forEach((fn) =>
        fn(new Event(type) as Event)
      );
    },
  };
}

function arm(host: ReturnType<typeof createHost>, onFallback: jest.Mock) {
  return armStoreFallback({ onFallback, win: host.win, doc: host.doc });
}

describe('armStoreFallback', () => {
  let host: ReturnType<typeof createHost>;
  let onFallback: jest.Mock;

  beforeEach(() => {
    jest.useFakeTimers();
    host = createHost();
    onFallback = jest.fn();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // The scheme no-ops with no dialog at all, so there is no blur/focus pair to
  // key off and the backstop timer owns the decision.
  it('falls back when the scheme no-ops silently', () => {
    arm(host, onFallback);

    jest.advanceTimersByTime(STORE_FALLBACK_TIMEOUT_MS);

    expect(onFallback).toHaveBeenCalledTimes(1);
  });

  // The highest-value case: a dialog is on screen and the user is slow to tap
  // "Open". A bare timer would send them to the store mid-dialog.
  it('does not fall back on the backstop timer once a dialog has appeared', () => {
    arm(host, onFallback);

    host.fire('blur');
    jest.advanceTimersByTime(STORE_FALLBACK_TIMEOUT_MS);

    expect(onFallback).not.toHaveBeenCalled();
  });

  // not installed: blur ("address is invalid") -> focus (tapped OK) -> nothing.
  it('falls back when focus returns and nothing follows it', () => {
    arm(host, onFallback);

    host.fire('blur');
    host.fire('focus');
    jest.advanceTimersByTime(STORE_FALLBACK_GRACE_MS);

    expect(onFallback).toHaveBeenCalledTimes(1);
  });

  it('does not fall back while the grace window is still open', () => {
    arm(host, onFallback);

    host.fire('blur');
    host.fire('focus');
    jest.advanceTimersByTime(STORE_FALLBACK_GRACE_MS - 1);

    expect(onFallback).not.toHaveBeenCalled();
  });

  // installed: focus comes back BEFORE Safari is backgrounded, so each of these
  // three signals arrives after the grace window has already opened.
  describe('when the app takes the foreground after focus returns', () => {
    it('cancels the fallback on visibilitychange to hidden', () => {
      arm(host, onFallback);

      host.fire('blur');
      host.fire('focus');
      host.setVisibility('hidden');
      host.fire('visibilitychange');
      jest.advanceTimersByTime(STORE_FALLBACK_GRACE_MS);

      expect(onFallback).not.toHaveBeenCalled();
    });

    it('cancels the fallback on pagehide', () => {
      arm(host, onFallback);

      host.fire('blur');
      host.fire('focus');
      host.fire('pagehide');
      jest.advanceTimersByTime(STORE_FALLBACK_GRACE_MS);

      expect(onFallback).not.toHaveBeenCalled();
    });

    // Holds together on any iOS version where visibilitychange does not fire
    // for an app switch.
    it('cancels the fallback on a second blur', () => {
      arm(host, onFallback);

      host.fire('blur');
      host.fire('focus');
      host.fire('blur');
      jest.advanceTimersByTime(STORE_FALLBACK_GRACE_MS);

      expect(onFallback).not.toHaveBeenCalled();
    });
  });

  it('does not fall back while the page is not visible', () => {
    arm(host, onFallback);

    host.setVisibility('hidden');
    jest.advanceTimersByTime(STORE_FALLBACK_TIMEOUT_MS);

    expect(onFallback).toHaveBeenCalledTimes(0);
  });

  it('falls back only once', () => {
    arm(host, onFallback);

    jest.advanceTimersByTime(STORE_FALLBACK_TIMEOUT_MS);
    host.fire('blur');
    host.fire('focus');
    jest.advanceTimersByTime(STORE_FALLBACK_GRACE_MS);

    expect(onFallback).toHaveBeenCalledTimes(1);
  });

  describe('teardown', () => {
    it('removes every listener it added', () => {
      const teardown = arm(host, onFallback);
      expect(host.listenerCount()).toBe(4);

      teardown();

      expect(host.listenerCount()).toBe(0);
    });

    it('stops the backstop timer from firing', () => {
      const teardown = arm(host, onFallback);

      teardown();
      jest.advanceTimersByTime(STORE_FALLBACK_TIMEOUT_MS);

      expect(onFallback).not.toHaveBeenCalled();
    });

    it('stops an open grace window from firing', () => {
      const teardown = arm(host, onFallback);

      host.fire('blur');
      host.fire('focus');
      teardown();
      jest.advanceTimersByTime(STORE_FALLBACK_GRACE_MS);

      expect(onFallback).not.toHaveBeenCalled();
    });

    it('is safe to call twice', () => {
      const teardown = arm(host, onFallback);

      teardown();
      expect(() => teardown()).not.toThrow();
    });
  });
});
