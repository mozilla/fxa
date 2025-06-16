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

  for (const blockOn of ['ip', 'email', 'uid', 'ip_email']) {
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
      });
      const check2 = await rateLimit.check('testBlock', {
        ip_email: '127.0.0.1_foo@mozilla.com',
        ip: '127.0.0.1',
        email: 'foo@mozilla.com',
        uid: '123',
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

  it('should clear block after should clear after banDurationInSeconds', async () => {
    /**
     * Note that once the ban kicks in the window disappears. So despite
     */
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
        rules: parseConfigRules(['testBlock:ip:1:1s:1s:block']),
      },
      redis,
      statsd
    );

    const check1 = await rateLimit.check('testBlock', { ip: '127.0.0.1' });
    const check2 = await rateLimit.check('testBlock', { ip: '127.0.0.1' });
    await rateLimit.unblock({ ip: '127.0.0.1' });
    const check3 = await rateLimit.check('testBlock', { ip: '127.0.0.1' });

    expect(check1).toBeNull();
    expect(check2?.reason).toEqual('too-many-attempts');
    expect(check2?.retryAfter).toEqual(1000);
    expect(check3).toBeNull();

    expect(statsd.increment).toBeCalledTimes(2);
    expect(statsd.increment).toBeCalledWith('rate_limit.block', [
      'on:ip',
      'action:testBlock',
    ]);
    expect(statsd.increment).toBeCalledWith('rate_limit.unblock', [
      'on:ip',
      'action:testBlock',
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
});
