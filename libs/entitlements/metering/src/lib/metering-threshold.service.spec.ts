/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { MockStatsDProvider } from '@fxa/shared/metrics/statsd';

import { MeteringManager } from './metering.manager';
import { MeteringConfigurationManager } from './metering-configuration.manager';
import { MeteringThresholdService } from './metering-threshold.service';
import { MeteringWebhookManager } from './metering-webhook.manager';
import { StrapiMeterFactory } from '@fxa/shared/cms';

describe('MeteringThresholdService', () => {
  let meteringThresholdService: MeteringThresholdService;
  let meteringConfigurationManager: jest.Mocked<MeteringConfigurationManager>;
  let meteringManager: jest.Mocked<MeteringManager>;
  let meteringWebhookManager: jest.Mocked<MeteringWebhookManager>;
  let logger: { error: jest.Mock; log: jest.Mock };

  beforeEach(async () => {
    logger = { error: jest.fn(), log: jest.fn() };
    const moduleRef = await Test.createTestingModule({
      providers: [
        MeteringThresholdService,
        {
          provide: MeteringConfigurationManager,
          useValue: { getMeterBySlug: jest.fn() },
        },
        {
          provide: MeteringManager,
          useValue: { queryUsage: jest.fn() },
        },
        {
          provide: MeteringWebhookManager,
          useValue: {
            dispatch: jest.fn().mockResolvedValue(undefined),
          },
        },
        { provide: Logger, useValue: logger },
        MockStatsDProvider,
      ],
    }).compile();

    meteringThresholdService = moduleRef.get(MeteringThresholdService);
    meteringConfigurationManager = moduleRef.get(MeteringConfigurationManager);
    meteringManager = moduleRef.get(MeteringManager);
    meteringWebhookManager = moduleRef.get(MeteringWebhookManager);
  });

  it('returns no-meter and logs when the slug is unknown', async () => {
    meteringConfigurationManager.getMeterBySlug.mockResolvedValue(null);
    const outcome = await meteringThresholdService.handleThresholdCheck({
      slug: 'bandwidth',
      userIdentifier: 'user-1',
    });
    expect(outcome).toBe('no-meter');
    expect(meteringManager.queryUsage).not.toHaveBeenCalled();
    expect(meteringWebhookManager.dispatch).not.toHaveBeenCalled();
    expect(logger.error).toHaveBeenCalled();
  });

  it('returns no-webhooks when the meter has no webhooks configured', async () => {
    meteringConfigurationManager.getMeterBySlug.mockResolvedValue(
      StrapiMeterFactory({
        slug: 'bandwidth',
        webhooks: [],
      })
    );
    const outcome = await meteringThresholdService.handleThresholdCheck({
      slug: 'bandwidth',
      userIdentifier: 'user-1',
    });
    expect(outcome).toBe('no-webhooks');
    expect(meteringManager.queryUsage).not.toHaveBeenCalled();
  });

  it('returns no-crossings when usage does not reach any threshold', async () => {
    meteringConfigurationManager.getMeterBySlug.mockResolvedValue(
      StrapiMeterFactory({
        slug: 'bandwidth',
        limit: 100,
        notificationThresholds: [80, 100],
        webhooks: [{ url: 'https://hook.example/h', signingClientId: 'vpn' }],
      })
    );
    meteringManager.queryUsage.mockResolvedValue({
      usage: 50,
      from: new Date(),
      to: new Date(),
    });
    const outcome = await meteringThresholdService.handleThresholdCheck({
      slug: 'bandwidth',
      userIdentifier: 'user-1',
    });
    expect(outcome).toBe('no-crossings');
    expect(meteringWebhookManager.dispatch).not.toHaveBeenCalled();
  });

  it('dispatches one webhook per threshold-met × webhook', async () => {
    meteringConfigurationManager.getMeterBySlug.mockResolvedValue(
      StrapiMeterFactory({
        slug: 'bandwidth',
        unit: 'mb',
        limit: 100,
        window: 'monthly',
        notificationThresholds: [80, 100],
        webhooks: [
          { url: 'https://a.example/h', signingClientId: 'vpn' },
          { url: 'https://b.example/h', signingClientId: 'partner' },
        ],
      })
    );
    meteringManager.queryUsage.mockResolvedValue({
      usage: 100,
      from: new Date(),
      to: new Date(),
    });
    const now = new Date('2026-05-15T12:00:00.000Z');

    const outcome = await meteringThresholdService.handleThresholdCheck(
      { slug: 'bandwidth', userIdentifier: 'user-1' },
      now
    );

    expect(outcome).toBe('crossings-dispatched');
    expect(meteringWebhookManager.dispatch).toHaveBeenCalledTimes(4);
    const first = meteringWebhookManager.dispatch.mock.calls[0][0];
    expect(first.signingClientId).toBe('vpn');
    expect(first.url).toBe('https://a.example/h');
    expect(first.threshold).toBe(80);
    expect(first.currentUsage).toBe(100);
    expect(first.limit).toBe(100);
    const second = meteringWebhookManager.dispatch.mock.calls[1][0];
    expect(second.signingClientId).toBe('partner');
    expect(second.url).toBe('https://b.example/h');
  });

  it('propagates dispatch failures so Cloud Tasks can re-enqueue', async () => {
    meteringConfigurationManager.getMeterBySlug.mockResolvedValue(
      StrapiMeterFactory({
        slug: 'bandwidth',
        limit: 100,
        notificationThresholds: [80],
        webhooks: [{ url: 'https://a.example/h', signingClientId: 'vpn' }],
      })
    );
    meteringManager.queryUsage.mockResolvedValue({
      usage: 90,
      from: new Date(),
      to: new Date(),
    });
    meteringWebhookManager.dispatch.mockRejectedValueOnce(
      new Error('Webhook target returned 502')
    );

    await expect(
      meteringThresholdService.handleThresholdCheck({
        slug: 'bandwidth',
        userIdentifier: 'user-1',
      })
    ).rejects.toThrow(/502/);
  });

  it('queries OpenMeter for the active monthly window', async () => {
    meteringConfigurationManager.getMeterBySlug.mockResolvedValue(
      StrapiMeterFactory({
        slug: 'bandwidth',
        limit: 100,
        window: 'monthly',
        notificationThresholds: [80],
        webhooks: [{ url: 'https://a.example/h', signingClientId: 'vpn' }],
      })
    );
    meteringManager.queryUsage.mockResolvedValue({
      usage: 90,
      from: new Date(),
      to: new Date(),
    });
    const now = new Date('2026-05-15T12:00:00.000Z');

    await meteringThresholdService.handleThresholdCheck(
      { slug: 'bandwidth', userIdentifier: 'user-1' },
      now
    );

    expect(meteringManager.queryUsage).toHaveBeenCalledWith({
      userIdentifier: 'user-1',
      slug: 'bandwidth',
      from: new Date('2026-05-01T00:00:00.000Z'),
      to: new Date('2026-06-01T00:00:00.000Z'),
    });
  });
});
