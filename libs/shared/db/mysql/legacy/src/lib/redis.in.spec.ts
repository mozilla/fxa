/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { RedisShared } from './redis';

const uid = 'touch-uid';
const location = {
  city: 'a',
  state: 'b',
  stateCode: 'c',
  country: 'd',
  countryCode: 'e',
};

describe('#integration - RedisShared touchSessionToken', () => {
  const shared = new RedisShared({
    host: process.env.REDIS_HOST || 'localhost',
    port: 6379,
    prefix: 'test-touch:',
  });

  beforeEach(async () => {
    await shared.del(uid);
  });

  afterAll(async () => {
    await shared.del(uid);
    await shared.close();
  });

  it('stores a new token packed, with trailing nulls trimmed', async () => {
    expect(
      await shared.touchSessionToken(uid, {
        id: 't1',
        lastAccessTime: 1,
        location: null,
        uaBrowser: 'x',
        uaFormFactor: null,
      })
    ).toBe('OK');
    expect(await shared.redis.get(uid)).toBe('{"t1":[1,null,"x"]}');
  });

  it('merges an update into the old packed token', async () => {
    await shared.touchSessionToken(uid, {
      id: 't1',
      lastAccessTime: 1,
      location,
      uaBrowser: 'x',
    });
    await shared.touchSessionToken(uid, { id: 't1', lastAccessTime: 2 });

    expect(await shared.redis.get(uid)).toBe(
      '{"t1":[2,["a","b","c","d","e"],"x"]}'
    );
    expect(await shared.getSessionTokens(uid)).toEqual({
      t1: { lastAccessTime: 2, location, uaBrowser: 'x' },
    });
  });

  it('keeps every token when touches of one uid run at once', async () => {
    const ids = Array.from({ length: 20 }, (_, i) => `t${i}`);
    await Promise.all([
      ...ids.map((id) =>
        shared.touchSessionToken(uid, { id, lastAccessTime: 1 })
      ),
      // An EXEC on the shared connection must not break the touch transactions.
      ...ids.map(() => shared.redis.multi().get(uid).exec()),
    ]);

    expect(Object.keys(await shared.getSessionTokens(uid)).sort()).toEqual(
      ids.sort()
    );
  });
});
