/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Redis from 'ioredis';

import { MeteringDedupeManager } from './metering-dedupe.manager';
import {
  MockMeteringRedisConfig,
  MeteringRedisConfig,
} from './metering-redis.config';

const REDIS_HOST = process.env['REDIS_TEST_HOST'] ?? 'localhost';
const REDIS_PORT = Number(process.env['REDIS_TEST_PORT'] ?? 6379);
const KEY_PREFIX = 'test-metering:dedupe:';

const CONFIG: MeteringRedisConfig = {
  ...MockMeteringRedisConfig,
  host: REDIS_HOST,
  port: REDIS_PORT,
  keyPrefix: KEY_PREFIX,
};

describe('MeteringDedupeManager against a real Redis', () => {
  let prefixed: Redis.Redis;
  let raw: Redis.Redis;
  let manager: MeteringDedupeManager;

  async function deleteTestKeys(): Promise<void> {
    const keys = await raw.keys(`${KEY_PREFIX}*`);
    if (keys.length > 0) {
      await raw.del(...keys);
    }
  }

  beforeAll(() => {
    prefixed = new Redis({
      host: REDIS_HOST,
      port: REDIS_PORT,
      keyPrefix: KEY_PREFIX,
    });
    raw = new Redis({ host: REDIS_HOST, port: REDIS_PORT });
    manager = new MeteringDedupeManager(CONFIG, prefixed);
  });

  beforeEach(async () => {
    await deleteTestKeys();
  });

  afterAll(async () => {
    await deleteTestKeys();
    await prefixed.quit();
    await raw.quit();
  });

  it('claims a key the first time it is seen', async () => {
    await expect(manager.claim(['vpn:e1'])).resolves.toEqual(['claimed']);
  });

  it('reports pending while an earlier claim has not been confirmed', async () => {
    await manager.claim(['vpn:e1']);

    await expect(manager.claim(['vpn:e1'])).resolves.toEqual(['pending']);
  });

  it('reports a duplicate once the claim has been confirmed', async () => {
    await manager.claim(['vpn:e1']);
    await manager.confirm(['vpn:e1']);

    await expect(manager.claim(['vpn:e1'])).resolves.toEqual(['duplicate']);
  });

  it('makes a released key claimable again', async () => {
    await manager.claim(['vpn:e1']);
    await manager.release(['vpn:e1']);

    await expect(manager.claim(['vpn:e1'])).resolves.toEqual(['claimed']);
  });

  it('treats the same event id under two clients as two events', async () => {
    await expect(manager.claim(['vpn:e1', 'relay:e1'])).resolves.toEqual([
      'claimed',
      'claimed',
    ]);
  });

  it('holds an unconfirmed claim only for the short claim TTL', async () => {
    await manager.claim(['vpn:e1']);

    const ttlMs = await raw.pttl(`${KEY_PREFIX}vpn:e1`);
    expect(ttlMs).toBeGreaterThan(0);
    expect(ttlMs).toBeLessThanOrEqual(CONFIG.claimTtlSeconds * 1000);
  });

  it('extends a confirmed claim to the full dedupe TTL', async () => {
    await manager.claim(['vpn:e1']);
    await manager.confirm(['vpn:e1']);

    const ttlMs = await raw.pttl(`${KEY_PREFIX}vpn:e1`);
    expect(ttlMs).toBeGreaterThan(CONFIG.claimTtlSeconds * 1000);
    expect(ttlMs).toBeLessThanOrEqual(CONFIG.dedupeTtlSeconds * 1000);
  });

  it('namespaces every key under the configured prefix', async () => {
    await manager.claim(['vpn:e1']);
    await expect(raw.get(`${KEY_PREFIX}vpn:e1`)).resolves.toBe('claimed');

    await manager.confirm(['vpn:e1']);
    await expect(raw.get(`${KEY_PREFIX}vpn:e1`)).resolves.toBe('stored');
  });
});
