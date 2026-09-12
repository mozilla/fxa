/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  createAuthServerLoader,
  featureFlag,
  loadFeatureFlags,
  resetFeatureFlags,
} from './feature-flags';

describe('feature flags', () => {
  afterEach(() => {
    resetFeatureFlags();
    jest.restoreAllMocks();
  });

  describe('featureFlag', () => {
    it('is true for a loaded flag', async () => {
      await loadFeatureFlags(async () => ['new-checkout']);

      expect(featureFlag('new-checkout')).toBe(true);
    });

    it('is false for a flag absent from the list', async () => {
      await loadFeatureFlags(async () => ['new-checkout']);

      expect(featureFlag('something-else')).toBe(false);
    });

    it('is false before the flags load', () => {
      expect(featureFlag('new-checkout')).toBe(false);
    });

    it('is false for every flag when the loader rejects', async () => {
      await expect(
        loadFeatureFlags(async () => {
          throw new Error('network down');
        })
      ).rejects.toThrow('network down');

      expect(featureFlag('new-checkout')).toBe(false);
    });

    it('does not refresh once loaded', async () => {
      const loader = jest
        .fn()
        .mockResolvedValueOnce(['new-checkout'])
        .mockResolvedValueOnce([]);

      await loadFeatureFlags(loader);
      featureFlag('new-checkout');
      featureFlag('new-checkout');

      expect(loader).toHaveBeenCalledTimes(1);
      expect(featureFlag('new-checkout')).toBe(true);
    });
  });

  describe('createAuthServerLoader', () => {
    it('requests the flags endpoint and returns the list', async () => {
      const fetchMock = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ['new-checkout'],
      });
      global.fetch = fetchMock as any;

      const flags = await createAuthServerLoader('https://auth.example.com')();

      expect(fetchMock).toHaveBeenCalledWith(
        'https://auth.example.com/v1/feature-flags'
      );
      expect(flags).toEqual(['new-checkout']);
    });

    it('throws on a non-ok response', async () => {
      global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 503 });

      await expect(
        createAuthServerLoader('https://auth.example.com')()
      ).rejects.toThrow('503');
    });

    it('throws when the response is not an array', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ 'new-checkout': true }),
      });

      await expect(
        createAuthServerLoader('https://auth.example.com')()
      ).rejects.toThrow('not an array');
    });
  });
});
