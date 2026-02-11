/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import { CacheStrategyContext } from '@type-cacheable/core';
import { CacheFirstStrategy } from './type-cachable-cache-first';
import { MemoryAdapter } from './type-cachable-memory-adapter';
import { setTimeout } from 'timers/promises';

describe('CacheFirstStrategy', () => {
  let cacheFirstStrategy: CacheFirstStrategy;
  let targetMethod: jest.Mock;
  const methodValue = faker.string.uuid();
  let cacheClient: MemoryAdapter;
  const cacheKey = faker.string.uuid();
  const cacheValue = faker.string.uuid();
  let onAsyncCacheWriteFailure: jest.Mock;
  let onRequestFinished: jest.Mock;

  beforeEach(() => {
    onAsyncCacheWriteFailure = jest.fn();
    onRequestFinished = jest.fn();
    cacheFirstStrategy = new CacheFirstStrategy(
      onAsyncCacheWriteFailure,
      onRequestFinished
    );
    cacheClient = new MemoryAdapter();
    targetMethod = jest.fn().mockResolvedValue(methodValue);
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

    const result = await cacheFirstStrategy.handle(context);

    expect(result).toEqual(methodValue);

    expect(targetMethod).toHaveBeenCalled();
    expect(onRequestFinished).toHaveBeenCalledWith(
      expect.any(Number),
      expect.any(Number),
      'method'
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

    await cacheFirstStrategy.handle(context);

    expect(targetMethod).toHaveBeenCalled();

    // Wait at end of node event loop to ensure async cache write failure is called
    await setTimeout();
    expect(onAsyncCacheWriteFailure).toHaveBeenCalledWith(
      new Error('cache write error')
    );
  });

  it('returns cached value if present and does not call method', async () => {
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

    await cacheClient.set(cacheKey, cacheValue);

    const result = await cacheFirstStrategy.handle(context);

    expect(result).toEqual(cacheValue);

    expect(targetMethod).not.toHaveBeenCalled();
    expect(onRequestFinished).toHaveBeenCalledWith(
      expect.any(Number),
      expect.any(Number),
      'cache'
    );
    expect(onAsyncCacheWriteFailure).not.toHaveBeenCalled();
  });

  it('throws error if cache client fails to get cached value', async () => {
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

    jest.spyOn(cacheClient, 'get').mockRejectedValue(new Error('cache error'));

    await expect(cacheFirstStrategy.handle(context)).rejects.toThrowError(
      'cache error'
    );
    expect(targetMethod).not.toHaveBeenCalled();
  });

  it("throws error if the cache client doesn't have a record, and the method call fails", async () => {
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

    jest.spyOn(cacheClient, 'get').mockResolvedValue(null);

    targetMethod.mockRejectedValue(new Error('method error'));

    await expect(cacheFirstStrategy.handle(context)).rejects.toThrowError(
      'method error'
    );
  });
});
