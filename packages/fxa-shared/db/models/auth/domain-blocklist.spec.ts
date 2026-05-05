/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { DomainBlocklist } from './domain-blocklist';

const sampleEntries = [
  { domain: 'evil.com', createdAt: 2000 },
  { domain: 'spam.net', createdAt: 1000 },
];

describe('DomainBlocklist', () => {
  let findAllSpy: jest.SpyInstance;

  beforeEach(() => {
    DomainBlocklist.invalidateCache();
    findAllSpy = jest
      .spyOn(DomainBlocklist, 'findAll')
      .mockResolvedValue(sampleEntries);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('findMatchingDomain', () => {
    it('returns the matching domain for a known entry', async () => {
      const result = await DomainBlocklist.findMatchingDomain('user@evil.com');
      expect(result).toBe('evil.com');
    });

    it('returns null when the domain is not in the list', async () => {
      const result = await DomainBlocklist.findMatchingDomain('user@safe.com');
      expect(result).toBeNull();
    });

    it('returns null for an email with no @ character', async () => {
      findAllSpy.mockResolvedValue([]);
      const result = await DomainBlocklist.findMatchingDomain('notanemail');
      expect(result).toBeNull();
      expect(findAllSpy).not.toHaveBeenCalled();
    });

    it('normalizes the email domain to lowercase before matching', async () => {
      const result =
        await DomainBlocklist.findMatchingDomain('user@EVIL.COM');
      expect(result).toBe('evil.com');
    });

    it('caches results and only calls findAll once across multiple lookups', async () => {
      await DomainBlocklist.findMatchingDomain('user@evil.com');
      await DomainBlocklist.findMatchingDomain('user@spam.net');
      await DomainBlocklist.findMatchingDomain('user@safe.com');

      expect(findAllSpy).toHaveBeenCalledTimes(1);
    });

    it('re-fetches after invalidateCache is called', async () => {
      const updatedEntries = [{ domain: 'new.com', createdAt: 3000 }];
      findAllSpy
        .mockResolvedValueOnce(sampleEntries)
        .mockResolvedValueOnce(updatedEntries);

      const first = await DomainBlocklist.findMatchingDomain('user@evil.com');
      expect(first).toBe('evil.com');

      DomainBlocklist.invalidateCache();

      const second = await DomainBlocklist.findMatchingDomain('user@evil.com');
      expect(second).toBeNull();

      expect(findAllSpy).toHaveBeenCalledTimes(2);
    });

    it('re-fetches after the cache TTL expires', async () => {
      const now = 1_000_000;
      const TTL_MS = 5 * 60 * 1000;
      const dateSpy = jest
        .spyOn(Date, 'now')
        .mockReturnValueOnce(now) // cache-check on first call (miss)
        .mockReturnValueOnce(now) // set cacheExpiresAt = now + TTL
        .mockReturnValueOnce(now + TTL_MS + 1) // cache-check on second call (expired)
        .mockReturnValueOnce(now + TTL_MS + 1); // set cacheExpiresAt after second fetch

      await DomainBlocklist.findMatchingDomain('user@evil.com');
      await DomainBlocklist.findMatchingDomain('user@evil.com');

      expect(findAllSpy).toHaveBeenCalledTimes(2);
      dateSpy.mockRestore();
    });
  });

  describe('invalidateCache', () => {
    it('causes the next findMatchingDomain call to re-fetch', async () => {
      await DomainBlocklist.findMatchingDomain('user@evil.com');
      expect(findAllSpy).toHaveBeenCalledTimes(1);

      DomainBlocklist.invalidateCache();
      await DomainBlocklist.findMatchingDomain('user@evil.com');
      expect(findAllSpy).toHaveBeenCalledTimes(2);
    });
  });
});
