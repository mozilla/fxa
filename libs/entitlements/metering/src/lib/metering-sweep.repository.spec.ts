/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Test } from '@nestjs/testing';

import { ClickHouseClient } from './clickhouse.client';
import {
  NOTIFICATIONS_TABLE,
  SESSIONS_TABLE,
  WATERMARKS_TABLE,
} from './metering.constants';
import { ClickHouseError } from './metering.error';
import { MeteringSweepRepository } from './metering-sweep.repository';

describe('MeteringSweepRepository', () => {
  let repository: MeteringSweepRepository;
  let clickHouseClient: jest.Mocked<Pick<ClickHouseClient, 'query' | 'insert'>>;

  const scope = { clientId: 'vpn', slug: 'tokens' };

  beforeEach(async () => {
    clickHouseClient = { query: jest.fn(), insert: jest.fn() };

    const moduleRef = await Test.createTestingModule({
      providers: [
        MeteringSweepRepository,
        { provide: ClickHouseClient, useValue: clickHouseClient },
      ],
    }).compile();

    repository = moduleRef.get(MeteringSweepRepository);
  });

  describe('findWindowCandidates', () => {
    const params = {
      ...scope,
      from: new Date('2026-05-01T00:00:00.000Z'),
      to: new Date('2026-06-01T00:00:00.000Z'),
      ingestedSince: new Date('2026-05-15T11:58:30.000Z'),
      eventTimeFloor: new Date('2026-05-13T11:58:30.000Z'),
      minUsage: 80,
    };

    it('binds the window, activity lookback and prefilter', async () => {
      clickHouseClient.query.mockResolvedValue([]);

      await repository.findWindowCandidates(params);

      expect(clickHouseClient.query).toHaveBeenCalledWith(
        expect.objectContaining({
          params: {
            clientId: 'vpn',
            slug: 'tokens',
            from: '2026-05-01 00:00:00.000',
            to: '2026-06-01 00:00:00.000',
            ingestedSince: '2026-05-15 11:58:30.000',
            eventTimeFloor: '2026-05-13 11:58:30.000',
            minUsage: 80,
          },
        })
      );
    });

    it('restricts the scan to subjects with recent activity', async () => {
      clickHouseClient.query.mockResolvedValue([]);

      await repository.findWindowCandidates(params);

      const { sql } = clickHouseClient.query.mock.calls[0][0];
      expect(sql).toContain('WITH active AS');
      expect(sql).toContain(
        "ingested_at >= {ingestedSince:DateTime64(3, 'UTC')}"
      );
      expect(sql).toContain('subject IN (SELECT subject FROM active)');
    });

    it('sums amounts directly because duplicates are dropped at ingest', async () => {
      clickHouseClient.query.mockResolvedValue([]);

      await repository.findWindowCandidates(params);

      const { sql } = clickHouseClient.query.mock.calls[0][0];
      expect(sql).toContain('sum(amount)');
      expect(sql).not.toContain('event_id_hash');
    });

    it('propagates a ClickHouse failure', async () => {
      clickHouseClient.query.mockRejectedValue(
        new ClickHouseError('query', new Error('timeout'))
      );

      await expect(repository.findWindowCandidates(params)).rejects.toThrow(
        ClickHouseError
      );
    });
  });

  describe('findSessionCandidates', () => {
    const params = {
      ...scope,
      expiredBefore: new Date('2026-05-15T07:00:00.000Z'),
      to: new Date('2026-05-15T12:00:00.000Z'),
      minUsage: 80,
    };

    it('joins events to the open session so each subject gets its own window', async () => {
      clickHouseClient.query.mockResolvedValue([]);

      await repository.findSessionCandidates(params);

      const { sql } = clickHouseClient.query.mock.calls[0][0];
      expect(sql).toContain('WITH open_sessions AS');
      expect(sql).toContain('INNER JOIN open_sessions AS s');
      expect(sql).toContain('e.event_time >= s.started_at');
    });

    it('excludes sessions that have already expired', async () => {
      clickHouseClient.query.mockResolvedValue([]);

      await repository.findSessionCandidates(params);

      const { sql } = clickHouseClient.query.mock.calls[0][0];
      expect(sql).toContain(
        "HAVING started_at > {expiredBefore:DateTime64(3, 'UTC')}"
      );
    });
  });

  describe('findLastNotifications', () => {
    it('passes subjects as a bound ClickHouse array', async () => {
      clickHouseClient.query.mockResolvedValue([]);

      await repository.findLastNotifications({
        ...scope,
        subjects: ['user-1', "o'brien"],
      });

      expect(clickHouseClient.query).toHaveBeenCalledWith(
        expect.objectContaining({
          params: expect.objectContaining({
            subjects: "['user-1','o\\'brien']",
          }),
        })
      );
    });
  });

  describe('advanceWatermark', () => {
    it('writes the watermark row', async () => {
      clickHouseClient.insert.mockResolvedValue(undefined);

      await repository.advanceWatermark({
        ...scope,
        watermark: new Date('2026-05-15T12:00:00.000Z'),
        updatedAt: new Date('2026-05-15T12:00:01.000Z'),
      });

      expect(clickHouseClient.insert).toHaveBeenCalledWith({
        table: WATERMARKS_TABLE,
        rows: [
          {
            client_id: 'vpn',
            slug: 'tokens',
            watermark: '2026-05-15 12:00:00.000',
            updated_at: '2026-05-15 12:00:01.000',
          },
        ],
      });
    });
  });

  describe('recordNotifications', () => {
    it('writes the notification rows', async () => {
      clickHouseClient.insert.mockResolvedValue(undefined);

      await repository.recordNotifications([
        {
          clientId: 'vpn',
          slug: 'tokens',
          subject: 'user-1',
          threshold: 80,
          signingClientId: 'vpn',
          windowId: '2026-05-01T00:00:00.000Z',
          sentAt: new Date('2026-05-15T12:00:00.000Z'),
        },
      ]);

      expect(clickHouseClient.insert).toHaveBeenCalledWith({
        table: NOTIFICATIONS_TABLE,
        rows: [
          {
            client_id: 'vpn',
            slug: 'tokens',
            subject: 'user-1',
            threshold: 80,
            signing_client_id: 'vpn',
            window_id: '2026-05-01T00:00:00.000Z',
            sent_at: '2026-05-15 12:00:00.000',
          },
        ],
      });
    });

    it('stores a null window id as an empty string', async () => {
      clickHouseClient.insert.mockResolvedValue(undefined);

      await repository.recordNotifications([
        {
          clientId: 'vpn',
          slug: 'tokens',
          subject: 'user-1',
          threshold: 80,
          signingClientId: 'vpn',
          windowId: null,
          sentAt: new Date('2026-05-15T12:00:00.000Z'),
        },
      ]);

      expect(clickHouseClient.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          rows: [expect.objectContaining({ window_id: '' })],
        })
      );
    });
  });

  describe('recordSessionStarts', () => {
    it('writes the session rows', async () => {
      clickHouseClient.insert.mockResolvedValue(undefined);

      await repository.recordSessionStarts([
        {
          clientId: 'vpn',
          slug: 'tokens',
          subject: 'user-1',
          sessionStart: new Date('2026-05-15T09:00:00.000Z'),
        },
      ]);

      expect(clickHouseClient.insert).toHaveBeenCalledWith({
        table: SESSIONS_TABLE,
        rows: [
          {
            client_id: 'vpn',
            slug: 'tokens',
            subject: 'user-1',
            session_start: '2026-05-15 09:00:00.000',
          },
        ],
      });
    });
  });
});
