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
import { StripeEventManager } from './stripe-event.manager';
import { StripeWebhookService } from './stripe-webhooks.service';
import { SubscriptionEventsService } from './subscription-handler.service';
import {
  CustomerDeletedError,
  CustomerManager,
  InvoiceManager,
  PriceManager,
  SubscriptionManager,
  PaymentMethodManager,
  SubPlatPaymentMethodType,
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
import {
  CancellationReason,
  determineCancellation,
} from './util/determineCancellation';
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

jest.mock('@fxa/payments/customer');
jest.mock('./util/determineCancellation');
const mockDetermineCancellation = jest.mocked(determineCancellation);

describe('SubscriptionEventsService', () => {
  let subscriptionEventsService: SubscriptionEventsService;
  let subscriptionManager: SubscriptionManager;
  let customerManager: CustomerManager;
  let invoiceManager: InvoiceManager;
  let emitterService: PaymentsEmitterService;
  let paymentMethodManager: PaymentMethodManager;

  const mockEmitter = {
    emit: jest.fn(),
  };
  const mockLogger = {
    error: jest.fn(),
    log: jest.fn(),
  };
  const paymentMethodManagerMock = {
    determineType: jest.fn(),
  };

  const { event: mockEvent, eventObjectData: mockEventObjectData } =
    CustomerSubscriptionDeletedResponseFactory();

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

    subscriptionEventsService = module.get(SubscriptionEventsService);
    subscriptionManager = module.get(SubscriptionManager);
    customerManager = module.get(CustomerManager);
    invoiceManager = module.get(InvoiceManager);
    emitterService = module.get(PaymentsEmitterService);
    paymentMethodManager = module.get(PaymentMethodManager);
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
      (paymentMethodManager.determineType as jest.Mock).mockResolvedValue({
        type: SubPlatPaymentMethodType.Card,
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
        (paymentMethodManager.determineType as jest.Mock).mockResolvedValueOnce(
          {
            type: SubPlatPaymentMethodType.PayPal,
          }
        );
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

      it('should emit the subscriptionEnded event, with cancellationReason as redundant', async () => {
        mockDetermineCancellation.mockReturnValue(CancellationReason.Redundant);
        await subscriptionEventsService.handleCustomerSubscriptionDeleted(
          mockEvent,
          mockEventObjectData
        );

        expect(mockEmitter.emit).toHaveBeenCalledTimes(1);
        expect(mockEmitter.emit).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            cancellationReason: CancellationReason.Redundant,
          })
        );
      });

      it('should emit the subscriptionEnded event, with cancellationReason as involuntary', async () => {
        mockDetermineCancellation.mockReturnValue(
          CancellationReason.Involuntary
        );
        await subscriptionEventsService.handleCustomerSubscriptionDeleted(
          mockEvent,
          mockEventObjectData
        );

        expect(mockEmitter.emit).toHaveBeenCalledTimes(1);
        expect(mockEmitter.emit).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            cancellationReason: CancellationReason.Involuntary,
          })
        );
      });

      it('should emit the subscriptionEnded event, with cancellationReason as customer initiated', async () => {
        mockDetermineCancellation.mockReturnValue(
          CancellationReason.CustomerInitiated
        );
        await subscriptionEventsService.handleCustomerSubscriptionDeleted(
          mockEvent,
          mockEventObjectData
        );

        expect(mockEmitter.emit).toHaveBeenCalledTimes(1);
        expect(mockEmitter.emit).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            cancellationReason: CancellationReason.CustomerInitiated,
          })
        );
      });

      it('should emit the subscriptionEnded event, with paymentProvider undefined on error', async () => {
        jest
          .spyOn(customerManager, 'retrieve')
          .mockRejectedValue(new CustomerDeletedError('customerId'));
        await subscriptionEventsService.handleCustomerSubscriptionDeleted(
          mockEvent,
          mockEventObjectData
        );

        expect(mockEmitter.emit).toHaveBeenCalledTimes(1);
        expect(mockEmitter.emit).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            paymentProvider: undefined,
            cancellationReason: CancellationReason.Involuntary,
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
