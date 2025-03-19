/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { calculateRetryAfter, getKey, RateLimit } from './rate-limit';
import { parseConfigRules } from './config';
import { Redis } from 'ioredis';
import { BlockRecord } from './models';

describe('rate-limit', () => {
  let redis: Redis;
  let rateLimit: RateLimit;

  beforeAll(() => {
    redis = {} as unknown as Redis;
  });

  afterEach(async () => {});

  it('can parse rule set', () => {
    const ruleSet = parseConfigRules(`
      # Rules are in the form
      # Action | Attribute To Check | Max Attempts | Check Window Duration | Block Duration
      test : ip    :   1 :   1 second : 1s
      test : email :  99 : 30 seconds : 1 hour
      test : uid   :   1 : 30 seconds : 1 day
    `);
    const rules = ruleSet['test'];

    expect(rules).toBeDefined();
    expect(rules.length).toEqual(3);

    expect(rules[0]).toBeDefined();
    expect(rules[0].action).toEqual('test');
    expect(rules[0].maxAttempts).toEqual(1);
    expect(rules[0].blockingOn).toEqual('ip');
    expect(rules[0].windowDurationInSeconds).toEqual(1);
    expect(rules[0].blockDurationInSeconds).toEqual(1);

    expect(rules[1]).toBeDefined();
    expect(rules[1].action).toEqual('test');
    expect(rules[1].maxAttempts).toEqual(99);
    expect(rules[1].blockingOn).toEqual('email');
    expect(rules[1].windowDurationInSeconds).toEqual(30);
    expect(rules[1].blockDurationInSeconds).toEqual(60 * 60);

    expect(rules[2]).toBeDefined();
    expect(rules[2].action).toEqual('test');
    expect(rules[2].maxAttempts).toEqual(1);
    expect(rules[2].blockingOn).toEqual('uid');
    expect(rules[2].windowDurationInSeconds).toEqual(30);
    expect(rules[2].blockDurationInSeconds).toEqual(24 * 60 * 60);
  });

  it('throws on bad action name', () => {
    expect(() => parseConfigRules('foo!23:ip:1:1s:1s')).toThrowError();
    expect(() => parseConfigRules('foo:bar:1:1s:1s')).toThrowError();
    expect(() => parseConfigRules('foo:bar:  -2:1s:1s')).toThrowError();
    expect(() => parseConfigRules('foo:bar:1:1sdfds:1s')).toThrowError();
    expect(() => parseConfigRules('foo:bar:1:1s:1dsfds')).toThrowError();
    expect(() => parseConfigRules('foo:bar:1:1s:-1h')).toThrowError();
    expect(() => parseConfigRules(':bar:1:1s:-1h')).toThrowError();
    expect(() => parseConfigRules('foo::1:1s:-1h')).toThrowError();
    expect(() => parseConfigRules('foo:bar::1s:-1h')).toThrowError();
    expect(() => parseConfigRules('foo:bar:1::-1h')).toThrowError();
    expect(() => parseConfigRules('foo:bar:1:1s:')).toThrowError();
    expect(() => parseConfigRules('foo:bar:1')).toThrowError();
  });

  it('should create', () => {
    rateLimit = new RateLimit({}, redis);
    expect(rateLimit).toBeDefined();
  });

  it('should throw if no action can be found', async () => {
    rateLimit = new RateLimit({}, redis);
    expect(rateLimit.check('foo', {})).rejects.toThrow(
      `Could not locate the 'foo' action.`
    );
  });

  it('should throw error if option is missing', async () => {
    rateLimit = new RateLimit(parseConfigRules(['test:ip:1:1s:1s']), redis);

    expect(
      rateLimit.check('test', { email: 'foo@mozilla.com' })
    ).rejects.toThrow(
      `A rule for the 'test' action requires that 'ip' is provided as an option.`
    );
  });

  it('can calculate retry after', () => {
    const now = Date.now();
    const block = {
      action: 'test',
      blockingOn: 'ip',
      blockedValue: '',
      startTime: now - 5 * 1000,
      duration: 60,
      attempts: 3,
      reason: 'too-many-attempts',
    } satisfies BlockRecord;

    const retryAfter = calculateRetryAfter(now, block);

    // The block started 5 seconds ago, and the duration is set
    // to 60 seconds. Therefore we should be able to retry again
    // in 55,000 milliseconds.
    expect(retryAfter).toEqual(55 * 1000);
  });

  it('can create a key', () => {
    const rule = {
      blockingOn: 'ip' as 'ip',
      action: 'foo',
    };
    expect(getKey('block', rule, '127.0.0.1')).toEqual(
      `rate-limit:block:ip:127.0.0.1:foo`
    );
  });
});
