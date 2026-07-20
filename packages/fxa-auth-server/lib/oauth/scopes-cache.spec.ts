/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ScopeIdCache, ScopeResolver, ScopeRow } from './scopes-cache';

// Fixed scope -> id table the fake resolver draws from. 'unseeded' is
// deliberately absent so tests can exercise the missing path.
const SCOPE_TABLE: Record<string, number> = {
  '': 1,
  openid: 2,
  profile: 3,
  email: 4,
  'https://identity.mozilla.com/apps/oldsync': 5,
};

// Each resolver reads its own table snapshot (cloned by default) so no test
// mutates state another test observes.
function makeResolver(
  table: Record<string, number> = { ...SCOPE_TABLE }
): jest.MockedFunction<ScopeResolver> {
  return jest.fn(
    async (scopes: string[]): Promise<ScopeRow[]> =>
      scopes
        .filter((scope) => scope in table)
        .map((scope) => ({ scope, id: table[scope] }))
  );
}

describe('ScopeIdCache', () => {
  let resolver: jest.MockedFunction<ScopeResolver>;
  let cache: ScopeIdCache;

  beforeEach(() => {
    resolver = makeResolver();
    cache = new ScopeIdCache(resolver);
  });

  it('resolves known scopes to their ids via the resolver on first call', async () => {
    const { resolved } = await cache.resolve(['openid', 'profile']);

    expect(Object.fromEntries(resolved)).toEqual({ openid: 2, profile: 3 });
    expect(resolver).toHaveBeenCalledTimes(1);
    expect(resolver).toHaveBeenCalledWith(['openid', 'profile']);
  });

  it('resolves the empty-string scope like any other scope', async () => {
    const { resolved, missing } = await cache.resolve(['']);

    expect(resolved.get('')).toBe(1);
    expect(missing).toEqual([]);
  });

  it('serves a repeated scope from cache without a second resolver call', async () => {
    await cache.resolve(['openid']);
    const { resolved } = await cache.resolve(['openid']);

    expect(resolved.get('openid')).toBe(2);
    expect(resolver).toHaveBeenCalledTimes(1);
  });

  it('only asks the resolver for the uncached scopes on a partial hit', async () => {
    await cache.resolve(['openid']);

    const { resolved } = await cache.resolve(['openid', 'profile']);

    expect(Object.fromEntries(resolved)).toEqual({ openid: 2, profile: 3 });
    // openid was cached by the first call; the second queries only profile.
    expect(resolver).toHaveBeenCalledTimes(2);
    expect(resolver).toHaveBeenNthCalledWith(2, ['profile']);
  });

  it('dedupes repeated input scopes into a single resolver argument', async () => {
    const { resolved } = await cache.resolve(['openid', 'openid', 'profile']);

    expect(Object.fromEntries(resolved)).toEqual({ openid: 2, profile: 3 });
    expect(resolver).toHaveBeenCalledWith(['openid', 'profile']);
  });

  it('reports scopes absent from the table as missing', async () => {
    const { resolved, missing } = await cache.resolve(['openid', 'unseeded']);

    expect(Object.fromEntries(resolved)).toEqual({ openid: 2 });
    expect(missing).toEqual(['unseeded']);
  });

  it('does not cache a miss, so a later-seeded scope resolves without a restart', async () => {
    // Own mutable table so seeding is local to this test.
    const table: Record<string, number> = { ...SCOPE_TABLE };
    const localResolver = makeResolver(table);
    const localCache = new ScopeIdCache(localResolver);

    const first = await localCache.resolve(['unseeded']);
    expect(first.missing).toEqual(['unseeded']);

    // Simulate the scope being seeded after the first miss.
    table.unseeded = 99;
    const second = await localCache.resolve(['unseeded']);
    expect(second.resolved.get('unseeded')).toBe(99);
    // The miss was re-queried, not served from a negative cache entry.
    expect(localResolver).toHaveBeenCalledTimes(2);
  });

  it('does not call the resolver for empty input', async () => {
    const { resolved, missing } = await cache.resolve([]);

    expect(resolved.size).toBe(0);
    expect(missing).toEqual([]);
    expect(resolver).not.toHaveBeenCalled();
  });

  it('re-queries the resolver after clear() drops the cache', async () => {
    await cache.resolve(['openid']);
    cache.clear();

    const { resolved } = await cache.resolve(['openid']);

    expect(resolved.get('openid')).toBe(2);
    expect(resolver).toHaveBeenCalledTimes(2);
  });

  it('propagates a resolver rejection to the caller', async () => {
    resolver.mockRejectedValueOnce(new Error('scopes read failed'));

    await expect(cache.resolve(['openid'])).rejects.toThrow(
      'scopes read failed'
    );
  });
});
