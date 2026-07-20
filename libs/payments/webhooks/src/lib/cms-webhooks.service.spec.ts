/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Test } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import * as Sentry from '@sentry/node';
import { CmsWebhookService } from './cms-webhooks.service';
import { CmsContentValidationManager, StrapiClient } from '@fxa/shared/cms';
import { StatsDService } from '@fxa/shared/metrics/statsd';
import type { StatsD } from 'hot-shots';
import type { StrapiValidationWebhookPayload } from './cms-webhooks.types';

jest.mock('@sentry/node', () => {
  const actual = jest.requireActual('@sentry/node');
  return {
    ...actual,
    captureException: jest.fn(),
  };
});

describe('CmsWebhookService', () => {
  let service: CmsWebhookService;
  let validator: CmsContentValidationManager;
  let mockStrapiClient: { verifyWebhookSignature: jest.Mock };
  let statsd: { increment: jest.Mock; timing: jest.Mock };
  let logger: { error: jest.Mock; log: jest.Mock };

  const mockPayload: StrapiValidationWebhookPayload = {
    event: 'entry.publish',
    createdAt: new Date().toISOString(),
    model: 'offering',
    entry: { id: 1, documentId: 'abc123' },
  };

  beforeEach(async () => {
    logger = { error: jest.fn(), log: jest.fn() };
    statsd = { increment: jest.fn(), timing: jest.fn() };
    mockStrapiClient = {
      verifyWebhookSignature: jest.fn().mockReturnValue(true),
    };
    const mockValidator = {
      validateAll: jest.fn().mockResolvedValue([]),
    };

    const module = await Test.createTestingModule({
      providers: [
        { provide: Logger, useValue: logger },
        CmsWebhookService,
        { provide: CmsContentValidationManager, useValue: mockValidator },
        { provide: StrapiClient, useValue: mockStrapiClient },
        { provide: StatsDService, useValue: statsd as unknown as StatsD },
      ],
    }).compile();

    service = module.get(CmsWebhookService);
    validator = module.get(CmsContentValidationManager);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('rejects invalid authorization', async () => {
    mockStrapiClient.verifyWebhookSignature.mockReturnValue(false);

    await service.handleValidationWebhook('Bearer wrong', mockPayload);

    expect(statsd.increment).toHaveBeenCalledWith('cms.validation.auth.error');
    expect(validator.validateAll).not.toHaveBeenCalled();
  });

  it('skips non-allowed events', async () => {
    const payload = { ...mockPayload, event: 'media.upload' };
    await service.handleValidationWebhook('Bearer valid', payload);

    expect(validator.validateAll).not.toHaveBeenCalled();
  });

  it('records success when no validation errors', async () => {
    await service.handleValidationWebhook('Bearer valid', mockPayload);

    expect(validator.validateAll).toHaveBeenCalled();
    expect(statsd.increment).toHaveBeenCalledWith('cms.validation.success');
  });

  it('reports validation errors to Sentry and statsd', async () => {
    const validationError = Object.assign(new Error('CMS validation failed'), {
      model: 'offering',
      zodErrors: [],
    });

    jest.spyOn(validator, 'validateAll').mockResolvedValue([validationError]);

    await service.handleValidationWebhook('Bearer valid', mockPayload);

    expect(Sentry.captureException).toHaveBeenCalledWith(validationError);
    expect(statsd.increment).toHaveBeenCalledWith('cms.validation.error', {
      model: 'offering',
    });
  });

  it('catches and reports unexpected errors during validation sweep', async () => {
    const unexpectedError = new Error('Strapi connection failed');
    jest.spyOn(validator, 'validateAll').mockRejectedValue(unexpectedError);

    await service.handleValidationWebhook('Bearer valid', mockPayload);

    expect(Sentry.captureException).toHaveBeenCalledWith(unexpectedError);
    expect(statsd.increment).toHaveBeenCalledWith('cms.validation.error');
  });

  it('processes all allowed event types', async () => {
    const events = [
      'entry.publish',
      'entry.unpublish',
      'entry.delete',
      'entry.create',
      'entry.update',
    ];

    for (const event of events) {
      jest.clearAllMocks();
      mockStrapiClient.verifyWebhookSignature.mockReturnValue(true);
      await service.handleValidationWebhook('Bearer valid', {
        ...mockPayload,
        event,
      });
      expect(validator.validateAll).toHaveBeenCalled();
    }
  });
});
