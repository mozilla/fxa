/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Test } from '@nestjs/testing';

import { ClickHouseClient } from './clickhouse.client';
import { EVENTS_TABLE, NOTIFICATIONS_TABLE } from './metering.constants';
import { ClickHouseError } from './metering.error';
import { MeteringMetricsRepository } from './metering-metrics.repository';

describe('MeteringMetricsRepository', () => {
  let repository: MeteringMetricsRepository;
  let clickHouseClient: jest.Mocked<Pick<ClickHouseClient, 'query'>>;

  const range = {
    clientId: 'vpn',
    slug: 'tokens',
    from: new Date('2026-05-01T00:00:00.000Z'),
    to: new Date('2026-05-15T12:00:00.000Z'),
  };

  beforeEach(async () => {
    clickHouseClient = { query: jest.fn() };

    const moduleRef = await Test.createTestingModule({
      providers: [
        MeteringMetricsRepository,
        { provide: ClickHouseClient, useValue: clickHouseClient },
      ],
    }).compile();

    repository = moduleRef.get(MeteringMetricsRepository);
  });

  describe('findActiveSubjectCount', () => {
    it('binds the meter and the time range', async () => {
      clickHouseClient.query.mockResolvedValue([]);

      await repository.findActiveSubjectCount(range);

      expect(clickHouseClient.query).toHaveBeenCalledWith(
        expect.objectContaining({
          params: {
            clientId: 'vpn',
            slug: 'tokens',
            from: '2026-05-01 00:00:00.000',
            to: '2026-05-15 12:00:00.000',
          },
        })
      );
    });

    it('estimates the distinct subjects with events in the range', async () => {
      clickHouseClient.query.mockResolvedValue([]);

      await repository.findActiveSubjectCount(range);

      const { sql } = clickHouseClient.query.mock.calls[0][0];
      expect(sql).toContain('uniq(subject)');
      expect(sql).toContain(`FROM ${EVENTS_TABLE}`);
      expect(sql).toContain("event_time >= {from:DateTime64(3, 'UTC')}");
      expect(sql).toContain("event_time < {to:DateTime64(3, 'UTC')}");
    });

    it('returns the subject count', async () => {
      clickHouseClient.query.mockResolvedValue([{ subject_count: 42 }]);

      await expect(repository.findActiveSubjectCount(range)).resolves.toBe(42);
    });

    it('returns zero when ClickHouse returns no row', async () => {
      clickHouseClient.query.mockResolvedValue([]);

      await expect(repository.findActiveSubjectCount(range)).resolves.toBe(0);
    });

    it('propagates a ClickHouse failure', async () => {
      clickHouseClient.query.mockRejectedValue(
        new ClickHouseError('query', new Error('timeout'))
      );

      await expect(repository.findActiveSubjectCount(range)).rejects.toThrow(
        ClickHouseError
      );
    });
  });

  describe('findNotifiedSubjectCounts', () => {
    const params = { ...range, thresholds: [80, 100] };

    it('binds the meter, thresholds and time range', async () => {
      clickHouseClient.query.mockResolvedValue([]);

      await repository.findNotifiedSubjectCounts(params);

      expect(clickHouseClient.query).toHaveBeenCalledWith(
        expect.objectContaining({
          params: {
            clientId: 'vpn',
            slug: 'tokens',
            thresholds: '[80,100]',
            from: '2026-05-01 00:00:00.000',
            to: '2026-05-15 12:00:00.000',
          },
        })
      );
    });

    it('estimates the distinct subjects notified for each threshold in the range', async () => {
      clickHouseClient.query.mockResolvedValue([]);

      await repository.findNotifiedSubjectCounts(params);

      const { sql } = clickHouseClient.query.mock.calls[0][0];
      expect(sql).toContain('uniq(subject)');
      expect(sql).toContain(`FROM ${NOTIFICATIONS_TABLE}`);
      expect(sql).toContain("sent_at >= {from:DateTime64(3, 'UTC')}");
      expect(sql).toContain("sent_at < {to:DateTime64(3, 'UTC')}");
      expect(sql).toContain('GROUP BY threshold');
    });

    it('returns the rows', async () => {
      const rows = [
        { threshold: 80, subject_count: 12 },
        { threshold: 100, subject_count: 3 },
      ];
      clickHouseClient.query.mockResolvedValue(rows);

      await expect(
        repository.findNotifiedSubjectCounts(params)
      ).resolves.toEqual(rows);
    });

    it('propagates a ClickHouse failure', async () => {
      clickHouseClient.query.mockRejectedValue(
        new ClickHouseError('query', new Error('timeout'))
      );

      await expect(
        repository.findNotifiedSubjectCounts(params)
      ).rejects.toThrow(ClickHouseError);
    });
  });
});
