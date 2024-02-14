/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  CacheClient,
  CacheStrategy,
  CacheStrategyContext,
} from '@type-cacheable/core';

export class NetworkFirstStrategy implements CacheStrategy {
  private pendingCacheRequestMap = new Map<string, Promise<any>>();
  private pendingMethodCallMap = new Map<string, Promise<any>>();

  private findCachedValue = async (client: CacheClient, key: string) => {
    let cachedValue: any;

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

  async handle(context: CacheStrategyContext): Promise<any> {
    let result: any;
    const pendingMethodRun = this.pendingMethodCallMap.get(context.key);

    if (pendingMethodRun) {
      result = await pendingMethodRun;
    } else {
      const methodPromise = new Promise(async (resolve, reject) => {
        let returnValue;
        let isCacheable = false;
        try {
          returnValue = await context.originalMethod.apply(
            context.originalMethodScope,
            context.originalMethodArgs
          );
          isCacheable = context.isCacheable(returnValue);
        } catch (err) {
          reject(err);
          return;
        }

        if (!isCacheable) {
          resolve(returnValue);
          return;
        }

        try {
          await context.client.set(context.key, returnValue, context.ttl);
        } catch (err) {
          console.error(err);

          if (context.fallbackClient) {
            try {
              await context.fallbackClient.set(
                context.key,
                returnValue,
                context.ttl
              );
            } catch (err) {}
          }

          if (context.debug) {
            console.warn(
              `type-cacheable Cacheable set cache failure on method ${
                context.originalMethod.name
              } due to client error: ${(err as Error).message}`
            );
          }
        }

        resolve(returnValue);
      });

      try {
        this.pendingMethodCallMap.set(context.key, methodPromise);
        result = await methodPromise;
      } catch (err) {
        console.error(err);
      } finally {
        this.pendingMethodCallMap.delete(context.key);
      }
    }

    if (result) {
      return result;
    }

    try {
      const cachedValue = await this.findCachedValue(
        context.client,
        context.key
      );

      // If a value for the cacheKey was found in cache, simply return that.
      if (cachedValue !== undefined && cachedValue !== null) {
        return cachedValue;
      }
    } catch (err) {
      console.error(err);

      if (context.fallbackClient) {
        try {
          const cachedValue = await this.findCachedValue(
            context.fallbackClient,
            context.key
          );

          // If a value for the cacheKey was found in cache, simply return that.
          if (cachedValue !== undefined && cachedValue !== null) {
            return cachedValue;
          }
        } catch (fallbackErr) {}
      }

      if (context.debug) {
        console.warn(
          `type-cacheable Cacheable cache miss on method ${
            context.originalMethod.name
          } due to client error: ${(err as Error).message}`
        );
      }
    }

    return result;
  }
}
