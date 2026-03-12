/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Test } from '@nestjs/testing';

import {
  MockStripeConfigProvider,
  StripeClient,
  StripeCustomerFactory,
  StripeEventCustomerSubscriptionUpdatedFactory,
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
  PaymentProvider,
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
import { MockStatsDProvider, StatsDService } from '@fxa/shared/metrics/statsd';
import { StatsD } from 'hot-shots';
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
  let statsd: StatsD;

  const mockEmitter = {
    emit: jest.fn(),
  };
  const mockLogger = {
    error: jest.fn(),
    log: jest.fn(),
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
        PaymentMethodManager,
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

    subscriptionEventsService = module.get(SubscriptionEventsService);
    subscriptionManager = module.get(SubscriptionManager);
    customerManager = module.get(CustomerManager);
    invoiceManager = module.get(InvoiceManager);
    emitterService = module.get(PaymentsEmitterService);
    paymentMethodManager = module.get(PaymentMethodManager);
    statsd = module.get(StatsDService);
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
      jest.spyOn(paymentMethodManager, 'determineType').mockResolvedValue({
        provider: PaymentProvider.Stripe,
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
            paymentProvider: PaymentProvider.Stripe,
          })
        );
      });

      it('should emit the subscriptionEnded event, with paymentProvider external_paypal', async () => {
        jest.spyOn(paymentMethodManager, 'determineType').mockResolvedValue({
          provider: PaymentProvider.PayPal,
          type: SubPlatPaymentMethodType.PayPal,
        });
        await subscriptionEventsService.handleCustomerSubscriptionDeleted(
          mockEvent,
          mockEventObjectData
        );

        expect(mockEmitter.emit).toHaveBeenCalledTimes(1);
        expect(mockEmitter.emit).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            paymentProvider: PaymentProvider.PayPal,
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
        ).rejects.toThrow();
      });
    });

    describe('handleCustomerSubscriptionUpdated', () => {
      const mockActiveSubscription = StripeSubscriptionFactory({
        status: 'active',
      });

      const mockUpdatedEvent =
        StripeEventCustomerSubscriptionUpdatedFactory(
          undefined,
          { status: 'active' },
          { status: 'trialing' }
        );

      beforeEach(() => {
        jest
          .spyOn(customerManager, 'retrieve')
          .mockResolvedValue(
            StripeResponseFactory(
              StripeCustomerFactory({
                metadata: { userid: 'uid123' },
                address: { country: 'US', city: '', line1: '', line2: '', postal_code: '', state: '' },
              })
            )
          );
      });

      it('should emit trialConverted with successful status when trialing -> active', async () => {
        jest.spyOn(statsd, 'increment');

        await subscriptionEventsService.handleCustomerSubscriptionUpdated(
          mockUpdatedEvent,
          mockActiveSubscription
        );

        expect(mockEmitter.emit).toHaveBeenCalledTimes(1);
        expect(mockEmitter.emit).toHaveBeenCalledWith(
          'trialConverted',
          expect.objectContaining({
            conversionStatus: 'successful',
          })
        );
        expect(statsd.increment).toHaveBeenCalledWith(
          'subscription.trial_conversion',
          expect.objectContaining({
            status: 'successful',
          })
        );
      });

      it('should emit trialConverted with unsuccessful status when trialing -> canceled', async () => {
        const mockCanceledSubscription = StripeSubscriptionFactory({
          status: 'canceled',
        });
        jest.spyOn(statsd, 'increment');

        await subscriptionEventsService.handleCustomerSubscriptionUpdated(
          mockUpdatedEvent,
          mockCanceledSubscription
        );

        expect(mockEmitter.emit).toHaveBeenCalledWith(
          'trialConverted',
          expect.objectContaining({
            conversionStatus: 'unsuccessful',
          })
        );
        expect(statsd.increment).toHaveBeenCalledWith(
          'subscription.trial_conversion',
          expect.objectContaining({
            status: 'unsuccessful',
          })
        );
      });

      it('should not emit when previous status is not trialing', async () => {
        const nonTrialEvent =
          StripeEventCustomerSubscriptionUpdatedFactory(
            undefined,
            { status: 'active' },
            { status: 'incomplete' }
          );

        await subscriptionEventsService.handleCustomerSubscriptionUpdated(
          nonTrialEvent,
          mockActiveSubscription
        );

        expect(mockEmitter.emit).not.toHaveBeenCalled();
      });

      it('should not emit when no previous_attributes', async () => {
        const noAttrEvent =
          StripeEventCustomerSubscriptionUpdatedFactory(
            undefined,
            { status: 'active' }
          );

        await subscriptionEventsService.handleCustomerSubscriptionUpdated(
          noAttrEvent,
          mockActiveSubscription
        );

        expect(mockEmitter.emit).not.toHaveBeenCalled();
      });

      it('should handle CustomerDeletedError gracefully', async () => {
        jest
          .spyOn(customerManager, 'retrieve')
          .mockRejectedValue(new CustomerDeletedError('customerId'));

        await subscriptionEventsService.handleCustomerSubscriptionUpdated(
          mockUpdatedEvent,
          mockActiveSubscription
        );

        expect(mockEmitter.emit).toHaveBeenCalledWith(
          'trialConverted',
          expect.objectContaining({
            uid: undefined,
            billingCountry: undefined,
          })
        );
      });

      it('should throw on non-CustomerDeletedError', async () => {
        jest
          .spyOn(customerManager, 'retrieve')
          .mockRejectedValue(new Error('unexpected'));

        await expect(
          subscriptionEventsService.handleCustomerSubscriptionUpdated(
            mockUpdatedEvent,
            mockActiveSubscription
          )
        ).rejects.toThrow('unexpected');
      });
    });
  });
});
