/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Test } from '@nestjs/testing';

import {
  MockStripeConfigProvider,
  StripeClient,
  StripeEventCustomerSubscriptionCreatedFactory,
} from '@fxa/payments/stripe';
import { StripeEventManager } from './stripeEvents.manager';
import { StripeWebhookService } from './stripeWebhooks.service';
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
import { StripeEventCustomerSubscriptionDeletedFactory } from 'libs/payments/stripe/src/lib/factories/event.factory';
import { Logger } from '@nestjs/common';

describe('StripeEventManager', () => {
  let stripeEventManager: StripeEventManager;
  let stripeClient: StripeClient;

  const mockLogger = {
    error: jest.fn(),
    log: jest.fn(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        {
          provide: Logger,
          useValue: mockLogger,
        },
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
    stripeClient = module.get(StripeClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('SubscriptionEventsService', () => {
    describe('constructWebhookEventResponse', () => {
      it('customer.subscription.deleted - returns subscription object', () => {
        jest
          .spyOn(stripeClient, 'constructWebhookEvent')
          .mockReturnValue(StripeEventCustomerSubscriptionDeletedFactory());
        const result = stripeEventManager.constructWebhookEventResponse({}, '');
        expect(result.type).toBe('customer.subscription.deleted');
      });

      it('customer.subscription.created - returns default', () => {
        jest
          .spyOn(stripeClient, 'constructWebhookEvent')
          .mockReturnValue(StripeEventCustomerSubscriptionCreatedFactory());
        const result = stripeEventManager.constructWebhookEventResponse({}, '');
        expect(result.type).toBe('customer.subscription.created');
      });
    });
  });
});
