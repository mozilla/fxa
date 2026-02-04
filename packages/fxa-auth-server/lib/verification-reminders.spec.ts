/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

/**
 * @jest-environment node
 */

import sinon from 'sinon';

const REMINDERS = ['first', 'second', 'third'];
const EXPECTED_CREATE_DELETE_RESULT = REMINDERS.reduce(
  (expected: Record<string, number>, reminder) => {
    expected[reminder] = 1;
    return expected;
  },
  {}
);

function mockLog() {
  return {
    info: sinon.stub(),
    trace: sinon.stub(),
    error: sinon.stub(),
    warn: sinon.stub(),
    debug: sinon.stub(),
  };
}

const config = require('../config').default.getProperties();

describe('#integration - lib/verification-reminders', () => {
  let log: ReturnType<typeof mockLog>;
  let mockConfig: any;
  let redis: any;
  let verificationReminders: any;

  beforeEach(() => {
    log = mockLog();
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
    redis = require('./redis')(
      {
        ...config.redis,
        ...mockConfig.verificationReminders.redis,
        enabled: true,
      },
      mockLog()
    );
    verificationReminders = require('./verification-reminders')(log, mockConfig);
  });

  afterEach(async () => {
    await redis.close();
    await verificationReminders.close();
  });

  it('returned the expected interface', () => {
    expect(typeof verificationReminders).toBe('object');
    expect(Object.keys(verificationReminders)).toHaveLength(6);

    expect(verificationReminders.keys).toEqual(['first', 'second', 'third']);

    expect(typeof verificationReminders.create).toBe('function');
    expect(verificationReminders.create.length).toBe(3);

    expect(typeof verificationReminders.delete).toBe('function');
    expect(verificationReminders.delete.length).toBe(1);

    expect(typeof verificationReminders.process).toBe('function');
    expect(verificationReminders.process.length).toBe(0);

    expect(typeof verificationReminders.reinstate).toBe('function');
    expect(verificationReminders.reinstate.length).toBe(2);

    expect(typeof verificationReminders.close).toBe('function');
    expect(verificationReminders.close.length).toBe(0);
  });

  describe('create without metadata:', () => {
    let before: number;
    let createResult: any;

    beforeEach(async () => {
      before = Date.now();
      // Clobber keys to assert that misbehaving callers can't wreck the internal behaviour
      verificationReminders.keys = [];
      createResult = await verificationReminders.create(
        'wibble',
        undefined,
        undefined,
        before - 1
      );
    });

    afterEach(() => {
      return verificationReminders.delete('wibble');
    });

    it('returned the correct result', async () => {
      expect(createResult).toEqual(EXPECTED_CREATE_DELETE_RESULT);
    });

    REMINDERS.forEach((reminder) => {
      it(`wrote ${reminder} reminder to redis`, async () => {
        const reminders = await redis.zrange(reminder, 0, -1);
        expect(reminders).toEqual(['wibble']);
      });
    });

    it('did not write metadata to redis', async () => {
      const metadata = await redis.get('metadata:wibble');
      expect(metadata).toBeNull();
    });

    describe('delete:', () => {
      let deleteResult: any;

      beforeEach(async () => {
        deleteResult = await verificationReminders.delete('wibble');
      });

      it('returned the correct result', async () => {
        expect(deleteResult).toEqual(EXPECTED_CREATE_DELETE_RESULT);
      });

      REMINDERS.forEach((reminder) => {
        it(`removed ${reminder} reminder from redis`, async () => {
          const reminders = await redis.zrange(reminder, 0, -1);
          expect(reminders).toHaveLength(0);
        });
      });

      it('did not call log.error', () => {
        expect(log.error.callCount).toBe(0);
      });
    });

    describe('process:', () => {
      let processResult: any;

      beforeEach(async () => {
        await verificationReminders.create('blee', undefined, undefined, before);
        processResult = await verificationReminders.process(before + 2);
      });

      afterEach(() => {
        return verificationReminders.delete('blee');
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
        expect(parseInt(processResult.first[0].timestamp)).toBeLessThan(before);
        expect(processResult.first[1].uid).toBe('blee');
        expect(parseInt(processResult.first[1].timestamp)).toBeGreaterThanOrEqual(
          before
        );
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

      REMINDERS.forEach((reminder) => {
        if (reminder !== 'third') {
          it(`removed ${reminder} reminder from redis correctly`, async () => {
            const reminders = await redis.zrange(reminder, 0, -1);
            expect(reminders).toHaveLength(0);
          });
        } else {
          it('left the third reminders in redis', async () => {
            const reminders = await redis.zrange(reminder, 0, -1);
            expect(new Set(reminders)).toEqual(new Set(['wibble', 'blee']));
          });
        }
      });

      it('did not call log.error', () => {
        expect(log.error.callCount).toBe(0);
      });

      describe('reinstate:', () => {
        let reinstateResult: any;

        beforeEach(async () => {
          reinstateResult = await verificationReminders.reinstate('second', [
            { timestamp: 2, uid: 'wibble' },
            { timestamp: 3, uid: 'blee' },
          ]);
        });

        afterEach(async () => {
          return await redis.zrem('second', 'wibble', 'blee');
        });

        it('returned the correct result', () => {
          expect(reinstateResult).toBe(2);
        });

        it('left the first reminder empty', async () => {
          const reminders = await redis.zrange('first', 0, -1);
          expect(reminders).toHaveLength(0);
        });

        it('reinstated records to the second reminder', async () => {
          const reminders = await redis.zrange('second', 0, -1, 'WITHSCORES');
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
    let before: number;
    let createResult: any;

    beforeEach(async () => {
      before = Date.now();
      createResult = await verificationReminders.create('wibble', 'blee', 42, before);
    });

    afterEach(() => {
      return verificationReminders.delete('wibble');
    });

    it('returned the correct result', async () => {
      expect(createResult).toEqual(EXPECTED_CREATE_DELETE_RESULT);
    });

    REMINDERS.forEach((reminder) => {
      it(`wrote ${reminder} reminder to redis`, async () => {
        const reminders = await redis.zrange(reminder, 0, -1);
        expect(reminders).toEqual(['wibble']);
      });
    });

    it('wrote metadata to redis', async () => {
      const metadata = await redis.get('metadata:wibble');
      expect(JSON.parse(metadata)).toEqual(['blee', 42]);
    });

    describe('delete:', () => {
      let deleteResult: any;

      beforeEach(async () => {
        deleteResult = await verificationReminders.delete('wibble');
      });

      it('returned the correct result', async () => {
        expect(deleteResult).toEqual(EXPECTED_CREATE_DELETE_RESULT);
      });

      REMINDERS.forEach((reminder) => {
        it(`removed ${reminder} reminder from redis`, async () => {
          const reminders = await redis.zrange(reminder, 0, -1);
          expect(reminders).toHaveLength(0);
        });
      });

      it('removed metadata from redis', async () => {
        const metadata = await redis.get('metadata:wibble');
        expect(metadata).toBeNull();
      });

      it('did not call log.error', () => {
        expect(log.error.callCount).toBe(0);
      });
    });

    describe('process:', () => {
      let processResult: any;

      beforeEach(async () => {
        processResult = await verificationReminders.process(before + 2);
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

      REMINDERS.forEach((reminder) => {
        if (reminder !== 'third') {
          it(`removed ${reminder} reminder from redis correctly`, async () => {
            const reminders = await redis.zrange(reminder, 0, -1);
            expect(reminders).toHaveLength(0);
          });
        } else {
          it('left the third reminder in redis', async () => {
            const reminders = await redis.zrange(reminder, 0, -1);
            expect(reminders).toEqual(['wibble']);
          });

          it('left the metadata in redis', async () => {
            const metadata = await redis.get('metadata:wibble');
            expect(JSON.parse(metadata)).toEqual(['blee', 42]);
          });
        }
      });

      it('did not call log.error', () => {
        expect(log.error.callCount).toBe(0);
      });

      describe('reinstate:', () => {
        let reinstateResult: any;

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
          expect(reinstateResult).toBe(1);
        });

        it('left the first reminder empty', async () => {
          const reminders = await redis.zrange('first', 0, -1);
          expect(reminders).toHaveLength(0);
        });

        it('reinstated record to the second reminder', async () => {
          const reminders = await redis.zrange('second', 0, -1, 'WITHSCORES');
          expect(reminders).toEqual(['wibble', '2']);
        });

        it('left the third reminder in redis', async () => {
          const reminders = await redis.zrange('third', 0, -1);
          expect(reminders).toEqual(['wibble']);
        });

        it('reinstated the metadata', async () => {
          const metadata = await redis.get('metadata:wibble');
          expect(JSON.parse(metadata)).toEqual(['different!', 56]);
        });
      });

      describe('process:', () => {
        let secondProcessResult: any;

        beforeEach(async () => {
          secondProcessResult = await verificationReminders.process(before + 1000);
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

          const metadata = await redis.get('metadata:wibble');
          expect(metadata).toBeNull();
        });
      });
    });
  });
});

describe('lib/verification-reminders with invalid config:', () => {
  it('throws if config contains clashing metadata key', () => {
    expect(() => {
      require('./verification-reminders')(
        {
          info: () => {},
          trace: () => {},
          error: () => {},
          warn: () => {},
          debug: () => {},
        },
        {
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
        }
      );
    }).toThrow();
  });
});
