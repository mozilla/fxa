/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Test } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { MockPaymentsGleanServiceFactory } from '@fxa/payments/metrics';
import { FxaWebhooksController } from './fxa-webhooks.controller';
import { FxaWebhookService } from './fxa-webhooks.service';
import { MockFxaWebhookConfigProvider } from './fxa-webhooks.config';
import { MockStatsDProvider } from '@fxa/shared/metrics/statsd';

describe('FxaWebhooksController', () => {
  let controller: FxaWebhooksController;
  let service: FxaWebhookService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        { provide: Logger, useValue: { error: jest.fn(), log: jest.fn() } },
        FxaWebhooksController,
        FxaWebhookService,
        MockFxaWebhookConfigProvider,
        MockStatsDProvider,
        MockPaymentsGleanServiceFactory,
      ],
    }).compile();

    controller = module.get(FxaWebhooksController);
    service = module.get(FxaWebhookService);
  });

  describe('postFxaEvent', () => {
    beforeEach(() => {
      jest.spyOn(service, 'handleWebhookEvent').mockResolvedValue(undefined);
    });

    it('calls service with authorization header', async () => {
      await controller.postFxaEvent('Bearer test-token');

      expect(service.handleWebhookEvent).toHaveBeenCalledWith(
        'Bearer test-token'
      );
    });

    it('returns success response', async () => {
      const result = await controller.postFxaEvent('Bearer test-token');

      expect(result).toEqual({ success: true });
    });

    it('propagates service errors', async () => {
      const serviceError = new Error('webhook auth failed');
      jest
        .spyOn(service, 'handleWebhookEvent')
        .mockRejectedValue(serviceError);

      await expect(
        controller.postFxaEvent('Bearer bad-token')
      ).rejects.toThrow(serviceError);
    });
  });
});
