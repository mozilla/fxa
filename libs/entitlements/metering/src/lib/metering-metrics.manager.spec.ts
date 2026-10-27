/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Test } from '@nestjs/testing';

import { ClickHouseError } from './metering.error';
import { MeteringMetricsManager } from './metering-metrics.manager';
import { MeteringMetricsRepository } from './metering-metrics.repository';

describe('MeteringMetricsManager', () => {
  let manager: MeteringMetricsManager;
  let meteringMetricsRepository: jest.Mocked<
    Pick<
      MeteringMetricsRepository,
      'findActiveSubjectCount' | 'findNotifiedSubjectCounts'
    >
  >;

  const range = {
    clientId: 'vpn',
    slug: 'tokens',
    from: new Date('2026-05-01T00:00:00.000Z'),
    to: new Date('2026-05-15T12:00:00.000Z'),
  };

  beforeEach(async () => {
    meteringMetricsRepository = {
      findActiveSubjectCount: jest.fn().mockResolvedValue(0),
      findNotifiedSubjectCounts: jest.fn().mockResolvedValue([]),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        MeteringMetricsManager,
        {
          provide: MeteringMetricsRepository,
          useValue: meteringMetricsRepository,
        },
      ],
    }).compile();

    manager = moduleRef.get(MeteringMetricsManager);
  });

  describe('findActiveSubjectCount', () => {
    it('returns the subject count from the repository', async () => {
      meteringMetricsRepository.findActiveSubjectCount.mockResolvedValue(42);

      await expect(manager.findActiveSubjectCount(range)).resolves.toBe(42);
    });

    it('propagates a repository failure', async () => {
      meteringMetricsRepository.findActiveSubjectCount.mockRejectedValue(
        new ClickHouseError('query', new Error('timeout'))
      );

      await expect(manager.findActiveSubjectCount(range)).rejects.toThrow(
        ClickHouseError
      );
    });
  });

  describe('findNotifiedSubjectCounts', () => {
    const params = { ...range, thresholds: [50, 80, 100] };

    it('pairs each threshold with its subject count', async () => {
      meteringMetricsRepository.findNotifiedSubjectCounts.mockResolvedValue([
        { threshold: 100, subject_count: 3 },
        { threshold: 50, subject_count: 20 },
        { threshold: 80, subject_count: 12 },
      ]);

      await expect(manager.findNotifiedSubjectCounts(params)).resolves.toEqual([
        { threshold: 50, subjectCount: 20 },
        { threshold: 80, subjectCount: 12 },
        { threshold: 100, subjectCount: 3 },
      ]);
    });

    it('reports zero for a threshold nobody was notified for', async () => {
      meteringMetricsRepository.findNotifiedSubjectCounts.mockResolvedValue([
        { threshold: 50, subject_count: 20 },
      ]);

      await expect(manager.findNotifiedSubjectCounts(params)).resolves.toEqual([
        { threshold: 50, subjectCount: 20 },
        { threshold: 80, subjectCount: 0 },
        { threshold: 100, subjectCount: 0 },
      ]);
    });

    it('returns nothing for a meter without thresholds', async () => {
      await expect(
        manager.findNotifiedSubjectCounts({ ...range, thresholds: [] })
      ).resolves.toEqual([]);
    });

    it('does not query ClickHouse for a meter without thresholds', async () => {
      await manager.findNotifiedSubjectCounts({ ...range, thresholds: [] });

      expect(
        meteringMetricsRepository.findNotifiedSubjectCounts
      ).not.toHaveBeenCalled();
    });

    it('propagates a repository failure', async () => {
      meteringMetricsRepository.findNotifiedSubjectCounts.mockRejectedValue(
        new ClickHouseError('query', new Error('timeout'))
      );

      await expect(manager.findNotifiedSubjectCounts(params)).rejects.toThrow(
        ClickHouseError
      );
    });
  });
});
