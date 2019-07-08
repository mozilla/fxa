/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

'use strict';

const ROOT_DIR = '../..';
const REMINDERS = ['first', 'second', 'third'];
const EXPECTED_CREATE_DELETE_RESULT = REMINDERS.reduce((expected, reminder) => {
  expected[reminder] = 1;
  return expected;
}, {});

const { assert } = require('chai');
const config = require(`${ROOT_DIR}/config`).getProperties();
const mocks = require('../mocks');

describe('lib/verification-reminders:', () => {
  let log, mockConfig, redis, verificationReminders;

  beforeEach(() => {
    log = mocks.mockLog();
    mockConfig = {
      redis: config.redis,
      verificationReminders: {
        rolloutRate: 1,
        firstInterval: 1,
        secondInterval: 2,
        thirdInterval: 1000,
        redis: {
          maxConnections: 1,
          minConnections: 1,
          prefix: 'test-verification-reminders:',
        },
      },
    };
    redis = require('fxa-shared/redis')(
      {
        ...config.redis,
        ...mockConfig.verificationReminders.redis,
        enabled: true,
      },
      mocks.mockLog()
    );
    verificationReminders = require(`${ROOT_DIR}/lib/verification-reminders`)(
      log,
      mockConfig
    );
  });

  afterEach(() => {
    redis.close();
    verificationReminders.close();
  });

  it('returned the expected interface', () => {
    assert.isObject(verificationReminders);
    assert.lengthOf(Object.keys(verificationReminders), 6);

    assert.deepEqual(verificationReminders.keys, ['first', 'second', 'third']);

    assert.isFunction(verificationReminders.create);
    assert.lengthOf(verificationReminders.create, 3);

    assert.isFunction(verificationReminders.delete);
    assert.lengthOf(verificationReminders.delete, 1);

    assert.isFunction(verificationReminders.process);
    assert.lengthOf(verificationReminders.process, 0);

    assert.isFunction(verificationReminders.reinstate);
    assert.lengthOf(verificationReminders.reinstate, 2);

    assert.isFunction(verificationReminders.close);
    assert.lengthOf(verificationReminders.close, 0);
  });

  it('called log.info correctly', () => {
    assert.equal(log.info.callCount, 1);
    const args = log.info.args[0];
    assert.lengthOf(args, 2);
    assert.equal(args[0], 'redis.enabled');
    assert.isObject(args[1]);
  });

  describe('create without metadata:', () => {
    let createResult;

    beforeEach(async () => {
      // Clobber keys to assert that misbehaving callers can't wreck the internal behaviour
      verificationReminders.keys = [];
      createResult = await verificationReminders.create('wibble');
    });

    afterEach(() => {
      return verificationReminders.delete('wibble');
    });

    it('returned the correct result', async () => {
      assert.deepEqual(createResult, EXPECTED_CREATE_DELETE_RESULT);
    });

    REMINDERS.forEach(reminder => {
      it(`wrote ${reminder} reminder to redis`, async () => {
        const reminders = await redis.zrange(reminder, 0, -1);
        assert.deepEqual(reminders, ['wibble']);
      });
    });

    it('did not write metadata to redis', async () => {
      const metadata = await redis.get('metadata:wibble');
      assert.isNull(metadata);
    });

    it('called log.info correctly', () => {
      assert.equal(log.info.callCount, 2);
      const args = log.info.args[1];
      assert.lengthOf(args, 2);
      assert.equal(args[0], 'verificationReminders.create');
      assert.deepEqual(args[1], {
        uid: 'wibble',
        flowId: undefined,
        flowBeginTime: undefined,
      });
    });

    describe('delete:', () => {
      let deleteResult;

      beforeEach(async () => {
        deleteResult = await verificationReminders.delete('wibble');
      });

      it('returned the correct result', async () => {
        assert.deepEqual(deleteResult, EXPECTED_CREATE_DELETE_RESULT);
      });

      REMINDERS.forEach(reminder => {
        it(`removed ${reminder} reminder from redis`, async () => {
          const reminders = await redis.zrange(reminder, 0, -1);
          assert.lengthOf(reminders, 0);
        });
      });

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0);
      });

      it('called log.info correctly', () => {
        assert.equal(log.info.callCount, 3);
        const args = log.info.args[2];
        assert.lengthOf(args, 2);
        assert.equal(args[0], 'verificationReminders.delete');
        assert.deepEqual(args[1], { uid: 'wibble' });
      });
    });

    describe('process:', () => {
      let before, processResult, after;

      beforeEach(done => {
        before = Date.now();
        verificationReminders.create('blee').then(() => {
          setTimeout(async () => {
            processResult = await verificationReminders.process();
            after = Date.now();
            done();
          }, 2);
        });
      });

      afterEach(() => {
        return verificationReminders.delete('blee');
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

      REMINDERS.forEach(reminder => {
        if (reminder !== 'third') {
          it(`removed ${reminder} reminder from redis correctly`, async () => {
            const reminders = await redis.zrange(reminder, 0, -1);
            assert.lengthOf(reminders, 0);
          });
        } else {
          it('left the third reminders in redis', async () => {
            const reminders = await redis.zrange(reminder, 0, -1);
            assert.deepEqual(reminders, ['wibble', 'blee']);
          });
        }
      });

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0);
      });

      it('called log.info correctly', () => {
        assert.equal(log.info.callCount, 6);

        let args = log.info.args[3];
        assert.lengthOf(args, 2);
        assert.equal(args[0], 'verificationReminders.process');
        assert.isObject(args[1]);
        assert.equal(args[1].key, 'first');
        assert.isAtLeast(args[1].now, before);
        assert.isAtMost(args[1].now, after);
        assert.equal(
          args[1].cutoff,
          args[1].now - mockConfig.verificationReminders.firstInterval
        );

        args = log.info.args[4];
        assert.equal(args[1].key, 'second');
        assert.equal(args[1].now, log.info.args[3][1].now);
        assert.equal(
          args[1].cutoff,
          args[1].now - mockConfig.verificationReminders.secondInterval
        );

        args = log.info.args[5];
        assert.equal(args[1].key, 'third');
        assert.equal(args[1].now, log.info.args[3][1].now);
        assert.equal(
          args[1].cutoff,
          args[1].now - mockConfig.verificationReminders.thirdInterval
        );
      });

      describe('reinstate:', () => {
        let reinstateResult;

        beforeEach(async () => {
          reinstateResult = await verificationReminders.reinstate('second', [
            { timestamp: 2, uid: 'wibble' },
            { timestamp: 3, uid: 'blee' },
          ]);
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
          assert.deepEqual(reminders, ['wibble', 'blee']);
        });
      });
    });
  });

  describe('create with metadata:', () => {
    let createResult;

    beforeEach(async () => {
      createResult = await verificationReminders.create('wibble', 'blee', 42);
    });

    afterEach(() => {
      return verificationReminders.delete('wibble');
    });

    it('returned the correct result', async () => {
      assert.deepEqual(createResult, EXPECTED_CREATE_DELETE_RESULT);
    });

    REMINDERS.forEach(reminder => {
      it(`wrote ${reminder} reminder to redis`, async () => {
        const reminders = await redis.zrange(reminder, 0, -1);
        assert.deepEqual(reminders, ['wibble']);
      });
    });

    it('wrote metadata to redis', async () => {
      const metadata = await redis.get('metadata:wibble');
      assert.deepEqual(JSON.parse(metadata), ['blee', 42]);
    });

    it('called log.info', () => {
      assert.equal(log.info.callCount, 2);
    });

    it('called log.info correctly', () => {
      assert.equal(log.info.callCount, 2);
      assert.deepEqual(log.info.args[1][1], {
        uid: 'wibble',
        flowId: 'blee',
        flowBeginTime: 42,
      });
    });

    describe('delete:', () => {
      let deleteResult;

      beforeEach(async () => {
        deleteResult = await verificationReminders.delete('wibble');
      });

      it('returned the correct result', async () => {
        assert.deepEqual(deleteResult, EXPECTED_CREATE_DELETE_RESULT);
      });

      REMINDERS.forEach(reminder => {
        it(`removed ${reminder} reminder from redis`, async () => {
          const reminders = await redis.zrange(reminder, 0, -1);
          assert.lengthOf(reminders, 0);
        });
      });

      it('removed metadata from redis', async () => {
        const metadata = await redis.get('metadata:wibble');
        assert.isNull(metadata);
      });

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0);
      });

      it('called log.info correctly', () => {
        assert.equal(log.info.callCount, 3);
        assert.deepEqual(log.info.args[2][1], { uid: 'wibble' });
      });
    });

    describe('process:', () => {
      let processResult;

      beforeEach(done => {
        setTimeout(async () => {
          processResult = await verificationReminders.process();
          done();
        }, 2);
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

      REMINDERS.forEach(reminder => {
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
            const metadata = await redis.get('metadata:wibble');
            assert.deepEqual(JSON.parse(metadata), ['blee', 42]);
          });
        }
      });

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0);
      });

      it('called log.info', () => {
        assert.equal(log.info.callCount, 5);
      });

      describe('reinstate:', () => {
        let reinstateResult;

        beforeEach(async () => {
          reinstateResult = await verificationReminders.reinstate('second', [
            {
              timestamp: 2,
              uid: 'wibble',
              flowId: 'different!',
              flowBeginTime: 56,
            },
          ]);
        });

        afterEach(async () => {
          await redis.zrem('second', 'wibble');
          await redis.del('metadata:wibble');
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
          const metadata = await redis.get('metadata:wibble');
          assert.deepEqual(JSON.parse(metadata), ['different!', 56]);
        });
      });

      describe('process:', () => {
        let secondProcessResult;

        beforeEach(done => {
          setTimeout(async () => {
            secondProcessResult = await verificationReminders.process();
            done();
          }, 1000);
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

          const metadata = await redis.get('metadata:wibble');
          assert.isNull(metadata);
        });
      });
    });
  });
});

describe('lib/verification-reminders with invalid config:', () => {
  it('throws if config contains clashing metadata key', () => {
    assert.throws(() => {
      require(`${ROOT_DIR}/lib/verification-reminders`)(mocks.mockLog(), {
        redis: config.redis,
        verificationReminders: {
          rolloutRate: 1,
          firstInterval: 1,
          secondInterval: 2,
          metadataInterval: 3,
          redis: {
            maxConnections: 1,
            minConnections: 1,
            prefix: 'test-verification-reminders:',
          },
        },
      });
    });
  });
});
