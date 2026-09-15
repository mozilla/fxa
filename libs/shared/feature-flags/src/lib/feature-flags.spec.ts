/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { createFeatureFlags, httpSource } from './feature-flags';

describe('featureFlags', () => {
  beforeEach(() => {
    jest.useFakeTimers({ now: 1_700_000_000_000 });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  describe('init with a source', () => {
    it('primes the cache before resolving', async () => {
      const ff = createFeatureFlags();
      await ff.init({ source: async () => ({ a: true }), ttlMs: 1000 });
      expect(ff.get('a')).toBe(true);
    });

    it('reports unknown flags as off', async () => {
      const ff = createFeatureFlags();
      await ff.init({ source: async () => ({}), ttlMs: 1000 });
      expect(ff.get('nope')).toBe(false);
    });

    it('does not refetch within the TTL', async () => {
      const source = jest.fn().mockResolvedValue({ a: true });
      const ff = createFeatureFlags();
      await ff.init({ source, ttlMs: 1000 });
      jest.advanceTimersByTime(999);
      ff.get('a');
      expect(source).toHaveBeenCalledTimes(1);
    });

    it('serves stale and refreshes in the background once the TTL elapses', async () => {
      const source = jest
        .fn()
        .mockResolvedValueOnce({ a: true })
        .mockResolvedValueOnce({ a: false });
      const ff = createFeatureFlags();
      await ff.init({ source, ttlMs: 1000 });
      jest.advanceTimersByTime(1000);
      expect(ff.get('a')).toBe(true);
      await Promise.resolve();
      expect(ff.get('a')).toBe(false);
      expect(source).toHaveBeenCalledTimes(2);
    });

    it('issues one request while a refresh is in flight', async () => {
      const source = jest.fn().mockReturnValue(new Promise(() => {}));
      const ff = createFeatureFlags();
      void ff.init({ source, ttlMs: 1000 });
      ff.get('a');
      ff.get('a');
      expect(source).toHaveBeenCalledTimes(1);
    });

    it('keeps the last good flags and reports when a refresh fails', async () => {
      const onError = jest.fn();
      const source = jest
        .fn()
        .mockResolvedValueOnce({ a: true })
        .mockRejectedValueOnce(new Error('boom'));
      const ff = createFeatureFlags();
      await ff.init({ source, ttlMs: 1000, onError });
      jest.advanceTimersByTime(1000);
      ff.get('a');
      await Promise.resolve();
      expect(ff.get('a')).toBe(true);
      expect(onError).toHaveBeenCalledWith(expect.any(Error));
    });

    it('resolves init even when the first fetch fails', async () => {
      const ff = createFeatureFlags();
      await ff.init({
        source: async () => {
          throw new Error('down');
        },
      });
      expect(ff.get('a')).toBe(false);
    });
  });

  describe('init with static flags', () => {
    it('serves the given flags and never refreshes', async () => {
      const ff = createFeatureFlags();
      await ff.init({ flags: { a: true } });
      jest.advanceTimersByTime(1_000_000);
      expect(ff.get('a')).toBe(true);
      expect(ff.all()).toEqual({ a: true });
    });
  });

  describe('all', () => {
    it('returns a copy', async () => {
      const ff = createFeatureFlags();
      await ff.init({ flags: { a: true } });
      ff.all().a = false;
      expect(ff.get('a')).toBe(true);
    });
  });

  describe('httpSource', () => {
    it('fetches the public endpoint and returns the JSON body', async () => {
      const fetchSpy = jest.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => ({ a: true }),
      } as Response);
      await expect(httpSource('http://auth.test/')()).resolves.toEqual({
        a: true,
      });
      expect(fetchSpy.mock.calls[0][0]).toBe(
        'http://auth.test/v1/feature-flags'
      );
    });

    it('rejects on a non-2xx response', async () => {
      jest
        .spyOn(globalThis, 'fetch')
        .mockResolvedValue({ ok: false, status: 503 } as Response);
      await expect(httpSource('http://auth.test')()).rejects.toThrow('503');
    });
  });
});
