/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const RedisSessionToken = require('../../redis-session-token');

const tokens = {
  abc: {
    lastAccessTime: 'yesterday',
    location: {
      city: 'Heapolandia',
      state: 'Memory Palace',
      stateCode: 'MP',
      country: 'United Devices of von Neumann',
      countryCode: 'UVN',
    },
    uaBrowser: 'SpaceTuna',
    uaBrowserVersion: '76',
    uaOS: 'Plan 9',
    uaOSVersion: '0.0.0.0.1',
    uaDeviceType: 'Desktop',
    uaFormFactor: 'Yuge',
  },
  xyz: {
    lastAccessTime: 'two weeks ago',
    location: {
      city: 'Heapolandia',
      stateCode: 'MP',
      countryCode: 'UVN',
    },
    uaOS: 'Plan 9',
    uaOSVersion: '0.0.0.0.1',
  },
};

const packedTokens = {
  abc: [
    'yesterday',
    [
      'Heapolandia',
      'Memory Palace',
      'MP',
      'United Devices of von Neumann',
      'UVN',
    ],
    'SpaceTuna',
    '76',
    'Plan 9',
    '0.0.0.0.1',
    'Desktop',
    'Yuge',
  ],
  xyz: [
    'two weeks ago',
    ['Heapolandia', undefined, 'MP', undefined, 'UVN'],
    undefined,
    undefined,
    'Plan 9',
    '0.0.0.0.1',
  ],
};

describe('Redis session token', () => {
  describe('packing', () => {
    it('returns an empty tokens dictionary when given an empty object', () => {
      const actual = RedisSessionToken.packTokensForRedis({});
      const expected = JSON.stringify({});
      assert.deepEqual(actual, expected);
    });

    it('returns empty arrays when given empty objects', () => {
      const actual = RedisSessionToken.packTokensForRedis({ abc: {}, xyz: {} });
      const expected = JSON.stringify({ abc: [], xyz: [] });
      assert.deepEqual(actual, expected);
    });

    it('does not pack extra properties', () => {
      const actual = RedisSessionToken.packTokensForRedis({
        abc: { ...tokens.abc, quux: 'quuz' },
      });
      const expected = JSON.stringify({ abc: packedTokens.abc });
      assert.deepEqual(actual, expected);
    });

    it('does not include trailing empty array items', () => {
      const actual = RedisSessionToken.packTokensForRedis({ xyz: tokens.xyz });
      const expected = JSON.stringify({ xyz: packedTokens.xyz });
      assert.deepEqual(actual, expected);
    });

    it('packs the location object properties', () => {
      const packed = RedisSessionToken.packTokensForRedis(tokens);
      const actual = JSON.parse(packed).abc.location;
      assert.deepEqual(actual, packedTokens.abc.location);
    });

    it('packs all given defined properties properly', () => {
      const actual = RedisSessionToken.packTokensForRedis(tokens);
      const expected = JSON.stringify(packedTokens);
      assert.deepEqual(actual, expected);
    });
  });

  describe('unpacking', () => {
    it('returns an object with undefined properties when given an empty array', () => {
      const actual = RedisSessionToken.unpackTokensFromRedis(
        JSON.stringify({ abc: [] })
      );
      const expected = {
        abc: {
          lastAccessTime: undefined,
          location: undefined,
          uaBrowser: undefined,
          uaBrowserVersion: undefined,
          uaOS: undefined,
          uaOSVersion: undefined,
          uaDeviceType: undefined,
          uaFormFactor: undefined,
        },
      };
      assert.deepEqual(actual, expected);
    });

    it('unpacks all given properties correctly', () => {
      const actual = RedisSessionToken.unpackTokensFromRedis(
        JSON.stringify(packedTokens)
      );

      // `undefined` is not a valid JSON value, so it was packed into a null.
      // The truncated trailing empty array items are repopulated as undefined.
      const expected = {
        abc: tokens.abc,
        xyz: {
          ...tokens.xyz,
          location: { ...tokens.xyz.location, country: null, state: null },
          uaBrowser: null,
          uaBrowserVersion: null,
          uaDeviceType: undefined,
          uaFormFactor: undefined,
        },
      };
      assert.deepEqual(actual, expected);
    });
  });
});
