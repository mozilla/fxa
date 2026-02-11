/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import cacheManager, {
  CacheClient,
  CacheManagerOptions,
} from '@type-cacheable/core';
import { AsyncLocalStorage } from 'async_hooks';

export class TypeCacheableAsyncLocalStorageNotAvailableError extends Error {
  constructor() {
    super(
      'AsyncLocalStorageAdapter was used outside of a typeCacheableAsyncLocalStorage context'
    );
  }
}

type Store = {
  cacheStore: Map<any, any>;
};

export const typeCacheableAsyncLocalStorage = new AsyncLocalStorage<Store>();

export const withTypeCacheableAsyncLocalStorage = <T>(fn: () => T): T => {
  return typeCacheableAsyncLocalStorage.run(
    {
      cacheStore: new Map(),
    },
    fn
  );
};

export class AsyncLocalStorageAdapter implements CacheClient {
  constructor(private throwWhenContextUnavailable = false) {
    this.get = this.get.bind(this);
    this.del = this.del.bind(this);
    this.delHash = this.delHash.bind(this);
    this.getClientTTL = this.getClientTTL.bind(this);
    this.keys = this.keys.bind(this);
    this.set = this.set.bind(this);
  }

  private getCacheStoreRef() {
    const cacheStore = typeCacheableAsyncLocalStorage.getStore()?.cacheStore;
    if (!cacheStore && this.throwWhenContextUnavailable) {
      throw new TypeCacheableAsyncLocalStorageNotAvailableError();
    }
    if (!cacheStore) {
      console.warn(
        'AsyncLocalStorageAdapter was used outside of a typeCacheableAsyncLocalStorage context'
      );
    }
    return cacheStore;
  }

  public async get(cacheKey: string): Promise<any> {
    const cacheStore = this.getCacheStoreRef();

    const cacheEntry = cacheStore?.get(cacheKey);
    if (!cacheEntry) {
      return undefined;
    }

    return cacheEntry;
  }

  public async set(cacheKey: string, value: any): Promise<any> {
    const cacheStore = this.getCacheStoreRef();

    cacheStore?.set(cacheKey, value);
  }

  public getClientTTL(): number {
    return 0;
  }

  public async del(keyOrKeys: string | string[]): Promise<any> {
    if (Array.isArray(keyOrKeys) && !keyOrKeys.length) {
      return 0;
    }

    const cacheStore = this.getCacheStoreRef();

    const keysToDelete = Array.isArray(keyOrKeys) ? keyOrKeys : [keyOrKeys];

    for (const cacheKey of keysToDelete) {
      cacheStore?.delete(cacheKey);
    }
  }

  public async keys(_: string): Promise<string[]> {
    const cacheStore = this.getCacheStoreRef() || new Map();

    return Promise.resolve(Array.from(cacheStore.keys()));
  }

  public async delHash(_: string | string[]): Promise<any> {
    throw new Error(
      'delHash() not supported for cachable AsyncLocalStorageAdapter'
    );
  }
}

export const useAsyncLocalStorageAdapter = (
  asFallback?: boolean,
  options?: CacheManagerOptions
): AsyncLocalStorageAdapter => {
  const asyncLocalStorageAdapter = new AsyncLocalStorageAdapter();

  if (asFallback) {
    cacheManager.setFallbackClient(asyncLocalStorageAdapter);
  } else {
    cacheManager.setClient(asyncLocalStorageAdapter);
  }

  if (options) {
    cacheManager.setOptions(options);
  }

  return asyncLocalStorageAdapter;
};
