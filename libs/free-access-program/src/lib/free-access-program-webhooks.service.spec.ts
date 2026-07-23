/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Logger, UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { StatsD } from 'hot-shots';

import { FreeAccessProgramConfigurationManager, StrapiClient } from '@fxa/shared/cms';
import { StatsDService } from '@fxa/shared/metrics/statsd';

import { FreeAccessProgramWebhooksService } from './free-access-program-webhooks.service';
import type { StrapiAccessWebhookPayload } from './util/classifyAccessWebhook';

// Event-filtering/dedupe internals are covered by the shared-function spec; this
// suite covers the payments-api wiring (auth → cache invalidation, error translation).
describe('FreeAccessProgramWebhooksService', () => {
  let service: FreeAccessProgramWebhooksService;
  let manager: { invalidateProjectionCache: jest.Mock };
  let strapiClient: { verifyWebhookSignature: jest.Mock };
  let statsd: { increment: jest.Mock };
  let logger: { error: jest.Mock };

  const payload: StrapiAccessWebhookPayload = {
    event: 'entry.publish',
    model: 'access',
    createdAt: '2026-06-23T12:00:00.000Z',
    entry: { documentId: 'ent-1' },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    logger = { error: jest.fn() };
    statsd = { increment: jest.fn() };
    strapiClient = { verifyWebhookSignature: jest.fn().mockReturnValue(true) };
    manager = { invalidateProjectionCache: jest.fn().mockResolvedValue(undefined) };

    const module = await Test.createTestingModule({
      providers: [
        FreeAccessProgramWebhooksService,
        { provide: Logger, useValue: logger },
        { provide: StrapiClient, useValue: strapiClient },
        {
          provide: FreeAccessProgramConfigurationManager,
          useValue: manager,
        },
        { provide: StatsDService, useValue: statsd as unknown as StatsD },
      ],
    }).compile();

    service = module.get(FreeAccessProgramWebhooksService);
  });

  it('throws UnauthorizedException and increments statsd on an invalid signature', async () => {
    strapiClient.verifyWebhookSignature.mockReturnValue(false);

    await expect(
      service.handleAccessWebhook('Bearer wrong', payload)
    ).rejects.toThrow(UnauthorizedException);

    expect(statsd.increment).toHaveBeenCalledWith(
      'free_access_program.webhook.auth.error'
    );
    expect(manager.invalidateProjectionCache).not.toHaveBeenCalled();
  });

  it.each([
    ['entry.publish'],
    ['entry.update'],
    ['entry.unpublish'],
    ['entry.delete'],
  ])('invalidates the projection cache on a %s access event', async (event) => {
    const result = await service.handleAccessWebhook('Bearer valid', {
      ...payload,
      event,
    });

    expect(manager.invalidateProjectionCache).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ handled: true });
  });

  it('does not invalidate for a non-access model', async () => {
    const result = await service.handleAccessWebhook('Bearer valid', {
      ...payload,
      model: 'offering',
    });

    expect(result).toEqual({ handled: false, reason: 'model' });
    expect(manager.invalidateProjectionCache).not.toHaveBeenCalled();
  });

  it('does not invalidate for an unknown event type', async () => {
    const result = await service.handleAccessWebhook('Bearer valid', {
      ...payload,
      event: 'media.upload',
    });

    expect(result).toEqual({ handled: false, reason: 'event' });
    expect(manager.invalidateProjectionCache).not.toHaveBeenCalled();
  });

  it('dedupes a replayed webhook without invalidating twice', async () => {
    const first = await service.handleAccessWebhook('Bearer valid', payload);
    const second = await service.handleAccessWebhook('Bearer valid', payload);

    expect(manager.invalidateProjectionCache).toHaveBeenCalledTimes(1);
    expect(first).toEqual({ handled: true });
    expect(second).toEqual({ handled: true, dedupe: true });
  });

  it('swallows an invalidateProjectionCache failure and still reports handled', async () => {
    manager.invalidateProjectionCache.mockRejectedValue(
      new Error('firestore down')
    );

    const result = await service.handleAccessWebhook('Bearer valid', payload);

    // Strapi must not retry; the cron sweep is the backstop.
    expect(result).toEqual({ handled: true });
    expect(logger.error).toHaveBeenCalledWith(
      'freeAccessProgramWebhook.invalidate.error',
      { err: expect.any(Error) }
    );
  });
});
