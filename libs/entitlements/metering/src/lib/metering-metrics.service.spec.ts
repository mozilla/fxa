/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Logger } from '@nestjs/common';
import type { LoggerService } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import {
  MeterBySlugResultUtil,
  MeteringConfigurationManager,
  StrapiMeterRawFactory,
} from '@fxa/shared/cms';
import type { StrapiMeterRaw } from '@fxa/shared/cms';
import { StatsDService, type StatsD } from '@fxa/shared/metrics/statsd';

import { ClickHouseError } from './metering.error';
import { MeteringMetricsManager } from './metering-metrics.manager';
import { MeteringMetricsService } from './metering-metrics.service';
import { MeteringSweepManager } from './metering-sweep.manager';

const CLIENT_ID = 'vpn';
const SLUG = 'tokens';
const NOW = new Date('2026-05-15T12:00:00.000Z');
const TAGS = { clientId: CLIENT_ID, slug: SLUG };

describe('MeteringMetricsService', () => {
  let service: MeteringMetricsService;
  let meteringConfigurationManager: jest.Mocked<
    Pick<MeteringConfigurationManager, 'getMeterResultUtil'>
  >;
  let meteringMetricsManager: jest.Mocked<
    Pick<
      MeteringMetricsManager,
      'findActiveSubjectCount' | 'findNotifiedSubjectCounts'
    >
  >;
  let meteringSweepManager: jest.Mocked<
    Pick<MeteringSweepManager, 'findSweptMeters'>
  >;
  let statsd: jest.Mocked<Pick<StatsD, 'increment' | 'timing' | 'gauge'>>;
  let logger: jest.Mocked<Pick<LoggerService, 'error' | 'log' | 'warn'>>;

  function utilFor(raw: StrapiMeterRaw): MeterBySlugResultUtil {
    return new MeterBySlugResultUtil({ meters: [raw] }, raw.slug);
  }

  function meter(override: Partial<StrapiMeterRaw> = {}): StrapiMeterRaw {
    return StrapiMeterRawFactory({
      slug: SLUG,
      limit: 100,
      unit: 'tokens',
      windowKind: 'calendar',
      windowPeriod: 'monthly',
      notificationThresholds: '80, 100',
      ...override,
    });
  }

  function gaugesNamed(name: string) {
    return statsd.gauge.mock.calls.filter(([metric]) => metric === name);
  }

  const params = { clientId: CLIENT_ID, slug: SLUG };

  beforeEach(async () => {
    meteringConfigurationManager = {
      getMeterResultUtil: jest.fn().mockResolvedValue(utilFor(meter())),
    };
    meteringMetricsManager = {
      findActiveSubjectCount: jest.fn().mockResolvedValue(42),
      findNotifiedSubjectCounts: jest.fn().mockResolvedValue([
        { threshold: 80, subjectCount: 12 },
        { threshold: 100, subjectCount: 3 },
      ]),
    };
    meteringSweepManager = {
      findSweptMeters: jest.fn().mockResolvedValue([]),
    };
    statsd = { increment: jest.fn(), timing: jest.fn(), gauge: jest.fn() };
    logger = { error: jest.fn(), log: jest.fn(), warn: jest.fn() };

    const moduleRef = await Test.createTestingModule({
      providers: [
        MeteringMetricsService,
        {
          provide: MeteringConfigurationManager,
          useValue: meteringConfigurationManager,
        },
        { provide: MeteringMetricsManager, useValue: meteringMetricsManager },
        { provide: MeteringSweepManager, useValue: meteringSweepManager },
        { provide: StatsDService, useValue: statsd },
        { provide: Logger, useValue: logger },
      ],
    }).compile();

    service = moduleRef.get(MeteringMetricsService);
  });

  describe('subjects today', () => {
    it('counts the subjects with usage since midnight UTC', async () => {
      await service.report(params, NOW);

      expect(
        meteringMetricsManager.findActiveSubjectCount
      ).toHaveBeenCalledWith({
        clientId: CLIENT_ID,
        slug: SLUG,
        from: new Date('2026-05-15T00:00:00.000Z'),
        to: new Date('2026-05-16T00:00:00.000Z'),
      });
    });
  });

  describe('subjects notified', () => {
    it('counts the notifications sent since the start of the calendar window', async () => {
      await service.report(params, NOW);

      expect(
        meteringMetricsManager.findNotifiedSubjectCounts
      ).toHaveBeenCalledWith({
        clientId: CLIENT_ID,
        slug: SLUG,
        from: new Date('2026-05-01T00:00:00.000Z'),
        to: NOW,
        thresholds: [80, 100],
      });
    });

    it('counts the notifications sent within a sliding window', async () => {
      meteringConfigurationManager.getMeterResultUtil.mockResolvedValue(
        utilFor(
          meter({
            windowKind: 'sliding',
            windowPeriod: null,
            windowDurationMinutes: 60,
          })
        )
      );

      await service.report(params, NOW);

      expect(
        meteringMetricsManager.findNotifiedSubjectCounts
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          from: new Date('2026-05-15T11:00:00.000Z'),
          to: NOW,
        })
      );
    });

    it('counts the notifications sent within one session length', async () => {
      meteringConfigurationManager.getMeterResultUtil.mockResolvedValue(
        utilFor(
          meter({
            windowKind: 'session',
            windowPeriod: null,
            windowDurationMinutes: 30,
          })
        )
      );

      await service.report(params, NOW);

      expect(
        meteringMetricsManager.findNotifiedSubjectCounts
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          from: new Date('2026-05-15T11:30:00.000Z'),
          to: NOW,
        })
      );
    });

    it('leaves out a zero threshold', async () => {
      meteringConfigurationManager.getMeterResultUtil.mockResolvedValue(
        utilFor(meter({ notificationThresholds: '0, 80' }))
      );

      await service.report(params, NOW);

      expect(
        meteringMetricsManager.findNotifiedSubjectCounts
      ).toHaveBeenCalledWith(expect.objectContaining({ thresholds: [80] }));
    });

    it('counts no thresholds for a meter without webhooks, since the sweep never notifies it', async () => {
      meteringConfigurationManager.getMeterResultUtil.mockResolvedValue(
        utilFor(meter({ webhooks: [] }))
      );

      await service.report(params, NOW);

      expect(
        meteringMetricsManager.findNotifiedSubjectCounts
      ).toHaveBeenCalledWith(expect.objectContaining({ thresholds: [] }));
    });

    it('counts no thresholds for a meter with a non-positive limit, since the sweep never notifies it', async () => {
      meteringConfigurationManager.getMeterResultUtil.mockResolvedValue(
        utilFor(meter({ limit: 0 }))
      );

      await service.report(params, NOW);

      expect(
        meteringMetricsManager.findNotifiedSubjectCounts
      ).toHaveBeenCalledWith(expect.objectContaining({ thresholds: [] }));
    });
  });

  describe('meter not configured', () => {
    beforeEach(() => {
      meteringConfigurationManager.getMeterResultUtil.mockResolvedValue(
        new MeterBySlugResultUtil({ meters: [] }, SLUG)
      );
    });

    it('reports meter-not-configured for an unknown slug', async () => {
      await expect(service.report(params, NOW)).resolves.toBe(
        'meter-not-configured'
      );
    });

    it('does not query ClickHouse', async () => {
      await service.report(params, NOW);

      expect(
        meteringMetricsManager.findActiveSubjectCount
      ).not.toHaveBeenCalled();
      expect(
        meteringMetricsManager.findNotifiedSubjectCounts
      ).not.toHaveBeenCalled();
    });

    it('sends no gauges', async () => {
      await service.report(params, NOW);

      expect(statsd.gauge).not.toHaveBeenCalled();
    });
  });

  describe('gauges', () => {
    it('reports the meter limit tagged with its unit', async () => {
      await service.report(params, NOW);

      expect(gaugesNamed('metering.metrics.meter_limit')).toEqual([
        ['metering.metrics.meter_limit', 100, { ...TAGS, unit: 'tokens' }],
      ]);
    });

    it('reports how many subjects have usage today', async () => {
      await service.report(params, NOW);

      expect(gaugesNamed('metering.metrics.active_subjects_today')).toEqual([
        ['metering.metrics.active_subjects_today', 42, TAGS],
      ]);
    });

    it('reports how many subjects were notified at each threshold', async () => {
      await service.report(params, NOW);

      expect(gaugesNamed('metering.metrics.notified_subjects')).toEqual([
        [
          'metering.metrics.notified_subjects',
          12,
          { ...TAGS, threshold: '80' },
        ],
        [
          'metering.metrics.notified_subjects',
          3,
          { ...TAGS, threshold: '100' },
        ],
      ]);
    });

    it('keeps the gauges of two clients that share a slug apart', async () => {
      await service.report(params, NOW);
      await service.report({ clientId: 'relay', slug: SLUG }, NOW);

      expect(gaugesNamed('metering.metrics.active_subjects_today')).toEqual([
        ['metering.metrics.active_subjects_today', 42, TAGS],
        [
          'metering.metrics.active_subjects_today',
          42,
          { clientId: 'relay', slug: SLUG },
        ],
      ]);
    });
  });

  describe('outcome metric', () => {
    it('counts a reported meter by slug', async () => {
      await service.report(params, NOW);

      expect(statsd.increment).toHaveBeenCalledWith('metering.metrics_report', {
        outcome: 'reported',
        slug: SLUG,
      });
    });

    it('counts a meter that is not configured', async () => {
      meteringConfigurationManager.getMeterResultUtil.mockResolvedValue(
        new MeterBySlugResultUtil({ meters: [] }, SLUG)
      );

      await service.report(params, NOW);

      expect(statsd.increment).toHaveBeenCalledWith('metering.metrics_report', {
        outcome: 'meter-not-configured',
        slug: SLUG,
      });
    });

    it('rethrows when a ClickHouse query fails', async () => {
      meteringMetricsManager.findActiveSubjectCount.mockRejectedValue(
        new ClickHouseError('query', new Error('timeout'))
      );

      await expect(service.report(params, NOW)).rejects.toThrow(
        ClickHouseError
      );
    });

    it('counts an error outcome when a ClickHouse query fails', async () => {
      meteringMetricsManager.findNotifiedSubjectCounts.mockRejectedValue(
        new ClickHouseError('query', new Error('timeout'))
      );

      await service.report(params, NOW).catch(() => undefined);

      expect(statsd.increment).toHaveBeenCalledWith('metering.metrics_report', {
        outcome: 'error',
        slug: SLUG,
      });
    });

    it('rethrows when the meter lookup fails', async () => {
      meteringConfigurationManager.getMeterResultUtil.mockRejectedValue(
        new Error('strapi unavailable')
      );

      await expect(service.report(params, NOW)).rejects.toThrow(
        'strapi unavailable'
      );
    });

    it('counts an error outcome when the meter lookup fails', async () => {
      meteringConfigurationManager.getMeterResultUtil.mockRejectedValue(
        new Error('strapi unavailable')
      );

      await service.report(params, NOW).catch(() => undefined);

      expect(statsd.increment).toHaveBeenCalledWith('metering.metrics_report', {
        outcome: 'error',
        slug: SLUG,
      });
    });

    it('records how long the meter took, tagged by slug', async () => {
      await service.report(params, NOW);

      expect(statsd.timing).toHaveBeenCalledWith(
        'metering.metrics_report.duration',
        expect.any(Number),
        { slug: SLUG }
      );
    });

    it('records the duration of a meter that failed', async () => {
      meteringMetricsManager.findActiveSubjectCount.mockRejectedValue(
        new ClickHouseError('query', new Error('timeout'))
      );

      await service.report(params, NOW).catch(() => undefined);

      expect(statsd.timing).toHaveBeenCalledWith(
        'metering.metrics_report.duration',
        expect.any(Number),
        { slug: SLUG }
      );
    });
  });

  describe('reportAll', () => {
    it('reports every swept meter', async () => {
      meteringSweepManager.findSweptMeters.mockResolvedValue([
        params,
        { clientId: 'relay', slug: 'bandwidth' },
      ]);

      await service.reportAll(NOW);

      const reported =
        meteringMetricsManager.findActiveSubjectCount.mock.calls.map(
          ([countParams]) => [countParams.clientId, countParams.slug]
        );
      expect(reported).toEqual([
        [CLIENT_ID, SLUG],
        ['relay', 'bandwidth'],
      ]);
    });

    it('logs one line per reported meter', async () => {
      meteringSweepManager.findSweptMeters.mockResolvedValue([params]);

      await service.reportAll(NOW);

      expect(logger.log).toHaveBeenCalledWith(
        `Reported metrics for ${CLIENT_ID}/${SLUG}`
      );
    });

    it('warns about a meter that is no longer configured in the CMS', async () => {
      meteringSweepManager.findSweptMeters.mockResolvedValue([params]);
      meteringConfigurationManager.getMeterResultUtil.mockResolvedValue(
        new MeterBySlugResultUtil({ meters: [] }, SLUG)
      );

      await service.reportAll(NOW);

      expect(logger.warn).toHaveBeenCalledWith(
        `Meter ${CLIENT_ID}/${SLUG} is not configured in the CMS and was skipped`
      );
    });

    it('counts a meter whose lookup failed as failed', async () => {
      meteringSweepManager.findSweptMeters.mockResolvedValue([params]);
      meteringConfigurationManager.getMeterResultUtil.mockRejectedValue(
        new Error('strapi unavailable')
      );

      await expect(service.reportAll(NOW)).resolves.toEqual({
        total: 1,
        failed: 1,
      });
    });

    describe('when one meter throws', () => {
      beforeEach(() => {
        meteringSweepManager.findSweptMeters.mockResolvedValue([
          params,
          { clientId: 'relay', slug: SLUG },
        ]);
        meteringMetricsManager.findActiveSubjectCount
          .mockRejectedValueOnce(
            new ClickHouseError('query', new Error('down'))
          )
          .mockResolvedValueOnce(42);
      });

      it('keeps reporting the next meter', async () => {
        await service.reportAll(NOW);

        expect(gaugesNamed('metering.metrics.active_subjects_today')).toEqual([
          [
            'metering.metrics.active_subjects_today',
            42,
            { clientId: 'relay', slug: SLUG },
          ],
        ]);
      });

      it('counts the meter as failed', async () => {
        await expect(service.reportAll(NOW)).resolves.toEqual({
          total: 2,
          failed: 1,
        });
      });

      it('logs the error', async () => {
        await service.reportAll(NOW);

        expect(logger.error).toHaveBeenCalledWith(expect.any(ClickHouseError));
      });
    });

    it('records how long the run took', async () => {
      await service.reportAll(NOW);

      expect(statsd.timing).toHaveBeenCalledWith(
        'metering.metrics_report_all.duration',
        expect.any(Number)
      );
    });

    it('returns zero counts when no meter has been swept', async () => {
      await expect(service.reportAll(NOW)).resolves.toEqual({
        total: 0,
        failed: 0,
      });
    });

    it('propagates a failure to list the swept meters', async () => {
      meteringSweepManager.findSweptMeters.mockRejectedValue(
        new ClickHouseError('query', new Error('down'))
      );

      await expect(service.reportAll(NOW)).rejects.toThrow(ClickHouseError);
    });
  });
});
