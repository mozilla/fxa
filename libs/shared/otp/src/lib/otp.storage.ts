/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Redis } from 'ioredis';

/**
 * A general interface for storing data
 */
export interface OtpStorage {
  del: (key: string) => Promise<void>;
  get: (key: string) => Promise<string | null>;
  set: (key: string, value: string) => Promise<void>;
}

/**
 * An implementation of OtpStorage that uses redis a backing store
 */
export class OtpRedisStorage implements OtpStorage {
  constructor(private readonly redis: Redis) {}

  async del(key: string) {
    await this.redis.del(key);
  }
  async get(key: string) {
    return await this.redis.get(key);
  }
  async set(key: string, value: string) {
    await this.redis.set(key, value);
  }
}
