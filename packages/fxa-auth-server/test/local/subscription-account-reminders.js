/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

'use strict';

const REMINDERS = ['first', 'second', 'third'];
const EXPECTED_CREATE_DELETE_RESULT = REMINDERS.reduce((expected, reminder) => {
  expected[reminder] = 1;
  return expected;
}, {});

import { assert } from 'chai';
import configModule from "../../config";
const config = configModule.getProperties();
import mocks from '../mocks';

describe('#integration - lib/subscription-account-reminders', () => {
  let log, mockConfig, redis, subscriptionAccountReminders;

  beforeEach(() => {
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
    subscriptionAccountReminders =
      require('../../lib/subscription-account-reminders')(log, mockConfig);
  });

  afterEach(() => {
    redis.close();
    subscriptionAccountReminders.close();
  });

  it('returned the expected interface', () => {
    assert.isObject(subscriptionAccountReminders);
    assert.lengthOf(Object.keys(subscriptionAccountReminders), 6);

    assert.deepEqual(subscriptionAccountReminders.keys, [
      'first',
      'second',
      'third',
    ]);

    assert.isFunction(subscriptionAccountReminders.create);
    assert.lengthOf(subscriptionAccountReminders.create, 6);

    assert.isFunction(subscriptionAccountReminders.delete);
    assert.lengthOf(subscriptionAccountReminders.delete, 1);

    assert.isFunction(subscriptionAccountReminders.process);
    assert.lengthOf(subscriptionAccountReminders.process, 0);

    assert.isFunction(subscriptionAccountReminders.reinstate);
    assert.lengthOf(subscriptionAccountReminders.reinstate, 2);

    assert.isFunction(subscriptionAccountReminders.close);
    assert.lengthOf(subscriptionAccountReminders.close, 0);
  });

  describe('create without metadata:', () => {
    let before, createResult;

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
      assert.deepEqual(createResult, EXPECTED_CREATE_DELETE_RESULT);
    });

    REMINDERS.forEach((reminder) => {
      it(`wrote ${reminder} reminder to redis`, async () => {
        const reminders = await redis.zrange(reminder, 0, -1);
        assert.deepEqual(reminders, ['wibble']);
      });
    });

    it('did not write metadata to redis', async () => {
      const metadata = await redis.get('metadata_sub_flow:wibble');
      assert.isNull(metadata);
    });

    describe('delete:', () => {
      let deleteResult;

      beforeEach(async () => {
        deleteResult = await subscriptionAccountReminders.delete('wibble');
      });

      it('returned the correct result', async () => {
        assert.deepEqual(deleteResult, EXPECTED_CREATE_DELETE_RESULT);
      });

      REMINDERS.forEach((reminder) => {
        it(`removed ${reminder} reminder from redis`, async () => {
          const reminders = await redis.zrange(reminder, 0, -1);
          assert.lengthOf(reminders, 0);
        });
      });

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0);
      });
    });

    describe('process:', () => {
      let processResult;

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
        assert.isObject(processResult);

        assert.isArray(processResult.first);
        assert.lengthOf(processResult.first, 2);
        assert.isObject(processResult.first[0]);
        assert.equal(processResult.first[0].uid, 'wibble');
        assert.isUndefined(processResult.first[0].flowId);
        assert.isUndefined(processResult.first[0].flowBeginTime);
        assert.isAbove(
          parseInt(processResult.first[0].timestamp),
          before - 1000
        );
        assert.isBelow(parseInt(processResult.first[0].timestamp), before);
        assert.equal(processResult.first[1].uid, 'blee');
        assert.isAtLeast(parseInt(processResult.first[1].timestamp), before);
        assert.isBelow(
          parseInt(processResult.first[1].timestamp),
          before + 1000
        );
        assert.isUndefined(processResult.first[1].flowId);
        assert.isUndefined(processResult.first[1].flowBeginTime);

        assert.isArray(processResult.second);
        assert.lengthOf(processResult.second, 2);
        assert.equal(processResult.second[0].uid, 'wibble');
        assert.equal(
          processResult.second[0].timestamp,
          processResult.first[0].timestamp
        );
        assert.isUndefined(processResult.second[0].flowId);
        assert.isUndefined(processResult.second[0].flowBeginTime);
        assert.equal(processResult.second[1].uid, 'blee');
        assert.equal(
          processResult.second[1].timestamp,
          processResult.first[1].timestamp
        );
        assert.isUndefined(processResult.second[1].flowId);
        assert.isUndefined(processResult.second[1].flowBeginTime);

        assert.deepEqual(processResult.third, []);
      });

      REMINDERS.forEach((reminder) => {
        if (reminder !== 'third') {
          it(`removed ${reminder} reminder from redis correctly`, async () => {
            const reminders = await redis.zrange(reminder, 0, -1);
            assert.lengthOf(reminders, 0);
          });
        } else {
          it('left the third reminders in redis', async () => {
            const reminders = await redis.zrange(reminder, 0, -1);
            assert.deepEqual(new Set(reminders), new Set(['wibble', 'blee']));
          });
        }
      });

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0);
      });

      describe('reinstate:', () => {
        let reinstateResult;

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
          assert.equal(reinstateResult, 2);
        });

        it('left the first reminder empty', async () => {
          const reminders = await redis.zrange('first', 0, -1);
          assert.lengthOf(reminders, 0);
        });

        it('reinstated records to the second reminder', async () => {
          const reminders = await redis.zrange('second', 0, -1, 'WITHSCORES');
          assert.deepEqual(reminders, ['wibble', '2', 'blee', '3']);
        });

        it('left the third reminders in redis', async () => {
          const reminders = await redis.zrange('third', 0, -1);
          assert.deepEqual(new Set(reminders), new Set(['wibble', 'blee']));
        });
      });
    });
  });

  describe('create with metadata:', () => {
    let before, createResult;

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
      assert.deepEqual(createResult, EXPECTED_CREATE_DELETE_RESULT);
    });

    REMINDERS.forEach((reminder) => {
      it(`wrote ${reminder} reminder to redis`, async () => {
        const reminders = await redis.zrange(reminder, 0, -1);
        assert.deepEqual(reminders, ['wibble']);
      });
    });

    it('wrote metadata to redis', async () => {
      const metadata = await redis.get('metadata_sub_flow:wibble');
      assert.deepEqual(JSON.parse(metadata), ['blee', 42, 'a', 'b', 'c']);
    });

    describe('delete:', () => {
      let deleteResult;

      beforeEach(async () => {
        deleteResult = await subscriptionAccountReminders.delete('wibble');
      });

      it('returned the correct result', async () => {
        assert.deepEqual(deleteResult, EXPECTED_CREATE_DELETE_RESULT);
      });

      REMINDERS.forEach((reminder) => {
        it(`removed ${reminder} reminder from redis`, async () => {
          const reminders = await redis.zrange(reminder, 0, -1);
          assert.lengthOf(reminders, 0);
        });
      });

      it('removed metadata from redis', async () => {
        const metadata = await redis.get('metadata_sub_flow:wibble');
        assert.isNull(metadata);
      });

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0);
      });
    });

    describe('process:', () => {
      let processResult;

      beforeEach(async () => {
        processResult = await subscriptionAccountReminders.process(before + 2);
      });

      it('returned the correct result', async () => {
        assert.isObject(processResult);

        assert.isArray(processResult.first);
        assert.lengthOf(processResult.first, 1);
        assert.equal(processResult.first[0].flowId, 'blee');
        assert.equal(processResult.first[0].flowBeginTime, 42);

        assert.isArray(processResult.second);
        assert.lengthOf(processResult.second, 1);
        assert.equal(processResult.second[0].flowId, 'blee');
        assert.equal(processResult.second[0].flowBeginTime, 42);

        assert.deepEqual(processResult.third, []);
      });

      REMINDERS.forEach((reminder) => {
        if (reminder !== 'third') {
          it(`removed ${reminder} reminder from redis correctly`, async () => {
            const reminders = await redis.zrange(reminder, 0, -1);
            assert.lengthOf(reminders, 0);
          });
        } else {
          it('left the third reminder in redis', async () => {
            const reminders = await redis.zrange(reminder, 0, -1);
            assert.deepEqual(reminders, ['wibble']);
          });

          it('left the metadata in redis', async () => {
            const metadata = await redis.get('metadata_sub_flow:wibble');
            assert.deepEqual(JSON.parse(metadata), ['blee', 42, 'a', 'b', 'c']);
          });
        }
      });

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0);
      });

      describe('reinstate:', () => {
        let reinstateResult;

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
          assert.equal(reinstateResult, 1);
        });

        it('left the first reminder empty', async () => {
          const reminders = await redis.zrange('first', 0, -1);
          assert.lengthOf(reminders, 0);
        });

        it('reinstated record to the second reminder', async () => {
          const reminders = await redis.zrange('second', 0, -1, 'WITHSCORES');
          assert.deepEqual(reminders, ['wibble', '2']);
        });

        it('left the third reminder in redis', async () => {
          const reminders = await redis.zrange('third', 0, -1);
          assert.deepEqual(reminders, ['wibble']);
        });

        it('reinstated the metadata', async () => {
          const metadata = await redis.get('metadata_sub_flow:wibble');
          assert.deepEqual(JSON.parse(metadata), [
            'different!',
            56,
            'a',
            'b',
            'c',
          ]);
        });
      });

      describe('process:', () => {
        let secondProcessResult;

        beforeEach(async () => {
          secondProcessResult = await subscriptionAccountReminders.process(
            before + 1000
          );
        });

        // NOTE: Because this suite has a slow setup, don't add any more test cases!
        //       Add further assertions to this test case instead.
        it('returned the correct result and cleared everything from redis', async () => {
          assert.isObject(secondProcessResult);

          assert.deepEqual(secondProcessResult.first, []);
          assert.deepEqual(secondProcessResult.second, []);

          assert.isArray(secondProcessResult.third);
          assert.lengthOf(secondProcessResult.third, 1);
          assert.equal(secondProcessResult.third[0].uid, 'wibble');
          assert.equal(secondProcessResult.third[0].flowId, 'blee');
          assert.equal(secondProcessResult.third[0].flowBeginTime, 42);

          const reminders = await redis.zrange('third', 0, -1);
          assert.lengthOf(reminders, 0);

          const metadata = await redis.get('metadata_sub_flow:wibble');
          assert.isNull(metadata);
        });
      });
    });
  });
});
