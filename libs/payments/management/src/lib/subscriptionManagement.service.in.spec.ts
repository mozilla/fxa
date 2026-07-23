/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import { Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import {
  ChurnInterventionManager,
  MockChurnInterventionConfigProvider,
  TaxService,
} from '@fxa/payments/cart';
import {
  GeoDBManager,
  GeoDBManagerConfig,
  MockGeoDBNestFactory,
} from '@fxa/shared/geodb';
import {
  CurrencyManager,
  MockCurrencyConfigProvider,
} from '@fxa/payments/currency';
import {
  CustomerManager,
  InvoiceManager,
  InvoicePreviewFactory,
  PaymentMethodManager,
  PriceManager,
  SubscriptionManager,
  SetupIntentManager,
  CustomerSessionManager,
  STRIPE_CUSTOMER_METADATA,
  STRIPE_SUBSCRIPTION_METADATA,
} from '@fxa/payments/customer';
import {
  EligibilityManager,
  EligibilityService,
  LocationConfig,
  MockLocationConfigProvider,
} from '@fxa/payments/eligibility';
import {
  AppleIapClient,
  AppleIapPurchaseManager,
  GoogleIapClient,
  GoogleIapPurchaseManager,
  MockAppleIapClientConfigProvider,
  MockGoogleIapClientConfigProvider,
} from '@fxa/payments/iap';
import {
  SubscriptionManagementService,
} from '@fxa/payments/management';
import { SubPlatPaymentMethodType } from '@fxa/payments/customer';
import {
  MockPaypalClientConfigProvider,
  PaypalBillingAgreementManager,
  PayPalClient,
  PaypalCustomerManager,
  ResultPaypalCustomerFactory,
} from '@fxa/payments/paypal';
import {
  AccountCustomerManager,
  MockStripeConfigProvider,
  ResultAccountCustomerFactory,
  StripeAddressFactory,
  StripeClient,
  StripeConfig,
  StripeCustomerFactory,
  StripePaymentMethodFactory,
  StripeResponseFactory,
  StripeSetupIntentFactory,
  StripeSubscriptionFactory,
  StripeSubscriptionItemFactory,
} from '@fxa/payments/stripe';
import {
  MockStrapiClientConfigProvider,
  PageContentByPriceIdsPurchaseResultFactory,
  PageContentByPriceIdsResultUtil,
  ProductConfigurationManager,
  StrapiClient,
} from '@fxa/shared/cms';
import { ChurnInterventionService } from './churn-intervention.service';
import { MockFirestoreProvider } from '@fxa/shared/db/firestore';
import { MockAccountDatabaseNestFactory } from '@fxa/shared/db/mysql/account';
import { MockStatsDProvider } from '@fxa/shared/metrics/statsd';
import {
  CancelSubscriptionCustomerMismatch,
  CreateBillingAgreementActiveBillingAgreement,
  CreateBillingAgreementAccountCustomerMissingStripeId,
  CreateBillingAgreementCurrencyNotFound,
  CreateBillingAgreementPaypalSubscriptionNotFound,
  ResubscribeSubscriptionCustomerMismatch,
} from './subscriptionManagement.error';
import {
  MockNotifierSnsConfigProvider,
  NotifierService,
  NotifierSnsProvider,
} from '@fxa/shared/notifier';
import {
  MockProfileClientConfigProvider,
  ProfileClient,
} from '@fxa/profile/client';
import { LOGGER_PROVIDER } from '@fxa/shared/log';

jest.mock('@fxa/shared/error', () => ({
  ...jest.requireActual('@fxa/shared/error'),
  SanitizeExceptions: jest.fn(() => {
    return function (_: any, __: string, descriptor: PropertyDescriptor) {
      return descriptor;
    };
  }),
}));

describe('SubscriptionManagementService integration', () => {
  let accountCustomerManager: AccountCustomerManager;
  let appleIapPurchaseManager: AppleIapPurchaseManager;
  let churnInterventionService: ChurnInterventionService;
  let customerManager: CustomerManager;
  let googleIapPurchaseManager: GoogleIapPurchaseManager;
  let invoiceManager: InvoiceManager;
  let paymentMethodManager: PaymentMethodManager;
  let paypalBillingAgreementManager: PaypalBillingAgreementManager;
  let paypalCustomerManager: PaypalCustomerManager;
  let productConfigurationManager: ProductConfigurationManager;
  let subscriptionManager: SubscriptionManager;
  let subscriptionManagementService: SubscriptionManagementService;
  let notifierService: NotifierService;
  let profileClient: ProfileClient;
  let setupIntentManager: SetupIntentManager;
  let taxService: TaxService;

  const mockLogger = {
    error: jest.fn(),
    debug: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        Logger,
        AccountCustomerManager,
        AppleIapClient,
        AppleIapPurchaseManager,
        ChurnInterventionManager,
        ChurnInterventionService,
        CurrencyManager,
        CustomerManager,
        EligibilityManager,
        EligibilityService,
        GoogleIapClient,
        GoogleIapPurchaseManager,
        InvoiceManager,
        LocationConfig,
        MockAccountDatabaseNestFactory,
        MockAppleIapClientConfigProvider,
        MockCurrencyConfigProvider,
        MockFirestoreProvider,
        MockGoogleIapClientConfigProvider,
        MockNotifierSnsConfigProvider,
        MockPaypalClientConfigProvider,
        MockProfileClientConfigProvider,
        MockStatsDProvider,
        MockStrapiClientConfigProvider,
        MockStripeConfigProvider,
        NotifierService,
        NotifierSnsProvider,
        PaymentMethodManager,
        PaypalBillingAgreementManager,
        PayPalClient,
        PaypalCustomerManager,
        PriceManager,
        ProductConfigurationManager,
        ProfileClient,
        StrapiClient,
        StripeClient,
        StripeConfig,
        SubscriptionManager,
        SubscriptionManagementService,
        SetupIntentManager,
        CustomerSessionManager,
        CurrencyManager,
        MockCurrencyConfigProvider,
        MockChurnInterventionConfigProvider,
        MockLocationConfigProvider,
        TaxService,
        GeoDBManager,
        GeoDBManagerConfig,
        MockGeoDBNestFactory,
        {
          provide: LOGGER_PROVIDER,
          useValue: mockLogger,
        },
      ],
    }).compile();

    accountCustomerManager = moduleRef.get(AccountCustomerManager);
    appleIapPurchaseManager = moduleRef.get(AppleIapPurchaseManager);
    churnInterventionService = moduleRef.get(ChurnInterventionService);
    customerManager = moduleRef.get(CustomerManager);
    googleIapPurchaseManager = moduleRef.get(GoogleIapPurchaseManager);
    invoiceManager = moduleRef.get(InvoiceManager);
    paymentMethodManager = moduleRef.get(PaymentMethodManager);
    paypalBillingAgreementManager = moduleRef.get(
      PaypalBillingAgreementManager
    );
    paypalCustomerManager = moduleRef.get(PaypalCustomerManager);
    productConfigurationManager = moduleRef.get(ProductConfigurationManager);
    subscriptionManager = moduleRef.get(SubscriptionManager);
    subscriptionManagementService = moduleRef.get(
      SubscriptionManagementService
    );
    notifierService = moduleRef.get(NotifierService);
    profileClient = moduleRef.get(ProfileClient);
    setupIntentManager = moduleRef.get(SetupIntentManager);
    taxService = moduleRef.get(TaxService);

    jest.spyOn(profileClient, 'deleteCache').mockResolvedValue(undefined);
    jest.spyOn(notifierService, 'send').mockReturnValue(undefined);
  });

  describe('cancelSubscriptionAtPeriodEnd', () => {
    it('calls subscription.update with cancel_at_period_end=true, correct metadata', async () => {
      const mockStripeCustomer = StripeCustomerFactory();
      const mockAccountCustomer = ResultAccountCustomerFactory({
        stripeCustomerId: mockStripeCustomer.id,
      });
      const mockSubscription = StripeResponseFactory(
        StripeSubscriptionFactory({
          customer: mockStripeCustomer.id,
        })
      );

      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      jest
        .spyOn(subscriptionManager, 'retrieve')
        .mockResolvedValue(mockSubscription);
      jest
        .spyOn(subscriptionManager, 'update')
        .mockResolvedValue(mockSubscription);

      await subscriptionManagementService.cancelSubscriptionAtPeriodEnd(
        mockAccountCustomer.uid,
        mockSubscription.id
      );

      expect(subscriptionManager.update).toHaveBeenCalledWith(
        mockSubscription.id,
        {
          cancel_at_period_end: true,
          metadata: {
            [STRIPE_SUBSCRIPTION_METADATA.CancelledForCustomerAt]:
              expect.any(Number),
          },
        }
      );
      expect(profileClient.deleteCache).toHaveBeenCalledWith(
        mockAccountCustomer.uid
      );
    });

    it('throws CancelSubscriptionCustomerMismatch when UID does not own subscription', async () => {
      const mockStripeCustomer = StripeCustomerFactory();
      const mockAccountCustomer = ResultAccountCustomerFactory({
        stripeCustomerId: mockStripeCustomer.id,
      });
      const mockSubscription = StripeResponseFactory(
        StripeSubscriptionFactory({
          customer: 'cus_different_customer',
        })
      );

      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      jest
        .spyOn(subscriptionManager, 'retrieve')
        .mockResolvedValue(mockSubscription);
      jest.spyOn(subscriptionManager, 'update');

      await expect(
        subscriptionManagementService.cancelSubscriptionAtPeriodEnd(
          mockAccountCustomer.uid,
          mockSubscription.id
        )
      ).rejects.toBeInstanceOf(CancelSubscriptionCustomerMismatch);

      expect(subscriptionManager.update).not.toHaveBeenCalled();
      expect(profileClient.deleteCache).not.toHaveBeenCalled();
    });
  });

  describe('cancelSubscriptionImmediately', () => {
    it('calls subscription.cancel with immediate flag', async () => {
      const mockStripeCustomer = StripeCustomerFactory();
      const mockAccountCustomer = ResultAccountCustomerFactory({
        stripeCustomerId: mockStripeCustomer.id,
      });
      const mockSubscription = StripeResponseFactory(
        StripeSubscriptionFactory({
          customer: mockStripeCustomer.id,
        })
      );

      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      jest
        .spyOn(subscriptionManager, 'retrieve')
        .mockResolvedValue(mockSubscription);
      jest
        .spyOn(subscriptionManager, 'cancel')
        .mockResolvedValue(mockSubscription);

      await subscriptionManagementService.cancelSubscriptionImmediately(
        mockAccountCustomer.uid,
        mockSubscription.id
      );

      expect(subscriptionManager.cancel).toHaveBeenCalledWith(
        mockSubscription.id
      );
      expect(profileClient.deleteCache).toHaveBeenCalledWith(
        mockAccountCustomer.uid
      );
    });

    it('throws CancelSubscriptionCustomerMismatch when UID does not own subscription', async () => {
      const mockStripeCustomer = StripeCustomerFactory();
      const mockAccountCustomer = ResultAccountCustomerFactory({
        stripeCustomerId: mockStripeCustomer.id,
      });
      const mockSubscription = StripeResponseFactory(
        StripeSubscriptionFactory({
          customer: 'cus_different_customer',
        })
      );

      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      jest
        .spyOn(subscriptionManager, 'retrieve')
        .mockResolvedValue(mockSubscription);
      jest.spyOn(subscriptionManager, 'cancel');

      await expect(
        subscriptionManagementService.cancelSubscriptionImmediately(
          mockAccountCustomer.uid,
          mockSubscription.id
        )
      ).rejects.toBeInstanceOf(CancelSubscriptionCustomerMismatch);

      expect(subscriptionManager.cancel).not.toHaveBeenCalled();
      expect(profileClient.deleteCache).not.toHaveBeenCalled();
    });
  });

  describe('resubscribeSubscription', () => {
    it('removes cancel_at_period_end, subscription returns to active', async () => {
      const mockStripeCustomer = StripeCustomerFactory();
      const mockAccountCustomer = ResultAccountCustomerFactory({
        stripeCustomerId: mockStripeCustomer.id,
      });
      const mockSubscription = StripeResponseFactory(
        StripeSubscriptionFactory({
          customer: mockStripeCustomer.id,
          cancel_at_period_end: true,
        })
      );

      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      jest
        .spyOn(subscriptionManager, 'retrieve')
        .mockResolvedValue(mockSubscription);
      jest
        .spyOn(subscriptionManager, 'update')
        .mockResolvedValue(mockSubscription);

      await subscriptionManagementService.resubscribeSubscription(
        mockAccountCustomer.uid,
        mockSubscription.id
      );

      expect(subscriptionManager.update).toHaveBeenCalledWith(
        mockSubscription.id,
        {
          cancel_at_period_end: false,
          metadata: {
            [STRIPE_SUBSCRIPTION_METADATA.CancelledForCustomerAt]: '',
          },
        }
      );
      expect(profileClient.deleteCache).toHaveBeenCalledWith(
        mockAccountCustomer.uid
      );
    });

    it('throws ResubscribeSubscriptionCustomerMismatch when UID does not own subscription', async () => {
      const mockStripeCustomer = StripeCustomerFactory();
      const mockAccountCustomer = ResultAccountCustomerFactory({
        stripeCustomerId: mockStripeCustomer.id,
      });
      const mockSubscription = StripeResponseFactory(
        StripeSubscriptionFactory({
          customer: 'cus_different_customer',
        })
      );

      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      jest
        .spyOn(subscriptionManager, 'retrieve')
        .mockResolvedValue(mockSubscription);
      jest.spyOn(subscriptionManager, 'update');

      await expect(
        subscriptionManagementService.resubscribeSubscription(
          mockAccountCustomer.uid,
          mockSubscription.id
        )
      ).rejects.toBeInstanceOf(ResubscribeSubscriptionCustomerMismatch);

      expect(subscriptionManager.update).not.toHaveBeenCalled();
      expect(profileClient.deleteCache).not.toHaveBeenCalled();
    });
  });

  describe('cancel → resubscribe round-trip', () => {
    it('cancel then resubscribe → subscription metadata correct at each step', async () => {
      const mockStripeCustomer = StripeCustomerFactory();
      const mockAccountCustomer = ResultAccountCustomerFactory({
        stripeCustomerId: mockStripeCustomer.id,
      });
      const mockSubscription = StripeResponseFactory(
        StripeSubscriptionFactory({
          customer: mockStripeCustomer.id,
        })
      );

      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      jest
        .spyOn(subscriptionManager, 'retrieve')
        .mockResolvedValue(mockSubscription);
      jest
        .spyOn(subscriptionManager, 'update')
        .mockResolvedValue(mockSubscription);

      // Step 1: Cancel at period end
      await subscriptionManagementService.cancelSubscriptionAtPeriodEnd(
        mockAccountCustomer.uid,
        mockSubscription.id
      );

      expect(subscriptionManager.update).toHaveBeenCalledWith(
        mockSubscription.id,
        {
          cancel_at_period_end: true,
          metadata: {
            [STRIPE_SUBSCRIPTION_METADATA.CancelledForCustomerAt]:
              expect.any(Number),
          },
        }
      );

      // Step 2: Resubscribe
      await subscriptionManagementService.resubscribeSubscription(
        mockAccountCustomer.uid,
        mockSubscription.id
      );

      expect(subscriptionManager.update).toHaveBeenCalledWith(
        mockSubscription.id,
        {
          cancel_at_period_end: false,
          metadata: {
            [STRIPE_SUBSCRIPTION_METADATA.CancelledForCustomerAt]: '',
          },
        }
      );

      expect(profileClient.deleteCache).toHaveBeenCalledTimes(2);
    });
  });

  describe('updateStripePaymentDetails', () => {
    const mockIp = '127.0.0.1';

    const customerWithShipping = () =>
      StripeResponseFactory(
        StripeCustomerFactory({
          shipping: {
            name: 'test',
            address: StripeAddressFactory({
              country: 'US',
              postal_code: '10001',
            }),
            phone: null,
          },
        })
      );

    beforeEach(() => {
      jest
        .spyOn(customerManager, 'retrieve')
        .mockResolvedValue(customerWithShipping());
    });

    it('updates default payment method on customer, new payment method attached', async () => {
      const mockPaymentMethod = StripeResponseFactory(
        StripePaymentMethodFactory()
      );
      const mockCustomer = StripeResponseFactory(
        StripeCustomerFactory({
          currency: faker.finance.currencyCode().toLowerCase(),
          invoice_settings: {
            custom_fields: null,
            default_payment_method: mockPaymentMethod.id,
            footer: null,
            rendering_options: null,
          },
        })
      );
      const mockAccountCustomer = ResultAccountCustomerFactory({
        stripeCustomerId: mockCustomer.id,
      });
      const mockSetupIntent = StripeResponseFactory(
        StripeSetupIntentFactory({
          customer: mockCustomer.id,
          payment_method: mockPaymentMethod.id,
          status: 'succeeded',
        })
      );

      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      jest
        .spyOn(setupIntentManager, 'createAndConfirm')
        .mockResolvedValue(mockSetupIntent);
      jest
        .spyOn(paymentMethodManager, 'retrieve')
        .mockResolvedValue(mockPaymentMethod);
      jest.spyOn(customerManager, 'update').mockResolvedValue(mockCustomer);

      const result =
        await subscriptionManagementService.updateStripePaymentDetails(
          mockAccountCustomer.uid,
          'tok_confirmation_123',
          mockIp
        );

      expect(result).toEqual({
        id: mockSetupIntent.id,
        clientSecret: mockSetupIntent.client_secret,
        status: mockSetupIntent.status,
      });
      expect(customerManager.update).toHaveBeenCalledWith(
        mockSetupIntent.customer,
        {
          invoice_settings: {
            default_payment_method: mockSetupIntent.payment_method,
          },
          name: mockPaymentMethod.billing_details.name ?? undefined,
        }
      );
    });

    it('validates tax address from confirmation token', async () => {
      const mockPaymentMethod = StripeResponseFactory(
        StripePaymentMethodFactory()
      );
      const mockCustomerWithoutShipping = StripeResponseFactory(
        StripeCustomerFactory({ shipping: null })
      );
      const mockAccountCustomer = ResultAccountCustomerFactory({
        stripeCustomerId: mockCustomerWithoutShipping.id,
      });
      const mockSetupIntent = StripeResponseFactory(
        StripeSetupIntentFactory({
          customer: mockCustomerWithoutShipping.id,
          payment_method: mockPaymentMethod.id,
          status: 'succeeded',
        })
      );
      const resolvedTaxAddress = {
        countryCode: 'CA',
        postalCode: 'K1A 0B1',
      };

      jest
        .spyOn(customerManager, 'retrieve')
        .mockResolvedValue(mockCustomerWithoutShipping);
      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      jest
        .spyOn(taxService, 'getTaxAddress')
        .mockResolvedValue(resolvedTaxAddress);
      jest
        .spyOn(setupIntentManager, 'createAndConfirm')
        .mockResolvedValue(mockSetupIntent);
      jest
        .spyOn(paymentMethodManager, 'retrieve')
        .mockResolvedValue(mockPaymentMethod);
      jest
        .spyOn(customerManager, 'update')
        .mockResolvedValue(mockCustomerWithoutShipping);

      await subscriptionManagementService.updateStripePaymentDetails(
        mockAccountCustomer.uid,
        'tok_confirmation_123',
        mockIp
      );

      expect(taxService.getTaxAddress).toHaveBeenCalledWith(
        mockIp,
        mockAccountCustomer.uid
      );
      expect(customerManager.update).toHaveBeenCalledWith(
        mockCustomerWithoutShipping.id,
        {
          shipping: {
            name: mockCustomerWithoutShipping.email || '',
            address: {
              country: resolvedTaxAddress.countryCode,
              postal_code: resolvedTaxAddress.postalCode,
            },
          },
        }
      );
    });

    it('throws PaymentMethodUpdateFailedError when SetupIntent fails', async () => {
      const mockCustomer = StripeResponseFactory(
        StripeCustomerFactory({
          currency: faker.finance.currencyCode().toLowerCase(),
        })
      );
      const mockAccountCustomer = ResultAccountCustomerFactory({
        stripeCustomerId: mockCustomer.id,
      });

      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      jest.spyOn(setupIntentManager, 'createAndConfirm').mockRejectedValue({
        setup_intent: {
          status: 'requires_payment_method',
          last_setup_error: {
            code: 'processing_error',
            decline_code: undefined,
          },
        },
      });

      await expect(
        subscriptionManagementService.updateStripePaymentDetails(
          mockAccountCustomer.uid,
          'tok_confirmation_123',
          mockIp
        )
      ).rejects.toThrow();
    });
  });

  describe('setDefaultStripePaymentDetails', () => {
    const mockIp = '127.0.0.1';

    const customerWithShipping = () =>
      StripeResponseFactory(
        StripeCustomerFactory({
          shipping: {
            name: 'test',
            address: StripeAddressFactory({
              country: 'US',
              postal_code: '10001',
            }),
            phone: null,
          },
        })
      );

    beforeEach(() => {
      jest
        .spyOn(customerManager, 'retrieve')
        .mockResolvedValue(customerWithShipping());
    });

    it('sets payment method as default on customer', async () => {
      const mockAccountCustomer = ResultAccountCustomerFactory();
      const mockCustomer = StripeResponseFactory(StripeCustomerFactory());
      const mockPaymentMethodId = `pm_${faker.string.alphanumeric(24)}`;

      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      jest.spyOn(customerManager, 'update').mockResolvedValue(mockCustomer);

      await subscriptionManagementService.setDefaultStripePaymentDetails(
        mockAccountCustomer.uid,
        mockPaymentMethodId,
        mockIp
      );

      expect(customerManager.update).toHaveBeenCalledWith(
        mockAccountCustomer.stripeCustomerId,
        {
          invoice_settings: {
            default_payment_method: mockPaymentMethodId,
          },
        }
      );
    });

    it('validates tax address on payment method', async () => {
      const mockCustomerWithoutShipping = StripeResponseFactory(
        StripeCustomerFactory({ shipping: null })
      );
      const mockAccountCustomer = ResultAccountCustomerFactory({
        stripeCustomerId: mockCustomerWithoutShipping.id,
      });
      const resolvedTaxAddress = {
        countryCode: 'DE',
        postalCode: '10115',
      };
      const mockPaymentMethodId = `pm_${faker.string.alphanumeric(24)}`;

      jest
        .spyOn(customerManager, 'retrieve')
        .mockResolvedValue(mockCustomerWithoutShipping);
      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      jest
        .spyOn(taxService, 'getTaxAddress')
        .mockResolvedValue(resolvedTaxAddress);
      jest
        .spyOn(customerManager, 'update')
        .mockResolvedValue(mockCustomerWithoutShipping);

      await subscriptionManagementService.setDefaultStripePaymentDetails(
        mockAccountCustomer.uid,
        mockPaymentMethodId,
        mockIp
      );

      expect(taxService.getTaxAddress).toHaveBeenCalledWith(
        mockIp,
        mockAccountCustomer.uid
      );
      expect(customerManager.update).toHaveBeenNthCalledWith(
        1,
        mockCustomerWithoutShipping.id,
        {
          shipping: {
            name: mockCustomerWithoutShipping.email || '',
            address: {
              country: resolvedTaxAddress.countryCode,
              postal_code: resolvedTaxAddress.postalCode,
            },
          },
        }
      );
      expect(customerManager.update).toHaveBeenNthCalledWith(
        2,
        mockCustomerWithoutShipping.id,
        {
          invoice_settings: {
            default_payment_method: mockPaymentMethodId,
          },
        }
      );
    });
  });

  describe('getPageContent — no active subscriptions', () => {
    it('returns empty subscriptions when customer has no Stripe subscriptions or IAP purchases', async () => {
      const mockUid = faker.string.uuid();
      const mockAccountCustomer = ResultAccountCustomerFactory({
        stripeCustomerId: null,
      });

      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      jest
        .spyOn(appleIapPurchaseManager, 'getForUser')
        .mockResolvedValue([]);
      jest
        .spyOn(googleIapPurchaseManager, 'getForUser')
        .mockResolvedValue([]);

      const result =
        await subscriptionManagementService.getPageContent(mockUid);

      expect(result.subscriptions).toEqual([]);
      expect(result.trialSubscriptions).toEqual([]);
      expect(result.appleIapSubscriptions).toEqual([]);
      expect(result.googleIapSubscriptions).toEqual([]);
      expect(result.defaultPaymentMethod).toBeUndefined();
      expect(result.isStripeCustomer).toBe(false);
    });

    it('returns the full page content shape expected by the manage page component', async () => {
      const mockUid = faker.string.uuid();
      const mockAccountCustomer = ResultAccountCustomerFactory({
        stripeCustomerId: null,
      });

      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      jest
        .spyOn(appleIapPurchaseManager, 'getForUser')
        .mockResolvedValue([]);
      jest
        .spyOn(googleIapPurchaseManager, 'getForUser')
        .mockResolvedValue([]);

      const result =
        await subscriptionManagementService.getPageContent(mockUid);

      // Verify the full shape: the manage page destructures all these keys
      expect(result).toEqual({
        accountCreditBalance: expect.objectContaining({
          balance: expect.any(Number),
          currency: null,
        }),
        appleIapSubscriptions: [],
        defaultPaymentMethod: undefined,
        googleIapSubscriptions: [],
        isStripeCustomer: false,
        subscriptions: [],
        trialSubscriptions: [],
      });
    });
  });

  describe('getPageContent — Stripe customer with no active subscriptions', () => {
    it('returns empty subscriptions but isStripeCustomer=true and payment method when customer exists with no subs', async () => {
      const mockUid = faker.string.uuid();
      const mockStripeCustomer = StripeResponseFactory(
        StripeCustomerFactory({ currency: 'usd' })
      );
      const mockAccountCustomer = ResultAccountCustomerFactory({
        stripeCustomerId: mockStripeCustomer.id,
      });
      const mockPaymentMethodInfo = {
        type: SubPlatPaymentMethodType.Card,
        brand: 'visa',
        last4: '4242',
        expMonth: 12,
        expYear: 2030,
        hasPaymentMethodError: undefined,
      };
      const mockProductMap = {
        purchaseForPriceId: jest.fn(),
      };

      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      jest
        .spyOn(customerManager, 'retrieve')
        .mockResolvedValue(mockStripeCustomer);
      jest
        .spyOn(subscriptionManager, 'listForCustomer')
        .mockResolvedValue([]);
      jest
        .spyOn(paymentMethodManager, 'getDefaultPaymentMethod')
        .mockResolvedValue(mockPaymentMethodInfo);
      jest
        .spyOn(productConfigurationManager, 'getPageContentByPriceIds')
        .mockResolvedValue(
          mockProductMap as unknown as PageContentByPriceIdsResultUtil
        );
      jest
        .spyOn(appleIapPurchaseManager, 'getForUser')
        .mockResolvedValue([]);
      jest
        .spyOn(googleIapPurchaseManager, 'getForUser')
        .mockResolvedValue([]);

      const result =
        await subscriptionManagementService.getPageContent(mockUid);

      expect(result.subscriptions).toEqual([]);
      expect(result.trialSubscriptions).toEqual([]);
      expect(result.appleIapSubscriptions).toEqual([]);
      expect(result.googleIapSubscriptions).toEqual([]);
      expect(result.isStripeCustomer).toBe(true);
      expect(result.defaultPaymentMethod).toEqual(mockPaymentMethodInfo);
    });
  });

  describe('getPageContent — with active subscriptions', () => {
    it('returns subscriptions in the subscriptions array when customer has active Stripe subs', async () => {
      const mockUid = faker.string.uuid();
      const mockStripeCustomer = StripeResponseFactory(
        StripeCustomerFactory({ currency: 'usd' })
      );
      const mockAccountCustomer = ResultAccountCustomerFactory({
        stripeCustomerId: mockStripeCustomer.id,
      });
      const mockSubscription = StripeSubscriptionFactory({
        status: 'active',
      });
      const mockPaymentMethodInfo = {
        type: SubPlatPaymentMethodType.Card,
        brand: 'visa',
        last4: '4242',
        expMonth: 12,
        expYear: 2030,
        hasPaymentMethodError: undefined,
      };
      const mockProductMap = {
        purchaseForPriceId: jest.fn(),
      };
      mockProductMap.purchaseForPriceId.mockReturnValue(
        PageContentByPriceIdsPurchaseResultFactory({
          purchaseDetails: {
            productName: 'Mozilla VPN',
            webIcon: 'https://example.com/icon.png',
            localizations: [
              {
                productName: 'Mozilla VPN',
                webIcon: 'https://example.com/icon.png',
              },
            ],
          },
        })
      );

      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      jest
        .spyOn(customerManager, 'retrieve')
        .mockResolvedValue(mockStripeCustomer);
      jest
        .spyOn(subscriptionManager, 'listForCustomer')
        .mockResolvedValue([mockSubscription]);
      jest
        .spyOn(paymentMethodManager, 'getDefaultPaymentMethod')
        .mockResolvedValue(mockPaymentMethodInfo);
      jest
        .spyOn(productConfigurationManager, 'getPageContentByPriceIds')
        .mockResolvedValue(
          mockProductMap as unknown as PageContentByPriceIdsResultUtil
        );
      jest
        .spyOn(invoiceManager, 'preview')
        .mockResolvedValue(InvoicePreviewFactory());
      jest
        .spyOn(invoiceManager, 'previewUpcomingSubscription')
        .mockResolvedValue(InvoicePreviewFactory());
      jest
        .spyOn(churnInterventionService, 'determineStaySubscribedEligibility')
        .mockResolvedValue({
          isEligible: false,
          reason: 'feature_disabled',
          cmsChurnInterventionEntry: null,
          cmsOfferingContent: null,
        });
      jest
        .spyOn(churnInterventionService, 'determineCancellationIntervention')
        .mockResolvedValue({
          cancelChurnInterventionType: 'none',
          reason: 'feature_disabled',
          cmsOfferContent: null,
        });
      jest
        .spyOn(appleIapPurchaseManager, 'getForUser')
        .mockResolvedValue([]);
      jest
        .spyOn(googleIapPurchaseManager, 'getForUser')
        .mockResolvedValue([]);

      const result =
        await subscriptionManagementService.getPageContent(mockUid);

      expect(result.subscriptions).toHaveLength(1);
      expect(result.subscriptions[0].productName).toBe('Mozilla VPN');
      expect(result.isStripeCustomer).toBe(true);
      expect(result.defaultPaymentMethod).toEqual(mockPaymentMethodInfo);
    });
  });

  describe('createPaypalBillingAgreementId', () => {
    const mockToken = 'EC-1234567890';
    const mockBillingAgreementId = 'B-1234567890';

    it('creates billing agreement, stores ID in Stripe metadata, and notifies profile', async () => {
      const mockStripeCustomer = StripeResponseFactory(
        StripeCustomerFactory({ currency: 'usd' })
      );
      const mockAccountCustomer = ResultAccountCustomerFactory({
        stripeCustomerId: mockStripeCustomer.id,
      });
      const mockSubscription = StripeSubscriptionFactory({
        customer: mockStripeCustomer.id,
        collection_method: 'send_invoice',
      });

      jest
        .spyOn(paypalBillingAgreementManager, 'retrieveActiveId')
        .mockResolvedValue(undefined);
      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      jest
        .spyOn(paypalCustomerManager, 'fetchPaypalCustomersByUid')
        .mockResolvedValue([]);
      jest
        .spyOn(customerManager, 'retrieve')
        .mockResolvedValue(mockStripeCustomer);
      jest
        .spyOn(customerManager, 'getDefaultPaymentMethod')
        .mockResolvedValue(undefined);
      jest
        .spyOn(subscriptionManager, 'listForCustomer')
        .mockResolvedValue([mockSubscription]);
      jest
        .spyOn(paypalCustomerManager, 'deletePaypalCustomersByUid')
        .mockResolvedValue(BigInt(0));
      jest
        .spyOn(paypalBillingAgreementManager, 'create')
        .mockResolvedValue(mockBillingAgreementId);
      jest
        .spyOn(customerManager, 'update')
        .mockResolvedValue(mockStripeCustomer);

      await subscriptionManagementService.createPaypalBillingAgreementId(
        mockAccountCustomer.uid,
        mockToken
      );

      expect(paypalBillingAgreementManager.create).toHaveBeenCalledWith(
        mockAccountCustomer.uid,
        mockToken
      );
      expect(customerManager.update).toHaveBeenCalledWith(
        mockStripeCustomer.id,
        {
          metadata: {
            [STRIPE_CUSTOMER_METADATA.PaypalAgreement]: mockBillingAgreementId,
          },
        }
      );
      expect(profileClient.deleteCache).toHaveBeenCalledWith(
        mockAccountCustomer.uid
      );
    });

    it('deletes existing PayPal customer records before creating new agreement', async () => {
      const mockStripeCustomer = StripeResponseFactory(
        StripeCustomerFactory({ currency: 'usd' })
      );
      const mockAccountCustomer = ResultAccountCustomerFactory({
        stripeCustomerId: mockStripeCustomer.id,
      });
      const mockOldPaypalCustomer = ResultPaypalCustomerFactory({
        uid: mockAccountCustomer.uid,
        status: 'Cancelled',
        endedAt: 1700000000000,
      });
      const mockSubscription = StripeSubscriptionFactory({
        customer: mockStripeCustomer.id,
        collection_method: 'send_invoice',
      });

      jest
        .spyOn(paypalBillingAgreementManager, 'retrieveActiveId')
        .mockResolvedValue(undefined);
      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      jest
        .spyOn(paypalCustomerManager, 'fetchPaypalCustomersByUid')
        .mockResolvedValue([mockOldPaypalCustomer]);
      jest
        .spyOn(customerManager, 'retrieve')
        .mockResolvedValue(mockStripeCustomer);
      jest
        .spyOn(customerManager, 'getDefaultPaymentMethod')
        .mockResolvedValue(undefined);
      jest
        .spyOn(subscriptionManager, 'listForCustomer')
        .mockResolvedValue([mockSubscription]);
      jest
        .spyOn(paypalCustomerManager, 'deletePaypalCustomersByUid')
        .mockResolvedValue(BigInt(1));
      jest
        .spyOn(paypalBillingAgreementManager, 'create')
        .mockResolvedValue(mockBillingAgreementId);
      jest
        .spyOn(customerManager, 'update')
        .mockResolvedValue(mockStripeCustomer);

      await subscriptionManagementService.createPaypalBillingAgreementId(
        mockAccountCustomer.uid,
        mockToken
      );

      expect(
        paypalCustomerManager.deletePaypalCustomersByUid
      ).toHaveBeenCalledWith(mockAccountCustomer.uid);
      expect(paypalBillingAgreementManager.create).toHaveBeenCalledWith(
        mockAccountCustomer.uid,
        mockToken
      );
    });

    it('throws CreateBillingAgreementActiveBillingAgreement when user already has active agreement', async () => {
      const mockUid = faker.string.uuid();

      jest
        .spyOn(paypalBillingAgreementManager, 'retrieveActiveId')
        .mockResolvedValue('B-existing-agreement');
      const createSpy = jest.spyOn(paypalBillingAgreementManager, 'create');

      await expect(
        subscriptionManagementService.createPaypalBillingAgreementId(
          mockUid,
          mockToken
        )
      ).rejects.toBeInstanceOf(CreateBillingAgreementActiveBillingAgreement);

      expect(createSpy).not.toHaveBeenCalled();
      expect(profileClient.deleteCache).not.toHaveBeenCalled();
    });

    it('throws CreateBillingAgreementAccountCustomerMissingStripeId when no Stripe customer', async () => {
      const mockAccountCustomer = ResultAccountCustomerFactory({
        stripeCustomerId: null,
      });

      jest
        .spyOn(paypalBillingAgreementManager, 'retrieveActiveId')
        .mockResolvedValue(undefined);
      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      const createSpy = jest.spyOn(paypalBillingAgreementManager, 'create');

      await expect(
        subscriptionManagementService.createPaypalBillingAgreementId(
          mockAccountCustomer.uid,
          mockToken
        )
      ).rejects.toBeInstanceOf(
        CreateBillingAgreementAccountCustomerMissingStripeId
      );

      expect(createSpy).not.toHaveBeenCalled();
      expect(profileClient.deleteCache).not.toHaveBeenCalled();
    });

    it('throws CreateBillingAgreementCurrencyNotFound when currency cannot be determined', async () => {
      const mockStripeCustomer = StripeResponseFactory(StripeCustomerFactory());
      const mockAccountCustomer = ResultAccountCustomerFactory({
        stripeCustomerId: mockStripeCustomer.id,
      });

      jest
        .spyOn(paypalBillingAgreementManager, 'retrieveActiveId')
        .mockResolvedValue(undefined);
      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      jest
        .spyOn(paypalCustomerManager, 'fetchPaypalCustomersByUid')
        .mockResolvedValue([]);
      jest
        .spyOn(customerManager, 'retrieve')
        .mockResolvedValue(mockStripeCustomer);
      jest
        .spyOn(customerManager, 'getDefaultPaymentMethod')
        .mockResolvedValue(undefined);
      const createSpy = jest.spyOn(paypalBillingAgreementManager, 'create');

      await expect(
        subscriptionManagementService.createPaypalBillingAgreementId(
          mockAccountCustomer.uid,
          mockToken
        )
      ).rejects.toBeInstanceOf(CreateBillingAgreementCurrencyNotFound);

      expect(createSpy).not.toHaveBeenCalled();
      expect(profileClient.deleteCache).not.toHaveBeenCalled();
    });

    it('throws CreateBillingAgreementPaypalSubscriptionNotFound when no send_invoice subscription exists', async () => {
      const mockStripeCustomer = StripeResponseFactory(
        StripeCustomerFactory({ currency: 'usd' })
      );
      const mockAccountCustomer = ResultAccountCustomerFactory({
        stripeCustomerId: mockStripeCustomer.id,
      });
      const mockCardSubscription = StripeSubscriptionFactory({
        customer: mockStripeCustomer.id,
        collection_method: 'charge_automatically',
      });

      jest
        .spyOn(paypalBillingAgreementManager, 'retrieveActiveId')
        .mockResolvedValue(undefined);
      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      jest
        .spyOn(paypalCustomerManager, 'fetchPaypalCustomersByUid')
        .mockResolvedValue([]);
      jest
        .spyOn(customerManager, 'retrieve')
        .mockResolvedValue(mockStripeCustomer);
      jest
        .spyOn(customerManager, 'getDefaultPaymentMethod')
        .mockResolvedValue(undefined);
      jest
        .spyOn(subscriptionManager, 'listForCustomer')
        .mockResolvedValue([mockCardSubscription]);
      const createSpy = jest.spyOn(paypalBillingAgreementManager, 'create');

      await expect(
        subscriptionManagementService.createPaypalBillingAgreementId(
          mockAccountCustomer.uid,
          mockToken
        )
      ).rejects.toBeInstanceOf(
        CreateBillingAgreementPaypalSubscriptionNotFound
      );

      expect(createSpy).not.toHaveBeenCalled();
      expect(profileClient.deleteCache).not.toHaveBeenCalled();
    });

    it('cancels newly created billing agreement on error after creation', async () => {
      const mockStripeCustomer = StripeResponseFactory(
        StripeCustomerFactory({ currency: 'usd' })
      );
      const mockAccountCustomer = ResultAccountCustomerFactory({
        stripeCustomerId: mockStripeCustomer.id,
      });
      const mockSubscription = StripeSubscriptionFactory({
        customer: mockStripeCustomer.id,
        collection_method: 'send_invoice',
      });

      jest
        .spyOn(paypalBillingAgreementManager, 'retrieveActiveId')
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce(undefined);
      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      jest
        .spyOn(paypalCustomerManager, 'fetchPaypalCustomersByUid')
        .mockResolvedValue([]);
      jest
        .spyOn(customerManager, 'retrieve')
        .mockResolvedValue(mockStripeCustomer);
      jest
        .spyOn(customerManager, 'getDefaultPaymentMethod')
        .mockResolvedValue(undefined);
      jest
        .spyOn(subscriptionManager, 'listForCustomer')
        .mockResolvedValue([mockSubscription]);
      jest
        .spyOn(paypalCustomerManager, 'deletePaypalCustomersByUid')
        .mockResolvedValue(BigInt(0));
      jest
        .spyOn(paypalBillingAgreementManager, 'create')
        .mockResolvedValue(mockBillingAgreementId);
      jest
        .spyOn(customerManager, 'update')
        .mockRejectedValue(new Error('Stripe update failed'));
      jest
        .spyOn(paypalBillingAgreementManager, 'cancel')
        .mockResolvedValue(undefined);

      await expect(
        subscriptionManagementService.createPaypalBillingAgreementId(
          mockAccountCustomer.uid,
          mockToken
        )
      ).rejects.toThrow('Stripe update failed');

      expect(paypalBillingAgreementManager.cancel).toHaveBeenCalledWith(
        mockBillingAgreementId
      );
    });
  });

  describe('updateStripePaymentDetails — new card last4 visible', () => {
    it('sets the new payment method as default so last4 reflects updated card', async () => {
      const mockIp = '127.0.0.1';
      const newLast4 = '4242';
      const mockPaymentMethod = StripeResponseFactory(
        StripePaymentMethodFactory({
          card: {
            brand: 'visa',
            last4: newLast4,
            exp_month: 12,
            exp_year: 2030,
            country: 'US',
            funding: 'credit',
            fingerprint: faker.string.alphanumeric(16),
            generated_from: null,
            networks: null,
            three_d_secure_usage: null,
            wallet: null,
            checks: null,
            display_brand: null,
          } as any,
        })
      );
      const mockCustomer = StripeResponseFactory(
        StripeCustomerFactory({
          shipping: {
            name: 'test',
            address: StripeAddressFactory({
              country: 'US',
              postal_code: '10001',
            }),
            phone: null,
          },
        })
      );
      const mockAccountCustomer = ResultAccountCustomerFactory({
        stripeCustomerId: mockCustomer.id,
      });
      const mockSetupIntent = StripeResponseFactory(
        StripeSetupIntentFactory({
          customer: mockCustomer.id,
          payment_method: mockPaymentMethod.id,
          status: 'succeeded',
        })
      );

      jest.spyOn(customerManager, 'retrieve').mockResolvedValue(mockCustomer);
      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      jest
        .spyOn(setupIntentManager, 'createAndConfirm')
        .mockResolvedValue(mockSetupIntent);
      jest
        .spyOn(paymentMethodManager, 'retrieve')
        .mockResolvedValue(mockPaymentMethod);
      jest.spyOn(customerManager, 'update').mockResolvedValue(mockCustomer);

      await subscriptionManagementService.updateStripePaymentDetails(
        mockAccountCustomer.uid,
        'tok_confirmation_new_card',
        mockIp
      );

      // Verify the new payment method is set as default
      expect(customerManager.update).toHaveBeenCalledWith(
        mockCustomer.id,
        expect.objectContaining({
          invoice_settings: {
            default_payment_method: mockPaymentMethod.id,
          },
        })
      );

      // Verify the service retrieved the payment method to update billing details
      expect(paymentMethodManager.retrieve).toHaveBeenCalledWith(
        mockPaymentMethod.id
      );
    });
  });

  describe('getCancelFlowContent', () => {
    it('returns cancel flow data for an active subscription', async () => {
      const mockUid = faker.string.uuid();
      const mockStripeCustomer = StripeResponseFactory(
        StripeCustomerFactory({ currency: 'usd' })
      );
      const mockAccountCustomer = ResultAccountCustomerFactory({
        uid: mockUid,
        stripeCustomerId: mockStripeCustomer.id,
      });
      const mockSubscription = StripeResponseFactory(
        StripeSubscriptionFactory({
          customer: mockStripeCustomer.id,
          status: 'active',
          cancel_at_period_end: false,
          currency: 'usd',
          items: {
            object: 'list',
            data: [
              StripeSubscriptionItemFactory({
                current_period_end: 1735689600,
              }),
            ],
            has_more: false,
            url: '',
          },
        })
      );
      const mockPaymentMethodInfo = {
        type: SubPlatPaymentMethodType.Card,
        brand: 'visa',
        last4: '4242',
        expMonth: 12,
        expYear: 2030,
        hasPaymentMethodError: undefined,
      };
      const mockCmsPurchase = PageContentByPriceIdsPurchaseResultFactory();
      const mockProductMap = {
        purchaseForPriceId: jest.fn().mockReturnValue(mockCmsPurchase),
      };
      const mockUpcomingInvoice = InvoicePreviewFactory({
        subsequentAmount: 999,
        subsequentAmountExcludingTax: 900,
        subsequentTax: [{ amount: 99, inclusive: false, title: 'Tax' }],
      });

      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      jest
        .spyOn(subscriptionManager, 'retrieve')
        .mockResolvedValue(mockSubscription);
      jest
        .spyOn(customerManager, 'retrieve')
        .mockResolvedValue(mockStripeCustomer);
      jest
        .spyOn(paymentMethodManager, 'getDefaultPaymentMethod')
        .mockResolvedValue(mockPaymentMethodInfo);
      jest
        .spyOn(productConfigurationManager, 'getPageContentByPriceIds')
        .mockResolvedValue(
          mockProductMap as unknown as PageContentByPriceIdsResultUtil
        );
      jest
        .spyOn(invoiceManager, 'previewUpcomingSubscription')
        .mockResolvedValue(mockUpcomingInvoice);

      const result = await subscriptionManagementService.getCancelFlowContent(
        mockUid,
        mockSubscription.id
      );

      expect(result).toEqual({
        flowType: 'cancel',
        active: true,
        cancelAtPeriodEnd: false,
        currency: 'usd',
        currentPeriodEnd: 1735689600,
        defaultPaymentMethodType: SubPlatPaymentMethodType.Card,
        last4: '4242',
        nextInvoiceTax: 99,
        nextInvoiceTotal: 900,
        productName: expect.any(String),
        supportUrl: expect.any(String),
        webIcon: expect.any(String),
      });
    });

    it('returns not_found when subscription does not exist', async () => {
      const mockUid = faker.string.uuid();
      const mockAccountCustomer = ResultAccountCustomerFactory({
        uid: mockUid,
        stripeCustomerId: null,
      });

      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);

      const result = await subscriptionManagementService.getCancelFlowContent(
        mockUid,
        'sub_nonexistent'
      );

      expect(result).toEqual({ flowType: 'not_found' });
    });

    it('returns not_found when subscription is not active or trialing', async () => {
      const mockUid = faker.string.uuid();
      const mockStripeCustomer = StripeResponseFactory(StripeCustomerFactory());
      const mockAccountCustomer = ResultAccountCustomerFactory({
        uid: mockUid,
        stripeCustomerId: mockStripeCustomer.id,
      });
      const mockSubscription = StripeResponseFactory(
        StripeSubscriptionFactory({
          customer: mockStripeCustomer.id,
          status: 'canceled',
        })
      );

      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      jest
        .spyOn(subscriptionManager, 'retrieve')
        .mockResolvedValue(mockSubscription);

      const result = await subscriptionManagementService.getCancelFlowContent(
        mockUid,
        mockSubscription.id
      );

      expect(result).toEqual({ flowType: 'not_found' });
    });
  });

  describe('getStaySubscribedFlowContent', () => {
    it('returns stay_subscribed flow data for an active subscription', async () => {
      const mockUid = faker.string.uuid();
      const mockStripeCustomer = StripeResponseFactory(
        StripeCustomerFactory({ currency: 'usd' })
      );
      const mockAccountCustomer = ResultAccountCustomerFactory({
        uid: mockUid,
        stripeCustomerId: mockStripeCustomer.id,
      });
      const mockSubscription = StripeResponseFactory(
        StripeSubscriptionFactory({
          customer: mockStripeCustomer.id,
          status: 'active',
          cancel_at_period_end: true,
          currency: 'usd',
          items: {
            object: 'list',
            data: [
              StripeSubscriptionItemFactory({
                current_period_end: 1735689600,
              }),
            ],
            has_more: false,
            url: '',
          },
        })
      );
      const mockPaymentMethodInfo = {
        type: SubPlatPaymentMethodType.Card,
        brand: 'visa',
        last4: '4242',
        expMonth: 12,
        expYear: 2030,
        hasPaymentMethodError: undefined,
      };
      const mockCmsPurchase = PageContentByPriceIdsPurchaseResultFactory();
      const mockProductMap = {
        purchaseForPriceId: jest.fn().mockReturnValue(mockCmsPurchase),
      };
      const mockUpcomingInvoice = InvoicePreviewFactory({
        subsequentAmount: 999,
        subsequentAmountExcludingTax: 900,
        subsequentTax: [{ amount: 99, inclusive: false, title: 'Tax' }],
      });

      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      jest
        .spyOn(subscriptionManager, 'retrieve')
        .mockResolvedValue(mockSubscription);
      jest
        .spyOn(customerManager, 'retrieve')
        .mockResolvedValue(mockStripeCustomer);
      jest
        .spyOn(paymentMethodManager, 'getDefaultPaymentMethod')
        .mockResolvedValue(mockPaymentMethodInfo);
      jest
        .spyOn(productConfigurationManager, 'getPageContentByPriceIds')
        .mockResolvedValue(
          mockProductMap as unknown as PageContentByPriceIdsResultUtil
        );
      jest
        .spyOn(invoiceManager, 'previewUpcomingSubscription')
        .mockResolvedValue(mockUpcomingInvoice);

      const result =
        await subscriptionManagementService.getStaySubscribedFlowContent(
          mockUid,
          mockSubscription.id
        );

      expect(result).toEqual({
        flowType: 'stay_subscribed',
        active: true,
        cancelAtPeriodEnd: true,
        currency: 'usd',
        currentPeriodEnd: 1735689600,
        defaultPaymentMethodType: SubPlatPaymentMethodType.Card,
        last4: '4242',
        nextInvoiceTax: 99,
        nextInvoiceTotal: 900,
        productName: expect.any(String),
        webIcon: expect.any(String),
      });
    });

    it('returns not_found when subscription does not exist', async () => {
      const mockUid = faker.string.uuid();
      const mockAccountCustomer = ResultAccountCustomerFactory({
        uid: mockUid,
        stripeCustomerId: null,
      });

      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);

      const result =
        await subscriptionManagementService.getStaySubscribedFlowContent(
          mockUid,
          'sub_nonexistent'
        );

      expect(result).toEqual({ flowType: 'not_found' });
    });

    it('returns not_found when subscription is not active or trialing', async () => {
      const mockUid = faker.string.uuid();
      const mockStripeCustomer = StripeResponseFactory(StripeCustomerFactory());
      const mockAccountCustomer = ResultAccountCustomerFactory({
        uid: mockUid,
        stripeCustomerId: mockStripeCustomer.id,
      });
      const mockSubscription = StripeResponseFactory(
        StripeSubscriptionFactory({
          customer: mockStripeCustomer.id,
          status: 'canceled',
        })
      );

      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      jest
        .spyOn(subscriptionManager, 'retrieve')
        .mockResolvedValue(mockSubscription);

      const result =
        await subscriptionManagementService.getStaySubscribedFlowContent(
          mockUid,
          mockSubscription.id
        );

      expect(result).toEqual({ flowType: 'not_found' });
    });
  });
});
