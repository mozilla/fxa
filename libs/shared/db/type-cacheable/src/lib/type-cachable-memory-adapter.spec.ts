/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import { MemoryAdapter } from './type-cachable-memory-adapter';

describe('MemoryAdapter', () => {
  let memoryAdapter: MemoryAdapter;
  beforeEach(() => {
    memoryAdapter = new MemoryAdapter();
  });

  it('should return undefined if the key does not exist', async () => {
    const result = await memoryAdapter.get(faker.string.uuid());

    expect(result).toBeUndefined();
  });

  it('should return the value if the key exists and has not expired', async () => {
    const key = faker.string.uuid();
    const value = 'somevalue';
    await memoryAdapter.set(key, value);

    const result = await memoryAdapter.get(key);

    expect(result).toEqual(value);
  });

  it('should return undefined if the key exists but has expired', async () => {
    const key = faker.string.uuid();
    const value = 'somevalue';
    await memoryAdapter.set(key, value, -1);

    const result = await memoryAdapter.get(key);

    expect(result).toBeUndefined();
  });

  it('should delete a key', async () => {
    const key = faker.string.uuid();
    const value = 'somevalue';
    await memoryAdapter.set(key, value);

    await memoryAdapter.del(key);

    const result = await memoryAdapter.get(key);

    expect(result).toBeUndefined();
  });

  it('should list keys in the cache', async () => {
    const key = faker.string.uuid();
    const value = 'somevalue';
    await memoryAdapter.set(key, value);

    const keys = await memoryAdapter.keys('');

    expect(keys).toContain(key);
  });
});
