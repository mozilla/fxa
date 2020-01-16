/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const sinon = require('sinon');
const config = require('../../config').getProperties();
const redis = require('../../lib/redis')(
  { ...config.redis, ...config.redis.sessionTokens },
  { error: sinon.spy() }
);

const downRedis = require('../../lib/redis')(
  { enabled: true, port: 1, timeoutMs: 10, lazyConnect: true },
  { error: sinon.spy() }
);

const uid = 'uid1';
const sessionToken = {
  lastAccessTime: 1573067619720,
  location: {
    city: 'a',
    state: 'b',
    stateCode: 'c',
    country: 'd',
    countryCode: 'e',
  },
  uaBrowser: 'Firefox',
  uaBrowserVersion: '70.0',
  uaDeviceType: 'f',
  uaOS: 'Mac OS X',
  uaOSVersion: '10.14',
  id: 'token1',
};

describe('Redis', () => {
  after(async () => {
    await redis.del(uid);
    redis.close();
  });

  describe('touchSessionToken', () => {
    beforeEach(async () => {
      await redis.del(uid);
    });

    it('creates an entry for uid when none exists', async () => {
      const x = await redis.get(uid);
      assert.isNull(x);
      await redis.touchSessionToken(uid, sessionToken);
      const rawData = await redis.get(uid);
      assert.ok(rawData);
    });

    it('appends a new token to an existing uid record', async () => {
      await redis.touchSessionToken(uid, sessionToken);
      await redis.touchSessionToken(uid, { ...sessionToken, id: 'token2' });
      const tokens = await redis.getSessionTokens(uid);
      assert.deepEqual(Object.keys(tokens), [sessionToken.id, 'token2']);
    });

    it('updates existing tokens with new data', async () => {
      await redis.touchSessionToken(uid, { ...sessionToken, uaOS: 'Windows' });
      const tokens = await redis.getSessionTokens(uid);
      assert.equal(tokens[sessionToken.id].uaOS, 'Windows');
    });

    it('trims trailing null fields from the stored value', async () => {
      await redis.touchSessionToken(uid, {
        id: 'token1',
        lastAccessTime: 1,
        location: null,
        uaBrowser: 'x',
        uaFormFactor: null,
      });
      const rawData = await redis.get(uid);
      assert.equal(rawData, `{"token1":[1,null,"x"]}`);
    });
  });

  describe('getSessionTokens', () => {
    beforeEach(async () => {
      await redis.del(uid);
      await redis.touchSessionToken(uid, sessionToken);
    });

    it('returns an empty object for unknown uids', async () => {
      const tokens = await redis.getSessionTokens('x');
      assert.isEmpty(tokens);
    });

    it('returns tokens indexed by id', async () => {
      const tokens = await redis.getSessionTokens(uid);
      assert.deepEqual(Object.keys(tokens), [sessionToken.id]);
      // token 'id' not included
      const s = { ...sessionToken };
      delete s.id;
      assert.deepEqual(tokens[sessionToken.id], s);
    });

    it('returns empty for malformed entries', async () => {
      await redis.set(uid, 'YOLO!');
      const tokens = await redis.getSessionTokens(uid);
      assert.isEmpty(tokens);
    });

    it('deletes malformed entries', async () => {
      await redis.set(uid, 'YOLO!');
      await redis.getSessionTokens(uid);
      const nothing = await redis.get(uid);
      assert.isNull(nothing);
    });

    it('handles old (json) format entries', async () => {
      const oldFormat = {
        lastAccessTime: 42,
        uaBrowser: 'Firefox',
        uaBrowserVersion: '59',
        uaOS: 'Mac OS X',
        uaOSVersion: '10.11',
        uaDeviceType: null,
        uaFormFactor: null,
        location: {
          city: 'Bournemouth',
          state: 'England',
          stateCode: 'EN',
          country: 'United Kingdom',
          countryCode: 'GB',
        },
      };
      await redis.set(uid, JSON.stringify({ [uid]: oldFormat }));
      const tokens = await redis.getSessionTokens(uid);
      assert.deepEqual(tokens[uid], oldFormat);
    });
  });

  describe('pruneSessionTokens', () => {
    beforeEach(async () => {
      await redis.del(uid);
      await redis.touchSessionToken(uid, sessionToken);
      await redis.touchSessionToken(uid, { ...sessionToken, id: 'token2' });
    });

    it('does nothing for unknown uids', async () => {
      await redis.pruneSessionTokens('x');
      const tokens = await redis.getSessionTokens('x');
      assert.isEmpty(tokens);
    });

    it('does nothing for unkown token ids', async () => {
      await redis.pruneSessionTokens(uid, ['x', 'y']);
      const tokens = await redis.getSessionTokens(uid);
      assert.deepEqual(Object.keys(tokens), [sessionToken.id, 'token2']);
    });

    it('deletes a given token id', async () => {
      await redis.pruneSessionTokens(uid, ['token2']);
      const tokens = await redis.getSessionTokens(uid);
      assert.deepEqual(Object.keys(tokens), [sessionToken.id]);
    });

    it('deleted the uid record when no tokens remain', async () => {
      await redis.pruneSessionTokens(uid, [sessionToken.id, 'token2']);
      const rawData = await redis.get(uid);
      assert.isNull(rawData);
    });
  });
});

describe('Redis down', () => {
  before(async () => {
    try {
      await downRedis.redis.connect();
    } catch (e) {
      // this is expected
    }
  });

  after(() => {
    downRedis.redis.disconnect();
  });

  describe('touchSessionToken', () => {
    it('returns without error', async () => {
      try {
        await downRedis.touchSessionToken(uid, {});
      } catch (err) {
        assert.fail();
      }
    });
  });

  describe('getSessionTokens', () => {
    it('returns an empty object without error', async () => {
      const tokens = await downRedis.getSessionTokens(uid);
      assert.isEmpty(tokens);
    });
  });

  describe('pruneSessionTokens', () => {
    it('throws a timeout error', async () => {
      try {
        await downRedis.pruneSessionTokens(uid);
      } catch (e) {
        assert.typeOf(e, 'Error');
        assert.equal(e.message, 'redis timeout');
        return;
      }
      assert.fail();
    });
  });
});
