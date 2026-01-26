/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Test } from '@nestjs/testing';

import { MockStripeConfigProvider, StripeClient } from '@fxa/payments/stripe';
import { StripeEventManager } from './stripe-event.manager';
import { StripeWebhookService } from './stripe-webhooks.service';
import { CustomerSubscriptionDeletedResponseFactory } from './factories';
import { SubscriptionEventsService } from './subscription-handler.service';
import {
  CustomerManager,
  InvoiceManager,
  PriceManager,
  SubscriptionManager,
  PaymentMethodManager,
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
  PaymentsGleanService,
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
import { Logger } from '@nestjs/common';
import { MockStripeEventConfigProvider } from './stripe-event.config';
import {
  MockNimbusClientConfigProvider,
  NimbusClient,
} from '@fxa/shared/experiments';
import {
  MockNimbusManagerConfigProvider,
  NimbusManager,
} from '@fxa/payments/experiments';

jest.mock('@sentry/node', () => {
  const actual = jest.requireActual('@sentry/node');
  return {
    ...actual,
    captureException: jest.fn(),
  };
});

describe('StripeWebhookService', () => {
  let stripeEventManager: StripeEventManager;
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
        PaymentsGleanService,
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
        NimbusClient,
        MockNimbusClientConfigProvider,
        NimbusManager,
        MockNimbusManagerConfigProvider,
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
      jest.spyOn(stripeEventManager, 'isProcessed').mockResolvedValue(false);
      jest
        .spyOn(stripeEventManager, 'markAsProcessed')
        .mockResolvedValue(undefined);
    });

    describe('handleWebhookEvent', () => {
      it('should construct Webhook Event and call dispatchEventToHanlder', async () => {
        await stripeWebhookService.handleWebhookEvent({}, 'signature');

        expect(
          (stripeWebhookService as any).dispatchEventToHandler
        ).toHaveBeenCalled();
        expect(stripeEventManager.markAsProcessed).toHaveBeenCalled();
      });

      it('should return early if event already processed', async () => {
        jest.spyOn(stripeEventManager, 'isProcessed').mockResolvedValue(true);

        await stripeWebhookService.handleWebhookEvent({}, 'signature');
        expect(
          (stripeWebhookService as any).dispatchEventToHandler
        ).not.toHaveBeenCalled();
        expect(stripeEventManager.markAsProcessed).not.toHaveBeenCalled();
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
