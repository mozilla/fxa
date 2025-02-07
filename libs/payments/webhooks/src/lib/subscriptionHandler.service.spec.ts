/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Test } from '@nestjs/testing';

import {
  MockStripeConfigProvider,
  StripeClient,
  StripeCustomerFactory,
  StripeInvoiceFactory,
  StripeResponseFactory,
  StripeSubscriptionFactory,
} from '@fxa/payments/stripe';
import { StripeEventManager } from './stripeEvents.manager';
import { StripeWebhookService } from './stripeWebhooks.service';
import { SubscriptionEventsService } from './subscriptionHandler.service';
import {
  CustomerDeletedError,
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
import { CustomerSubscriptionDeletedResponseFactory } from './factories';
import { determinePaymentMethodType } from '@fxa/payments/customer';
import { determineCancellation } from './util/determineCancellation';

jest.mock('@fxa/payments/customer');
const mockDeterminePaymentMethodType = jest.mocked(determinePaymentMethodType);
jest.mock('./util/determineCancellation');
const mockDetermineCancellation = jest.mocked(determineCancellation);

describe('SubscriptionEventsService', () => {
  let subscriptionEventsService: SubscriptionEventsService;
  let subscriptionManager: SubscriptionManager;
  let customerManager: CustomerManager;
  let invoiceManager: InvoiceManager;
  let emitterService: PaymentsEmitterService;

  const mockEmitter = {
    emit: jest.fn(),
  };

  const { event: mockEvent, eventObjectData: mockEventObjectData } =
    CustomerSubscriptionDeletedResponseFactory();

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

    subscriptionEventsService = module.get(SubscriptionEventsService);
    subscriptionManager = module.get(SubscriptionManager);
    customerManager = module.get(CustomerManager);
    invoiceManager = module.get(InvoiceManager);
    emitterService = module.get(PaymentsEmitterService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('SubscriptionEventsService', () => {
    beforeEach(() => {
      jest
        .spyOn(subscriptionManager, 'retrieve')
        .mockResolvedValue(StripeResponseFactory(StripeSubscriptionFactory()));
      jest
        .spyOn(customerManager, 'retrieve')
        .mockResolvedValue(StripeResponseFactory(StripeCustomerFactory()));
      jest
        .spyOn(invoiceManager, 'retrieve')
        .mockResolvedValue(StripeResponseFactory(StripeInvoiceFactory()));
      jest
        .spyOn(emitterService, 'getEmitter')
        .mockReturnValue(mockEmitter as any);
      mockDeterminePaymentMethodType.mockReturnValue({
        type: 'stripe',
        paymentMethodId: 'pm_id',
      });
    });

    describe('handleCustomerSubscriptionDeleted', () => {
      it('should emit the subscriptionEnded event, with paymentProvider card', async () => {
        await subscriptionEventsService.handleCustomerSubscriptionDeleted(
          mockEvent,
          mockEventObjectData
        );

        expect(mockEmitter.emit).toHaveBeenCalledTimes(1);
        expect(mockEmitter.emit).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            paymentProvider: 'card',
          })
        );
      });

      it('should emit the subscriptionEnded event, with paymentProvider external_paypal', async () => {
        mockDeterminePaymentMethodType.mockReturnValue({
          type: 'external_paypal',
        });
        await subscriptionEventsService.handleCustomerSubscriptionDeleted(
          mockEvent,
          mockEventObjectData
        );

        expect(mockEmitter.emit).toHaveBeenCalledTimes(1);
        expect(mockEmitter.emit).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            paymentProvider: 'external_paypal',
          })
        );
      });

      it('should emit the subscriptionEnded event, with voluntaryCancellation false', async () => {
        mockDetermineCancellation.mockReturnValue(false);
        await subscriptionEventsService.handleCustomerSubscriptionDeleted(
          mockEvent,
          mockEventObjectData
        );

        expect(mockEmitter.emit).toHaveBeenCalledTimes(1);
        expect(mockEmitter.emit).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            voluntaryCancellation: false,
          })
        );
      });

      it('should emit the subscriptionEnded event, with voluntaryCancellation true', async () => {
        mockDetermineCancellation.mockReturnValue(true);
        await subscriptionEventsService.handleCustomerSubscriptionDeleted(
          mockEvent,
          mockEventObjectData
        );

        expect(mockEmitter.emit).toHaveBeenCalledTimes(1);
        expect(mockEmitter.emit).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            voluntaryCancellation: true,
          })
        );
      });

      it('should emit the subscriptionEnded event, with paymentProvider undefined on error', async () => {
        jest
          .spyOn(customerManager, 'retrieve')
          .mockRejectedValue(new CustomerDeletedError());
        await subscriptionEventsService.handleCustomerSubscriptionDeleted(
          mockEvent,
          mockEventObjectData
        );

        expect(mockEmitter.emit).toHaveBeenCalledTimes(1);
        expect(mockEmitter.emit).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            paymentProvider: undefined,
            voluntaryCancellation: undefined,
          })
        );
      });

      it('throws the error on exception', async () => {
        jest
          .spyOn(subscriptionManager, 'retrieve')
          .mockRejectedValue(new Error('bad'));

        await expect(
          subscriptionEventsService.handleCustomerSubscriptionDeleted(
            mockEvent,
            mockEventObjectData
          )
        ).rejects.toThrowError();
      });
    });
  });
});
