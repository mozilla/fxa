/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import { Test } from '@nestjs/testing';
import { PaymentMethodManager } from './paymentMethod.manager';
import {
  MockPaypalClientConfigProvider,
  PaypalBillingAgreementManager,
  PayPalClient,
  PaypalCustomerManager,
} from '@fxa/payments/paypal';
import {
  SubPlatPaymentMethodType,
} from '@fxa/payments/customer';
import {
  StripeClient,
  MockStripeConfigProvider,
  StripeResponseFactory,
  StripeCustomerFactory,
  StripePaymentMethodFactory,
  StripeSubscriptionFactory,
} from '@fxa/payments/stripe';
import { MockAccountDatabaseNestFactory } from '@fxa/shared/db/mysql/account';
import { MockStatsDProvider } from '@fxa/shared/metrics/statsd';

describe('PaymentMethodManager', () => {
  let paymentMethodManager: PaymentMethodManager;
  let paypalBillingAgreementManager: PaypalBillingAgreementManager;
  let stripeClient: StripeClient;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        MockAccountDatabaseNestFactory,
        MockPaypalClientConfigProvider,
        MockStripeConfigProvider,
        PaymentMethodManager,
        PaypalBillingAgreementManager,
        PayPalClient,
        PaypalCustomerManager,
        StripeClient,
        MockStatsDProvider,
      ],
    }).compile();

    paymentMethodManager = moduleRef.get(PaymentMethodManager);
    paypalBillingAgreementManager = moduleRef.get(
      PaypalBillingAgreementManager
    );
    stripeClient = moduleRef.get(StripeClient);
  });

  describe('attach', () => {
    it('should attach a payment method to a customer', async () => {
      const mockCustomer = StripeCustomerFactory();
      const mockPaymentMethod = StripePaymentMethodFactory();
      const mockResponse = StripeResponseFactory(mockPaymentMethod);

      jest
        .spyOn(stripeClient, 'paymentMethodsAttach')
        .mockResolvedValue(mockResponse);

      const result = await paymentMethodManager.attach(mockPaymentMethod.id, {
        customer: mockCustomer.id,
      });

      expect(stripeClient.paymentMethodsAttach).toHaveBeenCalledWith(
        mockPaymentMethod.id,
        {
          customer: mockCustomer.id,
        }
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('retrieve', () => {
    it('should retrieve a payment method', async () => {
      const mockPaymentMethod = StripePaymentMethodFactory();
      const mockResponse = StripeResponseFactory(mockPaymentMethod);

      jest
        .spyOn(stripeClient, 'paymentMethodRetrieve')
        .mockResolvedValue(mockResponse);

      const result = await paymentMethodManager.retrieve(mockPaymentMethod.id);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getDefaultPaymentMethod', () => {
    it('returns payment method information - card', async () => {
      const mockPaymentMethod = StripeResponseFactory(
        StripePaymentMethodFactory({})
      );
      const mockStripeCustomer = StripeCustomerFactory();
      const mockSubscriptions = [StripeSubscriptionFactory()];
      const mockUid = faker.string.uuid();

      jest.spyOn(paymentMethodManager, 'determineType').mockResolvedValue({
        type: SubPlatPaymentMethodType.Stripe,
        paymentMethodId: 'pm_id',
      });
      jest
        .spyOn(paymentMethodManager, 'retrieve')
        .mockResolvedValue(mockPaymentMethod);

      const result = await paymentMethodManager.getDefaultPaymentMethod(
        mockStripeCustomer,
        mockSubscriptions,
        mockUid
      );
      expect(result).toEqual({
        type: mockPaymentMethod.type,
        brand: mockPaymentMethod.card?.brand,
        last4: mockPaymentMethod.card?.last4,
        expMonth: mockPaymentMethod.card?.exp_month,
        expYear: mockPaymentMethod.card?.exp_year,
        walletType: mockPaymentMethod.card?.wallet?.type,
      });
    });

    it('returns payment method information - paypal', async () => {
      const mockPaypalBillingAgreementId = faker.string.sample();
      const mockStripeCustomer = StripeCustomerFactory();
      const mockSubscriptions = [StripeSubscriptionFactory()];
      const mockUid = faker.string.uuid();

      jest.spyOn(paymentMethodManager, 'determineType').mockResolvedValue({
        type: SubPlatPaymentMethodType.PayPal,
      });
      jest
        .spyOn(paypalBillingAgreementManager, 'retrieveActiveId')
        .mockResolvedValue(mockPaypalBillingAgreementId);

      const result = await paymentMethodManager.getDefaultPaymentMethod(
        mockStripeCustomer,
        mockSubscriptions,
        mockUid
      );
      expect(result).toEqual({
        type: 'external_paypal',
        brand: 'paypal',
        billingAgreementId: mockPaypalBillingAgreementId,
      });
    });
  });

  describe('determineType', () => {
    it('returns card', async () => {
      const mockCustomer = StripeCustomerFactory({
        invoice_settings: {
            custom_fields: null,
            default_payment_method: 'any',
            footer: null,
            rendering_options: null,
          },
      });

      const mockPaymentMethod = StripeResponseFactory(
        StripePaymentMethodFactory({
          type: 'card',
        })
      );
      jest.spyOn(paymentMethodManager, 'retrieve').mockResolvedValue(mockPaymentMethod);

      await expect(
        paymentMethodManager.determineType(mockCustomer)
      ).resolves.toEqual({
        type: SubPlatPaymentMethodType.Card,
        paymentMethodId: expect.any(String),
      });
    });

    it('returns external_paypal', async () => {
      const mockSubscription = StripeSubscriptionFactory({
        collection_method: 'send_invoice',
      });

      await expect(
        paymentMethodManager.determineType(undefined, [mockSubscription])
      ).resolves.toEqual({
        type: SubPlatPaymentMethodType.PayPal,
      });
    });

    it('returns link', async () => {
      const mockCustomer = StripeCustomerFactory({
        invoice_settings: {
          custom_fields: null,
          default_payment_method: 'any',
          footer: null,
          rendering_options: null,
        },
      });

      const mockPaymentMethod = StripeResponseFactory(
        StripePaymentMethodFactory({
          type: 'link',
        })
      );
      jest.spyOn(paymentMethodManager, 'retrieve').mockResolvedValue(mockPaymentMethod);

      await expect(
        paymentMethodManager.determineType(mockCustomer)
      ).resolves.toEqual({
        type: SubPlatPaymentMethodType.Link,
        paymentMethodId: expect.any(String),
      });
    });

    it('returns apple_pay', async () => {
      const mockCustomer = StripeCustomerFactory({
        invoice_settings: {
          custom_fields: null,
          default_payment_method: 'any',
          footer: null,
          rendering_options: null,
        },
      });

      const mockPaymentMethod = StripeResponseFactory(
        {
          type: 'card',
          card: { wallet: { type: 'apple_pay' } },
        } as any
      );
      jest.spyOn(paymentMethodManager, 'retrieve').mockResolvedValue(mockPaymentMethod);

      await expect(
        paymentMethodManager.determineType(mockCustomer)
      ).resolves.toEqual({
        type: SubPlatPaymentMethodType.ApplePay,
        paymentMethodId: expect.any(String),
      });
    });

    it('returns google_pay', async () => {
      const mockCustomer = StripeCustomerFactory({
        invoice_settings: {
          custom_fields: null,
          default_payment_method: 'any',
          footer: null,
          rendering_options: null,
        },
      });

      const mockPaymentMethod = StripeResponseFactory(
        {
          type: 'card',
          card: { wallet: { type: 'google_pay' } },
        } as any
      );
      jest.spyOn(paymentMethodManager, 'retrieve').mockResolvedValue(mockPaymentMethod);

      await expect(
        paymentMethodManager.determineType(mockCustomer)
      ).resolves.toEqual({
        type: SubPlatPaymentMethodType.GooglePay,
        paymentMethodId: expect.any(String),
      });
    });

    it('returns null', async () => {
      await expect(
        paymentMethodManager.determineType(undefined, undefined)
      ).resolves.toBeNull();
    });
  });
});
