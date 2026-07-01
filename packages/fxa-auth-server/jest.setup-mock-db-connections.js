/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Unit-test-only: mock the Redis + OAuth-MySQL boundaries so importing the OAuth
 * DB / senders / reminder singletons opens no real connections (FXA-13711/13712).
 * The infra suites use real infra and overrides setupFilesAfterEnv, so this never
 * applies there.
 *
 * NB: the real fix is prod-side — those singletons connect at module load
 * (eager-import, FXA-13828). Fixing that removes the need for this mock.
 */

// Redis boundary: RedisShared's constructor opens an ioredis connection.
jest.mock('fxa-shared/db/redis', () => {
  class RedisShared {
    // Any command resolves to undefined; specs asserting real Redis results
    // replace `this.redis` with their own mock.
    redis = new Proxy(
      {},
      { get: () => jest.fn().mockResolvedValue(undefined) }
    );
    // Subclasses call this.defineCommands(...) in their constructor; no-op it.
    defineCommands() {}
    async close() {}
  }
  return { RedisShared, Config: {} };
});

// OAuth MySQL boundary: node-mysql opens a real connection on first query. Fake
// the pool (no socket). Only the OAuth DB uses node-mysql; the main auth DB uses
// knex, so this stays oauth-scoped.
jest.mock('mysql', () => {
  const actual = jest.requireActual('mysql');
  const noResult = (...args) => {
    const cb = args[args.length - 1];
    if (typeof cb === 'function') cb(null, []);
  };
  const connection = {
    query: noResult,
    release: () => {},
    on: () => {},
    destroy: () => {},
  };
  return {
    ...actual,
    createPool: () => ({
      config: { connectionLimit: 0 },
      on: () => {},
      getConnection: (cb) => cb(null, connection),
      query: noResult,
      end: (cb) => typeof cb === 'function' && cb(),
    }),
  };
});
