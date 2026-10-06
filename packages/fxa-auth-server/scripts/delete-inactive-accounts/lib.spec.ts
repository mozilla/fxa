/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BigQuery, Dataset, Table } from '@google-cloud/bigquery';
import type { StatsD } from 'hot-shots';
import * as lib from './lib';

describe('delete inactive accounts script lib', () => {
  beforeEach(() => {});

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('setDateToUTC', () => {
    it('should set to beginning of day n UTC', () => {
      const date = new Date('2021-12-22T00:00:00.000-08:00');
      const utcDate = lib.setDateToUTC(date.valueOf());
      expect(utcDate.toISOString()).toBe('2021-12-22T00:00:00.000Z');
    });
  });

  describe('getActivityCutoffDate', () => {
    it.each([
      ['2028-02-29T12:00:00Z', '2026-02-28T00:00:00Z'],
      ['2026-09-18T15:30:00Z', '2024-09-18T00:00:00Z'],
      ['2028-02-28T23:30:00-08:00', '2026-02-28T00:00:00Z'],
      ['2028-02-29T23:30:00-08:00', '2026-03-01T00:00:00Z'],
      ['2026-01-01T12:00:00Z', '2024-01-01T00:00:00Z'],
    ])('maps %s to the clamped UTC anniversary %s', (now, expected) => {
      expect(lib.getActivityCutoffDate(Date.parse(now))).toBe(
        Date.parse(expected)
      );
    });

    it.each([
      ['2026-02-27T23:59:59.999Z', false],
      ['2026-02-28T00:00:00Z', true],
      ['2026-02-28T18:00:00Z', true],
    ])(
      'treats a refresh token used at %s as active=%s on leap day',
      async (lastUsedAt, expected) => {
        const cutoff = lib.getActivityCutoffDate(
          Date.parse('2028-02-29T12:00:00Z')
        );
        const getTokens = jest
          .fn()
          .mockResolvedValue([{ lastUsedAt: Date.parse(lastUsedAt) }]);
        await expect(
          lib.hasActiveRefreshToken(getTokens, 'test-uid', cutoff)
        ).resolves.toBe(expected);
      }
    );
  });

  describe('parseScanDate', () => {
    it('returns the UTC midnight timestamp of a valid YYYY-MM-DD string', () => {
      expect(lib.parseScanDate('2024-02-29', 'Start date')).toBe(
        Date.UTC(2024, 1, 29)
      );
    });

    it.each([
      [20240912],
      ['2024-9-12'],
      ['2024-09-12T00:00:00Z'],
      ['12-09-2024'],
    ])('rejects %p as not in YYYY-MM-DD format', (value) => {
      expect(() => lib.parseScanDate(value, 'Start date')).toThrow(
        'Start date must be a date in YYYY-MM-DD format.'
      );
    });
  });

  describe('validatePreviousScanRange', () => {
    it('returns only the two date fields from a valid state object', () => {
      expect(
        lib.validatePreviousScanRange({
          previous_start_date: '2024-09-12',
          previous_end_date: '2024-09-18',
          extra: 'ignored',
        })
      ).toEqual({
        previous_start_date: '2024-09-12',
        previous_end_date: '2024-09-18',
      });
    });

    it.each([[null], ['{}'], [[]], [42]])(
      'rejects %p because it is not a JSON object',
      (previousScanRange) => {
        expect(() => lib.validatePreviousScanRange(previousScanRange)).toThrow(
          'Previous scan range must be a JSON object.'
        );
      }
    );

    it('rejects a state object with an impossible previous_start_date', () => {
      expect(() =>
        lib.validatePreviousScanRange({
          previous_start_date: '2024-02-30',
          previous_end_date: '2024-03-01',
        })
      ).toThrow('previous_start_date is not a valid calendar date: 2024-02-30');
    });

    it('rejects a state object missing previous_end_date', () => {
      expect(() =>
        lib.validatePreviousScanRange({ previous_start_date: '2024-09-12' })
      ).toThrow('previous_end_date must be a date in YYYY-MM-DD format.');
    });
  });

  describe('resolveScanRange', () => {
    // The latest complete eligible day is 2024-09-17.
    const now = Date.UTC(2026, 8, 18, 15, 30);
    const resolve = (input: Partial<lib.ScanRangeInput>) =>
      lib.resolveScanRange({ now, scanWindowDays: 7, ...input });

    describe('without a state URL', () => {
      it('defaults to the oldest account date through the last complete eligible day', () => {
        expect(resolve({})).toEqual({
          startDate: '2014-01-18',
          endDate: '2024-09-17',
          startTimestamp: Date.UTC(2014, 0, 18),
          endTimestamp: Date.UTC(2024, 8, 18),
          rolledOver: false,
        });
      });

      it('uses both explicit dates', () => {
        const range = resolve({
          cliRange: { start: Date.UTC(2020, 0, 1), end: Date.UTC(2020, 0, 31) },
        });
        expect([range.startDate, range.endDate]).toEqual([
          '2020-01-01',
          '2020-01-31',
        ]);
      });

      // because the date values are use inclusively, the range is up to but
      // not include the anniversary date
      it.each([
        Date.UTC(2026, 8, 18),
        Date.UTC(2026, 8, 18, 15, 30),
        Date.UTC(2026, 8, 18, 23, 59, 59, 999),
      ])('excludes the anniversary day at invocation time %p', (now) => {
        const range = resolve({ now });
        expect(range.endDate).toBe('2024-09-17');
        expect(range.endTimestamp).toBe(Date.UTC(2024, 8, 18));
      });

      it('excludes the clamped anniversary day for a leap-day invocation', () => {
        const range = resolve({ now: Date.UTC(2028, 1, 29) });
        expect(range.endDate).toBe('2026-02-27');
        expect(range.endTimestamp).toBe(Date.UTC(2026, 1, 28));
      });

      it('rolls the two-year cutoff across a year boundary', () => {
        const range = resolve({ now: Date.UTC(2026, 0, 1) });
        expect(range.endDate).toBe('2023-12-31');
        expect(range.endTimestamp).toBe(Date.UTC(2024, 0, 1));
      });

      it('includes leap day when the anniversary falls on March 1', () => {
        const range = resolve({ now: Date.UTC(2026, 2, 1) });
        expect(range.endDate).toBe('2024-02-29');
        expect(range.endTimestamp).toBe(Date.UTC(2024, 2, 1));
      });
    });

    describe('bounds', () => {
      it('accepts a single-day range at the oldest boundary', () => {
        const range = resolve({
          cliRange: {
            start: Date.UTC(2014, 0, 18),
            end: Date.UTC(2014, 0, 18),
          },
        });
        expect(range.startTimestamp).toBe(Date.UTC(2014, 0, 18));
        expect(range.endTimestamp).toBe(Date.UTC(2014, 0, 19));
      });

      it('accepts a single-day range at the latest boundary', () => {
        const range = resolve({
          cliRange: {
            start: Date.UTC(2024, 8, 17),
            end: Date.UTC(2024, 8, 17),
          },
        });
        expect([range.startDate, range.endDate]).toEqual([
          '2024-09-17',
          '2024-09-17',
        ]);
      });

      it('clamps a start date before the oldest account date', () => {
        const range = resolve({
          cliRange: { start: Date.UTC(2010, 0, 1), end: Date.UTC(2014, 1, 1) },
        });
        expect(range.startDate).toBe('2014-01-18');
      });

      it('clamps an end date after the two-year cutoff', () => {
        const range = resolve({
          cliRange: { start: Date.UTC(2024, 8, 1), end: Date.UTC(2030, 0, 1) },
        });
        expect(range.endDate).toBe('2024-09-17');
      });

      it('rejects a range wholly before the oldest account date', () => {
        expect(() =>
          resolve({
            cliRange: {
              start: Date.UTC(2013, 0, 1),
              end: Date.UTC(2014, 0, 17),
            },
          })
        ).toThrow(
          'The date range 2013-01-01 to 2014-01-17 is outside the eligible range 2014-01-18 to 2024-09-17.'
        );
      });

      it('rejects a range wholly after the two-year cutoff', () => {
        expect(() =>
          resolve({
            cliRange: {
              start: Date.UTC(2024, 8, 18),
              end: Date.UTC(2024, 8, 25),
            },
          })
        ).toThrow('is outside the eligible range');
      });
    });

    describe('with saved state', () => {
      const previousScanRange = (
        previous_start_date: string,
        previous_end_date: string
      ) => ({
        previous_start_date,
        previous_end_date,
      });

      it('scans the window immediately before the previous start date', () => {
        expect(
          resolve({
            previousScanRange: previousScanRange('2024-09-12', '2024-09-18'),
          })
        ).toEqual({
          startDate: '2024-09-05',
          endDate: '2024-09-11',
          startTimestamp: Date.UTC(2024, 8, 5),
          endTimestamp: Date.UTC(2024, 8, 12),
          rolledOver: false,
        });
      });

      it('shortens the final window to start at the oldest account date', () => {
        const range = resolve({
          previousScanRange: previousScanRange('2014-01-22', '2014-01-28'),
        });
        expect([range.startDate, range.endDate, range.rolledOver]).toEqual([
          '2014-01-18',
          '2014-01-21',
          false,
        ]);
      });

      it('rolls over to the latest window once the previous start is the oldest date', () => {
        expect(
          resolve({
            previousScanRange: previousScanRange('2014-01-18', '2014-01-21'),
          })
        ).toEqual({
          startDate: '2024-09-11',
          endDate: '2024-09-17',
          startTimestamp: Date.UTC(2024, 8, 11),
          endTimestamp: Date.UTC(2024, 8, 18),
          rolledOver: true,
        });
      });

      it('sizes the rolled-over window from scanWindowDays', () => {
        const range = resolve({
          scanWindowDays: 1,
          previousScanRange: previousScanRange('2014-01-18', '2014-01-18'),
        });
        expect([range.startDate, range.endDate]).toEqual([
          '2024-09-17',
          '2024-09-17',
        ]);
      });

      it('does not roll over a saved range after the two-year cutoff', () => {
        expect(() =>
          resolve({
            previousScanRange: previousScanRange('2030-01-01', '2030-01-07'),
          })
        ).toThrow(
          'The date range 2029-12-25 to 2029-12-31 is outside the eligible range 2014-01-18 to 2024-09-17.'
        );
      });

      it.each([
        previousScanRange('2024-09-12', '2024-09-18'),
        previousScanRange('2014-01-18', '2014-01-21'),
      ])('uses both CLI dates instead of previous range %p', (savedRange) => {
        expect(
          resolve({
            cliRange: {
              start: Date.UTC(2020, 0, 1),
              end: Date.UTC(2020, 0, 7),
            },
            previousScanRange: savedRange,
          })
        ).toEqual({
          startDate: '2020-01-01',
          endDate: '2020-01-07',
          startTimestamp: Date.UTC(2020, 0, 1),
          endTimestamp: Date.UTC(2020, 0, 8),
          rolledOver: false,
        });
      });
    });

    describe('bootstrapping a missing state object', () => {
      const bootstrapError =
        'No previous scan range found. Supply the --start-date and --end-date CLI args, or seed the GCS object.';

      it('scans the explicit range when both dates are supplied', () => {
        const range = resolve({
          previousScanRange: null,
          cliRange: {
            start: Date.UTC(2024, 8, 12),
            end: Date.UTC(2024, 8, 18),
          },
        });
        expect([range.startDate, range.endDate, range.rolledOver]).toEqual([
          '2024-09-12',
          '2024-09-17',
          false,
        ]);
      });

      it('rejects both dates missing', () => {
        expect(() => resolve({ previousScanRange: null })).toThrow(
          bootstrapError
        );
      });
    });
  });

  describe('parseGcsUrl', () => {
    it('splits a path into bucket and object', () => {
      expect(lib.parseGcsUrl('gs://fxa-state/inactive/enqueue.json')).toEqual({
        bucket: 'fxa-state',
        object: 'inactive/enqueue.json',
      });
    });
  });

  describe('previous scan range state in GCS', () => {
    const url = 'gs://fxa-state/inactive/enqueue.json';
    const location = { bucket: 'fxa-state', object: 'inactive/enqueue.json' };
    const previousScanRange = {
      previous_start_date: '2024-09-12',
      previous_end_date: '2024-09-18',
    };
    const httpError = (status: number) =>
      Object.assign(new Error(`HTTP ${status}`), { status });

    let storage: {
      objects: jest.Mocked<lib.ScanStateStorage['objects']>;
    };

    beforeEach(() => {
      storage = { objects: { get: jest.fn(), insert: jest.fn() } };
    });

    describe('loadPreviousScanRange', () => {
      it('reads the previous scan range', async () => {
        storage.objects.get.mockResolvedValueOnce({ data: previousScanRange });

        await expect(lib.loadPreviousScanRange(storage, url)).resolves.toEqual(
          previousScanRange
        );
        expect(storage.objects.get.mock.calls).toEqual([
          [{ ...location, alt: 'media' }],
        ]);
      });

      it('returns null when the object is missing', async () => {
        storage.objects.get.mockRejectedValueOnce(httpError(404));

        await expect(
          lib.loadPreviousScanRange(storage, url)
        ).resolves.toBeNull();
        expect(storage.objects.get).toHaveBeenCalledTimes(1);
      });

      it.each([403, 500])(
        'propagates an HTTP %s read failure',
        async (status) => {
          storage.objects.get.mockRejectedValueOnce(httpError(status));

          await expect(lib.loadPreviousScanRange(storage, url)).rejects.toThrow(
            `HTTP ${status}`
          );
          expect(storage.objects.get).toHaveBeenCalledTimes(1);
        }
      );

      it.each([
        ['not json', 'Previous scan range must be a JSON object.'],
        [
          { previous_start_date: '2024-09-12' },
          'previous_end_date must be a date in YYYY-MM-DD format.',
        ],
        [
          {
            previous_start_date: '2024-09-18',
            previous_end_date: '2024-09-12',
          },
          'previous_end_date must be on the same day or later than previous_start_date.',
        ],
      ])('rejects a corrupt state body %p', async (body, error) => {
        storage.objects.get.mockResolvedValueOnce({ data: body });

        await expect(lib.loadPreviousScanRange(storage, url)).rejects.toThrow(
          error
        );
      });

      it('rejects an invalid bucket URL', async () => {
        await expect(
          lib.loadPreviousScanRange(storage, 'gs://bucket-only')
        ).rejects.toThrow('State file must be a gs://bucket/object URL');
        expect(storage.objects.get).not.toHaveBeenCalled();
      });
    });

    describe('savePreviousScanRange', () => {
      it('writes two date fields as JSON', async () => {
        storage.objects.insert.mockResolvedValueOnce({ data: {} });

        await lib.savePreviousScanRange(storage, url, {
          ...previousScanRange,
          extra: 'dropped',
        } as lib.PreviousScanRange);

        expect(storage.objects.insert).toHaveBeenCalledWith({
          bucket: 'fxa-state',
          name: 'inactive/enqueue.json',
          media: {
            mimeType: 'application/json',
            body: JSON.stringify(previousScanRange),
          },
        });
      });

      it('propagates a write failure', async () => {
        storage.objects.insert.mockRejectedValueOnce(httpError(500));

        await expect(
          lib.savePreviousScanRange(storage, url, previousScanRange)
        ).rejects.toThrow('HTTP 500');
      });
    });
  });

  describe('active account lists', () => {
    const clientId1 = 'f9416ce337034916';
    const clientId2 = '5b15b995f6224e2f';
    const now = Date.parse('2026-09-14T00:00:00Z');
    const maxAgeDays = 2;
    const cutoff = now - maxAgeDays * 86400000;

    let bq: BigQuery;
    let dataset: Dataset;
    let tables: Table[];
    let statsd: jest.Mocked<Pick<StatsD, 'increment'>>;

    beforeEach(() => {
      jest.spyOn(Date, 'now').mockReturnValue(now);
      jest.spyOn(console, 'error').mockImplementation(() => {});
      statsd = { increment: jest.fn() };
      bq = new BigQuery();
      dataset = bq.dataset('active_accounts', { projectId: 'fxa-testo' });
      jest.spyOn(bq, 'dataset').mockReturnValue(dataset);
      tables = [dataset.table(clientId1), dataset.table(clientId2)];
      jest.spyOn(dataset, 'getTables').mockResolvedValue([tables]);
      for (const table of tables) {
        jest
          .spyOn(table, 'getMetadata')
          .mockResolvedValue([{ numRows: '1', lastModifiedTime: String(now) }]);
      }
    });

    it('builds a unique exclusion union from overlapping explicit lists and dataset tables', async () => {
      const lists = await lib.getActiveAccountLists(
        bq,
        'fxa-testo.active_accounts',
        maxAgeDays,
        statsd
      );

      expect(bq.dataset).toHaveBeenCalledWith('active_accounts', {
        projectId: 'fxa-testo',
      });
      const query = lib.buildExclusionsTempTableQuery('exclusions', [
        'explicit-project.accounts.subscriptions.account_uid',
        `fxa-testo.active_accounts.${clientId1}.uid`,
        ...lists,
      ]);
      expect(query.replace(/\s+/g, ' ').trim()).toBe(
        'CREATE TEMP TABLE exclusions(uid STRING(32)) AS ( ' +
          '(SELECT `account_uid` AS uid FROM `explicit-project.accounts.subscriptions`) ' +
          `UNION DISTINCT (SELECT \`uid\` AS uid FROM \`fxa-testo.active_accounts.${clientId1}\`) ` +
          `UNION DISTINCT (SELECT \`uid\` AS uid FROM \`fxa-testo.active_accounts.${clientId2}\`) )`
      );
      expect(statsd.increment).not.toHaveBeenCalled();
      expect(console.error).not.toHaveBeenCalled();
    });

    it('accepts a nonempty table modified exactly at the age limit', async () => {
      jest
        .spyOn(tables[0], 'getMetadata')
        .mockResolvedValue([
          { numRows: '1', lastModifiedTime: String(cutoff) },
        ]);
      await expect(
        lib.getActiveAccountLists(
          bq,
          'fxa-testo.active_accounts',
          maxAgeDays,
          statsd
        )
      ).resolves.toEqual([
        `fxa-testo.active_accounts.${clientId1}.uid`,
        `fxa-testo.active_accounts.${clientId2}.uid`,
      ]);
      expect(statsd.increment).not.toHaveBeenCalled();
    });

    it('reports every empty and stale table before rejecting the lists', async () => {
      jest
        .spyOn(tables[0], 'getMetadata')
        .mockResolvedValue([{ numRows: '0', lastModifiedTime: String(now) }]);
      jest
        .spyOn(tables[1], 'getMetadata')
        .mockResolvedValue([
          { numRows: '1', lastModifiedTime: String(cutoff - 1) },
        ]);
      await expect(
        lib.getActiveAccountLists(
          bq,
          'fxa-testo.active_accounts',
          maxAgeDays,
          statsd
        )
      ).rejects.toThrow('Active account tables are empty or stale.');
      expect(statsd.increment.mock.calls).toEqual([
        [
          'accounts.inactive.active-account-table.empty',
          { client_id: clientId1 },
        ],
        [
          'accounts.inactive.active-account-table.stale',
          { client_id: clientId2 },
        ],
      ]);
      expect(jest.mocked(console.error).mock.calls).toEqual([
        [
          `Active account table is empty: fxa-testo.active_accounts.${clientId1}`,
        ],
        [
          `Active account table is stale: fxa-testo.active_accounts.${clientId2}`,
        ],
      ]);
    });

    it('reports both problems when a table is empty and stale', async () => {
      jest
        .spyOn(tables[0], 'getMetadata')
        .mockResolvedValue([
          { numRows: '0', lastModifiedTime: String(cutoff - 1) },
        ]);
      await expect(
        lib.getActiveAccountLists(
          bq,
          'fxa-testo.active_accounts',
          maxAgeDays,
          statsd
        )
      ).rejects.toThrow('Active account tables are empty or stale.');
      expect(statsd.increment.mock.calls).toEqual([
        [
          'accounts.inactive.active-account-table.empty',
          { client_id: clientId1 },
        ],
        [
          'accounts.inactive.active-account-table.stale',
          { client_id: clientId1 },
        ],
      ]);
    });

    it.each([
      {},
      { numRows: '1' },
      { lastModifiedTime: String(now) },
      { numRows: '-1', lastModifiedTime: String(now) },
      { numRows: '1', lastModifiedTime: 'invalid' },
      { numRows: '1', lastModifiedTime: '0' },
    ])('rejects unusable table metadata %j', async (metadata) => {
      jest.spyOn(tables[0], 'getMetadata').mockResolvedValue([metadata]);
      await expect(
        lib.getActiveAccountLists(
          bq,
          'fxa-testo.active_accounts',
          maxAgeDays,
          statsd
        )
      ).rejects.toThrow(
        `Cannot validate active account table metadata: fxa-testo.active_accounts.${clientId1}`
      );
    });

    it('propagates metadata lookup failures', async () => {
      jest
        .spyOn(tables[0], 'getMetadata')
        .mockRejectedValue(new Error('Access denied'));
      await expect(
        lib.getActiveAccountLists(
          bq,
          'fxa-testo.active_accounts',
          maxAgeDays,
          statsd
        )
      ).rejects.toThrow('Access denied');
    });

    it('rejects an active accounts dataset with no tables', async () => {
      jest.spyOn(dataset, 'getTables').mockResolvedValue([[]]);
      await expect(
        lib.getActiveAccountLists(
          bq,
          'fxa-testo.active_accounts',
          maxAgeDays,
          statsd
        )
      ).rejects.toThrow(
        'Active accounts dataset contains no tables: fxa-testo.active_accounts'
      );
    });

    it('propagates table lookup failures', async () => {
      jest
        .spyOn(dataset, 'getTables')
        .mockRejectedValue(new Error('Access denied'));
      await expect(
        lib.getActiveAccountLists(
          bq,
          'other-project.active_accounts',
          maxAgeDays,
          statsd
        )
      ).rejects.toThrow('Access denied');
    });
  });

  describe('token checks', () => {
    describe('session tokens', () => {
      const ts = Date.now();

      it('should be true when there is one recent enough session token', async () => {
        const tokensFn = jest.fn().mockResolvedValue([{ lastAccessTime: ts }]);
        const newerTsActual = await lib.hasActiveSessionToken(
          tokensFn,
          '9001',
          ts - 1000
        );
        expect(newerTsActual).toBe(true);
        expect(tokensFn).toHaveBeenCalledTimes(1);
        expect(tokensFn).toHaveBeenCalledWith('9001');

        const equallyNewActual = await lib.hasActiveSessionToken(
          tokensFn,
          '9001',
          ts
        );
        expect(equallyNewActual).toBe(true);
      });
      it('should be true when there are multiple recent enough session tokens', async () => {
        const tokensFn = jest
          .fn()
          .mockResolvedValue([
            { lastAccessTime: ts - 9000 },
            { lastAccessTime: ts },
            { lastAccessTime: ts + 9000 },
          ]);
        const actual = await lib.hasActiveSessionToken(
          tokensFn,
          '9001',
          ts - 1000
        );
        expect(actual).toBe(true);
      });
      it('should be false when there are no recent enough session tokens', async () => {
        const noTokensFn = jest.fn().mockResolvedValue([]);
        const noTokensActual = await lib.hasActiveSessionToken(
          noTokensFn,
          '9001',
          ts
        );
        expect(noTokensActual).toBe(false);

        const noTimestampTokensFn = jest
          .fn()
          .mockResolvedValue([{ uid: '9001' }]);
        const noTimestampTokensActual = await lib.hasActiveSessionToken(
          noTimestampTokensFn,
          '9001',
          ts
        );
        expect(noTimestampTokensActual).toBe(false);

        const noRecentEnoughTokensFn = jest
          .fn()
          .mockResolvedValue([{ lastAccessTime: ts }]);
        const noRecentEnoughTokensActual = await lib.hasActiveSessionToken(
          noRecentEnoughTokensFn,
          '9001',
          ts + 1000
        );
        expect(noRecentEnoughTokensActual).toBe(false);
      });
    });

    describe('refresh token', () => {
      const ts = Date.now();

      it('should be true when there is a recent enough refresh token', async () => {
        const tokensFn = jest.fn().mockResolvedValue([{ lastUsedAt: ts }]);
        const newerTsActual = await lib.hasActiveRefreshToken(
          tokensFn,
          '9001',
          ts - 1000
        );
        expect(newerTsActual).toBe(true);
        expect(tokensFn).toHaveBeenCalledTimes(1);
        expect(tokensFn).toHaveBeenCalledWith('9001');

        const equallyNewActual = await lib.hasActiveRefreshToken(
          tokensFn,
          '9001',
          ts
        );
        expect(equallyNewActual).toBe(true);
      });
      it('should be true when there are multiple recent enough refresh tokens', async () => {
        const tokensFn = jest
          .fn()
          .mockResolvedValue([
            { lastUsedAt: ts - 9000 },
            { lastUsedAt: ts },
            { lastUsedAt: ts + 9000 },
          ]);
        const actual = await lib.hasActiveRefreshToken(
          tokensFn,
          '9001',
          ts - 1000
        );
        expect(actual).toBe(true);
      });
      it('should be false when there are no recent enough refresh tokens', async () => {
        const noTokensFn = jest.fn().mockResolvedValue([]);
        const noTokensActual = await lib.hasActiveRefreshToken(
          noTokensFn,
          '9001',
          ts
        );
        expect(noTokensActual).toBe(false);

        const noTimestampTokensFn = jest
          .fn()
          .mockResolvedValue([{ uid: '9001' }]);
        const noTimestampTokensActual = await lib.hasActiveRefreshToken(
          noTimestampTokensFn,
          '9001',
          ts
        );
        expect(noTimestampTokensActual).toBe(false);

        const noRecentEnoughTokensFn = jest
          .fn()
          .mockResolvedValue([{ lastUsedAt: ts }]);
        const noRecentEnoughTokensActual = await lib.hasActiveRefreshToken(
          noRecentEnoughTokensFn,
          '9001',
          ts + 1000
        );
        expect(noRecentEnoughTokensActual).toBe(false);
      });
    });
    describe('access token', () => {
      it('should be true when there is an access token', async () => {
        const tokensFn = jest.fn().mockResolvedValue([{}, {}]);
        const actual = await lib.hasAccessToken(tokensFn, '9001');
        expect(tokensFn).toHaveBeenCalledTimes(1);
        expect(tokensFn).toHaveBeenCalledWith('9001');
        expect(actual).toBe(true);
      });
      it('should be false when there are no access tokens', async () => {
        const tokensFn = jest.fn().mockResolvedValue([]);
        const actual = await lib.hasAccessToken(tokensFn, '9001');
        expect(actual).toBe(false);
      });
    });
  });

  describe('inActive function builder', () => {
    let sessionTokensFn: jest.Mock;
    let refreshTokensFn: jest.Mock;
    let accessTokensFn: jest.Mock;
    let iapSubscriptionFn: jest.Mock;

    beforeEach(() => {
      sessionTokensFn = jest.fn();
      refreshTokensFn = jest.fn();
      accessTokensFn = jest.fn();
      iapSubscriptionFn = jest.fn();
    });

    it('should throw an error if the active session token function is missing', async () => {
      const builder = new lib.IsActiveFnBuilder();
      try {
        await (
          builder
            .setRefreshTokenFn(refreshTokensFn)
            .setAccessTokenFn(accessTokensFn)
            .build() as any
        )();
        throw new Error('should have thrown');
      } catch (actual) {
        expect(actual).toBeInstanceOf(Error);
      }
    });
    it('should throw an error if the active refresh token function is missing', async () => {
      const builder = new lib.IsActiveFnBuilder();
      try {
        await (
          builder
            .setActiveSessionTokenFn(sessionTokensFn)
            .setAccessTokenFn(accessTokensFn)
            .build() as any
        )();
        throw new Error('should have thrown');
      } catch (actual) {
        expect(actual).toBeInstanceOf(Error);
      }
    });
    it('should throw an error if the has access token token function is missing', async () => {
      const builder = new lib.IsActiveFnBuilder();
      try {
        await (
          builder
            .setActiveSessionTokenFn(sessionTokensFn)
            .setRefreshTokenFn(refreshTokensFn)
            .build() as any
        )();
        throw new Error('should have thrown');
      } catch (actual) {
        expect(actual).toBeInstanceOf(Error);
      }
    });
    it('should throw an error if the has IAP subscription function is missing', async () => {
      const builder = new lib.IsActiveFnBuilder();
      try {
        await (
          builder
            .setActiveSessionTokenFn(sessionTokensFn)
            .setRefreshTokenFn(refreshTokensFn)
            .setAccessTokenFn(accessTokensFn)
            .build() as any
        )();
        throw new Error('should have thrown');
      } catch (actual) {
        expect(actual).toBeInstanceOf(Error);
      }
    });

    describe('short-circuits on the first active result', () => {
      let isActive: (uid: string) => Promise<boolean>;

      beforeEach(() => {
        const builder = new lib.IsActiveFnBuilder();
        isActive = builder
          .setActiveSessionTokenFn(sessionTokensFn)
          .setRefreshTokenFn(refreshTokensFn)
          .setAccessTokenFn(accessTokensFn)
          .build();
      });

      it('should short-circuit with session token check', async () => {
        sessionTokensFn.mockResolvedValue(true);
        const actual = await isActive('9001');
        expect(actual).toBe(true);
        expect(sessionTokensFn).toHaveBeenCalledTimes(1);
        expect(sessionTokensFn).toHaveBeenCalledWith('9001');
        expect(refreshTokensFn).not.toHaveBeenCalled();
        expect(accessTokensFn).not.toHaveBeenCalled();
        expect(iapSubscriptionFn).not.toHaveBeenCalled();
      });

      it('should short-circuit with refresh token check', async () => {
        sessionTokensFn.mockResolvedValue(false);
        refreshTokensFn.mockResolvedValue(true);
        const actual = await isActive('9001');
        expect(actual).toBe(true);
        expect(sessionTokensFn).toHaveBeenCalledTimes(1);
        expect(sessionTokensFn).toHaveBeenCalledWith('9001');
        expect(refreshTokensFn).toHaveBeenCalledTimes(1);
        expect(refreshTokensFn).toHaveBeenCalledWith('9001');
        expect(accessTokensFn).not.toHaveBeenCalled();
        expect(iapSubscriptionFn).not.toHaveBeenCalled();
      });

      it('should short-circuit with access token check', async () => {
        sessionTokensFn.mockResolvedValue(false);
        refreshTokensFn.mockResolvedValue(false);
        accessTokensFn.mockResolvedValue(true);
        const actual = await isActive('9001');
        expect(actual).toBe(true);
        expect(sessionTokensFn).toHaveBeenCalledTimes(1);
        expect(sessionTokensFn).toHaveBeenCalledWith('9001');
        expect(refreshTokensFn).toHaveBeenCalledTimes(1);
        expect(refreshTokensFn).toHaveBeenCalledWith('9001');
        expect(accessTokensFn).toHaveBeenCalledTimes(1);
        expect(accessTokensFn).toHaveBeenCalledWith('9001');
        expect(iapSubscriptionFn).not.toHaveBeenCalled();
      });
    });

    it('should be false when all condition functions are false', async () => {
      const builder = new lib.IsActiveFnBuilder();
      const isActive = builder
        .setActiveSessionTokenFn(sessionTokensFn)
        .setRefreshTokenFn(refreshTokensFn)
        .setAccessTokenFn(accessTokensFn)
        .build();
      sessionTokensFn.mockResolvedValue(false);
      refreshTokensFn.mockResolvedValue(false);
      accessTokensFn.mockResolvedValue(false);
      iapSubscriptionFn.mockResolvedValue(false);

      const actual = await isActive('9001');
      expect(actual).toBe(false);
      expect(sessionTokensFn).toHaveBeenCalledTimes(1);
      expect(sessionTokensFn).toHaveBeenCalledWith('9001');
      expect(refreshTokensFn).toHaveBeenCalledTimes(1);
      expect(refreshTokensFn).toHaveBeenCalledWith('9001');
      expect(accessTokensFn).toHaveBeenCalledTimes(1);
      expect(accessTokensFn).toHaveBeenCalledWith('9001');
    });
  });
});
