/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Test } from '@nestjs/testing';

import { MockStripeConfigProvider, StripeClient } from '@fxa/payments/stripe';
import { StripeEventManager } from './stripeEvents.manager';
import { StripeWebhookService } from './stripeWebhooks.service';
import { CustomerSubscriptionDeletedResponseFactory } from './factories';
import { SubscriptionEventsService } from './subscriptionHandler.service';
import {
  CustomerManager,
  InvoiceManager,
  PriceManager,
  SubscriptionManager,
} from '@fxa/payments/customer';
import { PaymentsEmitterService } from '@fxa/payments/events';
import {
  MockPaypalClientConfigProvider,
  PayPalClient,
} from '@fxa/payments/paypal';
import {
  CurrencyManager,
  MockCurrencyConfigProvider,
} from '@fxa/payments/currency';
import {
  MockPaymentsGleanConfigProvider,
  MockPaymentsGleanFactory,
  PaymentsGleanManager,
} from '@fxa/payments/metrics';
import {
  MockStrapiClientConfigProvider,
  ProductConfigurationManager,
  StrapiClient,
} from '@fxa/shared/cms';
import { CartManager } from '@fxa/payments/cart';
import { AccountManager } from '@fxa/shared/account/account';
import { MockFirestoreProvider } from '@fxa/shared/db/firestore';
import { MockStatsDProvider } from '@fxa/shared/metrics/statsd';
import { MockAccountDatabaseNestFactory } from '@fxa/shared/db/mysql/account';
import * as Sentry from '@sentry/node';

jest.mock('@sentry/node', () => ({
  captureException: jest.fn(),
}));

describe('StripeWebhookService', () => {
  let stripeEventManager: StripeEventManager;
  let stripeWebhookService: StripeWebhookService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MockStripeConfigProvider,
        StripeClient,
        StripeEventManager,
        StripeWebhookService,
        SubscriptionEventsService,
        SubscriptionManager,
        CustomerManager,
        InvoiceManager,
        PaymentsEmitterService,
        PayPalClient,
        CurrencyManager,
        MockCurrencyConfigProvider,
        PaymentsGleanManager,
        MockPaymentsGleanConfigProvider,
        MockPaymentsGleanFactory,
        ProductConfigurationManager,
        CartManager,
        AccountManager,
        MockPaypalClientConfigProvider,
        MockStrapiClientConfigProvider,
        StrapiClient,
        MockStrapiClientConfigProvider,
        MockFirestoreProvider,
        MockStatsDProvider,
        PriceManager,
        MockAccountDatabaseNestFactory,
      ],
    }).compile();

    stripeEventManager = module.get(StripeEventManager);
    stripeWebhookService = module.get(StripeWebhookService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('StripeWebhookService', () => {
    beforeEach(() => {
      jest
        .spyOn(stripeWebhookService as any, 'dispatchEventToHandler')
        .mockResolvedValue({});
      jest
        .spyOn(stripeEventManager, 'constructWebhookEventResponse')
        .mockReturnValue(CustomerSubscriptionDeletedResponseFactory());
    });

    describe('handleWebhookEvent', () => {
      it('should construct Webhook Event and call dispatchEventToHanlder', async () => {
        await stripeWebhookService.handleWebhookEvent({}, 'signature');

        expect(
          (stripeWebhookService as any).dispatchEventToHandler
        ).toHaveBeenCalled();
      });

      it('should report exception to Sentry and throw on exception', async () => {
        jest
          .spyOn(stripeWebhookService as any, 'dispatchEventToHandler')
          .mockRejectedValue(new Error('bad'));

        await expect(
          stripeWebhookService.handleWebhookEvent({}, 'signature')
        ).rejects.toThrowError();

        expect(Sentry.captureException).toBeCalledTimes(1);
      });
    });
  });
});
