/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Test } from '@nestjs/testing';

import { ClickHouseClient } from './clickhouse.client';
import { MeteringEventsRepository } from './metering-events.repository';
import { EVENTS_TABLE } from './metering.constants';
import { ClickHouseError } from './metering.error';
import { MeteringEventInputFactory } from './metering.factories';

describe('MeteringEventsRepository', () => {
  let repository: MeteringEventsRepository;
  let clickHouseClient: jest.Mocked<Pick<ClickHouseClient, 'query' | 'insert'>>;

  const sumUsageParams = {
    clientId: 'vpn',
    slug: 'tokens',
    subject: 'user-1',
    from: new Date('2026-05-01T00:00:00.000Z'),
    to: new Date('2026-06-01T00:00:00.000Z'),
  };

  beforeEach(async () => {
    clickHouseClient = { query: jest.fn(), insert: jest.fn() };

    const moduleRef = await Test.createTestingModule({
      providers: [
        MeteringEventsRepository,
        { provide: ClickHouseClient, useValue: clickHouseClient },
      ],
    }).compile();

    repository = moduleRef.get(MeteringEventsRepository);
  });

  describe('insertEvents', () => {
    it('maps events onto the ClickHouse column names', async () => {
      clickHouseClient.insert.mockResolvedValue(undefined);

      await repository.insertEvents([
        MeteringEventInputFactory({
          eventIdHash: '12345678901234567890',
          clientId: 'vpn',
          slug: 'tokens',
          subject: 'user-1',
          amount: 5,
          eventTime: new Date('2026-05-07T15:23:45.123Z'),
          ingestedAt: new Date('2026-05-07T15:23:46.000Z'),
        }),
      ]);

      expect(clickHouseClient.insert).toHaveBeenCalledWith({
        table: EVENTS_TABLE,
        rows: [
          {
            event_id_hash: '12345678901234567890',
            client_id: 'vpn',
            slug: 'tokens',
            subject: 'user-1',
            amount: 5,
            event_time: '2026-05-07 15:23:45.123',
            ingested_at: '2026-05-07 15:23:46.000',
          },
        ],
      });
    });

    it('passes an empty batch straight through to the client', async () => {
      clickHouseClient.insert.mockResolvedValue(undefined);

      await repository.insertEvents([]);

      expect(clickHouseClient.insert).toHaveBeenCalledWith({
        table: EVENTS_TABLE,
        rows: [],
      });
    });

    it('propagates a ClickHouse failure', async () => {
      clickHouseClient.insert.mockRejectedValue(
        new ClickHouseError('insert', new Error('down'))
      );

      await expect(
        repository.insertEvents([MeteringEventInputFactory()])
      ).rejects.toThrow(ClickHouseError);
    });
  });

  describe('sumUsage', () => {
    it('binds the scope and window as query parameters', async () => {
      clickHouseClient.query.mockResolvedValue([{ usage: 0 }]);

      await repository.sumUsage(sumUsageParams);

      expect(clickHouseClient.query).toHaveBeenCalledWith(
        expect.objectContaining({
          params: {
            clientId: 'vpn',
            slug: 'tokens',
            subject: 'user-1',
            from: '2026-05-01 00:00:00.000',
            to: '2026-06-01 00:00:00.000',
          },
        })
      );
    });

    it('scopes the query by client_id so one relying party cannot read another', async () => {
      clickHouseClient.query.mockResolvedValue([{ usage: 0 }]);

      await repository.sumUsage(sumUsageParams);

      const { sql } = clickHouseClient.query.mock.calls[0][0];
      expect(sql).toContain('client_id = {clientId:String}');
    });

    it('sums amounts directly because duplicates are dropped at ingest', async () => {
      clickHouseClient.query.mockResolvedValue([{ usage: 0 }]);

      await repository.sumUsage(sumUsageParams);

      const { sql } = clickHouseClient.query.mock.calls[0][0];
      expect(sql).toContain('sum(amount)');
      expect(sql).not.toContain('event_id_hash');
    });

    it('treats the window end as exclusive', async () => {
      clickHouseClient.query.mockResolvedValue([{ usage: 0 }]);

      await repository.sumUsage(sumUsageParams);

      const { sql } = clickHouseClient.query.mock.calls[0][0];
      expect(sql).toContain("event_time >= {from:DateTime64(3, 'UTC')}");
      expect(sql).toContain("event_time < {to:DateTime64(3, 'UTC')}");
    });

    it('returns the summed usage', async () => {
      clickHouseClient.query.mockResolvedValue([{ usage: 250 }]);

      await expect(repository.sumUsage(sumUsageParams)).resolves.toBe(250);
    });

    it('returns 0 when ClickHouse returns no rows', async () => {
      clickHouseClient.query.mockResolvedValue([]);

      await expect(repository.sumUsage(sumUsageParams)).resolves.toBe(0);
    });

    it('propagates a ClickHouse failure', async () => {
      clickHouseClient.query.mockRejectedValue(
        new ClickHouseError('query', new Error('timeout'))
      );

      await expect(repository.sumUsage(sumUsageParams)).rejects.toThrow(
        ClickHouseError
      );
    });
  });
});
