/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import { CacheStrategyContext } from '@type-cacheable/core';
import { StaleWhileRevalidateWithFallbackStrategy } from './type-cachable-stale-while-revalidate-with-fallback';
import { MemoryAdapter } from './type-cachable-memory-adapter';
import { setTimeout } from 'timers/promises';

describe('StaleWhileRevalidateWithFallbackStrategy', () => {
  let staleWhileRevalidateWithFallbackStrategy: StaleWhileRevalidateWithFallbackStrategy;
  let targetMethod: jest.Mock;
  const methodValue = faker.string.uuid();
  let cacheClient: MemoryAdapter;
  const cacheKey = faker.string.uuid();
  let onAsyncCacheWriteFailure: jest.Mock;
  let onRequestFinished: jest.Mock;
  const staleValueTtl = 100;

  beforeEach(() => {
    onAsyncCacheWriteFailure = jest.fn();
    onRequestFinished = jest.fn();
    staleWhileRevalidateWithFallbackStrategy =
      new StaleWhileRevalidateWithFallbackStrategy(
        staleValueTtl,
        onAsyncCacheWriteFailure,
        onRequestFinished
      );
    cacheClient = new MemoryAdapter();
    targetMethod = jest.fn().mockResolvedValue(methodValue);
  });

  it('returns cached value if present', async () => {
    const context = {
      debug: false,
      originalMethod: targetMethod,
      originalMethodScope: {},
      originalPropertyKey: '',
      originalMethodArgs: [],
      client: cacheClient,
      fallbackClient: null,
      key: cacheKey,
      ttl: 100,
      isCacheable: () => true,
    } satisfies CacheStrategyContext;

    const cacheValue = {
      value: methodValue,
      timestamp: Date.now() + 1000,
    };
    await cacheClient.set(cacheKey, cacheValue);

    const result = await staleWhileRevalidateWithFallbackStrategy.handle(
      context
    );

    expect(result).toEqual(cacheValue.value);

    expect(targetMethod).toHaveBeenCalled();
    expect(onRequestFinished).toHaveBeenCalledWith(
      expect.any(Number),
      expect.any(Number),
      'stale'
    );
    expect(onAsyncCacheWriteFailure).not.toHaveBeenCalled();
  });

  it('returns method value if no cached value is present', async () => {
    const context = {
      debug: false,
      originalMethod: targetMethod,
      originalMethodScope: {},
      originalPropertyKey: '',
      originalMethodArgs: [],
      client: cacheClient,
      fallbackClient: null,
      key: cacheKey,
      ttl: 100,
      isCacheable: () => true,
    } satisfies CacheStrategyContext;

    const result = await staleWhileRevalidateWithFallbackStrategy.handle(
      context
    );

    expect(result).toEqual(methodValue);

    expect(targetMethod).toHaveBeenCalled();
    expect(onRequestFinished).toHaveBeenCalledWith(
      expect.any(Number),
      expect.any(Number),
      'method'
    );
    expect(onAsyncCacheWriteFailure).not.toHaveBeenCalled();
  });

  it('returns cached value if method call throws error', async () => {
    const context = {
      debug: false,
      originalMethod: targetMethod,
      originalMethodScope: {},
      originalPropertyKey: '',
      originalMethodArgs: [],
      client: cacheClient,
      fallbackClient: null,
      key: cacheKey,
      ttl: 100,
      isCacheable: () => true,
    } satisfies CacheStrategyContext;

    targetMethod.mockRejectedValue(new Error('method error'));

    const cacheValue = {
      value: methodValue,
      timestamp: Date.now() + 1000,
    };
    await cacheClient.set(cacheKey, cacheValue);

    const result = await staleWhileRevalidateWithFallbackStrategy.handle(
      context
    );

    expect(result).toEqual(cacheValue.value);

    expect(targetMethod).toHaveBeenCalled();
    expect(onRequestFinished).toHaveBeenCalledWith(
      expect.any(Number),
      expect.any(Number),
      'stale'
    );
    expect(onAsyncCacheWriteFailure).not.toHaveBeenCalled();
  });

  it('calls onAsyncCacheWriteFailure if cache write fails', async () => {
    const context = {
      debug: false,
      originalMethod: targetMethod,
      originalMethodScope: {},
      originalPropertyKey: '',
      originalMethodArgs: [],
      client: cacheClient,
      fallbackClient: null,
      key: cacheKey,
      ttl: 100,
      isCacheable: () => true,
    } satisfies CacheStrategyContext;

    jest
      .spyOn(cacheClient, 'set')
      .mockRejectedValue(new Error('cache write error'));

    await staleWhileRevalidateWithFallbackStrategy.handle(context);

    expect(targetMethod).toHaveBeenCalled();

    // Wait at end of node event loop to ensure async cache write failure is called
    await setTimeout();
    expect(onAsyncCacheWriteFailure).toHaveBeenCalledWith(
      new Error('cache write error')
    );
  });

  it('returns method value if cache client fails to get cached value, and method has value', async () => {
    const context = {
      debug: false,
      originalMethod: targetMethod,
      originalMethodScope: {},
      originalPropertyKey: '',
      originalMethodArgs: [],
      client: cacheClient,
      fallbackClient: null,
      key: cacheKey,
      ttl: 100,
      isCacheable: () => true,
    } satisfies CacheStrategyContext;

    jest
      .spyOn(cacheClient, 'get')
      .mockRejectedValue(new Error('cache get error'));

    const result = await staleWhileRevalidateWithFallbackStrategy.handle(
      context
    );

    expect(result).toEqual(methodValue);

    expect(targetMethod).toHaveBeenCalled();
    expect(onRequestFinished).toHaveBeenCalledWith(
      expect.any(Number),
      expect.any(Number),
      'method'
    );
    expect(onAsyncCacheWriteFailure).not.toHaveBeenCalled();
  });

  it('returns fallback value if cache returns an old value (outside of stale ttl), method throws error', async () => {
    const context = {
      debug: false,
      originalMethod: targetMethod,
      originalMethodScope: {},
      originalPropertyKey: '',
      originalMethodArgs: [],
      client: cacheClient,
      fallbackClient: cacheClient,
      key: cacheKey,
      ttl: 100,
      isCacheable: () => true,
    } satisfies CacheStrategyContext;

    targetMethod.mockRejectedValue(new Error('method error'));

    const cacheValue = {
      value: methodValue,
      timestamp: Date.now() - staleValueTtl * 1000,
    };
    await cacheClient.set(cacheKey, cacheValue);

    const result = await staleWhileRevalidateWithFallbackStrategy.handle(
      context
    );

    expect(result).toEqual(cacheValue.value);

    expect(targetMethod).toHaveBeenCalled();
    expect(onRequestFinished).toHaveBeenCalledWith(
      expect.any(Number),
      expect.any(Number),
      'fallback'
    );
    expect(onAsyncCacheWriteFailure).not.toHaveBeenCalled();
  });

  it("throws error if the cache client doesn't have a record, the method call fails, and there is no fallback value", async () => {
    const context = {
      debug: false,
      originalMethod: targetMethod,
      originalMethodScope: {},
      originalPropertyKey: '',
      originalMethodArgs: [],
      client: cacheClient,
      fallbackClient: null,
      key: cacheKey,
      ttl: 100,
      isCacheable: () => true,
    } satisfies CacheStrategyContext;

    targetMethod.mockRejectedValue(new Error('method error'));

    await expect(
      staleWhileRevalidateWithFallbackStrategy.handle(context)
    ).rejects.toThrowError('method error');

    expect(targetMethod).toHaveBeenCalled();
    expect(onRequestFinished).not.toHaveBeenCalled();
    expect(onAsyncCacheWriteFailure).not.toHaveBeenCalled();
  });
});
