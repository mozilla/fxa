/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { DomainBlocklist } from './domain-blocklist';

const TTL_MS = 60 * 1000;
const blocked = new Set(['evil.com', 'spam.net']);

describe('DomainBlocklist', () => {
  let findByDomainSpy: jest.SpyInstance;

  beforeEach(() => {
    DomainBlocklist.invalidateCache();
    findByDomainSpy = jest
      .spyOn(DomainBlocklist, 'findByDomain')
      .mockImplementation(async (domain) =>
        blocked.has(domain) ? domain : null
      );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('findMatchingDomain', () => {
    it('returns the matching domain for a known entry', async () => {
      const result = await DomainBlocklist.findMatchingDomain('user@evil.com');
      expect(result).toBe('evil.com');
      expect(findByDomainSpy).toHaveBeenCalledWith('evil.com');
    });

    it('returns null when the domain is not in the list', async () => {
      const result = await DomainBlocklist.findMatchingDomain('user@safe.com');
      expect(result).toBeNull();
    });

    it('returns null for an email with no @ character', async () => {
      const result = await DomainBlocklist.findMatchingDomain('notanemail');
      expect(result).toBeNull();
      expect(findByDomainSpy).not.toHaveBeenCalled();
    });

    it('normalizes the email domain to lowercase before the lookup', async () => {
      const result = await DomainBlocklist.findMatchingDomain('user@EVIL.COM');
      expect(result).toBe('evil.com');
      expect(findByDomainSpy).toHaveBeenCalledWith('evil.com');
    });

    it('never reads the whole table', async () => {
      const findAllSpy = jest.spyOn(DomainBlocklist, 'findAll');
      await DomainBlocklist.findMatchingDomain('user@evil.com');
      expect(findAllSpy).not.toHaveBeenCalled();
    });

    it('caches hits and misses per domain', async () => {
      await DomainBlocklist.findMatchingDomain('a@evil.com');
      await DomainBlocklist.findMatchingDomain('b@evil.com');
      await DomainBlocklist.findMatchingDomain('a@safe.com');
      await DomainBlocklist.findMatchingDomain('b@safe.com');

      expect(findByDomainSpy).toHaveBeenCalledTimes(2);
      expect(findByDomainSpy).toHaveBeenNthCalledWith(1, 'evil.com');
      expect(findByDomainSpy).toHaveBeenNthCalledWith(2, 'safe.com');
    });

    it('re-fetches after invalidateCache is called', async () => {
      findByDomainSpy
        .mockResolvedValueOnce('evil.com')
        .mockResolvedValueOnce(null);

      expect(await DomainBlocklist.findMatchingDomain('user@evil.com')).toBe(
        'evil.com'
      );
      DomainBlocklist.invalidateCache();
      expect(
        await DomainBlocklist.findMatchingDomain('user@evil.com')
      ).toBeNull();
      expect(findByDomainSpy).toHaveBeenCalledTimes(2);
    });

    it('uses the cache until the TTL ends, then re-fetches', async () => {
      const now = 1_000_000;
      const dateSpy = jest.spyOn(Date, 'now').mockReturnValue(now);
      await DomainBlocklist.findMatchingDomain('user@evil.com');

      dateSpy.mockReturnValue(now + TTL_MS);
      await DomainBlocklist.findMatchingDomain('user@evil.com');
      expect(findByDomainSpy).toHaveBeenCalledTimes(1);

      dateSpy.mockReturnValue(now + TTL_MS + 1);
      await DomainBlocklist.findMatchingDomain('user@evil.com');
      expect(findByDomainSpy).toHaveBeenCalledTimes(2);
    });

    it('clears the cache when it reaches 10,000 domains', async () => {
      for (let i = 0; i < 10_000; i++) {
        await DomainBlocklist.findMatchingDomain(`user@d${i}.example`);
      }
      await DomainBlocklist.findMatchingDomain('user@d1.example');
      expect(findByDomainSpy).toHaveBeenCalledTimes(10_000);

      await DomainBlocklist.findMatchingDomain('user@overflow.example');
      await DomainBlocklist.findMatchingDomain('user@d1.example');
      expect(findByDomainSpy).toHaveBeenCalledTimes(10_002);
    });
  });
});
