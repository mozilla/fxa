/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Logger } from '@nestjs/common';
import type { LoggerService } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import {
  MeterBySlugResultUtil,
  MeterInvalidNotificationThresholdError,
  MeteringConfigurationManager,
  StrapiMeterFactory,
  StrapiMeterWebhookFactory,
} from '@fxa/shared/cms';
import type { StrapiMeter } from '@fxa/shared/cms';
import { StatsDService } from '@fxa/shared/metrics/statsd';
import type { StatsD } from '@fxa/shared/metrics/statsd';

import { MeteringQueryManager } from './metering-query.manager';
import { MeteringThresholdService } from './metering-threshold.service';
import { MeteringWebhookManager } from './metering-webhook.manager';
import { OpenMeterQueryError } from './metering.error';

describe('MeteringThresholdService', () => {
  let service: MeteringThresholdService;
  let meteringConfigurationManager: jest.Mocked<
    Pick<MeteringConfigurationManager, 'getMeterResultUtil'>
  >;
  let meteringQueryManager: jest.Mocked<
    Pick<MeteringQueryManager, 'queryUsage'>
  >;
  let meteringWebhookManager: jest.Mocked<
    Pick<MeteringWebhookManager, 'dispatch'>
  >;
  let statsd: jest.Mocked<Pick<StatsD, 'increment'>>;
  let logger: jest.Mocked<Pick<LoggerService, 'error'>>;

  const body = { slug: 'tokens', userIdentifier: 'user-1' };
  const now = new Date('2026-05-15T12:00:00.000Z');

  function resultUtilFor(meter: StrapiMeter): MeterBySlugResultUtil {
    return new MeterBySlugResultUtil({ meters: [meter] }, meter.slug);
  }

  beforeEach(async () => {
    meteringConfigurationManager = { getMeterResultUtil: jest.fn() };
    meteringQueryManager = { queryUsage: jest.fn() };
    meteringWebhookManager = { dispatch: jest.fn() };
    statsd = { increment: jest.fn() };
    logger = { error: jest.fn() };

    const moduleRef = await Test.createTestingModule({
      providers: [
        MeteringThresholdService,
        {
          provide: MeteringConfigurationManager,
          useValue: meteringConfigurationManager,
        },
        { provide: MeteringQueryManager, useValue: meteringQueryManager },
        { provide: MeteringWebhookManager, useValue: meteringWebhookManager },
        { provide: StatsDService, useValue: statsd },
        { provide: Logger, useValue: logger },
      ],
    }).compile();

    service = moduleRef.get(MeteringThresholdService);
  });

  it('logs and emits the no-meter metric when the slug is not configured', async () => {
    meteringConfigurationManager.getMeterResultUtil.mockResolvedValue(
      new MeterBySlugResultUtil({ meters: [] }, 'tokens')
    );

    await service.handleThresholdCheck(body, now);

    expect(logger.error).toHaveBeenCalledWith(
      'threshold-check task for unknown slug tokens'
    );
    expect(statsd.increment).toHaveBeenCalledWith('metering.tasks.handler', {
      outcome: 'no-meter',
    });
    expect(meteringQueryManager.queryUsage).not.toHaveBeenCalled();
    expect(meteringWebhookManager.dispatch).not.toHaveBeenCalled();
  });

  it('emits the no-webhooks metric and skips the usage query when the meter has no webhooks', async () => {
    meteringConfigurationManager.getMeterResultUtil.mockResolvedValue(
      resultUtilFor(StrapiMeterFactory({ slug: 'tokens', webhooks: [] }))
    );

    await service.handleThresholdCheck(body, now);

    expect(statsd.increment).toHaveBeenCalledWith('metering.tasks.handler', {
      outcome: 'no-webhooks',
    });
    expect(meteringQueryManager.queryUsage).not.toHaveBeenCalled();
  });

  it('emits the no-crossings metric and dispatches nothing when usage meets no threshold', async () => {
    meteringConfigurationManager.getMeterResultUtil.mockResolvedValue(
      resultUtilFor(
        StrapiMeterFactory({
          slug: 'tokens',
          limit: 100,
          window: 'monthly',
          notificationThresholds: '80',
          webhooks: [StrapiMeterWebhookFactory()],
        })
      )
    );
    meteringQueryManager.queryUsage.mockResolvedValue({
      usage: 10,
      from: now,
      to: now,
    });

    await service.handleThresholdCheck(body, now);

    expect(statsd.increment).toHaveBeenCalledWith('metering.tasks.handler', {
      outcome: 'no-crossings',
    });
    expect(meteringWebhookManager.dispatch).not.toHaveBeenCalled();
  });

  it('queries usage for the current window anchored on now', async () => {
    meteringConfigurationManager.getMeterResultUtil.mockResolvedValue(
      resultUtilFor(
        StrapiMeterFactory({
          slug: 'tokens',
          limit: 100,
          window: 'monthly',
          notificationThresholds: '80',
          webhooks: [StrapiMeterWebhookFactory()],
        })
      )
    );
    meteringQueryManager.queryUsage.mockResolvedValue({
      usage: 10,
      from: now,
      to: now,
    });

    await service.handleThresholdCheck(body, now);

    expect(meteringQueryManager.queryUsage).toHaveBeenCalledWith({
      userIdentifier: 'user-1',
      slug: 'tokens',
      from: new Date('2026-05-01T00:00:00.000Z'),
      to: new Date('2026-06-01T00:00:00.000Z'),
    });
  });

  it('dispatches a webhook per met threshold per webhook and emits the crossings-dispatched metric', async () => {
    meteringConfigurationManager.getMeterResultUtil.mockResolvedValue(
      resultUtilFor(
        StrapiMeterFactory({
          slug: 'tokens',
          unit: 'tokens',
          limit: 100,
          window: 'monthly',
          notificationThresholds: '50,80',
          webhooks: [
            StrapiMeterWebhookFactory({
              url: 'https://webhook.example/a',
              signingClientId: 'rp-1',
            }),
            StrapiMeterWebhookFactory({
              url: 'https://webhook.example/b',
              signingClientId: 'rp-2',
            }),
          ],
        })
      )
    );
    meteringQueryManager.queryUsage.mockResolvedValue({
      usage: 90,
      from: now,
      to: now,
    });

    await service.handleThresholdCheck(body, now);

    expect(meteringWebhookManager.dispatch).toHaveBeenCalledTimes(4);
    expect(meteringWebhookManager.dispatch).toHaveBeenNthCalledWith(1, {
      signingClientId: 'rp-1',
      url: 'https://webhook.example/a',
      slug: 'tokens',
      userIdentifier: 'user-1',
      threshold: 50,
      currentUsage: 90,
      limit: 100,
      unit: 'tokens',
      windowStart: new Date('2026-05-01T00:00:00.000Z'),
      windowEnd: new Date('2026-06-01T00:00:00.000Z'),
      eventId: 'tokens:user-1:2026-05-01T00:00:00.000Z:50',
    });
    expect(meteringWebhookManager.dispatch).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        signingClientId: 'rp-2',
        threshold: 50,
        eventId: 'tokens:user-1:2026-05-01T00:00:00.000Z:50',
      })
    );
    expect(meteringWebhookManager.dispatch).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        signingClientId: 'rp-1',
        threshold: 80,
        eventId: 'tokens:user-1:2026-05-01T00:00:00.000Z:80',
      })
    );
    expect(meteringWebhookManager.dispatch).toHaveBeenNthCalledWith(
      4,
      expect.objectContaining({
        signingClientId: 'rp-2',
        threshold: 80,
        eventId: 'tokens:user-1:2026-05-01T00:00:00.000Z:80',
      })
    );
    expect(statsd.increment).toHaveBeenCalledWith('metering.tasks.handler', {
      outcome: 'crossings-dispatched',
    });
  });

  it('propagates a usage-query failure and dispatches nothing', async () => {
    meteringConfigurationManager.getMeterResultUtil.mockResolvedValue(
      resultUtilFor(
        StrapiMeterFactory({
          slug: 'tokens',
          window: 'monthly',
          notificationThresholds: '50',
          webhooks: [StrapiMeterWebhookFactory()],
        })
      )
    );
    meteringQueryManager.queryUsage.mockRejectedValue(
      new OpenMeterQueryError(new Error('openmeter down'))
    );

    await expect(service.handleThresholdCheck(body, now)).rejects.toThrow(
      OpenMeterQueryError
    );
    expect(meteringWebhookManager.dispatch).not.toHaveBeenCalled();
  });

  it('propagates an invalid-threshold config error and dispatches nothing', async () => {
    meteringConfigurationManager.getMeterResultUtil.mockResolvedValue(
      resultUtilFor(
        StrapiMeterFactory({
          slug: 'tokens',
          limit: 100,
          window: 'monthly',
          notificationThresholds: '50,150',
          webhooks: [StrapiMeterWebhookFactory()],
        })
      )
    );
    meteringQueryManager.queryUsage.mockResolvedValue({
      usage: 90,
      from: now,
      to: now,
    });

    await expect(service.handleThresholdCheck(body, now)).rejects.toThrow(
      MeterInvalidNotificationThresholdError
    );
    expect(meteringWebhookManager.dispatch).not.toHaveBeenCalled();
  });

  it('stops dispatching and does not emit the success metric when a webhook dispatch fails', async () => {
    meteringConfigurationManager.getMeterResultUtil.mockResolvedValue(
      resultUtilFor(
        StrapiMeterFactory({
          slug: 'tokens',
          limit: 100,
          window: 'monthly',
          notificationThresholds: '50,80',
          webhooks: [StrapiMeterWebhookFactory()],
        })
      )
    );
    meteringQueryManager.queryUsage.mockResolvedValue({
      usage: 90,
      from: now,
      to: now,
    });
    meteringWebhookManager.dispatch.mockRejectedValueOnce(
      new Error('webhook 500')
    );

    await expect(service.handleThresholdCheck(body, now)).rejects.toThrow(
      'webhook 500'
    );
    expect(meteringWebhookManager.dispatch).toHaveBeenCalledTimes(1);
    expect(statsd.increment).not.toHaveBeenCalledWith(
      'metering.tasks.handler',
      {
        outcome: 'crossings-dispatched',
      }
    );
  });
});
