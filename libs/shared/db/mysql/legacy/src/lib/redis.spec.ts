/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Redis from 'ioredis';
import { LUA_SCRIPTS } from './lua-scripts';
import { RedisShared } from './redis';

jest.mock('ioredis', () =>
  jest.fn().mockImplementation(() => {
    const redis = {
      on: jest.fn(),
      defineCommand: jest.fn((name: string) => {
        (redis as Record<string, unknown>)[name] = jest.fn();
      }),
    };
    return redis;
  })
);

describe('RedisShared', () => {
  it('defines one command for each embedded Lua script', () => {
    const shared = new RedisShared({ host: 'localhost', port: 6379 });

    expect(Redis).toHaveBeenCalledTimes(1);
    const defineCommand = shared.redis.defineCommand as jest.Mock;
    expect(defineCommand).toHaveBeenCalledTimes(5);
    for (const [name, scriptName] of [
      ['getAccessToken', 'getAccessToken_1'],
      ['getAccessTokens', 'getAccessTokens_1'],
      ['getSessionTokens', 'getSessionTokens_1'],
      ['pruneSessionTokens', 'pruneSessionTokens_1'],
      ['touchSessionToken', 'touchSessionToken_1'],
    ]) {
      expect(defineCommand).toHaveBeenCalledWith(name, {
        lua: LUA_SCRIPTS[scriptName],
        numberOfKeys: 1,
      });
    }
  });
});
