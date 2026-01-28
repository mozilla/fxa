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
  PaymentProvider,
  SubPlatPaymentMethodType,
} from '@fxa/payments/customer';
import {
  StripeClient,
  MockStripeConfigProvider,
  StripeResponseFactory,
  StripeCustomerFactory,
  StripePaymentMethodFactory,
  StripeSubscriptionFactory,
  StripeCardPaymentMethodFactory,
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
        StripePaymentMethodFactory()
      );
      const mockStripeCustomer = StripeCustomerFactory();
      const mockSubscriptions = [StripeSubscriptionFactory()];
      const mockUid = faker.string.uuid();

      jest.spyOn(paymentMethodManager, 'determineType').mockResolvedValue({
        provider: PaymentProvider.Stripe,
        type: SubPlatPaymentMethodType.Card,
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
        type: SubPlatPaymentMethodType.Card,
        brand: mockPaymentMethod.card?.brand,
        last4: mockPaymentMethod.card?.last4,
        expMonth: mockPaymentMethod.card?.exp_month,
        expYear: mockPaymentMethod.card?.exp_year,
        hasPaymentMethodError: expect.objectContaining({}) as any,
      });
    });

    it('returns payment method information - paypal', async () => {
      const mockPaypalBillingAgreementId = faker.string.sample();
      const mockStripeCustomer = StripeCustomerFactory();
      const mockSubscriptions = [StripeSubscriptionFactory()];
      const mockUid = faker.string.uuid();

      jest.spyOn(paymentMethodManager, 'determineType').mockResolvedValue({
        provider: PaymentProvider.PayPal,
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
        type: SubPlatPaymentMethodType.PayPal,
        billingAgreementId: mockPaypalBillingAgreementId,
        hasPaymentMethodError: expect.objectContaining({}) as any,
      });
    });

    it('returns payment method information - apple_pay', async () => {
      const mockPaymentMethod = StripeResponseFactory(
        StripePaymentMethodFactory()
      );
      const mockStripeCustomer = StripeCustomerFactory();
      const mockSubscriptions = [StripeSubscriptionFactory()];
      const mockUid = faker.string.uuid();

      jest.spyOn(paymentMethodManager, 'determineType').mockResolvedValue({
        provider: PaymentProvider.Stripe,
        type: SubPlatPaymentMethodType.ApplePay,
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
        type: SubPlatPaymentMethodType.ApplePay,
        brand: mockPaymentMethod.card?.brand,
        last4: mockPaymentMethod.card?.last4,
        expMonth: mockPaymentMethod.card?.exp_month,
        expYear: mockPaymentMethod.card?.exp_year,
        hasPaymentMethodError: expect.objectContaining({}) as any,
      });
    });

    it('returns hasPaymentMethodError (expired card) in payment method information - card', async () => {
      const mockPaymentMethod = StripeResponseFactory(
        StripePaymentMethodFactory({
          card: {
            brand: 'visa',
            checks: {
              address_line1_check: null,
              address_postal_code_check: null,
              cvc_check: 'unchecked',
            },
            country: faker.location.countryCode(),
            display_brand: 'visa',
            exp_month: 12,
            exp_year: 2000,
            fingerprint: faker.string.uuid(),
            funding: 'credit',
            generated_from: {
              charge: null,
              payment_method_details: null,
              setup_attempt: null,
            },
            last4: faker.string.numeric({ length: 4 }),
            networks: {
              available: ['visa'],
              preferred: null,
            },
            three_d_secure_usage: {
              supported: true,
            },
            wallet: null,
          },
        })
      );
      const mockStripeCustomer = StripeCustomerFactory();
      const mockSubscriptions = [StripeSubscriptionFactory()];
      const mockUid = faker.string.uuid();

      jest.spyOn(paymentMethodManager, 'determineType').mockResolvedValue({
        provider: PaymentProvider.Stripe,
        type: SubPlatPaymentMethodType.Card,
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
        type: SubPlatPaymentMethodType.Card,
        brand: mockPaymentMethod.card?.brand,
        last4: mockPaymentMethod.card?.last4,
        expMonth: mockPaymentMethod.card?.exp_month,
        expYear: mockPaymentMethod.card?.exp_year,
        hasPaymentMethodError: {
          bannerType: 'error',
          bannerLinkLabel: 'Update payment method',
          bannerLinkLabelFtl:
            'error-payment-method-banner-label-update-payment-method',
          bannerMessage:
            'Add a new card or payment method to avoid interruption to your subscriptions.',
          bannerMessageFtl: 'error-payment-method-banner-message-add-new-card',
          bannerTitle: 'Expired card',
          bannerTitleFtl: 'error-payment-method-banner-title-expired-card',
          message:
            'Your card has expired. Please add a new card or payment method to avoid interruption to your subscriptions.',
          messageFtl: 'error-payment-method-expired-card',
          paymentMethodType: SubPlatPaymentMethodType.Card,
        },
      });
    });

    it('returns hasPaymentMethodError (generic issue) in payment method information - Apple Pay', async () => {
      const mockPaymentMethod = StripeResponseFactory(
        StripePaymentMethodFactory({
          card: {
            brand: 'visa',
            checks: {
              address_line1_check: null,
              address_postal_code_check: null,
              cvc_check: 'unchecked',
            },
            country: faker.location.countryCode(),
            display_brand: 'visa',
            exp_month: 12,
            exp_year: 2000,
            fingerprint: faker.string.uuid(),
            funding: 'credit',
            generated_from: {
              charge: null,
              payment_method_details: null,
              setup_attempt: null,
            },
            last4: faker.string.numeric({ length: 4 }),
            networks: {
              available: ['visa'],
              preferred: null,
            },
            three_d_secure_usage: {
              supported: true,
            },
            wallet: null,
          },
        })
      );
      const mockStripeCustomer = StripeCustomerFactory();
      const mockSubscriptions = [StripeSubscriptionFactory()];
      const mockUid = faker.string.uuid();

      jest.spyOn(paymentMethodManager, 'determineType').mockResolvedValue({
        provider: PaymentProvider.Stripe,
        type: SubPlatPaymentMethodType.ApplePay,
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
        type: SubPlatPaymentMethodType.ApplePay,
        brand: mockPaymentMethod.card?.brand,
        last4: mockPaymentMethod.card?.last4,
        expMonth: mockPaymentMethod.card?.exp_month,
        expYear: mockPaymentMethod.card?.exp_year,
        hasPaymentMethodError: {
          bannerType: 'error',
          bannerLinkLabel: 'Manage payment method',
          bannerLinkLabelFtl:
            'subscription-management-button-manage-payment-method-1',
          bannerMessage: 'There is an issue with your account.',
          bannerMessageFtl: 'error-payment-method-banner-message-account-issue',
          bannerTitle: 'Invalid payment information',
          bannerTitleFtl:
            'error-payment-method-banner-title-invalid-payment-information',
          message:
            'There is an issue with your Apple Pay account. Please resolve the issue to maintain your active subscriptions.',
          messageFtl: 'subscription-management-error-apple-pay',
          paymentMethodType: SubPlatPaymentMethodType.ApplePay,
        },
      });
    });

    it('returns hasPaymentMethodError (generic issue) in payment method information - paypal', async () => {
      const mockStripeCustomer = StripeCustomerFactory();
      const mockSubscriptions = [StripeSubscriptionFactory()];
      const mockUid = faker.string.uuid();

      jest.spyOn(paymentMethodManager, 'determineType').mockResolvedValue({
        provider: PaymentProvider.PayPal,
        type: SubPlatPaymentMethodType.PayPal,
      });
      jest
        .spyOn(paypalBillingAgreementManager, 'retrieveActiveId')
        .mockResolvedValue(undefined);

      const result = await paymentMethodManager.getDefaultPaymentMethod(
        mockStripeCustomer,
        mockSubscriptions,
        mockUid
      );
      expect(result).toEqual({
        type: SubPlatPaymentMethodType.PayPal,
        billingAgreementId: undefined,
        hasPaymentMethodError: {
          bannerType: 'error',
          bannerLinkLabel: 'Manage payment method',
          bannerLinkLabelFtl:
            'subscription-management-button-manage-payment-method-1',
          bannerMessage: 'There is an issue with your account.',
          bannerMessageFtl: 'error-payment-method-banner-message-account-issue',
          bannerTitle: 'Invalid payment information',
          bannerTitleFtl:
            'error-payment-method-banner-title-invalid-payment-information',
          message:
            'There is an issue with your PayPal account. Please resolve the issue to maintain your active subscriptions.',
          messageFtl: 'subscription-management-error-paypal-billing-agreement',
          paymentMethodType: SubPlatPaymentMethodType.PayPal,
        },
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
        StripeCardPaymentMethodFactory()
      );
      jest
        .spyOn(paymentMethodManager, 'retrieve')
        .mockResolvedValue(mockPaymentMethod);

      await expect(
        paymentMethodManager.determineType(mockCustomer)
      ).resolves.toEqual({
        provider: PaymentProvider.Stripe,
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
        provider: PaymentProvider.PayPal,
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
      jest
        .spyOn(paymentMethodManager, 'retrieve')
        .mockResolvedValue(mockPaymentMethod);

      await expect(
        paymentMethodManager.determineType(mockCustomer)
      ).resolves.toEqual({
        provider: PaymentProvider.Stripe,
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
        StripeCardPaymentMethodFactory({
          walletType: 'apple_pay',
        })
      );
      jest
        .spyOn(paymentMethodManager, 'retrieve')
        .mockResolvedValue(mockPaymentMethod);

      await expect(
        paymentMethodManager.determineType(mockCustomer)
      ).resolves.toEqual({
        provider: PaymentProvider.Stripe,
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
        StripeCardPaymentMethodFactory({
          walletType: 'google_pay',
        })
      );
      jest
        .spyOn(paymentMethodManager, 'retrieve')
        .mockResolvedValue(mockPaymentMethod);

      await expect(
        paymentMethodManager.determineType(mockCustomer)
      ).resolves.toEqual({
        provider: PaymentProvider.Stripe,
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
