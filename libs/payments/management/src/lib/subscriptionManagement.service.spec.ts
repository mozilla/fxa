/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import { Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import {
  determinePaymentMethodType,
  getSubplatInterval,
  CustomerManager,
  InvoiceManager,
  InvoicePreview,
  InvoicePreviewFactory,
  PaymentMethodManager,
  PriceManager,
  SubscriptionManager,
  SubplatInterval,
  AccountCreditBalanceFactory,
} from '@fxa/payments/customer';
import {
  SubscriptionContentFactory,
  SubscriptionManagementService,
} from '@fxa/payments/management';
import {
  AccountCustomerManager,
  MockStripeConfigProvider,
  ResultAccountCustomerFactory,
  StripeClient,
  StripeConfig,
  StripeCustomerFactory,
  StripePaymentMethodFactory,
  StripePriceFactory,
  StripeResponseFactory,
  StripeSubscriptionFactory,
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
  MockPaypalClientConfigProvider,
  PaypalBillingAgreementManager,
  PayPalClient,
  PaypalCustomerManager,
} from '@fxa/payments/paypal';
import {
  CurrencyManager,
  MockCurrencyConfigProvider,
} from '@fxa/payments/currency';
import {
  SubscriptionContentMissingIntervalInformationError,
  SubscriptionContentMissingLatestInvoiceError,
  SubscriptionContentMissingLatestInvoicePreviewError,
  SubscriptionContentMissingUpcomingInvoicePreviewError,
} from './subscriptionManagement.error';

jest.mock('../../../customer/src/lib/util/determinePaymentMethodType');
const mockDeterminePaymentMethodType = jest.mocked(determinePaymentMethodType);
jest.mock('../../../customer/src/lib/util/getSubplatInterval');
const mockGetSubplatInterval = jest.mocked(getSubplatInterval);

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
  let invoiceManager: InvoiceManager;
  let paymentMethodManager: PaymentMethodManager;
  let productConfigurationManager: ProductConfigurationManager;
  let subscriptionManager: SubscriptionManager;
  let subscriptionManagementService: SubscriptionManagementService;

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
      ],
    }).compile();

    accountCustomerManager = moduleRef.get(AccountCustomerManager);
    customerManager = moduleRef.get(CustomerManager);
    invoiceManager = moduleRef.get(InvoiceManager);
    paymentMethodManager = moduleRef.get(PaymentMethodManager);
    productConfigurationManager = moduleRef.get(ProductConfigurationManager);
    subscriptionManager = moduleRef.get(SubscriptionManager);
    subscriptionManagementService = moduleRef.get(
      SubscriptionManagementService
    );
  });

  describe('getPageContent', () => {
    it('returns page content', async () => {
      const mockUid = faker.string.uuid();
      const mockAccountCreditBalance = AccountCreditBalanceFactory({
        balance: 50,
        currency: 'usd',
      });
      const mockStripeCustomer = StripeResponseFactory(StripeCustomerFactory());
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
        .spyOn(customerManager, 'getBalance')
        .mockResolvedValue(mockAccountCreditBalance);
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
        .spyOn(subscriptionManagementService, 'getSubscriptionContent')
        .mockResolvedValue(mockSubscriptionContent);

      const result =
        await subscriptionManagementService.getPageContent(mockUid);

      expect(result).toEqual({
        accountCreditBalance: mockAccountCreditBalance,
        defaultPaymentMethod: mockPaymentMethodInformation,
        subscriptions: [mockSubscriptionContent],
      });
    });

    it('returns no page information - Stripe customer does not exist', async () => {
      const mockUid = faker.string.uuid();
      const mockAccountCreditBalance = AccountCreditBalanceFactory({
        balance: 0,
        currency: 'usd',
      });
      const mockAccountCustomer = ResultAccountCustomerFactory({
        stripeCustomerId: null,
      });

      mockDeterminePaymentMethodType.mockReturnValue(null);
      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      jest.spyOn(subscriptionManager, 'listForCustomer').mockResolvedValue([]);
      jest
        .spyOn(customerManager, 'getBalance')
        .mockResolvedValue(mockAccountCreditBalance);

      const result =
        await subscriptionManagementService.getPageContent(mockUid);

      expect(result).toEqual({
        accountCreditBalance: mockAccountCreditBalance,
        defaultPaymentMethod: undefined,
        subscriptions: [],
      });
    });

    it('returns page information - Stripe customer but no payment information nor subscriptions', async () => {
      const mockUid = faker.string.uuid();
      const mockAccountCreditBalance = AccountCreditBalanceFactory({
        balance: 0,
        currency: 'usd',
      });
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
      jest
        .spyOn(customerManager, 'getBalance')
        .mockResolvedValue(mockAccountCreditBalance);

      const result =
        await subscriptionManagementService.getPageContent(mockUid);

      expect(result).toEqual({
        accountCreditBalance: mockAccountCreditBalance,
        defaultPaymentMethod: undefined,
        subscriptions: [],
      });
    });
  });

  describe('getSubscriptionContent', () => {
    it('returns subscription content', async () => {
      const mockCustomer = StripeCustomerFactory();
      const mockPrice = StripePriceFactory();
      const mockProductName = faker.string.sample();
      const mockSubscription = StripeSubscriptionFactory();
      const mockLatestInvoicePreview = InvoicePreviewFactory();
      const mockUpcomingInvoicePreview = InvoicePreviewFactory();

      mockGetSubplatInterval.mockReturnValue(SubplatInterval.Monthly);
      jest
        .spyOn(invoiceManager, 'preview')
        .mockResolvedValue(mockLatestInvoicePreview);
      jest
        .spyOn(invoiceManager, 'previewUpcoming')
        .mockResolvedValue(mockUpcomingInvoicePreview);

      const result = await subscriptionManagementService.getSubscriptionContent(
        mockSubscription,
        mockCustomer,
        mockPrice,
        mockProductName
      );
      expect(result).toEqual({
        productName: mockProductName,
        currency: mockSubscription.currency,
        interval: SubplatInterval.Monthly,
        currentInvoiceTax: mockLatestInvoicePreview.creditApplied
          ? 0
          : Math.max(
              0,
              mockLatestInvoicePreview.taxAmounts
                .filter((tax) => !tax.inclusive)
                .reduce((sum, tax) => sum + tax.amount, 0)
            ),
        currentInvoiceTotal:
          mockLatestInvoicePreview.creditApplied ||
          mockLatestInvoicePreview.amountDue <= 0
            ? mockLatestInvoicePreview.amountDue
            : (mockLatestInvoicePreview.taxAmounts
                .filter((tax) => !tax.inclusive)
                .reduce((sum, tax) => sum + tax.amount, 0) ??
              mockLatestInvoicePreview.totalAmount),
        currentPeriodEnd: mockSubscription.current_period_end,
        nextInvoiceDate: mockUpcomingInvoicePreview.nextInvoiceDate,
        nextInvoiceTax: mockUpcomingInvoicePreview.taxAmounts
          .filter((tax) => !tax.inclusive)
          .reduce((sum, tax) => sum + tax.amount, 0),
        nextInvoiceTotal:
          mockUpcomingInvoicePreview.totalExcludingTax ??
          mockUpcomingInvoicePreview.totalAmount,
        discountApplied: mockLatestInvoicePreview.discountAmount ? true : false,
        promotionName: mockLatestInvoicePreview.promotionName,
      });
    });

    it('throws error when latest invoice is missing', async () => {
      const mockCustomer = StripeCustomerFactory();
      const mockPrice = StripePriceFactory();
      const mockProductName = faker.string.sample();
      const mockSubscription = StripeSubscriptionFactory({
        latest_invoice: null,
      });

      await expect(
        subscriptionManagementService.getSubscriptionContent(
          mockSubscription,
          mockCustomer,
          mockPrice,
          mockProductName
        )
      ).rejects.toBeInstanceOf(SubscriptionContentMissingLatestInvoiceError);
    });

    it('throws error when interval is missing', async () => {
      const mockCustomer = StripeCustomerFactory();
      const mockPrice = StripePriceFactory({
        recurring: undefined,
      });
      const mockProductName = faker.string.sample();
      const mockSubscription = StripeSubscriptionFactory();

      await expect(
        subscriptionManagementService.getSubscriptionContent(
          mockSubscription,
          mockCustomer,
          mockPrice,
          mockProductName
        )
      ).rejects.toBeInstanceOf(
        SubscriptionContentMissingIntervalInformationError
      );
    });

    it('throws error when latest invoice preview is missing', async () => {
      const mockCustomer = StripeCustomerFactory();
      const mockPrice = StripePriceFactory();
      const mockProductName = faker.string.sample();
      const mockSubscription = StripeSubscriptionFactory();
      const mockUpcomingInvoicePreview = InvoicePreviewFactory();

      mockGetSubplatInterval.mockReturnValue(SubplatInterval.Monthly);
      jest
        .spyOn(invoiceManager, 'preview')
        .mockResolvedValue(undefined as unknown as InvoicePreview);
      jest
        .spyOn(invoiceManager, 'previewUpcoming')
        .mockResolvedValue(mockUpcomingInvoicePreview);

      await expect(
        subscriptionManagementService.getSubscriptionContent(
          mockSubscription,
          mockCustomer,
          mockPrice,
          mockProductName
        )
      ).rejects.toBeInstanceOf(
        SubscriptionContentMissingLatestInvoicePreviewError
      );
    });

    it('throws error when upcoming invoice preview is missing', async () => {
      const mockCustomer = StripeCustomerFactory();
      const mockPrice = StripePriceFactory();
      const mockProductName = faker.string.sample();
      const mockSubscription = StripeSubscriptionFactory();
      const mockLatestInvoicePreview = InvoicePreviewFactory();

      mockGetSubplatInterval.mockReturnValue(SubplatInterval.Monthly);
      jest
        .spyOn(invoiceManager, 'preview')
        .mockResolvedValue(mockLatestInvoicePreview);
      jest
        .spyOn(invoiceManager, 'previewUpcoming')
        .mockResolvedValue(undefined as unknown as InvoicePreview);

      await expect(
        subscriptionManagementService.getSubscriptionContent(
          mockSubscription,
          mockCustomer,
          mockPrice,
          mockProductName
        )
      ).rejects.toBeInstanceOf(
        SubscriptionContentMissingUpcomingInvoicePreviewError
      );
    });
  });
});
