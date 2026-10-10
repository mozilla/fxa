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
  StrapiMeterWebhookFactory,
} from '@fxa/shared/cms';
import type { StrapiMeterRaw } from '@fxa/shared/cms';
import { StatsDService, type StatsD } from '@fxa/shared/metrics/statsd';

import {
  MockMeteringSweepConfig,
  MeteringSweepConfig,
} from './metering-sweep.config';
import { CATCH_UP_SLICE_MS } from './metering.constants';
import { MeteringSweepManager } from './metering-sweep.manager';
import { notificationKey } from './utils/notificationKey';
import { MeteringSweepService } from './metering-sweep.service';
import { MeteringWebhookManager } from './metering-webhook.manager';
import { UsageGrantsManager } from './usage-grants.manager';

const CLIENT_ID = 'vpn';
const SLUG = 'tokens';
const NOW = new Date('2026-05-15T12:00:00.000Z');
const WATERMARK = new Date('2026-05-15T11:55:00.000Z');

describe('MeteringSweepService', () => {
  let service: MeteringSweepService;
  let meteringConfigurationManager: jest.Mocked<
    Pick<MeteringConfigurationManager, 'getMeterResultUtil'>
  >;
  let meteringSweepManager: jest.Mocked<
    Pick<
      MeteringSweepManager,
      | 'findActiveMeters'
      | 'findWindowCandidates'
      | 'findSessionCandidates'
      | 'findLastNotifications'
      | 'findSessionStarts'
      | 'recordNotifications'
      | 'findNewSessionStarts'
      | 'recordSessionStarts'
      | 'findWatermark'
      | 'advanceWatermark'
    >
  >;
  let meteringWebhookManager: jest.Mocked<
    Pick<MeteringWebhookManager, 'dispatch'>
  >;
  let usageGrantsManager: jest.Mocked<
    Pick<UsageGrantsManager, 'getActiveGrantedAmount'>
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
      notificationThresholds: '80',
      webhooks: [StrapiMeterWebhookFactory({ signingClientId: 'wh-a' })],
      ...override,
    });
  }

  const params = { clientId: CLIENT_ID, slug: SLUG };

  beforeEach(async () => {
    meteringConfigurationManager = {
      getMeterResultUtil: jest.fn().mockResolvedValue(utilFor(meter())),
    };
    meteringSweepManager = {
      findActiveMeters: jest.fn().mockResolvedValue([]),
      findWindowCandidates: jest.fn().mockResolvedValue([]),
      findSessionCandidates: jest.fn().mockResolvedValue([]),
      findLastNotifications: jest.fn().mockResolvedValue(new Map()),
      findSessionStarts: jest.fn().mockResolvedValue(new Map()),
      recordNotifications: jest.fn().mockResolvedValue(undefined),
      findNewSessionStarts: jest.fn().mockResolvedValue([]),
      recordSessionStarts: jest.fn().mockResolvedValue(undefined),
      findWatermark: jest.fn().mockResolvedValue(WATERMARK),
      advanceWatermark: jest.fn().mockResolvedValue(undefined),
    };
    meteringWebhookManager = {
      dispatch: jest.fn().mockResolvedValue(undefined),
    };
    usageGrantsManager = {
      getActiveGrantedAmount: jest.fn().mockResolvedValue(0),
    };
    statsd = { increment: jest.fn(), timing: jest.fn(), gauge: jest.fn() };
    logger = { error: jest.fn(), log: jest.fn(), warn: jest.fn() };

    const moduleRef = await Test.createTestingModule({
      providers: [
        MeteringSweepService,
        { provide: MeteringSweepConfig, useValue: MockMeteringSweepConfig },
        {
          provide: MeteringConfigurationManager,
          useValue: meteringConfigurationManager,
        },
        { provide: MeteringSweepManager, useValue: meteringSweepManager },
        { provide: MeteringWebhookManager, useValue: meteringWebhookManager },
        { provide: UsageGrantsManager, useValue: usageGrantsManager },
        { provide: StatsDService, useValue: statsd },
        { provide: Logger, useValue: logger },
      ],
    }).compile();

    service = moduleRef.get(MeteringSweepService);
  });

  describe('watermark', () => {
    it('uses the stored watermark to scope candidate discovery', async () => {
      await service.sweep(params, NOW);

      expect(meteringSweepManager.findWindowCandidates).toHaveBeenCalledWith(
        expect.objectContaining({
          ingestedSince: new Date(
            WATERMARK.getTime() - MockMeteringSweepConfig.watermarkLagMs
          ),
        })
      );
    });

    it('falls back to the configured lookback on the first ever sweep', async () => {
      meteringSweepManager.findWatermark.mockResolvedValue(null);

      await service.sweep(params, NOW);

      expect(meteringSweepManager.findWindowCandidates).toHaveBeenCalledWith(
        expect.objectContaining({
          ingestedSince: new Date(
            NOW.getTime() -
              MockMeteringSweepConfig.lookbackMs -
              MockMeteringSweepConfig.watermarkLagMs
          ),
        })
      );
    });

    it('floors the event_time scan below the watermark so a late backfill is visible', async () => {
      await service.sweep(params, NOW);

      const call = meteringSweepManager.findWindowCandidates.mock.calls[0][0];
      expect(call.eventTimeFloor.getTime()).toBeLessThan(WATERMARK.getTime());
    });

    it('advances the watermark to now after a successful sweep', async () => {
      const result = await service.sweep(params, NOW);

      expect(meteringSweepManager.advanceWatermark).toHaveBeenCalledWith({
        clientId: CLIENT_ID,
        slug: SLUG,
        watermark: NOW,
        updatedAt: NOW,
      });
      expect(result.watermark).toBe(NOW.toISOString());
    });

    it('does not advance the watermark when the sweep throws', async () => {
      meteringSweepManager.findWindowCandidates.mockRejectedValue(
        new Error('clickhouse')
      );

      await expect(service.sweep(params, NOW)).rejects.toThrow('clickhouse');
      expect(meteringSweepManager.advanceWatermark).not.toHaveBeenCalled();
    });

    it('bounds the ingest scan at now', async () => {
      await service.sweep(params, NOW);

      expect(meteringSweepManager.findWindowCandidates).toHaveBeenCalledWith(
        expect.objectContaining({ ingestedUntil: NOW })
      );
    });

    it('reports how far behind now the watermark is', async () => {
      await service.sweep(params, NOW);

      expect(statsd.gauge).toHaveBeenCalledWith(
        'metering.sweep.watermark_age',
        NOW.getTime() - WATERMARK.getTime(),
        { slug: SLUG }
      );
    });

    describe('catching up a stale watermark', () => {
      const SLICE_MS = CATCH_UP_SLICE_MS;
      const LAG_MS = MockMeteringSweepConfig.watermarkLagMs;
      const STALE = new Date(NOW.getTime() - 2.5 * SLICE_MS);

      beforeEach(() => {
        meteringSweepManager.findWatermark.mockResolvedValue(STALE);
      });

      it('scans the ingest range one slice at a time', async () => {
        await service.sweep(params, NOW);

        expect(meteringSweepManager.findWindowCandidates).toHaveBeenCalledTimes(
          3
        );
        expect(
          meteringSweepManager.findWindowCandidates
        ).toHaveBeenNthCalledWith(
          1,
          expect.objectContaining({
            ingestedSince: new Date(STALE.getTime() - LAG_MS),
            ingestedUntil: new Date(STALE.getTime() + SLICE_MS),
          })
        );
        expect(
          meteringSweepManager.findWindowCandidates
        ).toHaveBeenNthCalledWith(
          2,
          expect.objectContaining({
            ingestedSince: new Date(STALE.getTime() + SLICE_MS - LAG_MS),
            ingestedUntil: new Date(STALE.getTime() + 2 * SLICE_MS),
          })
        );
        expect(
          meteringSweepManager.findWindowCandidates
        ).toHaveBeenNthCalledWith(
          3,
          expect.objectContaining({
            ingestedSince: new Date(STALE.getTime() + 2 * SLICE_MS - LAG_MS),
            ingestedUntil: NOW,
          })
        );
      });

      it('records each slice end as its own watermark', async () => {
        await service.sweep(params, NOW);

        expect(meteringSweepManager.advanceWatermark).toHaveBeenCalledTimes(3);
        expect(meteringSweepManager.advanceWatermark).toHaveBeenNthCalledWith(
          1,
          {
            ...params,
            watermark: new Date(STALE.getTime() + SLICE_MS),
            updatedAt: NOW,
          }
        );
        expect(meteringSweepManager.advanceWatermark).toHaveBeenNthCalledWith(
          2,
          {
            ...params,
            watermark: new Date(STALE.getTime() + 2 * SLICE_MS),
            updatedAt: NOW,
          }
        );
        expect(meteringSweepManager.advanceWatermark).toHaveBeenNthCalledWith(
          3,
          { ...params, watermark: NOW, updatedAt: NOW }
        );
      });

      it('ends at now', async () => {
        const result = await service.sweep(params, NOW);

        expect(result.watermark).toBe(NOW.toISOString());
      });

      it('keeps the progress of earlier slices when a later slice fails', async () => {
        meteringSweepManager.findWindowCandidates
          .mockResolvedValueOnce([])
          .mockRejectedValueOnce(new Error('clickhouse'));

        await expect(service.sweep(params, NOW)).rejects.toThrow('clickhouse');

        expect(meteringSweepManager.advanceWatermark).toHaveBeenCalledTimes(1);
        expect(meteringSweepManager.advanceWatermark).toHaveBeenCalledWith({
          ...params,
          watermark: new Date(STALE.getTime() + SLICE_MS),
          updatedAt: NOW,
        });
      });

      it('stops at the slice whose dispatch failed and holds its start', async () => {
        meteringSweepManager.findWindowCandidates.mockResolvedValue([
          { subject: 'user-1', usage: 90 },
        ]);
        meteringWebhookManager.dispatch.mockRejectedValue(new Error('down'));

        const result = await service.sweep(params, NOW);

        expect(meteringSweepManager.findWindowCandidates).toHaveBeenCalledTimes(
          1
        );
        expect(meteringSweepManager.advanceWatermark).not.toHaveBeenCalled();
        expect(result).toEqual({
          outcome: 'dispatch-failed',
          candidates: 1,
          dispatched: 0,
          held: true,
          watermark: STALE.toISOString(),
        });
      });
    });

    it('starts catch-up no earlier than the current window could have received events', async () => {
      meteringConfigurationManager.getMeterResultUtil.mockResolvedValue(
        utilFor(meter({ windowPeriod: 'daily' }))
      );
      meteringSweepManager.findWatermark.mockResolvedValue(
        new Date(NOW.getTime() - 3 * 24 * 60 * 60 * 1000)
      );

      await service.sweep(params, NOW);

      expect(meteringSweepManager.findWindowCandidates).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          ingestedSince: new Date(
            new Date('2026-05-14T23:55:00.000Z').getTime() -
              MockMeteringSweepConfig.watermarkLagMs
          ),
        })
      );
    });

    it('advances the watermark even when the meter has no webhooks', async () => {
      meteringConfigurationManager.getMeterResultUtil.mockResolvedValue(
        utilFor(meter({ webhooks: [] }))
      );

      const result = await service.sweep(params, NOW);

      expect(result.outcome).toBe('no-webhooks');
      expect(meteringSweepManager.advanceWatermark).toHaveBeenCalled();
    });
  });

  describe('early exits', () => {
    it('reports meter-not-configured for an unknown slug', async () => {
      meteringConfigurationManager.getMeterResultUtil.mockResolvedValue(
        new MeterBySlugResultUtil({ meters: [] }, SLUG)
      );

      const result = await service.sweep(params, NOW);

      expect(result.outcome).toBe('meter-not-configured');
      expect(meteringSweepManager.advanceWatermark).not.toHaveBeenCalled();
    });

    it('ignores a zero threshold', async () => {
      meteringConfigurationManager.getMeterResultUtil.mockResolvedValue(
        utilFor(meter({ notificationThresholds: '0' }))
      );

      const result = await service.sweep(params, NOW);

      expect(result.outcome).toBe('no-thresholds');
      expect(meteringSweepManager.findWindowCandidates).not.toHaveBeenCalled();
    });

    it('refuses to sweep a meter with a non-positive limit', async () => {
      meteringConfigurationManager.getMeterResultUtil.mockResolvedValue(
        utilFor(meter({ limit: 0 }))
      );

      const result = await service.sweep(params, NOW);

      expect(result.outcome).toBe('no-thresholds');
      expect(meteringSweepManager.findWindowCandidates).not.toHaveBeenCalled();
    });
  });

  describe('dispatch', () => {
    const NOTIFIED_80_VIA_WH_A = new Map([
      [
        notificationKey('user-1', 80, 'wh-a'),
        {
          windowId: 'calendar:monthly:2026-05-01T00:00:00.000Z',
          sentAt: new Date('2026-05-10T00:00:00.000Z'),
        },
      ],
    ]);

    beforeEach(() => {
      meteringSweepManager.findWindowCandidates.mockResolvedValue([
        { subject: 'user-1', usage: 90 },
      ]);
    });

    it('dispatches and records a crossing', async () => {
      const result = await service.sweep(params, NOW);

      expect(result).toEqual({
        outcome: 'dispatched',
        candidates: 1,
        dispatched: 1,
        held: false,
        watermark: NOW.toISOString(),
      });
      expect(meteringWebhookManager.dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          signingClientId: 'wh-a',
          subject: 'user-1',
          threshold: 80,
          currentUsage: 90,
          limit: 100,
        })
      );
      expect(meteringSweepManager.recordNotifications).toHaveBeenCalledWith([
        expect.objectContaining({
          subject: 'user-1',
          threshold: 80,
          signingClientId: 'wh-a',
        }),
      ]);
    });

    it('scopes the idempotency key by client, meter, subject, window and threshold', async () => {
      await service.sweep(params, NOW);

      const call = meteringWebhookManager.dispatch.mock.calls[0][0];
      expect(call.idempotencyKey).toBe(
        `${CLIENT_ID}:${SLUG}:user-1:calendar:monthly:2026-05-01T00:00:00.000Z:80`
      );
    });

    it('skips the grants lookup when every threshold was already notified', async () => {
      meteringSweepManager.findLastNotifications.mockResolvedValue(
        NOTIFIED_80_VIA_WH_A
      );

      await service.sweep(params, NOW);

      expect(usageGrantsManager.getActiveGrantedAmount).not.toHaveBeenCalled();
    });

    it('still looks up grants when another webhook has not been notified', async () => {
      meteringConfigurationManager.getMeterResultUtil.mockResolvedValue(
        utilFor(
          meter({
            webhooks: [
              StrapiMeterWebhookFactory({ signingClientId: 'wh-a' }),
              StrapiMeterWebhookFactory({ signingClientId: 'wh-b' }),
            ],
          })
        )
      );
      meteringSweepManager.findLastNotifications.mockResolvedValue(
        NOTIFIED_80_VIA_WH_A
      );

      await service.sweep(params, NOW);

      expect(usageGrantsManager.getActiveGrantedAmount).toHaveBeenCalledTimes(
        1
      );
    });

    it('dispatches only to the webhook that has not been notified', async () => {
      meteringConfigurationManager.getMeterResultUtil.mockResolvedValue(
        utilFor(
          meter({
            webhooks: [
              StrapiMeterWebhookFactory({ signingClientId: 'wh-a' }),
              StrapiMeterWebhookFactory({ signingClientId: 'wh-b' }),
            ],
          })
        )
      );
      meteringSweepManager.findLastNotifications.mockResolvedValue(
        NOTIFIED_80_VIA_WH_A
      );

      await service.sweep(params, NOW);

      expect(meteringWebhookManager.dispatch).toHaveBeenCalledTimes(1);
      expect(meteringWebhookManager.dispatch).toHaveBeenCalledWith(
        expect.objectContaining({ signingClientId: 'wh-b' })
      );
    });

    it('suppresses a crossing already notified for that webhook', async () => {
      meteringSweepManager.findLastNotifications.mockResolvedValue(
        NOTIFIED_80_VIA_WH_A
      );

      const result = await service.sweep(params, NOW);

      expect(result.outcome).toBe('no-crossings');
      expect(meteringWebhookManager.dispatch).not.toHaveBeenCalled();
    });

    it('still delivers to a healthy webhook when another one fails', async () => {
      meteringConfigurationManager.getMeterResultUtil.mockResolvedValue(
        utilFor(
          meter({
            webhooks: [
              StrapiMeterWebhookFactory({ signingClientId: 'broken' }),
              StrapiMeterWebhookFactory({ signingClientId: 'healthy' }),
            ],
          })
        )
      );
      meteringWebhookManager.dispatch.mockImplementation(async (payload) => {
        if (payload.signingClientId === 'broken') {
          throw new Error('502');
        }
      });

      const result = await service.sweep(params, NOW);

      expect(meteringWebhookManager.dispatch).toHaveBeenCalledTimes(2);
      expect(result.dispatched).toBe(1);
      expect(meteringSweepManager.recordNotifications).toHaveBeenCalledWith([
        expect.objectContaining({ signingClientId: 'healthy' }),
      ]);
    });

    it('records nothing when the only webhook fails, so the next sweep retries', async () => {
      meteringWebhookManager.dispatch.mockRejectedValue(new Error('502'));

      const result = await service.sweep(params, NOW);

      expect(result.outcome).toBe('dispatch-failed');
      expect(meteringSweepManager.recordNotifications).not.toHaveBeenCalled();
    });

    it('holds the watermark when a dispatch fails so the crossing is retried', async () => {
      meteringWebhookManager.dispatch.mockRejectedValue(new Error('502'));

      const result = await service.sweep(params, NOW);

      expect(meteringSweepManager.advanceWatermark).not.toHaveBeenCalled();
      expect(result.watermark).toBe(WATERMARK.toISOString());
      expect(statsd.increment).toHaveBeenCalledWith(
        'metering.sweep.watermark_held',
        { slug: SLUG }
      );
    });

    it('holds the watermark when another webhook still succeeds', async () => {
      meteringConfigurationManager.getMeterResultUtil.mockResolvedValue(
        utilFor(
          meter({
            webhooks: [
              StrapiMeterWebhookFactory({ signingClientId: 'broken' }),
              StrapiMeterWebhookFactory({ signingClientId: 'healthy' }),
            ],
          })
        )
      );
      meteringWebhookManager.dispatch.mockImplementation(async (payload) => {
        if (payload.signingClientId === 'broken') {
          throw new Error('502');
        }
      });

      await service.sweep(params, NOW);

      expect(meteringSweepManager.advanceWatermark).not.toHaveBeenCalled();
    });

    it('records each chunk of notifications as it completes', async () => {
      meteringSweepManager.findWindowCandidates.mockResolvedValue(
        Array.from({ length: 45 }, (_, index) => ({
          subject: `user-${index}`,
          usage: 90,
        }))
      );

      const result = await service.sweep(params, NOW);

      expect(result.dispatched).toBe(45);
      expect(meteringSweepManager.recordNotifications).toHaveBeenCalledTimes(
        Math.ceil(45 / MockMeteringSweepConfig.dispatchConcurrency)
      );
    });

    it('keeps sweeping other subjects when one subject throws', async () => {
      meteringSweepManager.findWindowCandidates.mockResolvedValue([
        { subject: 'user-1', usage: 90 },
        { subject: 'user-2', usage: 90 },
      ]);
      usageGrantsManager.getActiveGrantedAmount.mockImplementation(
        async (subject) => {
          if (subject === 'user-1') {
            throw new Error('firestore');
          }
          return 0;
        }
      );

      const result = await service.sweep(params, NOW);

      expect(result.dispatched).toBe(1);
      expect(statsd.increment).toHaveBeenCalledWith(
        'metering.sweep.subject_error'
      );
      expect(logger.error).toHaveBeenCalled();
      expect(meteringSweepManager.advanceWatermark).not.toHaveBeenCalled();
    });
  });

  describe('observability', () => {
    it('tags the outcome metric with the slug', async () => {
      await service.sweep(params, NOW);

      expect(statsd.increment).toHaveBeenCalledWith('metering.sweep', {
        outcome: 'no-candidates',
        slug: SLUG,
      });
    });

    it('emits an error outcome and a duration when the sweep fails', async () => {
      meteringSweepManager.findWindowCandidates.mockRejectedValue(
        new Error('clickhouse')
      );

      await expect(service.sweep(params, NOW)).rejects.toThrow('clickhouse');

      expect(statsd.increment).toHaveBeenCalledWith('metering.sweep', {
        outcome: 'error',
        slug: SLUG,
      });
      expect(statsd.timing).toHaveBeenCalledWith(
        'metering.sweep.duration',
        expect.any(Number),
        { slug: SLUG }
      );
    });
  });

  describe('session start detection', () => {
    const SESSION_MINUTES = 300;

    function sessionMeter(): ReturnType<typeof utilFor> {
      return utilFor(
        meter({
          windowKind: 'session',
          windowPeriod: null,
          windowDurationMinutes: SESSION_MINUTES,
        })
      );
    }

    it('detects session starts in every catch-up slice', async () => {
      meteringConfigurationManager.getMeterResultUtil.mockResolvedValue(
        sessionMeter()
      );
      meteringSweepManager.findWatermark.mockResolvedValue(
        new Date(NOW.getTime() - 2.5 * CATCH_UP_SLICE_MS)
      );

      await service.sweep(params, NOW);

      expect(meteringSweepManager.findNewSessionStarts).toHaveBeenCalledTimes(
        3
      );
    });

    it('evaluates session candidates once after the last slice', async () => {
      meteringConfigurationManager.getMeterResultUtil.mockResolvedValue(
        sessionMeter()
      );
      meteringSweepManager.findWatermark.mockResolvedValue(
        new Date(NOW.getTime() - 2.5 * CATCH_UP_SLICE_MS)
      );

      await service.sweep(params, NOW);

      expect(meteringSweepManager.findSessionCandidates).toHaveBeenCalledTimes(
        1
      );
      expect(meteringSweepManager.findWindowCandidates).not.toHaveBeenCalled();
    });

    it('keeps the advanced watermark when a session dispatch fails, since open sessions retry on their own', async () => {
      meteringConfigurationManager.getMeterResultUtil.mockResolvedValue(
        sessionMeter()
      );
      meteringSweepManager.findSessionCandidates.mockResolvedValue([
        { subject: 'user-1', usage: 90 },
      ]);
      meteringWebhookManager.dispatch.mockRejectedValue(new Error('down'));

      const result = await service.sweep(params, NOW);

      expect(meteringSweepManager.advanceWatermark).toHaveBeenCalledWith({
        ...params,
        watermark: NOW,
        updatedAt: NOW,
      });
      expect(result).toEqual({
        outcome: 'dispatch-failed',
        candidates: 1,
        dispatched: 0,
        held: true,
        watermark: NOW.toISOString(),
      });
    });

    it('does not look for session starts on a calendar meter', async () => {
      await service.sweep(params, NOW);

      expect(meteringSweepManager.findNewSessionStarts).not.toHaveBeenCalled();
      expect(meteringSweepManager.recordSessionStarts).not.toHaveBeenCalled();
    });
  });

  describe('sweepAll', () => {
    it('sweeps every active meter', async () => {
      meteringSweepManager.findActiveMeters.mockResolvedValue([
        { clientId: CLIENT_ID, slug: SLUG },
        { clientId: 'relay', slug: 'bandwidth' },
      ]);

      const result = await service.sweepAll(NOW);

      expect(result).toEqual({ total: 2, held: 0, failed: 0 });
      expect(meteringSweepManager.findWatermark).toHaveBeenCalledWith({
        clientId: CLIENT_ID,
        slug: SLUG,
      });
      expect(meteringSweepManager.findWatermark).toHaveBeenCalledWith({
        clientId: 'relay',
        slug: 'bandwidth',
      });
    });

    it('looks for meters active within what a first sweep would read back', async () => {
      await service.sweepAll(NOW);

      expect(meteringSweepManager.findActiveMeters).toHaveBeenCalledWith({
        ingestedSince: new Date(
          NOW.getTime() -
            MockMeteringSweepConfig.lookbackMs -
            MockMeteringSweepConfig.watermarkLagMs
        ),
      });
    });

    it('counts a meter whose watermark was held without failing the run', async () => {
      meteringSweepManager.findActiveMeters.mockResolvedValue([params]);
      meteringSweepManager.findWindowCandidates.mockResolvedValue([
        { subject: 'user-1', usage: 90 },
      ]);
      meteringWebhookManager.dispatch.mockRejectedValue(new Error('down'));

      await expect(service.sweepAll(NOW)).resolves.toEqual({
        total: 1,
        held: 1,
        failed: 0,
      });
    });

    it('logs one line per swept meter', async () => {
      meteringSweepManager.findActiveMeters.mockResolvedValue([params]);

      await service.sweepAll(NOW);

      expect(logger.log).toHaveBeenCalledWith(
        expect.stringContaining(`Swept ${CLIENT_ID}/${SLUG}: no-candidates`)
      );
    });

    it('warns about a meter that is no longer configured in the CMS', async () => {
      meteringSweepManager.findActiveMeters.mockResolvedValue([params]);
      meteringConfigurationManager.getMeterResultUtil.mockResolvedValue(
        new MeterBySlugResultUtil({ meters: [] }, SLUG)
      );

      await service.sweepAll(NOW);

      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining(`${CLIENT_ID}/${SLUG}`)
      );
    });

    it('keeps sweeping after one meter throws and counts it as failed', async () => {
      meteringSweepManager.findActiveMeters.mockResolvedValue([
        { clientId: CLIENT_ID, slug: SLUG },
        { clientId: 'relay', slug: 'bandwidth' },
      ]);
      meteringSweepManager.findWatermark
        .mockRejectedValueOnce(new Error('clickhouse'))
        .mockResolvedValueOnce(WATERMARK);

      const result = await service.sweepAll(NOW);

      expect(result).toEqual({ total: 2, held: 0, failed: 1 });
      expect(meteringSweepManager.advanceWatermark).toHaveBeenCalledTimes(1);
      expect(logger.error).toHaveBeenCalledWith(expect.any(Error));
    });

    it('returns zero counts when no meter is active', async () => {
      await expect(service.sweepAll(NOW)).resolves.toEqual({
        total: 0,
        held: 0,
        failed: 0,
      });
    });
  });
});
