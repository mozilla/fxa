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

describe('lib/cad-reminders', () => {
  let log, mockConfig, redis, cadReminders;

  beforeEach(() => {
    log = mocks.mockLog();
    mockConfig = {
      redis: config.redis,
      cadReminders: {
        rolloutRate: 1,
        firstInterval: 1,
        secondInterval: 2,
        thirdInterval: 60000,
        redis: {
          maxConnections: 1,
          minConnections: 1,
          prefix: 'test-cad-reminders:',
        },
      },
    };
    redis = require('../../lib/redis')(
      {
        ...config.redis,
        ...mockConfig.cadReminders.redis,
        enabled: true,
      },
      mocks.mockLog()
    );
    cadReminders = require(`${ROOT_DIR}/lib/cad-reminders`)(mockConfig, log);
  });

  afterEach(async () => {
    await redis.close();
    await cadReminders.close();
  });

  it('returned the expected interface', () => {
    assert.isObject(cadReminders);
    assert.lengthOf(Object.keys(cadReminders), 5);

    assert.deepEqual(cadReminders.keys, ['first', 'second', 'third']);

    assert.isFunction(cadReminders.create);
    assert.lengthOf(cadReminders.create, 1);

    assert.isFunction(cadReminders.delete);
    assert.lengthOf(cadReminders.delete, 1);

    assert.isFunction(cadReminders.process);
    assert.lengthOf(cadReminders.process, 0);

    assert.isFunction(cadReminders.get);
    assert.lengthOf(cadReminders.get, 1);

    assert.isFunction(cadReminders.close);
    assert.lengthOf(cadReminders.close, 0);
  });

  describe('create', () => {
    let createResult;

    beforeEach(async () => {
      createResult = await cadReminders.create('wibble');
    });

    afterEach(async () => {
      await cadReminders.delete('wibble');
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

    describe('delete', () => {
      let deleteResult;

      beforeEach(async () => {
        deleteResult = await cadReminders.delete('wibble');
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

    describe('get', () => {
      let result;

      beforeEach(async () => {
        result = await cadReminders.get('wibble');
      });

      it('returned the correct result', async () => {
        assert.deepEqual(result, {
          first: 0,
          second: 0,
          third: 0,
        });
      });

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0);
      });
    });

    describe('process', () => {
      let before, processResult;

      beforeEach((done) => {
        before = Date.now();
        cadReminders.create('blee').then(() => {
          setTimeout(async () => {
            processResult = await cadReminders.process();
            done();
          }, 2);
        });
      });

      afterEach(async () => {
        await cadReminders.delete('blee');
      });

      it('returned the correct result', async () => {
        assert.isObject(processResult);

        assert.isArray(processResult.first);
        assert.lengthOf(processResult.first, 2);
        assert.isObject(processResult.first[0]);
        assert.equal(processResult.first[0].uid, 'wibble');

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

        assert.isArray(processResult.second);
        assert.lengthOf(processResult.second, 2);
        assert.equal(processResult.second[0].uid, 'wibble');
        assert.equal(
          processResult.second[0].timestamp,
          processResult.first[0].timestamp
        );

        assert.equal(processResult.second[1].uid, 'blee');
        assert.equal(
          processResult.second[1].timestamp,
          processResult.first[1].timestamp
        );
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
            assert.deepEqual(reminders, ['wibble', 'blee']);
          });
        }
      });

      it('did not call log.error', () => {
        assert.equal(log.error.callCount, 0);
      });
    });
  });
});
