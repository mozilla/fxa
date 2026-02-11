/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import {
  AsyncLocalStorageAdapter,
  withTypeCacheableAsyncLocalStorage,
  TypeCacheableAsyncLocalStorageNotAvailableError,
} from './type-cachable-async-local-storage-adapter';

describe('AsyncLocalStorageAdapter', () => {
  let adapter: AsyncLocalStorageAdapter;

  beforeEach(() => {
    adapter = new AsyncLocalStorageAdapter();
  });

  it('should return undefined if the key does not exist', () => {
    const result = withTypeCacheableAsyncLocalStorage(async () => {
      return await adapter.get(faker.string.uuid());
    });

    return expect(result).resolves.toBeUndefined();
  });

  it('should return the value if the key exists', () => {
    const key = faker.string.uuid();
    const value = 'somevalue';

    const result = withTypeCacheableAsyncLocalStorage(async () => {
      await adapter.set(key, value);
      return await adapter.get(key);
    });

    return expect(result).resolves.toEqual(value);
  });

  it('should delete a key', () => {
    const key = faker.string.uuid();
    const value = 'somevalue';

    const result = withTypeCacheableAsyncLocalStorage(async () => {
      await adapter.set(key, value);
      await adapter.del(key);
      return await adapter.get(key);
    });

    return expect(result).resolves.toBeUndefined();
  });

  it('should list keys in the cache', () => {
    const key = faker.string.uuid();
    const value = 'somevalue';

    const result = withTypeCacheableAsyncLocalStorage(async () => {
      await adapter.set(key, value);
      return await adapter.keys('');
    });

    return expect(result).resolves.toContain(key);
  });

  it('should delete multiple keys', () => {
    const key1 = faker.string.uuid();
    const key2 = faker.string.uuid();

    const result = withTypeCacheableAsyncLocalStorage(async () => {
      await adapter.set(key1, 'value1');
      await adapter.set(key2, 'value2');
      await adapter.del([key1, key2]);

      const [res1, res2] = await Promise.all([
        adapter.get(key1),
        adapter.get(key2),
      ]);

      return [res1, res2];
    });

    return expect(result).resolves.toEqual([undefined, undefined]);
  });

  it('should not throw if used outside context when throwWhenContextUnavailable is false', async () => {
    const adapter = new AsyncLocalStorageAdapter(false);
    await expect(adapter.get(faker.string.uuid())).resolves.toBeUndefined();
  });

  it('should throw if used outside context when throwWhenContextUnavailable is true', async () => {
    const adapter = new AsyncLocalStorageAdapter(true);
    await expect(adapter.get(faker.string.uuid())).rejects.toThrow(
      TypeCacheableAsyncLocalStorageNotAvailableError
    );
  });

  it('should throw when calling delHash', async () => {
    await expect(adapter.delHash(faker.string.uuid())).rejects.toThrow(
      'delHash() not supported for cachable AsyncLocalStorageAdapter'
    );
  });
});
