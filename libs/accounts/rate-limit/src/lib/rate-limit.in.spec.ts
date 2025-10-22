/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { RateLimit } from './rate-limit';
import { parseConfigRules } from './config';
import Redis from 'ioredis';
import { after } from 'node:test';
import { StatsD } from 'hot-shots';

describe('rate-limit', () => {
  let mockIncrement: jest.Mock;
  let statsd: StatsD;
  let redis: Redis.Redis;
  let rateLimit: RateLimit;

  beforeAll(() => {
    redis = new Redis('localhost');
    mockIncrement = jest.fn();
    statsd = {
      increment: mockIncrement,
    } as unknown as StatsD;
  });

  beforeEach(async () => {
    await redis.flushall();
    rateLimit = new RateLimit({ rules: {} }, redis, statsd);
    mockIncrement.mockReset();
  });

  after(async () => {
    await redis.flushall();
  });

  for (const blockOn of ['ip', 'email', 'uid', 'ip_email', 'ip_uid']) {
    it('should block on ' + blockOn, async () => {
      rateLimit = new RateLimit(
        { rules: parseConfigRules([`testBlock:${blockOn}:1:1s:1s:block`]) },
        redis,
        statsd
      );

      const check1 = await rateLimit.check('testBlock', {
        ip_email: '127.0.0.1_foo@mozilla.com',
        ip: '127.0.0.1',
        email: 'foo@mozilla.com',
        uid: '123',
        ip_uid: '127.0.0.1_123',
      });
      const check2 = await rateLimit.check('testBlock', {
        ip_email: '127.0.0.1_foo@mozilla.com',
        ip: '127.0.0.1',
        email: 'foo@mozilla.com',
        uid: '123',
        ip_uid: '127.0.0.1_123',
      });

      expect(check1).toBeNull();
      expect(check2?.reason).toEqual('too-many-attempts');
      expect(check2?.retryAfter).toEqual(1000);

      expect(mockIncrement).toBeCalledTimes(1);
      expect(mockIncrement).toBeCalledWith('rate_limit.block', [
        `on:${blockOn}`,
        'action:testBlock',
      ]);
    });

    it('should report on ' + blockOn, async () => {
      rateLimit = new RateLimit(
        { rules: parseConfigRules([`testReport:${blockOn}:1:1s:1s:report`]) },
        redis,
        statsd
      );

      const check1 = await rateLimit.check('testReport', {
        ip_email: '127.0.0.1_foo@mozilla.com',
        ip_uid: '127.0.0.1_123',
        ip: '127.0.0.1',
        email: 'foo@mozilla.com',
        uid: '123',
      });
      const check2 = await rateLimit.check('testReport', {
        ip_email: '127.0.0.1_foo@mozilla.com',
        ip_uid: '127.0.0.1_123',
        ip: '127.0.0.1',
        email: 'foo@mozilla.com',
        uid: '123',
      });

      expect(check1).toBeNull();
      expect(check2).toBeNull();

      expect(mockIncrement).toBeCalledTimes(1);
      expect(mockIncrement).toBeCalledWith('rate_limit.report', [
        `on:${blockOn}`,
        'action:testReport',
      ]);
    });
  }

  it(`should not block after window clears`, async () => {
    rateLimit = new RateLimit(
      { rules: parseConfigRules(['testWindowCleared:ip:1:1s:1s:block']) },
      redis,
      statsd
    );

    const check1 = await rateLimit.check('testWindowCleared', {
      ip: '127.0.0.1',
    });
    await new Promise((r) => setTimeout(r, 1001));
    const check2 = await rateLimit.check('testWindowCleared', {
      ip: '127.0.0.1',
    });

    expect(check1).toBeNull();
    expect(check2).toBeNull();
  });

  it('can block multiple rules on a single action', async () => {
    rateLimit = new RateLimit(
      {
        rules: parseConfigRules([
          'testMulti:ip:2:10s:2s:block',
          'testMulti:email:2:10s:3s:block',
        ]),
      },
      redis,
      statsd
    );
    const check1 = await rateLimit.check('testMulti', {
      ip: '127.0.0.1',
      email: 'foo@mozilla.com',
      uid: '000',
    });
    const check2 = await rateLimit.check('testMulti', {
      ip: '127.0.0.1',
      email: 'foo@mozilla.com',
      uid: '000',
    });
    const check3 = await rateLimit.check('testMulti', {
      ip: '127.0.0.1',
      email: 'foo@mozilla.com',
      uid: '000',
    });
    await new Promise((r) => setTimeout(r, 2001));
    const check4 = await rateLimit.check('testMulti', {
      ip: '127.0.0.1',
      email: 'foo@mozilla.com',
      uid: '000',
    });
    await new Promise((r) => setTimeout(r, 1001));
    const check5 = await rateLimit.check('testMulti', {
      ip: '127.0.0.1',
      email: 'foo@mozilla.com',
      uid: '000',
    });

    expect(check1).toBeNull();
    expect(check2).toBeNull();
    // Two blocks, but email should have the longest duration, and should be returned
    expect(check3?.blockingOn).toEqual('email');
    // Ip block should expire, so one remaining email block.
    expect(check4?.blockingOn).toEqual('email');
    // Blocks should expire
    expect(check5).toBeNull();
  });

  it('can block a doubled up rule', async () => {
    rateLimit = new RateLimit(
      {
        rules: parseConfigRules([
          'testDouble:email:2:10s:2s:block',
          'testDouble:email:3:10s:4s:block',
        ]),
      },
      redis,
      statsd
    );
    const check1 = await rateLimit.check('testDouble', {
      email: 'foo@mozilla.com',
    });
    const check2 = await rateLimit.check('testDouble', {
      email: 'foo@mozilla.com',
    });
    const check3 = await rateLimit.check('testDouble', {
      email: 'foo@mozilla.com',
    });
    const check4 = await rateLimit.check('testDouble', {
      email: 'foo@mozilla.com',
    });

    expect(check1).toBeNull();
    expect(check2).toBeNull();
    // Third attempt should trigger first rule
    expect(check3?.blockingOn).toEqual('email');
    // Fourth attempt should trigger second rule
    expect(check4?.blockingOn).toEqual('email');
  });

  it('should clear block after block duration ends', async () => {
    rateLimit = new RateLimit(
      {
        rules: parseConfigRules(['test:ip:1:20s:1s:block']),
      },
      redis,
      statsd
    );

    const check1 = await rateLimit.check('test', { ip: '127.0.0.1' });
    const check2 = await rateLimit.check('test', { ip: '127.0.0.1' });
    await new Promise((r) => setTimeout(r, 500));
    const check3 = await rateLimit.check('test', { ip: '127.0.0.1' });
    await new Promise((r) => setTimeout(r, 1001));
    const check4 = await rateLimit.check('test', { ip: '127.0.0.1' });

    expect(check1).toBeNull();
    expect(check2?.retryAfter).toEqual(1000);
    expect(check3?.retryAfter).toBeLessThan(501);
    expect(check3?.retryAfter).toBeGreaterThan(450);
    expect(check4).toBeNull();
  });

  it('can unblock', async () => {
    rateLimit = new RateLimit(
      {
        rules: parseConfigRules([
          'testBlock:ip:1:1s:1s:block',
          'testReport:ip:1:1s:1s:report',
        ]),
      },
      redis,
      statsd
    );

    // Check block
    const check1 = await rateLimit.check('testBlock', { ip: '127.0.0.1' });
    const checkReportOnly1 = await rateLimit.check('testReport', {
      ip: '127.0.0.1',
    });

    const check2 = await rateLimit.check('testBlock', { ip: '127.0.0.1' });
    const checkReportOnly2 = await rateLimit.check('testReport', {
      ip: '127.0.0.1',
    });

    await rateLimit.unblock({ ip: '127.0.0.1' });
    const check3 = await rateLimit.check('testBlock', { ip: '127.0.0.1' });
    const checkReportOnly3 = await rateLimit.check('testReport', {
      ip: '127.0.0.1',
    });

    expect(check1).toBeNull();

    expect(check2).not.toBeNull();
    expect(check2?.reason).toEqual('too-many-attempts');
    expect(check2?.retryAfter).toEqual(1000);
    expect(check3).toBeNull();

    expect(check2).not.toBeNull();
    expect(check2?.reason).toEqual('too-many-attempts');
    expect(check2?.retryAfter).toEqual(1000);
    expect(check3).toBeNull();

    // Report only never returns an actual block!
    expect(checkReportOnly1).toBeNull();
    expect(checkReportOnly2).toBeNull();
    expect(checkReportOnly3).toBeNull();

    expect(statsd.increment).toBeCalledTimes(5);
    // For unblock calls
    expect(statsd.increment).toBeCalledWith('rate_limit.unblock', [
      'on:ip',
      'action:testBlock',
    ]);
    // For two blocked calls
    expect(statsd.increment).toBeCalledWith('rate_limit.block', [
      'on:ip',
      'action:testBlock',
    ]);
    // For two report only calls
    expect(statsd.increment).toBeCalledWith('rate_limit.report', [
      'on:ip',
      'action:testReport',
    ]);
  });

  it('supports long emails', async () => {
    // Regression test for: FXA-9463
    rateLimit = new RateLimit(
      {
        rules: parseConfigRules(['testBlock:email:1:1s:1hour:block']),
      },
      redis,
      statsd
    );

    const email = Array(255).fill('β').join('') + '@restmail.net';
    const check1 = await rateLimit.check('testBlock', { email });
    const check2 = await rateLimit.check('testBlock', { email });

    expect(check1).toBeNull();
    expect(check2?.reason).toEqual('too-many-attempts');
  });

  it('can fallback to a default rule', async () => {
    rateLimit = new RateLimit(
      { rules: parseConfigRules(['default:ip:1:1s:1s:block']) },
      redis,
      statsd
    );
    const check1 = await rateLimit.check('testBlock', { ip: '127.0.0.1' });
    const check2 = await rateLimit.check('testBlock', { ip: '127.0.0.1' });

    expect(check1).toBeNull();
    expect(check2?.reason).toEqual('too-many-attempts');
    expect(check2?.retryAfter).toEqual(1000);

    expect(mockIncrement).toBeCalledTimes(1);
    expect(mockIncrement).toBeCalledWith('rate_limit.block', [
      'on:ip',
      'action:testBlock',
    ]);
  });

  it('can ban', async () => {
    rateLimit = new RateLimit(
      {
        rules: parseConfigRules([
          'testBlock:ip:1:1s:1s:block',
          'testBlock:email:1:1s:1s:block',
          'testBlockUid:uid:1:1s:1s:block',
          'testBlockEmail:email:10:1s:1s:block',
          'testBan:ip:1:10s:10s:ban',
        ]),
      },
      redis,
      statsd
    );

    const check1 = await rateLimit.check('testBan', { ip: '127.0.0.1' });
    const check2 = await rateLimit.check('testBan', { ip: '127.0.0.1' });

    // testBlock Should be blocked by check2 triggering a 'ban'.
    const check3 = await rateLimit.check('testBlock', {
      email: 'foo@mozilla.com',
      ip: '127.0.0.1',
    });

    // testBlockEmail should not be blocked, because it's has no policy for
    // for 'ip', which is what the ban is on.
    const check4 = await rateLimit.check('testBlockEmail', {
      email: 'foo@mozilla.com',
      ip: '127.0.0.1',
    });

    // testBlockEmail should be blocked, but if we don't provide the ip
    // there's not much the rate limiter can do.
    const check5 = await rateLimit.check('testBlockEmail', {
      email: 'foo@mozilla.com',
    });

    expect(check1).toBeNull();

    expect(check2).not.toBeNull();
    expect(check2?.reason).toEqual('too-many-attempts');
    expect(check2?.retryAfter).toBeGreaterThan(10000 - 100);
    expect(check2?.policy).toEqual('ban');

    // testBan should trigger a block on all other actions
    expect(check3).not.toBeNull();
    expect(check3?.reason).toEqual('too-many-attempts');
    expect(check3?.retryAfter).toBeGreaterThan(10000 - 100);
    expect(check3?.policy).toEqual('ban');

    expect(check4).not.toBeNull();
    expect(check5).toBeNull();

    expect(statsd.increment).toBeCalledTimes(1);
    expect(statsd.increment).toBeCalledWith('rate_limit.ban', [
      'on:ip',
      'action:testBan',
    ]);
  });

  it('can unban', async () => {
    rateLimit = new RateLimit(
      {
        rules: parseConfigRules([
          'testBlock:ip:1:1s:1s:block',
          'testBlock:email:1:1s:1s:block',
          'testBlockUid:uid:1:1s:1s:block',
          'testBlockEmail:email:10:1s:1s:block',
          'testBan:ip:1:1s:10s:ban',
        ]),
      },
      redis,
      statsd
    );

    const check1 = await rateLimit.check('testBan', { ip: '127.0.0.1' });
    const check2 = await rateLimit.check('testBan', { ip: '127.0.0.1' });

    // testBlock Should be blocked by check2 triggering a 'ban'.
    const check3 = await rateLimit.check('testBlock', {
      email: 'foo@mozilla.com',
      ip: '127.0.0.1',
    });

    // Should not clear the ban!
    await rateLimit.unblock({
      ip: '127.0.0.1',
    });

    // The IP should still be banned. Unblocking doesn't not equal unbanning.
    const check4 = await rateLimit.check('testBlockEmail', {
      email: 'foo@mozilla.com',
      ip: '127.0.0.1',
    });

    // Should clear the ban!
    await rateLimit.unban({
      ip: '127.0.0.1',
    });

    // The IP ban has been cleared. This check should now pass.
    const check5 = await rateLimit.check('testBlockEmail', {
      email: 'foo@mozilla.com',
      ip: '127.0.0.1',
    });

    expect(check1).toBeNull();
    expect(check2).not.toBeNull();
    expect(check3).not.toBeNull();
    expect(check4).not.toBeNull();
    expect(check5).toBeNull();
  });

  it('should clear ban after ban duration ends', async () => {
    rateLimit = new RateLimit(
      {
        rules: parseConfigRules([
          'test :ip:1  :20s :1s :ban',
          'testB:ip:100:20s :1s :block',
        ]),
      },
      redis,
      statsd
    );

    const check1 = await rateLimit.check('test', { ip: '127.0.0.1' });
    const check2 = await rateLimit.check('test', { ip: '127.0.0.1' });
    await new Promise((r) => setTimeout(r, 500));
    const check3 = await rateLimit.check('test', { ip: '127.0.0.1' });
    const check3b = await rateLimit.check('testB', { ip: '127.0.0.1' });
    await new Promise((r) => setTimeout(r, 1001));
    const check4 = await rateLimit.check('test', { ip: '127.0.0.1' });
    const check4b = await rateLimit.check('testB', { ip: '127.0.0.1' });

    expect(check1).toBeNull();
    expect(check2?.retryAfter).toEqual(1000);
    expect(check3?.retryAfter).toBeLessThan(501);
    expect(check3?.retryAfter).toBeGreaterThan(450);
    expect(check3b?.retryAfter).toBeLessThan(501);
    expect(check3b?.retryAfter).toBeGreaterThan(450);
    expect(check4).toBeNull();
    expect(check4b).toBeNull();
  });

  describe('search method', () => {
    beforeEach(async () => {
      rateLimit = new RateLimit(
        {
          rules: parseConfigRules([
            'testBlock:ip:1:1s:10s:block',
            'testBan:email:1:1s:10s:ban',
            'testMultiple:uid:1:1s:10s:block',
          ]),
        },
        redis,
        statsd
      );
    });

    it('can search for blocks by IP', async () => {
      await rateLimit.check('testBlock', { ip: '192.168.1.1' });
      await rateLimit.check('testBlock', { ip: '192.168.1.1' });

      const results = await rateLimit.search({ ip: '192.168.1.1' });

      expect(results).toHaveLength(1);
      expect(results[0].action).toBe('testBlock');
      expect(results[0].blockingOn).toBe('ip');
      expect(results[0].policy).toBe('block');
      expect(results[0].retryAfter).toBeGreaterThan(0);
    });

    it('can search for bans by email', async () => {
      await rateLimit.check('testBan', { email: 'test@example.com' });
      await rateLimit.check('testBan', { email: 'test@example.com' });

      const results = await rateLimit.search({ email: 'test@example.com' });

      expect(results).toHaveLength(1);
      expect(results[0].action).toBe('testBan');
      expect(results[0].blockingOn).toBe('email');
      expect(results[0].policy).toBe('ban');
      expect(results[0].retryAfter).toBeGreaterThan(0);
    });

    it('can search by multiple criteria', async () => {
      await rateLimit.check('testBlock', { ip: '192.168.1.1' });
      await rateLimit.check('testBlock', { ip: '192.168.1.1' });

      await rateLimit.check('testBan', { email: 'test@example.com' });
      await rateLimit.check('testBan', { email: 'test@example.com' });

      await rateLimit.check('testMultiple', { uid: 'user123' });
      await rateLimit.check('testMultiple', { uid: 'user123' });

      const results = await rateLimit.search({
        ip: '192.168.1.1',
        email: 'test@example.com',
        uid: 'user123',
      });

      expect(results).toHaveLength(3);
      const actions = results.map((r) => r.action).sort();
      expect(actions).toEqual(['testBan', 'testBlock', 'testMultiple']);
    });

    it('returns empty array when no blocks/bans found', async () => {
      const results = await rateLimit.search({ ip: '192.168.1.100' });
      expect(results).toHaveLength(0);
    });

    it('can search with composite keys (ip_email)', async () => {
      rateLimit = new RateLimit(
        {
          rules: parseConfigRules(['testComposite:ip_email:1:1s:10s:block']),
        },
        redis,
        statsd
      );

      await rateLimit.check('testComposite', {
        ip: '192.168.1.1',
        email: 'test@example.com',
        ip_email: '192.168.1.1_test@example.com',
      });
      await rateLimit.check('testComposite', {
        ip: '192.168.1.1',
        email: 'test@example.com',
        ip_email: '192.168.1.1_test@example.com',
      });

      const results = await rateLimit.search({
        ip: '192.168.1.1',
        email: 'test@example.com',
      });

      expect(results).toHaveLength(1);
      expect(results[0].action).toBe('testComposite');
      expect(results[0].blockingOn).toBe('ip_email');
      expect(results[0].policy).toBe('block');
    });
  });

  describe('searchAndClear method', () => {
    beforeEach(async () => {
      rateLimit = new RateLimit(
        {
          rules: parseConfigRules([
            'testBlock:ip:1:1s:10s:block',
            'testBan:email:1:1s:10s:ban',
            'testMultiple:uid:1:1s:10s:block',
          ]),
        },
        redis,
        statsd
      );
    });

    it('can clear blocks by IP and return count', async () => {
      await rateLimit.check('testBlock', { ip: '192.168.1.1' });
      await rateLimit.check('testBlock', { ip: '192.168.1.1' });

      let results = await rateLimit.search({ ip: '192.168.1.1' });
      expect(results).toHaveLength(1);

      const clearedCount = await rateLimit.searchAndClear({
        ip: '192.168.1.1',
      });
      expect(clearedCount).toBe(1);

      results = await rateLimit.search({ ip: '192.168.1.1' });
      expect(results).toHaveLength(0);

      const check = await rateLimit.check('testBlock', { ip: '192.168.1.1' });
      expect(check).toBeNull();
    });

    it('can clear bans by email and return count', async () => {
      await rateLimit.check('testBan', { email: 'test@example.com' });
      await rateLimit.check('testBan', { email: 'test@example.com' });

      let results = await rateLimit.search({ email: 'test@example.com' });
      expect(results).toHaveLength(1);

      const clearedCount = await rateLimit.searchAndClear({
        email: 'test@example.com',
      });
      expect(clearedCount).toBe(1);

      results = await rateLimit.search({ email: 'test@example.com' });
      expect(results).toHaveLength(0);

      const check = await rateLimit.check('testBan', {
        email: 'test@example.com',
      });
      expect(check).toBeNull();
    });

    it('can clear multiple blocks/bans and return total count', async () => {
      await rateLimit.check('testBlock', { ip: '192.168.1.1' });
      await rateLimit.check('testBlock', { ip: '192.168.1.1' });

      await rateLimit.check('testBan', { email: 'test@example.com' });
      await rateLimit.check('testBan', { email: 'test@example.com' });

      await rateLimit.check('testMultiple', { uid: 'user123' });
      await rateLimit.check('testMultiple', { uid: 'user123' });

      let results = await rateLimit.search({
        ip: '192.168.1.1',
        email: 'test@example.com',
        uid: 'user123',
      });
      expect(results).toHaveLength(3);

      const clearedCount = await rateLimit.searchAndClear({
        ip: '192.168.1.1',
        email: 'test@example.com',
        uid: 'user123',
      });
      expect(clearedCount).toBe(3);

      results = await rateLimit.search({
        ip: '192.168.1.1',
        email: 'test@example.com',
        uid: 'user123',
      });
      expect(results).toHaveLength(0);
    });

    it('returns 0 when no blocks/bans to clear', async () => {
      const clearedCount = await rateLimit.searchAndClear({
        ip: '192.168.1.100',
      });
      expect(clearedCount).toBe(0);
    });

    it('ignores attempt and report keys when clearing', async () => {
      rateLimit = new RateLimit(
        {
          rules: parseConfigRules([
            'testBlock:ip:1:1s:10s:block',
            'testReport:ip:1:1s:10s:report',
          ]),
        },
        redis,
        statsd
      );

      await rateLimit.check('testBlock', { ip: '192.168.1.1' });
      await rateLimit.check('testBlock', { ip: '192.168.1.1' });
      await rateLimit.check('testReport', { ip: '192.168.1.1' });
      await rateLimit.check('testReport', { ip: '192.168.1.1' });

      const clearedCount = await rateLimit.searchAndClear({
        ip: '192.168.1.1',
      });
      expect(clearedCount).toBe(1);

      const results = await rateLimit.search({ ip: '192.168.1.1' });
      expect(results).toHaveLength(0);

      const check = await rateLimit.check('testReport', { ip: '192.168.1.1' });
      expect(check).toBeNull();
    });
  });
});
