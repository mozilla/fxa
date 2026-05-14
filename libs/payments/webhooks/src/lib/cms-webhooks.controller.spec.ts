/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Test } from '@nestjs/testing';
import { CmsWebhooksController } from './cms-webhooks.controller';
import { CmsWebhookService } from './cms-webhooks.service';
import { EmailCapabilityWebhookService } from './email-capability-webhook.service';
import { CmsContentValidationManager, MockStrapiClientConfigProvider, StrapiClient } from '@fxa/shared/cms';
import { MockStatsDProvider } from '@fxa/shared/metrics/statsd';
import { MockFirestoreProvider } from '@fxa/shared/db/firestore';
import { Logger } from '@nestjs/common';
import type {
  StrapiEmailCapabilityListWebhookPayload,
  StrapiValidationWebhookPayload,
} from './cms-webhooks.types';

describe('CmsWebhooksController', () => {
  let controller: CmsWebhooksController;
  let service: CmsWebhookService;
  let emailCapabilityService: EmailCapabilityWebhookService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        { provide: Logger, useValue: { error: jest.fn(), log: jest.fn() } },
        CmsWebhooksController,
        CmsWebhookService,
        CmsContentValidationManager,
        {
          provide: EmailCapabilityWebhookService,
          useValue: {
            handleEmailCapabilityListWebhook: jest
              .fn()
              .mockResolvedValue(undefined),
          },
        },
        MockStatsDProvider,
        MockStrapiClientConfigProvider,
        StrapiClient,
        MockFirestoreProvider,
      ],
    }).compile();

    controller = module.get(CmsWebhooksController);
    service = module.get(CmsWebhookService);
    emailCapabilityService = module.get(EmailCapabilityWebhookService);
  });

  describe('postStrapiValidation', () => {
    const mockPayload: StrapiValidationWebhookPayload = {
      event: 'entry.publish',
      createdAt: new Date().toISOString(),
      model: 'offering',
      entry: { id: 1, documentId: 'abc123' },
    };

    beforeEach(() => {
      jest
        .spyOn(service, 'handleValidationWebhook')
        .mockResolvedValue(undefined);
    });

    it('calls service with authorization and body', async () => {
      await controller.postStrapiValidation('Bearer secret', mockPayload);

      expect(service.handleValidationWebhook).toHaveBeenCalledWith(
        'Bearer secret',
        mockPayload
      );
    });

    it('returns success response', async () => {
      const result = await controller.postStrapiValidation(
        'Bearer secret',
        mockPayload
      );

      expect(result).toEqual({ success: true });
    });
  });

  describe('postEmailCapabilityList', () => {
    const mockPayload: StrapiEmailCapabilityListWebhookPayload = {
      event: 'entry.update',
      model: 'business-entitlement',
      entry: {
        id: 1,
        documentId: 'doc-1',
        capabilities: [{ slug: 'capA' }],
        matchers: [
          { __component: 'matchers.email-list', emails: ['user@example.com'] },
        ],
      },
    };

    it('delegates to EmailCapabilityWebhookService', async () => {
      await controller.postEmailCapabilityList('Bearer secret', mockPayload);

      expect(
        emailCapabilityService.handleEmailCapabilityListWebhook
      ).toHaveBeenCalledWith('Bearer secret', mockPayload);
    });

    it('returns success response', async () => {
      const result = await controller.postEmailCapabilityList(
        'Bearer secret',
        mockPayload
      );

      expect(result).toEqual({ success: true });
    });
  });
});
