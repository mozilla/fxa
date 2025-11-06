/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Test } from '@nestjs/testing';
import { StripeWebhooksController } from './stripe-webhooks.controller';
import { StripeWebhookService } from './stripe-webhooks.service';
import { StripeEventManager } from './stripe-event.manager';
import { SubscriptionEventsService } from './subscription-handler.service';
import {
  CustomerManager,
  InvoiceManager,
  PaymentMethodManager,
  PriceManager,
  SubscriptionManager,
} from '@fxa/payments/customer';
import { MockStripeConfigProvider, StripeClient } from '@fxa/payments/stripe';
import { MockStripeEventConfigProvider } from './stripe-event.config';
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
import { Logger } from '@nestjs/common';
import {
  MockNimbusClientConfigProvider,
  NimbusClient,
} from '@fxa/shared/experiments';
import {
  MockNimbusManagerConfigProvider,
  NimbusManager,
} from '@fxa/payments/experiments';

describe('StripeWebhooksController', () => {
  let stripeWebhooksController: StripeWebhooksController;
  let stripeWebhookService: StripeWebhookService;

  const mockLogger = {
    error: jest.fn(),
    log: jest.fn(),
  };

  const paymentMethodManagerMock = {
    determineType: jest.fn(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        {
          provide: Logger,
          useValue: mockLogger,
        },
        {
          provide: PaymentMethodManager,
          useValue: paymentMethodManagerMock,
        },
        StripeWebhooksController,
        MockStripeConfigProvider,
        MockStripeEventConfigProvider,
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
        StrapiClient,
        MockPaypalClientConfigProvider,
        MockStrapiClientConfigProvider,
        MockFirestoreProvider,
        MockStatsDProvider,
        PriceManager,
        MockAccountDatabaseNestFactory,
        StripeWebhookService,
        StripeEventManager,
        SubscriptionEventsService,
        NimbusClient,
        MockNimbusClientConfigProvider,
        NimbusManager,
        MockNimbusManagerConfigProvider,
      ],
    }).compile();

    stripeWebhooksController = module.get(StripeWebhooksController);
    stripeWebhookService = module.get(StripeWebhookService);
  });

  describe('postStripe', () => {
    beforeEach(() => {
      jest
        .spyOn(stripeWebhookService, 'handleWebhookEvent')
        .mockResolvedValue({});
    });

    it('successfully processes a request', async () => {
      await stripeWebhooksController.postStripe('test' as any, 'test');
      expect(stripeWebhookService.handleWebhookEvent).toHaveBeenCalled();
    });
  });
});
