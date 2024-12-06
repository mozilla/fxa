/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  CacheClient,
  CacheStrategy,
  CacheStrategyContext,
} from '@type-cacheable/core';

interface CacheEntry {
  value: unknown;
  timestamp: number;
}

/**
 * Result meaning:
 * - stale: The returned value is stale and a new value is being fetched in the background.
 * - method: There was no fresh enough value in cache, so the method was called.
 * - fallback: The method failed, so a very old (older than stale) value was returned.
 */
type CacheResult = 'stale' | 'method' | 'fallback';

export class StaleWhileRevalidateWithFallbackStrategy implements CacheStrategy {
  private pendingCacheRequestMap = new Map<
    string,
    Promise<CacheEntry | undefined>
  >();
  private pendingMethodCallMap = new Map<string, Promise<CacheEntry>>();

  constructor(
    /**
     * The amount of time to consider a "stale" value for the purposes of racing against the method.
     * Note: This does not apply to "fallback", which is determined by the ttlSeconds set for type-cachable. The "fallback" ttl keeps a value for if the method _throws an error_. This value should always be shorter than the ttlSeconds provided to type-cacheable
     */
    private staleValueTtl: number,
    private onAsyncCacheWriteFailure?: (err: unknown) => void,
    private onRequestFinshed?: (
      startTime: number,
      endTime: number,
      cacheResult: CacheResult
    ) => void
  ) {}

  private findCachedValue = async (client: CacheClient, key: string) => {
    let cachedValue: CacheEntry | undefined;

    try {
      if (this.pendingCacheRequestMap.has(key)) {
        cachedValue = await this.pendingCacheRequestMap.get(key);
      } else {
        const cachePromise = client.get(key);
        this.pendingCacheRequestMap.set(key, cachePromise);
        cachedValue = await cachePromise;
      }
    } catch (err) {
      throw err;
    } finally {
      this.pendingCacheRequestMap.delete(key);
    }

    return cachedValue;
  };

  private getMethodValue = async (context: CacheStrategyContext) => {
    return new Promise<CacheEntry>(async (resolve, reject) => {
      const pendingMethodCallPromise = this.pendingMethodCallMap.get(
        context.key
      );
      if (pendingMethodCallPromise) {
        resolve(pendingMethodCallPromise);
        return;
      }

      let methodValue: unknown;
      let isCacheable = false;
      try {
        const methodPromise = context.originalMethod.apply(
          context.originalMethodScope,
          context.originalMethodArgs
        );
        this.pendingMethodCallMap.set(context.key, methodPromise);
        methodValue = await methodPromise;

        isCacheable = context.isCacheable(methodValue);
      } catch (err) {
        reject(err);
        return;
      } finally {
        this.pendingMethodCallMap.delete(context.key);
      }

      const cacheEntry = {
        value: methodValue,
        timestamp: Date.now(),
      } satisfies CacheEntry;

      if (isCacheable) {
        context.client
          .set(context.key, cacheEntry, context.ttl)
          .catch((err) => {
            this.onAsyncCacheWriteFailure?.(err);
            console.error(err);

            if (context.debug) {
              console.warn(
                `type-cacheable Cacheable set cache failure on method ${
                  context.originalMethod.name
                } due to client error: ${(err as Error).message}`
              );
            }
          });
      }

      resolve(cacheEntry);
    });
  };

  async handle(context: CacheStrategyContext): Promise<unknown> {
    const startTime = Date.now();

    let cachedValueDone = false;
    const cachedValuePromise: Promise<CacheEntry | undefined> =
      this.findCachedValue(context.client, context.key).then((result) => {
        cachedValueDone = true;
        return result;
      });

    const methodPromise = this.getMethodValue(context);

    const result = await Promise.any([cachedValuePromise, methodPromise]);
    if (
      cachedValueDone &&
      result &&
      result.timestamp > Date.now() - this.staleValueTtl
    ) {
      this.onRequestFinshed?.(startTime, Date.now(), 'stale');
      return result.value;
    }

    try {
      const methodResult = await methodPromise;
      this.onRequestFinshed?.(startTime, Date.now(), 'method');
      return methodResult.value;
    } catch (err) {
      const oldResult = await cachedValuePromise;
      if (oldResult) {
        this.onRequestFinshed?.(startTime, Date.now(), 'fallback');
        return oldResult.value;
      } else {
        throw err;
      }
    }
  }
}
