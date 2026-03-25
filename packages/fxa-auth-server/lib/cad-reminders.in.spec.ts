/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

const REMINDERS = ['first', 'second', 'third'];
const EXPECTED_CREATE_DELETE_RESULT = REMINDERS.reduce(
  (expected: any, reminder) => {
    expected[reminder] = 1;
    return expected;
  },
  {} as Record<string, number>
);

const config = require('../config').default.getProperties();
const mocks = require('../test/mocks');

describe('#integration - lib/cad-reminders', () => {
  let log: any, mockConfig: any, redis: any, cadReminders: any;

  beforeEach(() => {
    jest.resetModules();
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
    redis = require('./redis')(
      {
        ...config.redis,
        ...mockConfig.cadReminders.redis,
        enabled: true,
      },
      mocks.mockLog()
    );
    cadReminders = require('./cad-reminders')(mockConfig, log);
  });

  afterEach(async () => {
    await redis.close();
    await cadReminders.close();
  });

  it('returned the expected interface', () => {
    expect(cadReminders).toBeDefined();
    expect(Object.keys(cadReminders)).toHaveLength(5);
    expect(cadReminders.keys).toEqual(['first', 'second', 'third']);
    expect(typeof cadReminders.create).toBe('function');
    expect(cadReminders.create).toHaveLength(1);
    expect(typeof cadReminders.delete).toBe('function');
    expect(cadReminders.delete).toHaveLength(1);
    expect(typeof cadReminders.process).toBe('function');
    expect(cadReminders.process).toHaveLength(0);
    expect(typeof cadReminders.get).toBe('function');
    expect(cadReminders.get).toHaveLength(1);
    expect(typeof cadReminders.close).toBe('function');
    expect(cadReminders.close).toHaveLength(0);
  });

  describe('create', () => {
    let before: number, createResult: any;

    beforeEach(async () => {
      before = Date.now();
      createResult = await cadReminders.create('wibble', before - 1);
    });

    afterEach(async () => {
      await cadReminders.delete('wibble');
    });

    it('returned the correct result', () => {
      expect(createResult).toEqual(EXPECTED_CREATE_DELETE_RESULT);
    });

    it.each(REMINDERS)('wrote %s reminder to redis', async (reminder) => {
      const reminders = await redis.zrange(reminder, 0, -1);
      expect(reminders).toEqual(['wibble']);
    });

    describe('delete', () => {
      let deleteResult: any;

      beforeEach(async () => {
        deleteResult = await cadReminders.delete('wibble');
      });

      it('returned the correct result', () => {
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

    describe('get', () => {
      let result: any;

      beforeEach(async () => {
        result = await cadReminders.get('wibble');
      });

      it('returned the correct result', () => {
        expect(result).toEqual({ first: 0, second: 0, third: 0 });
      });

      it('did not call log.error', () => {
        expect(log.error.callCount).toBe(0);
      });
    });

    describe('process', () => {
      let processResult: any;

      beforeEach(async () => {
        await cadReminders.create('blee', before);
        processResult = await cadReminders.process(before + 2);
      });

      afterEach(async () => {
        await cadReminders.delete('blee');
      });

      it('returned the correct result', () => {
        expect(processResult).toBeDefined();

        expect(processResult.first).toHaveLength(2);
        expect(processResult.first[0].uid).toBe('wibble');
        expect(parseInt(processResult.first[0].timestamp)).toBeGreaterThan(
          before - 1000
        );
        expect(parseInt(processResult.first[0].timestamp)).toBeLessThan(
          before
        );
        expect(processResult.first[1].uid).toBe('blee');
        expect(parseInt(processResult.first[1].timestamp)).toBeGreaterThanOrEqual(
          before
        );
        expect(parseInt(processResult.first[1].timestamp)).toBeLessThan(
          before + 1000
        );

        expect(processResult.second).toHaveLength(2);
        expect(processResult.second[0].uid).toBe('wibble');
        expect(processResult.second[0].timestamp).toBe(
          processResult.first[0].timestamp
        );
        expect(processResult.second[1].uid).toBe('blee');
        expect(processResult.second[1].timestamp).toBe(
          processResult.first[1].timestamp
        );

        expect(processResult.third).toEqual([]);
      });

      it.each(['first', 'second'])(
        'removed %s reminder from redis correctly',
        async (reminder) => {
          const reminders = await redis.zrange(reminder, 0, -1);
          expect(reminders).toHaveLength(0);
        }
      );

      it('left the third reminders in redis', async () => {
        const reminders = await redis.zrange('third', 0, -1);
        expect(new Set(reminders)).toEqual(new Set(['wibble', 'blee']));
      });

      it('did not call log.error', () => {
        expect(log.error.callCount).toBe(0);
      });
    });
  });
});
