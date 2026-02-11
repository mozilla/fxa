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

  describe('rate limit search', () => {
    let mockScan: jest.Mock;
    let mockGet: jest.Mock;

    beforeEach(() => {
      mockScan = jest.fn();
      mockGet = jest.fn();
      redis.scan = mockScan;
      redis.get = mockGet;
    });

    afterEach(() => {
      mockScan.mockReset();
      mockGet.mockReset();
    });

    it('should return empty array when no identifiers provided', async () => {
      rateLimit = new RateLimit({ rules: {} }, redis, statsd);
      const result = await rateLimit.search({});
      expect(result).toEqual([]);
      expect(mockScan).not.toHaveBeenCalled();
    });

    it('should search by IP address', async () => {
      const testIp = '192.168.1.1';
      const mockBlockRecord = {
        action: 'login',
        usedDefaultRule: false,
        blockingOn: 'ip',
        blockedValue: testIp,
        startTime: Date.now() - 5000,
        duration: 3600,
        attempts: 3,
        reason: 'too-many-attempts',
        policy: 'block',
      };

      mockScan
        .mockResolvedValueOnce([
          '0',
          [`rate-limit:block:ip=${testIp}:login:1-60-3600`],
        ]) // for ip
        .mockResolvedValueOnce(['0', []]) // for ip_email
        .mockResolvedValueOnce(['0', []]); // for ip_uid

      mockGet.mockResolvedValue(JSON.stringify(mockBlockRecord));

      rateLimit = new RateLimit({ rules: {} }, redis, statsd);
      const result = await rateLimit.search({ ip: testIp });

      expect(mockScan).toHaveBeenCalledTimes(3); // ip, ip_email, ip_uid
      expect(mockScan).toHaveBeenNthCalledWith(
        1,
        '0',
        'MATCH',
        `rate-limit:*:ip=${testIp}*`,
        'COUNT',
        1000
      );
      expect(mockScan).toHaveBeenNthCalledWith(
        2,
        '0',
        'MATCH',
        `rate-limit:*:ip_email=${testIp}_**`,
        'COUNT',
        1000
      );
      expect(mockScan).toHaveBeenNthCalledWith(
        3,
        '0',
        'MATCH',
        `rate-limit:*:ip_uid=${testIp}_**`,
        'COUNT',
        1000
      );
      expect(mockGet).toHaveBeenCalledWith(
        `rate-limit:block:ip=${testIp}:login:1-60-3600`
      );
      expect(result).toHaveLength(1);
      expect(result[0].action).toBe('login');
      expect(result[0].blockingOn).toBe('ip');
      expect(result[0].policy).toBe('block');
    });

    it('should search by email', async () => {
      const testEmail = 'test@example.com';
      const mockBanRecord = {
        action: 'passwordReset',
        usedDefaultRule: false,
        blockingOn: 'email',
        blockedValue: testEmail,
        startTime: Date.now() - 10000,
        duration: 7200,
        attempts: 5,
        reason: 'too-many-attempts',
        policy: 'ban',
      };

      mockScan
        .mockResolvedValueOnce([
          '0',
          [`rate-limit:ban:email=${testEmail}:passwordReset:5-60-7200`],
        ]) // for email
        .mockResolvedValueOnce(['0', []]); // for ip_email

      mockGet.mockResolvedValue(JSON.stringify(mockBanRecord));

      rateLimit = new RateLimit({ rules: {} }, redis, statsd);
      const result = await rateLimit.search({ email: testEmail });

      expect(mockScan).toHaveBeenCalledTimes(2); // email, ip_email
      expect(mockScan).toHaveBeenNthCalledWith(
        1,
        '0',
        'MATCH',
        `rate-limit:*:email=${testEmail}*`,
        'COUNT',
        1000
      );
      expect(mockScan).toHaveBeenNthCalledWith(
        2,
        '0',
        'MATCH',
        `rate-limit:*:ip_email=*_${testEmail}*`,
        'COUNT',
        1000
      );
      expect(result).toHaveLength(1);
      expect(result[0].action).toBe('passwordReset');
      expect(result[0].blockingOn).toBe('email');
      expect(result[0].policy).toBe('ban');
    });

    it('should search by UID', async () => {
      const testUid = 'user-123';

      mockScan
        .mockResolvedValueOnce(['0', []]) // for uid
        .mockResolvedValueOnce(['0', []]); // for ip_uid

      rateLimit = new RateLimit({ rules: {} }, redis, statsd);
      const result = await rateLimit.search({ uid: testUid });

      expect(mockScan).toHaveBeenCalledTimes(2); // uid, ip_uid
      expect(mockScan).toHaveBeenNthCalledWith(
        1,
        '0',
        'MATCH',
        `rate-limit:*:uid=${testUid}*`,
        'COUNT',
        1000
      );
      expect(mockScan).toHaveBeenNthCalledWith(
        2,
        '0',
        'MATCH',
        `rate-limit:*:ip_uid=*_${testUid}*`,
        'COUNT',
        1000
      );
      expect(result).toHaveLength(0);
    });

    it('should search by multiple identifiers including composite keys', async () => {
      const testIp = '10.0.0.1';
      const testEmail = 'user@test.com';
      const testUid = 'uid-456';

      mockScan
        .mockResolvedValueOnce([
          '0',
          [`rate-limit:block:ip=${testIp}:login:1-60-3600`],
        ])
        .mockResolvedValueOnce([
          '0',
          [`rate-limit:ban:email=${testEmail}:signup:3-120-7200`],
        ])
        .mockResolvedValueOnce(['0', []])
        .mockResolvedValueOnce([
          '0',
          [
            `rate-limit:block:ip_email=${testIp}_${testEmail}:transfer:2-30-1800`,
          ],
        ])
        .mockResolvedValueOnce(['0', []]);

      const mockRecord1 = {
        action: 'login',
        usedDefaultRule: false,
        blockingOn: 'ip',
        blockedValue: testIp,
        startTime: Date.now(),
        duration: 3600,
        attempts: 1,
        reason: 'too-many-attempts',
        policy: 'block',
      };

      const mockRecord2 = {
        action: 'signup',
        usedDefaultRule: false,
        blockingOn: 'email',
        blockedValue: testEmail,
        startTime: Date.now(),
        duration: 7200,
        attempts: 3,
        reason: 'too-many-attempts',
        policy: 'ban',
      };

      const mockRecord3 = {
        action: 'transfer',
        usedDefaultRule: false,
        blockingOn: 'ip_email',
        blockedValue: `${testIp}_${testEmail}`,
        startTime: Date.now(),
        duration: 1800,
        attempts: 2,
        reason: 'too-many-attempts',
        policy: 'block',
      };

      mockGet
        .mockResolvedValueOnce(JSON.stringify(mockRecord1))
        .mockResolvedValueOnce(JSON.stringify(mockRecord2))
        .mockResolvedValueOnce(JSON.stringify(mockRecord3));

      rateLimit = new RateLimit({ rules: {} }, redis, statsd);
      const result = await rateLimit.search({
        ip: testIp,
        email: testEmail,
        uid: testUid,
      });

      expect(mockScan).toHaveBeenCalledTimes(5);
      expect(result).toHaveLength(3);
      expect(result.map((r) => r.action)).toEqual([
        'login',
        'signup',
        'transfer',
      ]);
      expect(result.map((r) => r.policy)).toEqual(['block', 'ban', 'block']);
    });

    it('should handle Redis scan pagination', async () => {
      const testIp = '127.0.0.1';

      // Since the search method processes identifiers in parallel,
      // we need to handle the scan calls in the order they're processed
      mockScan
        .mockResolvedValueOnce([
          '123',
          [`rate-limit:block:ip=${testIp}:action1:1-60-3600`],
        ]) // First call for IP identifier
        .mockResolvedValueOnce(['0', []]) // ip_email scan
        .mockResolvedValueOnce(['0', []]) // ip_uid scan
        .mockResolvedValueOnce([
          '0',
          [`rate-limit:block:ip=${testIp}:action2:1-60-3600`],
        ]); // Second call for IP pagination

      const mockRecord1 = {
        action: 'action1',
        usedDefaultRule: false,
        blockingOn: 'ip',
        blockedValue: testIp,
        startTime: Date.now(),
        duration: 3600,
        attempts: 1,
        reason: 'too-many-attempts',
        policy: 'block',
      };

      const mockRecord2 = {
        action: 'action2',
        usedDefaultRule: false,
        blockingOn: 'ip',
        blockedValue: testIp,
        startTime: Date.now(),
        duration: 3600,
        attempts: 1,
        reason: 'too-many-attempts',
        policy: 'block',
      };

      mockGet
        .mockResolvedValueOnce(JSON.stringify(mockRecord1))
        .mockResolvedValueOnce(JSON.stringify(mockRecord2));

      rateLimit = new RateLimit({ rules: {} }, redis, statsd);
      const result = await rateLimit.search({ ip: testIp });

      expect(mockScan).toHaveBeenCalledTimes(4); // 2 for ip pagination + ip_email + ip_uid
      expect(result).toHaveLength(2);
    });

    it('should filter out null results from invalid block records', async () => {
      const testEmail = 'test@example.com';

      // Mock scan calls for email and ip_email patterns
      mockScan
        .mockResolvedValueOnce([
          '0',
          [
            `rate-limit:block:email=${testEmail}:valid:1-60-3600`,
            `rate-limit:attempt:email=${testEmail}:invalid:1-60-3600`,
          ],
        ]) // for email
        .mockResolvedValueOnce(['0', []]); // for ip_email

      const validRecord = {
        action: 'valid',
        usedDefaultRule: false,
        blockingOn: 'email',
        blockedValue: testEmail,
        startTime: Date.now(),
        duration: 3600,
        attempts: 1,
        reason: 'too-many-attempts',
        policy: 'block',
      };
      const invalidRecord = {
        ...validRecord,
        action: 'invalid',
        policy: 'attempt', // not a policy type
      };

      mockGet
        .mockResolvedValueOnce(JSON.stringify(validRecord))
        .mockResolvedValueOnce(JSON.stringify(invalidRecord));

      rateLimit = new RateLimit({ rules: {} }, redis, statsd);
      const result = await rateLimit.search({ email: testEmail });

      expect(result).toHaveLength(1);
      expect(result[0].action).toBe('valid');
    });
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

  describe('searchAndClear', () => {
    let mockScan: jest.Mock;
    let mockDel: jest.Mock;

    beforeEach(() => {
      mockScan = jest.fn();
      mockDel = jest.fn();
      redis.scan = mockScan;
      redis.del = mockDel;

      rateLimit = new RateLimit(
        { rules: parseConfigRules(['test:ip:1:1s:1s:block']) },
        redis,
        statsd
      );
    });

    it('should search and clear both blocks and bans by IP', async () => {
      mockScan
        .mockResolvedValueOnce([
          '0',
          [
            'rate-limit:block:ip=192.168.1.1:test',
            'rate-limit:ban:ip=192.168.1.1:other',
          ],
        ]) // for ip
        .mockResolvedValueOnce([
          '0',
          [
            'rate-limit:block:ip_email=192.168.1.1_user@example.com:test',
            'rate-limit:ban:ip_email=192.168.1.1_another@example.com:other',
          ],
        ]) // for ip_email
        .mockResolvedValueOnce([
          '0',
          [
            'rate-limit:block:ip_uid=192.168.1.1_uid123:test',
            'rate-limit:ban:ip_uid=192.168.1.1_uid456:other',
          ],
        ]); // for ip_uid
      mockDel.mockResolvedValue(1);

      const result = await rateLimit.searchAndClear({ ip: '192.168.1.1' });

      expect(result).toBe(6); // 2 + 2 + 2 = 6 keys deleted
      expect(mockScan).toHaveBeenCalledTimes(3); // ip, ip_email, ip_uid
      expect(mockDel).toHaveBeenCalledTimes(6);
    });

    it('should search and clear by email', async () => {
      mockScan
        .mockResolvedValueOnce([
          '0',
          ['rate-limit:block:email=test@example.com:test'],
        ]) // for email
        .mockResolvedValueOnce([
          '0',
          ['rate-limit:block:ip_email=192.168.1.1_test@example.com:test'],
        ]); // for ip_email
      mockDel.mockResolvedValue(1);

      const result = await rateLimit.searchAndClear({
        email: 'test@example.com',
      });

      expect(result).toBe(2); // 1 + 1 = 2 keys deleted
      expect(mockScan).toHaveBeenCalledTimes(2); // email, ip_email
      expect(mockDel).toHaveBeenCalledTimes(2);
    });

    it('should search and clear by UID', async () => {
      mockScan
        .mockResolvedValueOnce(['0', []]) // for uid
        .mockResolvedValueOnce(['0', []]); // for ip_uid
      mockDel.mockResolvedValue(1);

      const result = await rateLimit.searchAndClear({
        uid: 'user123',
      });

      expect(result).toBe(0);
      expect(mockScan).toHaveBeenCalledTimes(2); // uid, ip_uid
      expect(mockDel).not.toHaveBeenCalled();
    });

    it('should handle multiple identifiers', async () => {
      mockScan.mockImplementation((cursor, matchType, pattern) => {
        if (pattern.includes('ip=192.168.1.1')) {
          return Promise.resolve([
            '0',
            ['rate-limit:block:ip=192.168.1.1:test'],
          ]);
        }
        if (pattern.includes('email=test@example.com')) {
          return Promise.resolve([
            '0',
            ['rate-limit:block:email=test@example.com:test'],
          ]);
        }
        if (pattern.includes('ip_email=192.168.1.1_test@example.com')) {
          return Promise.resolve([
            '0',
            ['rate-limit:block:ip_email=192.168.1.1_test@example.com:test'],
          ]);
        }
        return Promise.resolve(['0', []]);
      });
      mockDel.mockResolvedValue(1);

      const result = await rateLimit.searchAndClear({
        ip: '192.168.1.1',
        email: 'test@example.com',
      });

      expect(result).toBe(3);
      expect(mockDel).toHaveBeenCalledTimes(3);
    });

    it('should ignore attempt and report keys', async () => {
      mockScan
        .mockResolvedValueOnce([
          '0',
          [
            'rate-limit:block:ip=192.168.1.1:test',
            'rate-limit:attempt:ip=192.168.1.1:test', // should be ignored
            'rate-limit:report:ip=192.168.1.1:test', // should be ignored
            'rate-limit:ban:ip=192.168.1.1:other',
          ],
        ]) // for ip
        .mockResolvedValueOnce(['0', []]) // for email
        .mockResolvedValueOnce(['0', []]) // for uid
        .mockResolvedValueOnce(['0', []]) // for ip_email
        .mockResolvedValueOnce(['0', []]); // for ip_uid
      mockDel.mockResolvedValue(1);

      const result = await rateLimit.searchAndClear({ ip: '192.168.1.1' });

      expect(result).toBe(2);
      expect(mockDel).toHaveBeenCalledTimes(4);
    });
  });
});
