/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  CacheClient,
  CacheStrategy,
  CacheStrategyContext,
} from '@type-cacheable/core';

/**
 * Result meaning:
 * - cache: The result was found in cache and returned.
 * - method: There was no value in cache, so the method was called.
 */
type CacheResult = 'cache' | 'method';

export class CacheFirstStrategy implements CacheStrategy {
  private pendingCacheRequestMap = new Map<string, Promise<unknown>>();
  private pendingMethodCallMap = new Map<string, Promise<unknown>>();

  constructor(
    /**
     * Useful for external error handling or logging
     */
    private onAsyncCacheWriteFailure?: (err: unknown) => void,
    /**
     * Useful for external logging
     */
    private onRequestFinished?: (
      startTime: number,
      endTime: number,
      cacheResult: CacheResult
    ) => void
  ) {}

  private findCachedValue = async (client: CacheClient, key: string) => {
    let cachedValue: unknown;

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
    return new Promise<unknown>(async (resolve, reject) => {
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

      if (isCacheable) {
        context.client
          .set(context.key, methodValue, context.ttl)
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

      resolve(methodValue);
    });
  };

  async handle(context: CacheStrategyContext): Promise<unknown> {
    const startTime = Date.now();

    const cachedValue = await this.findCachedValue(context.client, context.key);
    if (cachedValue) {
      this.onRequestFinished?.(startTime, Date.now(), 'cache');
      return cachedValue;
    }

    const methodValue = await this.getMethodValue(context);
    this.onRequestFinished?.(startTime, Date.now(), 'method');
    return methodValue;
  }
}
