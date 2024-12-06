/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import cacheManager, {
  CacheClient,
  CacheManagerOptions,
} from '@type-cacheable/core';

const DEFAULT_TTL_SECONDS = 300;
const MEMCACHE_CLEANUP_INTERVAL_SECONDS = 10;

export class MemoryAdapter implements CacheClient {
  private memcache = new Map<
    string,
    {
      value: any;
      ttl: number;
    }
  >();

  constructor() {
    this.get = this.get.bind(this);
    this.del = this.del.bind(this);
    this.delHash = this.delHash.bind(this);
    this.getClientTTL = this.getClientTTL.bind(this);
    this.keys = this.keys.bind(this);
    this.set = this.set.bind(this);

    setInterval(() => {
      const now = Date.now();
      for (const [cacheKey, entry] of this.memcache.entries()) {
        if (entry.ttl < now) {
          this.memcache.delete(cacheKey);
        }
      }
    }, MEMCACHE_CLEANUP_INTERVAL_SECONDS * 1000);
  }

  public async get(cacheKey: string): Promise<any> {
    const cachedValue = this.memcache.get(cacheKey);
    if (!cachedValue || cachedValue.ttl < Date.now()) {
      return undefined;
    }

    return cachedValue;
  }

  public async set(cacheKey: string, value: any, ttl?: number): Promise<any> {
    ttl ||= DEFAULT_TTL_SECONDS;

    const expiry = new Date();
    expiry.setSeconds(expiry.getSeconds() + ttl);

    this.memcache.set(cacheKey, value);
  }

  public getClientTTL(): number {
    return 0;
  }

  public async del(keyOrKeys: string | string[]): Promise<any> {
    if (Array.isArray(keyOrKeys) && !keyOrKeys.length) {
      return 0;
    }

    const keysToDelete = Array.isArray(keyOrKeys) ? keyOrKeys : [keyOrKeys];

    for (const cacheKey of keysToDelete) {
      this.memcache.delete(cacheKey);
    }
  }

  public async keys(_: string): Promise<string[]> {
    return Promise.resolve(Array.from(this.memcache.keys()));
  }

  public async delHash(_: string | string[]): Promise<any> {
    throw new Error('delHash() not supported for cachable FirestoreAdapter');
  }
}

export const useMemoryAdapter = (
  asFallback?: boolean,
  options?: CacheManagerOptions
): MemoryAdapter => {
  const firestoreAdapter = new MemoryAdapter();

  if (asFallback) {
    cacheManager.setFallbackClient(firestoreAdapter);
  } else {
    cacheManager.setClient(firestoreAdapter);
  }

  if (options) {
    cacheManager.setOptions(options);
  }

  return firestoreAdapter;
};
