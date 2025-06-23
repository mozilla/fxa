/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { RateLimit } from './rate-limit';
import { parseConfigRules } from './config';
import { Redis } from 'ioredis';
import { BlockRecord, Rule, TOO_MANY_ATTEMPTS } from './models';
import { calculateRetryAfter, getKey } from './util';
import { StatsD } from 'hot-shots';

describe('rate-limit', () => {
  let redis: Redis;
  let mockIncrement: jest.Mock;
  let statsd: StatsD;
  let rateLimit: RateLimit;

  beforeAll(() => {
    mockIncrement = jest.fn();

    redis = {} as unknown as Redis;
    statsd = {
      increment: mockIncrement,
    } as unknown as StatsD;
  });

  afterEach(async () => {
    mockIncrement.mockReset();
  });

  it('creates rate limiter', () => {
    rateLimit = new RateLimit({ rules: {} }, redis, statsd);
    expect(rateLimit).toBeDefined();
  });

  it('can determine if action is supported', () => {
    rateLimit = new RateLimit(
      { rules: parseConfigRules(['test:ip:1:1s:1s:block']) },
      redis,
      statsd
    );

    expect(rateLimit.supportsAction('test')).toBeTruthy();
    expect(rateLimit.supportsAction('foo')).toBeFalsy();
  });

  it('supports all actions when default rule is configured', () => {
    rateLimit = new RateLimit(
      { rules: parseConfigRules(['default:ip:1:1s:1s:block']) },
      redis,
      statsd
    );

    expect(rateLimit.supportsAction('test')).toBeTruthy();
    expect(rateLimit.supportsAction('foo')).toBeTruthy();
  });

  it('throws if no action can be found', async () => {
    rateLimit = new RateLimit({ rules: {} }, redis, statsd);
    expect(rateLimit.check('foo', {})).rejects.toThrow(
      `Could not locate the 'foo' action.`
    );
  });

  it('throws error if option is missing', async () => {
    rateLimit = new RateLimit(
      {
        rules: parseConfigRules([
          'testIp:ip:1:1s:1s:block',
          'testIpEmail:ip_email:1:1s:1s:block',
          'testEmail:email:1:1s:1s:block',
          'testUid:uid:1:1s:1s:block',
          'testIpUid:ip_uid:1:1s:1s:block',
        ]),
      },
      redis,
      statsd
    );

    expect(rateLimit.check('testIp', {})).rejects.toThrow(
      `A rule for the 'testIp' action requires that 'ip' is provided as an option.`
    );

    expect(rateLimit.check('testEmail', {})).rejects.toThrow(
      `A rule for the 'testEmail' action requires that 'email' is provided as an option.`
    );

    expect(rateLimit.check('testUid', {})).rejects.toThrow(
      `A rule for the 'testUid' action requires that 'uid' is provided as an option.`
    );

    expect(rateLimit.check('testIpEmail', {})).rejects.toThrow(
      `A rule for the 'testIpEmail' action requires that 'ip_email' is provided as an option.`
    );

    expect(rateLimit.check('testIpUid', {})).rejects.toThrow(
      `A rule for the 'testIpUid' action requires that 'ip_uid' is provided as an option.`
    );
  });

  it('calculates retry after', () => {
    const now = Date.now();
    const block = {
      action: 'test',
      usedDefaultRule: false,
      blockingOn: 'ip',
      blockedValue: '',
      startTime: now - 5 * 1000,
      duration: 60,
      attempts: 3,
      reason: TOO_MANY_ATTEMPTS,
      policy: 'block',
    } satisfies BlockRecord;

    const retryAfter = calculateRetryAfter(now, block);

    // The block started 5 seconds ago, and the duration is set
    // to 60 seconds. Therefore we should be able to retry again
    // in 55,000 milliseconds.
    expect(retryAfter).toEqual(55 * 1000);
  });

  it('creates a key', () => {
    const action = 'foo';
    const rule = {
      blockingOn: 'ip',
      maxAttempts: 1,
      windowDurationInSeconds: 2,
      blockDurationInSeconds: 3,
      blockPolicy: 'block',
    } satisfies Rule;
    expect(getKey('block', action, rule, '127.0.0.1')).toEqual(
      `rate-limit:block:ip=127.0.0.1:foo:1-2-3`
    );
  });

  it('can ignore certain emails', () => {
    rateLimit = new RateLimit(
      {
        rules: {},
        ignoreEmails: ['@mozilla.com$', 'foo@firefox.com'],
      },
      redis,
      statsd
    );

    expect(rateLimit.skip({ email: 'foo@mozilla.com' })).toBeTruthy();
    expect(rateLimit.skip({ email: 'bar@mozilla.com' })).toBeTruthy();
    expect(rateLimit.skip({ email: 'bar@mozilla.com ' })).toBeFalsy();
    expect(rateLimit.skip({ email: 'foo@firefox.com' })).toBeTruthy();
    expect(rateLimit.skip({ email: 'bar@firefox.com ' })).toBeFalsy();
    expect(rateLimit.skip({})).toBeFalsy();
    expect(statsd.increment).toBeCalledWith('rate_limit.ignore.email');
  });

  it('can ignore certain ips', () => {
    rateLimit = new RateLimit(
      {
        rules: {},
        ignoreIPs: ['127.0.0.1'],
      },
      redis,
      statsd
    );

    expect(rateLimit.skip({ ip: '127.0.0.1' })).toBeTruthy();
    expect(rateLimit.skip({ ip: '0.0.0.0' })).toBeFalsy();
    expect(rateLimit.skip({})).toBeFalsy();
    expect(statsd.increment).toBeCalledWith('rate_limit.ignore.ip');
  });

  it('can ignore certain uids', () => {
    rateLimit = new RateLimit(
      {
        rules: {},
        ignoreUIDs: ['000-000-000'],
      },
      redis,
      statsd
    );

    expect(rateLimit.skip({ uid: '000-000-000' })).toBeTruthy();
    expect(rateLimit.skip({ uid: '000-000-001' })).toBeFalsy();
    expect(rateLimit.skip({})).toBeFalsy();
    expect(statsd.increment).toBeCalledWith('rate_limit.ignore.uid');
  });

  describe('configuration rules', () => {
    it('parses rule set', () => {
      const ruleSet = parseConfigRules(`
        # Rules are in the form
        # Action    | Attribute To Check | Max Attempts | Check Window Duration | Duration       | Policy
        test        : ip                 :  1           :   1 second            : 1s             : block
        test        : email              :  99          : 30 seconds            : 1 hour         : block
        test        : uid                :  1           : 30 seconds            : 1 day          : block
        test        : ip_email           :  100         : 10 seconds            : 1 Month        : block
        test        : ip_uid             :  100         : 10 seconds            : 1 Month        : block
        testBan     : ip                 :  100         : 10 seconds            : 1 Month        : ban
        testReport  : ip                 :  10          : 10 seconds            : 1 Month        : report
      `);
      let rules = ruleSet['test'];

      expect(rules).toBeDefined();
      expect(rules.length).toEqual(5);

      expect(rules[0]).toBeDefined();
      expect(rules[0].maxAttempts).toEqual(1);
      expect(rules[0].blockingOn).toEqual('ip');
      expect(rules[0].windowDurationInSeconds).toEqual(1);
      expect(rules[0].blockDurationInSeconds).toEqual(1);
      expect(rules[0].blockPolicy).toEqual('block');

      expect(rules[1]).toBeDefined();
      expect(rules[1].maxAttempts).toEqual(99);
      expect(rules[1].blockingOn).toEqual('email');
      expect(rules[1].windowDurationInSeconds).toEqual(30);
      expect(rules[1].blockDurationInSeconds).toEqual(60 * 60);
      expect(rules[1].blockPolicy).toEqual('block');

      expect(rules[2]).toBeDefined();
      expect(rules[2].maxAttempts).toEqual(1);
      expect(rules[2].blockingOn).toEqual('uid');
      expect(rules[2].windowDurationInSeconds).toEqual(30);
      expect(rules[2].blockDurationInSeconds).toEqual(24 * 60 * 60);

      expect(rules[3]).toBeDefined();
      expect(rules[3].maxAttempts).toEqual(100);
      expect(rules[3].blockingOn).toEqual('ip_email');
      expect(rules[3].windowDurationInSeconds).toEqual(10);
      expect(rules[3].blockDurationInSeconds).toEqual(2592000);
      expect(rules[3].blockPolicy).toEqual('block');

      expect(rules[4]).toBeDefined();
      expect(rules[4].maxAttempts).toEqual(100);
      expect(rules[4].blockingOn).toEqual('ip_uid');
      expect(rules[4].windowDurationInSeconds).toEqual(10);
      expect(rules[4].blockDurationInSeconds).toEqual(2592000);
      expect(rules[4].blockPolicy).toEqual('block');

      rules = ruleSet['testBan'];
      expect(rules[0].maxAttempts).toEqual(100);
      expect(rules[0].blockingOn).toEqual('ip');
      expect(rules[0].windowDurationInSeconds).toEqual(10);
      expect(rules[0].blockDurationInSeconds).toEqual(2592000);
      expect(rules[0].blockPolicy).toEqual('ban');

      rules = ruleSet['testReport'];
      expect(rules[0].maxAttempts).toEqual(10);
      expect(rules[0].blockingOn).toEqual('ip');
      expect(rules[0].windowDurationInSeconds).toEqual(10);
      expect(rules[0].blockDurationInSeconds).toEqual(2592000);
      expect(rules[0].blockPolicy).toEqual('report');
    });

    it('throws on duplicate rule in rule set', () => {
      expect(() =>
        parseConfigRules(`
        # Rules are in the form
        # Action | Attribute To Check | Max Attempts | Check Window Duration | Block Duration | Block Policy
        test     : ip                 :  1           :   1 second            : 1s             : block
        test     : ip                 :  1           :   1 second            : 1s             : block
      `)
      ).toThrowError(/Invalid configuration! Duplicates detected:/);
    });

    it('throws on malformed rule', () => {
      expect(() => parseConfigRules('foo!23:ip:1:1s:1s:block')).toThrowError();
      expect(() => parseConfigRules('foo:bar:1:1s:1s:block')).toThrowError();
      expect(() => parseConfigRules('foo:bar:-2:1s:1s:block')).toThrowError();
      expect(() =>
        parseConfigRules('foo:bar:1:1sdfds:1s:block')
      ).toThrowError();
      expect(() =>
        parseConfigRules('foo:bar:1:1s:1dsfds:block')
      ).toThrowError();
      expect(() =>
        parseConfigRules('foo:bar:1:1s:-1h:block:ban')
      ).toThrowError();
      expect(() => parseConfigRules('foo:bar:1:1s:-1h:block')).toThrowError();
      expect(() => parseConfigRules(':bar:1:1s:-1h:block')).toThrowError();
      expect(() => parseConfigRules('foo::1:1s:-1h:block')).toThrowError();
      expect(() => parseConfigRules('foo:bar::1s:-1h:block')).toThrowError();
      expect(() => parseConfigRules('foo:bar:1::-1h:block')).toThrowError();
      expect(() => parseConfigRules('foo:bar:1:1s::block')).toThrowError();
      expect(() => parseConfigRules('foo:bar:1')).toThrowError();
      expect(() => parseConfigRules('foo!23:ip:1:1s:1s:')).toThrowError();
      expect(() => parseConfigRules('foo!23:ip:1:1s:1s:foo')).toThrowError();
    });
  });
});
