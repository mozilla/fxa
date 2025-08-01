/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import { Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import {
  CurrencyManager,
  MockCurrencyConfigProvider,
} from '@fxa/payments/currency';
import {
  determinePaymentMethodType,
  CustomerManager,
  InvoiceManager,
  PaymentMethodManager,
  PriceManager,
  SubscriptionManager,
  SetupIntentManager,
  CustomerSessionManager,
} from '@fxa/payments/customer';
import {
  SubscriptionContentFactory,
  SubscriptionManagementService,
} from '@fxa/payments/management';
import {
  MockPaypalClientConfigProvider,
  PaypalBillingAgreementManager,
  PayPalClient,
  PaypalCustomerManager,
} from '@fxa/payments/paypal';
import {
  AccountCustomerManager,
  MockStripeConfigProvider,
  ResultAccountCustomerFactory,
  StripeApiListFactory,
  StripeClient,
  StripeConfig,
  StripeCustomerFactory,
  StripeCustomerSessionFactory,
  StripeInvoiceFactory,
  StripePaymentMethodFactory,
  StripePriceFactory,
  StripeResponseFactory,
  StripeSetupIntentFactory,
  StripeSubscriptionFactory,
  StripeSubscriptionItemFactory,
} from '@fxa/payments/stripe';
import {
  MockStrapiClientConfigProvider,
  ProductConfigurationManager,
  ProductNameByPriceIdsResultUtil,
  StrapiClient,
} from '@fxa/shared/cms';
import { MockFirestoreProvider } from '@fxa/shared/db/firestore';
import { MockAccountDatabaseNestFactory } from '@fxa/shared/db/mysql/account';
import { MockStatsDProvider } from '@fxa/shared/metrics/statsd';
import {
  CurrencyForCustomerNotFoundError,
  GetAccountCustomerMissingStripeId,
  SetDefaultPaymentAccountCustomerMissingStripeId,
  SetupIntentInvalidStatusError,
  SetupIntentMissingCustomerError,
  SetupIntentMissingPaymentMethodError,
  SubscriptionContentMissingIntervalInformationError,
  SubscriptionContentMissingLatestInvoiceError,
  SubscriptionContentMissingLatestInvoicePreviewError,
  SubscriptionContentMissingUpcomingInvoicePreviewError,
  SubscriptionManagementCouldNotRetrieveProductNamesFromCMSError,
  UpdateAccountCustomerMissingStripeId,
} from './subscriptionManagement.error';

jest.mock('../../../customer/src/lib/util/determinePaymentMethodType');
const mockDeterminePaymentMethodType = jest.mocked(determinePaymentMethodType);

jest.mock('@fxa/shared/error', () => ({
  ...jest.requireActual('@fxa/shared/error'),
  SanitizeExceptions: jest.fn(({ allowlist = [] } = {}) => {
    return function (
      target: any,
      propertyKey: string,
      descriptor: PropertyDescriptor
    ) {
      return descriptor;
    };
  }),
}));

describe('SubscriptionManagementService', () => {
  let accountCustomerManager: AccountCustomerManager;
  let customerManager: CustomerManager;
  let paymentMethodManager: PaymentMethodManager;
  let productConfigurationManager: ProductConfigurationManager;
  let subscriptionManager: SubscriptionManager;
  let subscriptionManagementService: SubscriptionManagementService;
  let setupIntentManager: SetupIntentManager;
  let customerSessionManager: CustomerSessionManager;
  let currencyManager: CurrencyManager;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        Logger,
        AccountCustomerManager,
        CurrencyManager,
        CustomerManager,
        InvoiceManager,
        MockAccountDatabaseNestFactory,
        MockCurrencyConfigProvider,
        MockFirestoreProvider,
        MockPaypalClientConfigProvider,
        MockStatsDProvider,
        MockStrapiClientConfigProvider,
        MockStripeConfigProvider,
        PaymentMethodManager,
        PaypalBillingAgreementManager,
        PayPalClient,
        PaypalCustomerManager,
        PriceManager,
        ProductConfigurationManager,
        StrapiClient,
        StripeClient,
        StripeConfig,
        SubscriptionManager,
        SubscriptionManagementService,
        SetupIntentManager,
        CustomerSessionManager,
        CurrencyManager,
        MockCurrencyConfigProvider,
      ],
    }).compile();

    accountCustomerManager = moduleRef.get(AccountCustomerManager);
    customerManager = moduleRef.get(CustomerManager);
    paymentMethodManager = moduleRef.get(PaymentMethodManager);
    productConfigurationManager = moduleRef.get(ProductConfigurationManager);
    subscriptionManager = moduleRef.get(SubscriptionManager);
    subscriptionManagementService = moduleRef.get(
      SubscriptionManagementService
    );
    setupIntentManager = moduleRef.get(SetupIntentManager);
    customerSessionManager = moduleRef.get(CustomerSessionManager);
    currencyManager = moduleRef.get(CurrencyManager);
  });

  describe('getPageContent', () => {
    it('returns page content', async () => {
      const mockUid = faker.string.uuid();
      const mockStripeCustomer = StripeResponseFactory(
        StripeCustomerFactory({
          currency: 'usd',
        })
      );
      const mockAccountCustomer = ResultAccountCustomerFactory({
        stripeCustomerId: mockStripeCustomer.id,
      });
      const mockSubscriptions = StripeSubscriptionFactory();
      const mockPaymentMethod = StripeResponseFactory(
        StripePaymentMethodFactory({})
      );
      const mockSubscriptionContent = SubscriptionContentFactory();
      const mockPaymentMethodInformation = {
        type: mockPaymentMethod.type,
        brand: mockPaymentMethod.card?.brand,
        last4: mockPaymentMethod.card?.last4,
        expMonth: mockPaymentMethod.card?.exp_month,
        expYear: mockPaymentMethod.card?.exp_year,
      };
      const productNameByPriceIdsResultUtil =
        new ProductNameByPriceIdsResultUtil({
          purchases: [],
        });
      const mockProductName = faker.string.sample();

      mockDeterminePaymentMethodType.mockReturnValue({
        type: 'stripe',
        paymentMethodId: 'pm_id',
      });
      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      jest
        .spyOn(customerManager, 'retrieve')
        .mockResolvedValue(mockStripeCustomer);
      jest
        .spyOn(subscriptionManager, 'listForCustomer')
        .mockResolvedValue([mockSubscriptions]);
      jest
        .spyOn(paymentMethodManager, 'getDefaultPaymentMethod')
        .mockResolvedValue(mockPaymentMethodInformation);
      jest
        .spyOn(productConfigurationManager, 'getProductNameByPriceIds')
        .mockResolvedValue(productNameByPriceIdsResultUtil);
      jest
        .spyOn(productNameByPriceIdsResultUtil, 'productNameForPriceId')
        .mockReturnValue(mockProductName);
      jest
        .spyOn(subscriptionManagementService as any, 'getSubscriptionContent')
        .mockResolvedValue(mockSubscriptionContent);

      const result =
        await subscriptionManagementService.getPageContent(mockUid);

      expect(result).toEqual({
        accountCreditBalance: {
          balance: mockStripeCustomer.balance,
          currency: mockStripeCustomer.currency,
        },
        defaultPaymentMethod: mockPaymentMethodInformation,
        subscriptions: [mockSubscriptionContent],
      });
    });

    it('returns no page information - Stripe customer does not exist', async () => {
      const mockUid = faker.string.uuid();
      const mockAccountCustomer = ResultAccountCustomerFactory({
        stripeCustomerId: null,
      });

      mockDeterminePaymentMethodType.mockReturnValue(null);
      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      jest.spyOn(subscriptionManager, 'listForCustomer').mockResolvedValue([]);

      const result =
        await subscriptionManagementService.getPageContent(mockUid);

      expect(result).toEqual({
        accountCreditBalance: {
          balance: 0,
          currency: null,
        },
        defaultPaymentMethod: undefined,
        subscriptions: [],
      });
    });

    it('returns page information - Stripe customer but no payment information nor subscriptions', async () => {
      const mockUid = faker.string.uuid();
      const mockAccountCustomer = ResultAccountCustomerFactory();
      const mockStripeCustomer = StripeResponseFactory(StripeCustomerFactory());

      mockDeterminePaymentMethodType.mockReturnValue(null);
      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      jest
        .spyOn(customerManager, 'retrieve')
        .mockResolvedValue(mockStripeCustomer);
      jest.spyOn(subscriptionManager, 'listForCustomer').mockResolvedValue([]);
      jest
        .spyOn(paymentMethodManager, 'getDefaultPaymentMethod')
        .mockResolvedValueOnce(undefined);

      const result =
        await subscriptionManagementService.getPageContent(mockUid);

      expect(result).toEqual({
        accountCreditBalance: {
          balance: mockStripeCustomer.balance,
          currency: mockStripeCustomer.currency,
        },
        defaultPaymentMethod: undefined,
        subscriptions: [],
      });
    });

    it('gracefully handles if no product name returned for price id', async () => {
      const mockUid = faker.string.uuid();
      const mockAccountCustomer = ResultAccountCustomerFactory();
      const mockStripeCustomer = StripeResponseFactory(StripeCustomerFactory());
      const mockSubscriptions = StripeSubscriptionFactory();

      mockDeterminePaymentMethodType.mockReturnValue(null);
      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      jest
        .spyOn(customerManager, 'retrieve')
        .mockResolvedValue(mockStripeCustomer);
      jest
        .spyOn(subscriptionManager, 'listForCustomer')
        .mockResolvedValue([mockSubscriptions]);
      jest
        .spyOn(paymentMethodManager, 'getDefaultPaymentMethod')
        .mockResolvedValueOnce(undefined);
      jest
        .spyOn(productConfigurationManager, 'getProductNameByPriceIds')
        .mockResolvedValue(
          undefined as unknown as ProductNameByPriceIdsResultUtil
        );

      await expect(
        subscriptionManagementService.getPageContent(mockUid)
      ).rejects.toBeInstanceOf(
        SubscriptionManagementCouldNotRetrieveProductNamesFromCMSError
      );
    });

    it('sanitizes error when latest invoice is missing', async () => {
      const mockUid = faker.string.uuid();
      const mockStripeCustomer = StripeResponseFactory(
        StripeCustomerFactory({
          currency: 'usd',
        })
      );
      const mockAccountCustomer = ResultAccountCustomerFactory({
        stripeCustomerId: mockStripeCustomer.id,
      });
      const mockSubscription = StripeSubscriptionFactory({
        latest_invoice: null,
      });
      const productNameByPriceIdsResultUtil =
        new ProductNameByPriceIdsResultUtil({
          purchases: [],
        });
      const mockProductName = faker.string.sample();

      mockDeterminePaymentMethodType.mockReturnValue(null);
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
        .mockResolvedValue(undefined);
      jest
        .spyOn(productConfigurationManager, 'getProductNameByPriceIds')
        .mockResolvedValue(productNameByPriceIdsResultUtil);
      jest
        .spyOn(productNameByPriceIdsResultUtil, 'productNameForPriceId')
        .mockReturnValue(mockProductName);

      mockDeterminePaymentMethodType.mockReturnValue(null);
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
        .mockResolvedValue(undefined);
      jest
        .spyOn(subscriptionManagementService as any, 'getSubscriptionContent')
        .mockRejectedValue(
          new SubscriptionContentMissingLatestInvoiceError(mockSubscription.id)
        );

      await expect(
        subscriptionManagementService.getPageContent(mockUid)
      ).rejects.toBeInstanceOf(SubscriptionContentMissingLatestInvoiceError);
    });

    it('throws error when interval is missing', async () => {
      const mockUid = faker.string.uuid();
      const mockStripeCustomer = StripeResponseFactory(
        StripeCustomerFactory({
          currency: 'usd',
        })
      );
      const mockAccountCustomer = ResultAccountCustomerFactory({
        stripeCustomerId: mockStripeCustomer.id,
      });
      const mockPrice = StripePriceFactory({
        recurring: undefined,
      });
      const mockSubscription = StripeSubscriptionFactory({
        items: StripeApiListFactory([
          StripeSubscriptionItemFactory({
            price: mockPrice,
          }),
        ]),
        latest_invoice: null,
      });
      const productNameByPriceIdsResultUtil =
        new ProductNameByPriceIdsResultUtil({
          purchases: [],
        });
      const mockProductName = faker.string.sample();

      mockDeterminePaymentMethodType.mockReturnValue(null);
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
        .mockResolvedValue(undefined);
      jest
        .spyOn(productConfigurationManager, 'getProductNameByPriceIds')
        .mockResolvedValue(productNameByPriceIdsResultUtil);
      jest
        .spyOn(productNameByPriceIdsResultUtil, 'productNameForPriceId')
        .mockReturnValue(mockProductName);

      mockDeterminePaymentMethodType.mockReturnValue(null);
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
        .mockResolvedValue(undefined);
      jest
        .spyOn(subscriptionManagementService as any, 'getSubscriptionContent')
        .mockRejectedValue(
          new SubscriptionContentMissingIntervalInformationError(
            mockSubscription.id,
            mockPrice.id
          )
        );

      await expect(
        subscriptionManagementService.getPageContent(mockUid)
      ).rejects.toBeInstanceOf(
        SubscriptionContentMissingIntervalInformationError
      );
    });

    it('throws error when latest invoice preview is missing', async () => {
      const mockUid = faker.string.uuid();
      const mockStripeCustomer = StripeResponseFactory(
        StripeCustomerFactory({
          currency: 'usd',
        })
      );
      const mockAccountCustomer = ResultAccountCustomerFactory({
        stripeCustomerId: mockStripeCustomer.id,
      });
      const mockInvoice = StripeInvoiceFactory();
      const mockSubscription = StripeSubscriptionFactory();
      const productNameByPriceIdsResultUtil =
        new ProductNameByPriceIdsResultUtil({
          purchases: [],
        });
      const mockProductName = faker.string.sample();

      mockDeterminePaymentMethodType.mockReturnValue(null);
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
        .mockResolvedValue(undefined);
      jest
        .spyOn(productConfigurationManager, 'getProductNameByPriceIds')
        .mockResolvedValue(productNameByPriceIdsResultUtil);
      jest
        .spyOn(productNameByPriceIdsResultUtil, 'productNameForPriceId')
        .mockReturnValue(mockProductName);

      mockDeterminePaymentMethodType.mockReturnValue(null);
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
        .mockResolvedValue(undefined);
      jest
        .spyOn(subscriptionManagementService as any, 'getSubscriptionContent')
        .mockRejectedValue(
          new SubscriptionContentMissingLatestInvoicePreviewError(
            mockSubscription.id,
            mockInvoice.id
          )
        );

      await expect(
        subscriptionManagementService.getPageContent(mockUid)
      ).rejects.toBeInstanceOf(
        SubscriptionContentMissingLatestInvoicePreviewError
      );
    });

    it('throws error when upcoming invoice preview is missing', async () => {
      const mockUid = faker.string.uuid();
      const mockCurrency = faker.finance.currencyCode().toLowerCase();
      const mockStripeCustomer = StripeResponseFactory(
        StripeCustomerFactory({
          currency: mockCurrency,
        })
      );
      const mockAccountCustomer = ResultAccountCustomerFactory({
        stripeCustomerId: mockStripeCustomer.id,
      });
      const mockPrice = StripePriceFactory();
      const mockSubscription = StripeSubscriptionFactory();
      const productNameByPriceIdsResultUtil =
        new ProductNameByPriceIdsResultUtil({
          purchases: [],
        });
      const mockProductName = faker.string.sample();

      mockDeterminePaymentMethodType.mockReturnValue(null);
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
        .mockResolvedValue(undefined);
      jest
        .spyOn(productConfigurationManager, 'getProductNameByPriceIds')
        .mockResolvedValue(productNameByPriceIdsResultUtil);
      jest
        .spyOn(productNameByPriceIdsResultUtil, 'productNameForPriceId')
        .mockReturnValue(mockProductName);

      mockDeterminePaymentMethodType.mockReturnValue(null);
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
        .mockResolvedValue(undefined);
      jest
        .spyOn(subscriptionManagementService as any, 'getSubscriptionContent')
        .mockRejectedValue(
          new SubscriptionContentMissingUpcomingInvoicePreviewError(
            mockSubscription.id,
            mockPrice.id,
            mockCurrency,
            mockStripeCustomer
          )
        );

      await expect(
        subscriptionManagementService.getPageContent(mockUid)
      ).rejects.toBeInstanceOf(
        SubscriptionContentMissingUpcomingInvoicePreviewError
      );
    });
  });

  describe('getStripePaymentManagementDetails', () => {
    it('gets stripe payment management details', async () => {
      const mockCustomerId = faker.string.uuid();
      const mockCurrency = faker.finance.currencyCode().toLowerCase();
      const mockPaymentMethod = StripeResponseFactory(
        StripePaymentMethodFactory({ customer: mockCustomerId })
      );
      const mockCustomer = StripeResponseFactory(
        StripeCustomerFactory({
          id: mockCustomerId,
          currency: mockCurrency,
        })
      );
      const mockCustomerSession = StripeResponseFactory(
        StripeCustomerSessionFactory({ customer: mockCustomer.id })
      );
      const mockAccountCustomer = ResultAccountCustomerFactory({
        stripeCustomerId: mockCustomer.id,
      });

      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      jest
        .spyOn(customerSessionManager, 'createManagementSession')
        .mockResolvedValue(mockCustomerSession);
      jest
        .spyOn(customerManager, 'getDefaultPaymentMethod')
        .mockResolvedValue(mockPaymentMethod);
      jest.spyOn(customerManager, 'retrieve').mockResolvedValue(mockCustomer);
      jest
        .spyOn(currencyManager, 'getCurrencyForCountry')
        .mockReturnValue(mockCurrency);

      const result =
        await subscriptionManagementService.getStripePaymentManagementDetails(
          mockAccountCustomer.uid
        );

      expect(result).toEqual({
        clientSecret: mockCustomerSession.client_secret,
        customer: mockCustomer.id,
        defaultPaymentMethodId: mockPaymentMethod.id,
        currency: mockCustomer.currency,
      });
    });

    it('throws GetAccountCustomerMissingStripeId for missing stripe customer id', async () => {
      const mockAccountCustomer = ResultAccountCustomerFactory({
        stripeCustomerId: null,
      });
      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);

      await expect(
        subscriptionManagementService.getStripePaymentManagementDetails(
          mockAccountCustomer.uid
        )
      ).rejects.toBeInstanceOf(GetAccountCustomerMissingStripeId);
    });

    it("gets the customer's currency from their shipping address if needed", async () => {
      const mockCustomerId = faker.string.uuid();
      const mockCurrency = faker.finance.currencyCode().toLowerCase();
      const mockPaymentMethod = StripeResponseFactory(
        StripePaymentMethodFactory({ customer: mockCustomerId })
      );
      const mockCustomer = StripeResponseFactory(
        StripeCustomerFactory({
          id: mockCustomerId,
          shipping: {
            address: {
              country: faker.location.countryCode(),
              city: null,
              line1: null,
              line2: null,
              state: null,
              postal_code: null,
            },
          },
        })
      );
      const mockCustomerSession = StripeResponseFactory(
        StripeCustomerSessionFactory({ customer: mockCustomer.id })
      );
      const mockAccountCustomer = ResultAccountCustomerFactory({
        stripeCustomerId: mockCustomer.id,
      });

      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      jest
        .spyOn(customerSessionManager, 'createManagementSession')
        .mockResolvedValue(mockCustomerSession);
      jest
        .spyOn(customerManager, 'getDefaultPaymentMethod')
        .mockResolvedValue(mockPaymentMethod);
      jest.spyOn(customerManager, 'retrieve').mockResolvedValue(mockCustomer);
      jest
        .spyOn(currencyManager, 'getCurrencyForCountry')
        .mockReturnValue(mockCurrency);

      const result =
        await subscriptionManagementService.getStripePaymentManagementDetails(
          mockAccountCustomer.uid
        );

      expect(result).toEqual({
        clientSecret: mockCustomerSession.client_secret,
        customer: mockCustomer.id,
        defaultPaymentMethodId: mockPaymentMethod.id,
        currency: mockCurrency,
      });
    });

    it("gets the customer's currency from their default payment method if needed", async () => {
      const mockCustomerId = faker.string.uuid();
      const mockCurrency = faker.finance.currencyCode().toLowerCase();
      const mockPaymentMethod = StripeResponseFactory(
        StripePaymentMethodFactory({
          customer: mockCustomerId,
          billing_details: {
            address: {
              country: faker.location.countryCode(),
              city: null,
              line1: null,
              line2: null,
              state: null,
              postal_code: null,
            },
            email: null,
            name: null,
            phone: null,
          },
        })
      );
      const mockCustomer = StripeResponseFactory(
        StripeCustomerFactory({
          id: mockCustomerId,
        })
      );
      const mockCustomerSession = StripeResponseFactory(
        StripeCustomerSessionFactory({ customer: mockCustomer.id })
      );
      const mockAccountCustomer = ResultAccountCustomerFactory({
        stripeCustomerId: mockCustomer.id,
      });

      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      jest
        .spyOn(customerSessionManager, 'createManagementSession')
        .mockResolvedValue(mockCustomerSession);
      jest
        .spyOn(customerManager, 'getDefaultPaymentMethod')
        .mockResolvedValue(mockPaymentMethod);
      jest.spyOn(customerManager, 'retrieve').mockResolvedValue(mockCustomer);
      jest
        .spyOn(currencyManager, 'getCurrencyForCountry')
        .mockReturnValue(mockCurrency);

      const result =
        await subscriptionManagementService.getStripePaymentManagementDetails(
          mockAccountCustomer.uid
        );

      expect(result).toEqual({
        clientSecret: mockCustomerSession.client_secret,
        customer: mockCustomer.id,
        defaultPaymentMethodId: mockPaymentMethod.id,
        currency: mockCurrency,
      });
    });

    it('throws CurrencyForCustomerNotFoundError if no currency can be determined', async () => {
      const mockCustomerId = faker.string.uuid();
      const mockCurrency = faker.finance.currencyCode().toLowerCase();
      const mockPaymentMethod = StripeResponseFactory(
        StripePaymentMethodFactory({
          customer: mockCustomerId,
        })
      );
      const mockCustomer = StripeResponseFactory(
        StripeCustomerFactory({
          id: mockCustomerId,
        })
      );
      const mockCustomerSession = StripeResponseFactory(
        StripeCustomerSessionFactory({ customer: mockCustomer.id })
      );
      const mockAccountCustomer = ResultAccountCustomerFactory({
        stripeCustomerId: mockCustomer.id,
      });

      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      jest
        .spyOn(customerSessionManager, 'createManagementSession')
        .mockResolvedValue(mockCustomerSession);
      jest
        .spyOn(customerManager, 'getDefaultPaymentMethod')
        .mockResolvedValue(mockPaymentMethod);
      jest.spyOn(customerManager, 'retrieve').mockResolvedValue(mockCustomer);
      jest
        .spyOn(currencyManager, 'getCurrencyForCountry')
        .mockReturnValue(mockCurrency);

      await expect(
        subscriptionManagementService.getStripePaymentManagementDetails(
          mockAccountCustomer.uid
        )
      ).rejects.toBeInstanceOf(CurrencyForCustomerNotFoundError);
    });
  });

  describe('updateStripePaymentDetails', () => {
    it('updates the stripe customer payment method details', async () => {
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
          '123'
        );

      expect(result).toEqual({
        id: mockSetupIntent.id,
        clientSecret: mockSetupIntent.client_secret,
        status: mockSetupIntent.status,
      });
    });

    it('throws UpdateAccountCustomerMissingStripeId for missing stripe customer id', async () => {
      const mockAccountCustomer = ResultAccountCustomerFactory({
        stripeCustomerId: null,
      });
      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);

      await expect(
        subscriptionManagementService.updateStripePaymentDetails(
          mockAccountCustomer.uid,
          '123'
        )
      ).rejects.toBeInstanceOf(UpdateAccountCustomerMissingStripeId);
    });

    it('throws SetupIntentInvalidStatusError for invalid setupIntent statuses', async () => {
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
          status: 'canceled',
        })
      );

      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      jest
        .spyOn(setupIntentManager, 'createAndConfirm')
        .mockResolvedValue(mockSetupIntent);

      await expect(
        subscriptionManagementService.updateStripePaymentDetails(
          mockAccountCustomer.uid,
          '123'
        )
      ).rejects.toBeInstanceOf(SetupIntentInvalidStatusError);
    });

    it('throws SetupIntentMissingPaymentMethodError for missing setupIntent payment methods', async () => {
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
          status: 'succeeded',
        })
      );

      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      jest
        .spyOn(setupIntentManager, 'createAndConfirm')
        .mockResolvedValue(mockSetupIntent);

      await expect(
        subscriptionManagementService.updateStripePaymentDetails(
          mockAccountCustomer.uid,
          '123'
        )
      ).rejects.toBeInstanceOf(SetupIntentMissingPaymentMethodError);
    });
    it('throws SetupIntentMissingCustomerError for missing setupIntent customers', async () => {
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

      await expect(
        subscriptionManagementService.updateStripePaymentDetails(
          mockAccountCustomer.uid,
          '123'
        )
      ).rejects.toBeInstanceOf(SetupIntentMissingCustomerError);
    });

    it("updates the customer's name to the current payement method billing name", async () => {
      const mockPaymentMethod = StripeResponseFactory(
        StripePaymentMethodFactory({
          billing_details: {
            name: faker.person.fullName(),
            address: null,
            email: null,
            phone: null,
          },
        })
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
          name: faker.person.fullName(),
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

      await subscriptionManagementService.updateStripePaymentDetails(
        mockAccountCustomer.uid,
        '123'
      );

      expect(customerManager.update).toHaveBeenCalledWith(
        mockSetupIntent.customer,
        {
          invoice_settings: {
            default_payment_method: mockSetupIntent.payment_method,
          },
          name: mockPaymentMethod.billing_details.name,
        }
      );
    });
  });
  describe('setDefaultStripePaymentDetails', () => {
    it("updates the customer's payment details", async () => {
      const mockAccountCustomer = ResultAccountCustomerFactory();
      const mockCustomer = StripeResponseFactory(StripeCustomerFactory());
      const mockPaymentMethod = StripeResponseFactory(
        StripePaymentMethodFactory()
      );
      const mockFullName = faker.person.fullName();

      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      jest.spyOn(customerManager, 'update').mockResolvedValue(mockCustomer);

      await subscriptionManagementService.setDefaultStripePaymentDetails(
        mockCustomer.id,
        mockPaymentMethod.id,
        mockFullName
      );

      expect(customerManager.update).toHaveBeenCalledWith(
        mockAccountCustomer.stripeCustomerId,
        {
          invoice_settings: {
            default_payment_method: mockPaymentMethod.id,
          },
          name: mockFullName,
        }
      );
    });
    it('throws SetDefaultPaymentAccountCustomerMissingStripeId for missing stripe customer id', async () => {
      const mockAccountCustomer = ResultAccountCustomerFactory({
        stripeCustomerId: null,
      });

      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);

      await expect(
        subscriptionManagementService.setDefaultStripePaymentDetails(
          mockAccountCustomer.uid,
          'pm_12345',
          'john doe'
        )
      ).rejects.toBeInstanceOf(SetDefaultPaymentAccountCustomerMissingStripeId);
    });
  });
});
