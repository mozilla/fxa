/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Redis from 'ioredis';
import type { Redis as RedisType } from 'ioredis';

/**
 * A client that is useful to clear or emulate rate limiting scenarios. Note that this only
 * works when running in the test CI or locally. This WILL NOT work for smoke tests!
 */
export class RateLimitClient {
  private readonly redis: RedisType;

  constructor() {
    // Only works for local host!
    this.redis = new Redis();
  }

  /**
   * Resets all rate limiting counts in the Redis database. Useful during tests to avoid rate limiting.
   * @param action - Optional action to target. If nothing is provided, all counts are cleared.
   * @returns Number of keys deleted.
   */
  async resetCounts(action?: string) {
    // Determine what keys to target
    const pattern = action ? `rate-limit:*:${action}:*` : 'rate-limit:*';

    let cursor = '0';
    do {
      const [nextCursor, keys] = await this.redis.scan(
        cursor,
        'MATCH',
        pattern,
        'COUNT',
        100
      );
      cursor = nextCursor;
      if (keys.length > 0) {
        const deletedCount = await this.redis.del(...keys);
        console.log(`Deleted ${deletedCount} keys from redis.`);
      }
    } while (cursor !== '0');
  }
}
