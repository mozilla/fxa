/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Redis from 'ioredis';
import type { Redis as RedisType } from 'ioredis';

function wait() {
  return new Promise((r) => setTimeout(r, 500));
}

export class SmsClient {
  private client: RedisType;
  private uidCodes: Map<string, string>;
  private isConnected = false;
  private hasLoggedConnectionError = false;

  constructor() {
    this.client = new Redis();
    this.uidCodes = new Map();

    this.client.on('ready', () => {
      this.isConnected = true;
      this.hasLoggedConnectionError = false;
    });

    this.client.on('error', (err: Error) => {
      if (!this.hasLoggedConnectionError) {
        this.hasLoggedConnectionError = true;
      }
      this.isConnected = false;
    });
  }

  /**
   * Get the code stored in redis that was sent to the user via SMS.
   *
   * @param uid
   * @param timeout
   */
  async getCode(uid: string, timeout = 10000): Promise<string> {
    if (!this.isConnected) {
      throw new Error('Not connected to Redis');
    }

    const redisKeyPattern = `recovery-phone:sms-attempt:${uid}:*`;
    const expires = Date.now() + timeout;

    while (Date.now() < expires) {
      let cursor = '0';
      let newestKey: string | null = null;
      let newestCreatedAt = -1;

      do {
        const [newCursor, keys] = await this.client.scan(
          cursor,
          'MATCH',
          redisKeyPattern
        );
        cursor = newCursor;

        for (const key of keys) {
          const valueRaw = await this.client.get(key);
          if (!valueRaw) {
            continue;
          }
          const value = JSON.parse(valueRaw);

          if (!newestKey || value.createdAt > newestCreatedAt) {
            newestKey = key;
            newestCreatedAt = value.createdAt;
          }
        }
      } while (cursor !== '0');

      // If no keys are found, wait and try again.
      if (!newestKey) {
        await wait();
        continue;
      }

      const code = newestKey.split(':')[3];
      const lastCode = this.uidCodes.get(uid);

      // If the code is the same as the last one, wait and try again.
      if (lastCode === code) {
        await wait();
        continue;
      }

      this.uidCodes.set(uid, code);
      return code;
    }

    throw new Error('KeyTimeout');
  }
}
