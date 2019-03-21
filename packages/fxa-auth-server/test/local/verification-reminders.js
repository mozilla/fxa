/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

'use strict';

const ROOT_DIR = '../..';
const REMINDERS = [ 'first', 'second', 'third' ];
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
        thirdInterval: 60000,
        redis: {
          maxConnections: 1,
          minConnections: 1,
          prefix: 'test-verification-reminders:',
        },
      },
    };
    redis = require('fxa-shared/redis')({
      ...config.redis,
      ...mockConfig.verificationReminders.redis,
      enabled: true,
    }, mocks.mockLog());
    verificationReminders = require(`${ROOT_DIR}/lib/verification-reminders`)(log, mockConfig);
  });

  it('returned the expected interface', () => {
    assert.isObject(verificationReminders);
    assert.lengthOf(Object.keys(verificationReminders), 4);

    assert.deepEqual(verificationReminders.keys, [ 'first', 'second', 'third' ]);

    assert.isFunction(verificationReminders.create);
    assert.lengthOf(verificationReminders.create, 1);

    assert.isFunction(verificationReminders.delete);
    assert.lengthOf(verificationReminders.delete, 1);

    assert.isFunction(verificationReminders.process);
    assert.lengthOf(verificationReminders.process, 0);
  });

  it('called log.info correctly', () => {
    assert.equal(log.info.callCount, 1);
    const args = log.info.args[0];
    assert.lengthOf(args, 2);
    assert.equal(args[0], 'redis.enabled');
    assert.isObject(args[1]);
  });

  describe('create:', () => {
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
      it(`wrote ${reminder} reminder to redis correctly`, async () => {
        const reminders = await redis.zrange(reminder, 0, -1);
        assert.deepEqual(reminders, [ 'wibble' ]);
      });
    });

    it('called log.info correctly', () => {
      assert.equal(log.info.callCount, 2);
      const args = log.info.args[1];
      assert.lengthOf(args, 2);
      assert.equal(args[0], 'verificationReminders.create');
      assert.deepEqual(args[1], { uid: 'wibble' });
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
        it(`removed ${reminder} reminder from redis correctly`, async () => {
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
      let processResult, after;

      beforeEach(done => {
        setTimeout(async () => {
          processResult = await verificationReminders.process();
          after = Date.now();
          setImmediate(done);
        }, 2);
      });

      it('returned the correct result', async () => {
        assert.deepEqual(processResult, {
          first: [ 'wibble' ],
          second: [ 'wibble' ],
          third: [],
        });
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
            assert.deepEqual(reminders, [ 'wibble' ]);
          });
        }
      });

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0);
      });

      it('called log.info correctly', () => {
        assert.equal(log.info.callCount, 5);

        let args = log.info.args[2];
        assert.lengthOf(args, 2);
        assert.equal(args[0], 'verificationReminders.process');
        assert.isObject(args[1]);
        assert.equal(args[1].key, 'first');
        assert.isAtMost(args[1].now, after);
        assert.isAbove(args[1].now, after - 1000);
        assert.equal(args[1].cutoff, args[1].now - mockConfig.verificationReminders.firstInterval);

        args = log.info.args[3];
        assert.equal(args[1].key, 'second');
        assert.equal(args[1].now, log.info.args[2][1].now);
        assert.equal(args[1].cutoff, args[1].now - mockConfig.verificationReminders.secondInterval);

        args = log.info.args[4];
        assert.equal(args[1].key, 'third');
        assert.equal(args[1].now, log.info.args[2][1].now);
        assert.equal(args[1].cutoff, args[1].now - mockConfig.verificationReminders.thirdInterval);
      });
    });
  });
});
