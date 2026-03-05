/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

const REMINDERS = ['first', 'second', 'third'];
const EXPECTED_CREATE_DELETE_RESULT = REMINDERS.reduce(
  (expected: Record<string, number>, reminder: string) => {
    expected[reminder] = 1;
    return expected;
  },
  {}
);

const config = require('../../config').default.getProperties();
const mocks = require('../mocks');

describe('#integration - lib/subscription-account-reminders', () => {
  let log: any,
    mockConfig: any,
    redis: any,
    subscriptionAccountReminders: any;

  beforeEach(async () => {
    log = mocks.mockLog();
    mockConfig = {
      redis: config.redis,
      subscriptionAccountReminders: {
        rolloutRate: 1,
        firstInterval: 1,
        secondInterval: 2,
        thirdInterval: 1000,
        redis: {
          maxConnections: 1,
          minConnections: 1,
          prefix: 'test-subscription-account-reminders:',
        },
      },
    };
    redis = require('../../lib/redis')(
      {
        ...config.redis,
        ...mockConfig.subscriptionAccountReminders.redis,
        enabled: true,
      },
      mocks.mockLog()
    );
    // Flush any leftover keys from previous test runs to prevent stale data
    await Promise.all([
      redis.del('first'),
      redis.del('second'),
      redis.del('third'),
      redis.del('metadata_sub_flow:wibble'),
      redis.del('metadata_sub_flow:blee'),
    ]);
    subscriptionAccountReminders = require(
      '../../lib/subscription-account-reminders'
    )(log, mockConfig);
  });

  afterEach(async () => {
    await redis.close();
    await subscriptionAccountReminders.close();
  });

  it('returned the expected interface', () => {
    expect(typeof subscriptionAccountReminders).toBe('object');
    expect(Object.keys(subscriptionAccountReminders)).toHaveLength(6);

    expect(subscriptionAccountReminders.keys).toEqual([
      'first',
      'second',
      'third',
    ]);

    expect(typeof subscriptionAccountReminders.create).toBe('function');
    expect(subscriptionAccountReminders.create).toHaveLength(6);

    expect(typeof subscriptionAccountReminders.delete).toBe('function');
    expect(subscriptionAccountReminders.delete).toHaveLength(1);

    expect(typeof subscriptionAccountReminders.process).toBe('function');
    expect(subscriptionAccountReminders.process).toHaveLength(0);

    expect(typeof subscriptionAccountReminders.reinstate).toBe('function');
    expect(subscriptionAccountReminders.reinstate).toHaveLength(2);

    expect(typeof subscriptionAccountReminders.close).toBe('function');
    expect(subscriptionAccountReminders.close).toHaveLength(0);
  });

  describe('create without metadata:', () => {
    let before: number, createResult: any;

    beforeEach(async () => {
      before = Date.now();
      // Clobber keys to assert that misbehaving callers can't wreck the internal behaviour
      subscriptionAccountReminders.keys = [];
      createResult = await subscriptionAccountReminders.create(
        'wibble',
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        before - 1
      );
    });

    afterEach(() => {
      return subscriptionAccountReminders.delete('wibble');
    });

    it('returned the correct result', async () => {
      expect(createResult).toEqual(EXPECTED_CREATE_DELETE_RESULT);
    });

    it.each(REMINDERS)('wrote %s reminder to redis', async (reminder) => {
      const reminders = await redis.zrange(reminder, 0, -1);
      expect(reminders).toEqual(['wibble']);
    });

    it('did not write metadata to redis', async () => {
      const metadata = await redis.get('metadata_sub_flow:wibble');
      expect(metadata).toBeNull();
    });

    describe('delete:', () => {
      let deleteResult: any;

      beforeEach(async () => {
        deleteResult = await subscriptionAccountReminders.delete('wibble');
      });

      it('returned the correct result', async () => {
        expect(deleteResult).toEqual(EXPECTED_CREATE_DELETE_RESULT);
      });

      it.each(REMINDERS)(
        'removed %s reminder from redis',
        async (reminder) => {
          const reminders = await redis.zrange(reminder, 0, -1);
          expect(reminders).toHaveLength(0);
        }
      );

      it('did not call log.error', () => {
        expect(log.error.callCount).toBe(0);
      });
    });

    describe('process:', () => {
      let processResult: any;

      beforeEach(async () => {
        await subscriptionAccountReminders.create(
          'blee',
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          before
        );
        processResult = await subscriptionAccountReminders.process(before + 2);
      });

      afterEach(() => {
        return subscriptionAccountReminders.delete('blee');
      });

      it('returned the correct result', async () => {
        expect(typeof processResult).toBe('object');

        expect(Array.isArray(processResult.first)).toBe(true);
        expect(processResult.first).toHaveLength(2);
        expect(typeof processResult.first[0]).toBe('object');
        expect(processResult.first[0].uid).toBe('wibble');
        expect(processResult.first[0].flowId).toBeUndefined();
        expect(processResult.first[0].flowBeginTime).toBeUndefined();
        expect(parseInt(processResult.first[0].timestamp)).toBeGreaterThan(
          before - 1000
        );
        expect(parseInt(processResult.first[0].timestamp)).toBeLessThan(
          before
        );
        expect(processResult.first[1].uid).toBe('blee');
        expect(
          parseInt(processResult.first[1].timestamp)
        ).toBeGreaterThanOrEqual(before);
        expect(parseInt(processResult.first[1].timestamp)).toBeLessThan(
          before + 1000
        );
        expect(processResult.first[1].flowId).toBeUndefined();
        expect(processResult.first[1].flowBeginTime).toBeUndefined();

        expect(Array.isArray(processResult.second)).toBe(true);
        expect(processResult.second).toHaveLength(2);
        expect(processResult.second[0].uid).toBe('wibble');
        expect(processResult.second[0].timestamp).toBe(
          processResult.first[0].timestamp
        );
        expect(processResult.second[0].flowId).toBeUndefined();
        expect(processResult.second[0].flowBeginTime).toBeUndefined();
        expect(processResult.second[1].uid).toBe('blee');
        expect(processResult.second[1].timestamp).toBe(
          processResult.first[1].timestamp
        );
        expect(processResult.second[1].flowId).toBeUndefined();
        expect(processResult.second[1].flowBeginTime).toBeUndefined();

        expect(processResult.third).toEqual([]);
      });

      it.each(
        REMINDERS.filter((r) => r !== 'third')
      )('removed %s reminder from redis correctly', async (reminder) => {
        const reminders = await redis.zrange(reminder, 0, -1);
        expect(reminders).toHaveLength(0);
      });

      it('left the third reminders in redis', async () => {
        const reminders = await redis.zrange('third', 0, -1);
        expect(new Set(reminders)).toEqual(new Set(['wibble', 'blee']));
      });

      it('did not call log.error', () => {
        expect(log.error.callCount).toBe(0);
      });

      describe('reinstate:', () => {
        let reinstateResult: any;

        beforeEach(async () => {
          reinstateResult = await subscriptionAccountReminders.reinstate(
            'second',
            [
              { timestamp: 2, uid: 'wibble' },
              { timestamp: 3, uid: 'blee' },
            ]
          );
        });

        afterEach(() => {
          return redis.zrem('second', 'wibble', 'blee');
        });

        it('returned the correct result', () => {
          expect(reinstateResult).toBe(2);
        });

        it('left the first reminder empty', async () => {
          const reminders = await redis.zrange('first', 0, -1);
          expect(reminders).toHaveLength(0);
        });

        it('reinstated records to the second reminder', async () => {
          const reminders = await redis.zrange(
            'second',
            0,
            -1,
            'WITHSCORES'
          );
          expect(reminders).toEqual(['wibble', '2', 'blee', '3']);
        });

        it('left the third reminders in redis', async () => {
          const reminders = await redis.zrange('third', 0, -1);
          expect(new Set(reminders)).toEqual(new Set(['wibble', 'blee']));
        });
      });
    });
  });

  describe('create with metadata:', () => {
    let before: number, createResult: any;

    beforeEach(async () => {
      before = Date.now();
      createResult = await subscriptionAccountReminders.create(
        'wibble',
        'blee',
        42,
        'a',
        'b',
        'c',
        before
      );
    });

    afterEach(async () => {
      return subscriptionAccountReminders.delete('wibble');
    });

    it('returned the correct result', async () => {
      expect(createResult).toEqual(EXPECTED_CREATE_DELETE_RESULT);
    });

    it.each(REMINDERS)('wrote %s reminder to redis', async (reminder) => {
      const reminders = await redis.zrange(reminder, 0, -1);
      expect(reminders).toEqual(['wibble']);
    });

    it('wrote metadata to redis', async () => {
      const metadata = await redis.get('metadata_sub_flow:wibble');
      expect(JSON.parse(metadata)).toEqual(['blee', 42, 'a', 'b', 'c']);
    });

    describe('delete:', () => {
      let deleteResult: any;

      beforeEach(async () => {
        deleteResult = await subscriptionAccountReminders.delete('wibble');
      });

      it('returned the correct result', async () => {
        expect(deleteResult).toEqual(EXPECTED_CREATE_DELETE_RESULT);
      });

      it.each(REMINDERS)(
        'removed %s reminder from redis',
        async (reminder) => {
          const reminders = await redis.zrange(reminder, 0, -1);
          expect(reminders).toHaveLength(0);
        }
      );

      it('removed metadata from redis', async () => {
        const metadata = await redis.get('metadata_sub_flow:wibble');
        expect(metadata).toBeNull();
      });

      it('did not call log.error', () => {
        expect(log.error.callCount).toBe(0);
      });
    });

    describe('process:', () => {
      let processResult: any;

      beforeEach(async () => {
        processResult = await subscriptionAccountReminders.process(before + 2);
      });

      it('returned the correct result', async () => {
        expect(typeof processResult).toBe('object');

        expect(Array.isArray(processResult.first)).toBe(true);
        expect(processResult.first).toHaveLength(1);
        expect(processResult.first[0].flowId).toBe('blee');
        expect(processResult.first[0].flowBeginTime).toBe(42);

        expect(Array.isArray(processResult.second)).toBe(true);
        expect(processResult.second).toHaveLength(1);
        expect(processResult.second[0].flowId).toBe('blee');
        expect(processResult.second[0].flowBeginTime).toBe(42);

        expect(processResult.third).toEqual([]);
      });

      it.each(
        REMINDERS.filter((r) => r !== 'third')
      )('removed %s reminder from redis correctly', async (reminder) => {
        const reminders = await redis.zrange(reminder, 0, -1);
        expect(reminders).toHaveLength(0);
      });

      it('left the third reminder in redis', async () => {
        const reminders = await redis.zrange('third', 0, -1);
        expect(reminders).toEqual(['wibble']);
      });

      it('left the metadata in redis', async () => {
        const metadata = await redis.get('metadata_sub_flow:wibble');
        expect(JSON.parse(metadata)).toEqual(['blee', 42, 'a', 'b', 'c']);
      });

      it('did not call log.error', () => {
        expect(log.error.callCount).toBe(0);
      });

      describe('reinstate:', () => {
        let reinstateResult: any;

        beforeEach(async () => {
          reinstateResult = await subscriptionAccountReminders.reinstate(
            'second',
            [
              {
                timestamp: 2,
                uid: 'wibble',
                flowId: 'different!',
                flowBeginTime: 56,
                deviceId: 'a',
                productId: 'b',
                productName: 'c',
              },
            ]
          );
        });

        afterEach(async () => {
          await redis.zrem('second', 'wibble');
          await redis.del('metadata_sub_flow:wibble');
        });

        it('returned the correct result', () => {
          expect(reinstateResult).toBe(1);
        });

        it('left the first reminder empty', async () => {
          const reminders = await redis.zrange('first', 0, -1);
          expect(reminders).toHaveLength(0);
        });

        it('reinstated record to the second reminder', async () => {
          const reminders = await redis.zrange(
            'second',
            0,
            -1,
            'WITHSCORES'
          );
          expect(reminders).toEqual(['wibble', '2']);
        });

        it('left the third reminder in redis', async () => {
          const reminders = await redis.zrange('third', 0, -1);
          expect(reminders).toEqual(['wibble']);
        });

        it('reinstated the metadata', async () => {
          const metadata = await redis.get('metadata_sub_flow:wibble');
          expect(JSON.parse(metadata)).toEqual([
            'different!',
            56,
            'a',
            'b',
            'c',
          ]);
        });
      });

      describe('process:', () => {
        let secondProcessResult: any;

        beforeEach(async () => {
          secondProcessResult = await subscriptionAccountReminders.process(
            before + 1000
          );
        });

        // NOTE: Because this suite has a slow setup, don't add any more test cases!
        //       Add further assertions to this test case instead.
        it('returned the correct result and cleared everything from redis', async () => {
          expect(typeof secondProcessResult).toBe('object');

          expect(secondProcessResult.first).toEqual([]);
          expect(secondProcessResult.second).toEqual([]);

          expect(Array.isArray(secondProcessResult.third)).toBe(true);
          expect(secondProcessResult.third).toHaveLength(1);
          expect(secondProcessResult.third[0].uid).toBe('wibble');
          expect(secondProcessResult.third[0].flowId).toBe('blee');
          expect(secondProcessResult.third[0].flowBeginTime).toBe(42);

          const reminders = await redis.zrange('third', 0, -1);
          expect(reminders).toHaveLength(0);

          const metadata = await redis.get('metadata_sub_flow:wibble');
          expect(metadata).toBeNull();
        });
      });
    });
  });
});
