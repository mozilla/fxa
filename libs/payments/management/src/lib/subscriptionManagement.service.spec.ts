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
  CustomerDeletedError,
  CustomerManager,
  InvoiceManager,
  InvoicePreview,
  InvoicePreviewFactory,
  PaymentMethodManager,
  PriceManager,
  SubscriptionManager,
  SetupIntentManager,
  CustomerSessionManager,
  SubPlatPaymentMethodType,
} from '@fxa/payments/customer';
import {
  AppleIapClient,
  AppleIapPurchaseManager,
  GoogleIapClient,
  GoogleIapPurchaseManager,
  MockAppleIapClientConfigProvider,
  MockGoogleIapClientConfigProvider,
} from '@fxa/payments/iap';
import {
  AppleIapPurchaseFactory,
  AppleIapPurchaseResultFactory,
  GoogleIapPurchaseFactory,
  GoogleIapPurchaseResultFactory,
  SubscriptionContentFactory,
  SubscriptionManagementService,
} from '@fxa/payments/management';
import {
  BillingAgreementFactory,
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
  IapWithOfferingResultFactory,
  MockStrapiClientConfigProvider,
  ProductConfigurationManager,
  PageContentByPriceIdsResultUtil,
  PageContentByPriceIdsPurchaseResultFactory,
  StrapiClient,
  ChurnInterventionByProductIdResultFactory,
} from '@fxa/shared/cms';
import { ChurnInterventionService } from './churn-intervention.service';
import { MockFirestoreProvider } from '@fxa/shared/db/firestore';
import { MockAccountDatabaseNestFactory } from '@fxa/shared/db/mysql/account';
import { MockStatsDProvider } from '@fxa/shared/metrics/statsd';
import {
  CancelSubscriptionCustomerMismatch,
  CurrencyForCustomerNotFoundError,
  GetAccountCustomerMissingStripeId,
  ResubscribeSubscriptionCustomerMismatch,
  SetDefaultPaymentAccountCustomerMissingStripeId,
  SetupIntentInvalidStatusError,
  SetupIntentMissingCustomerError,
  SetupIntentMissingPaymentMethodError,
  SubscriptionContentMissingIntervalInformationError,
  SubscriptionContentMissingLatestInvoiceError,
  SubscriptionContentMissingLatestInvoicePreviewError,
  SubscriptionContentMissingUpcomingInvoicePreviewError,
  SubscriptionManagementCouldNotRetrieveProductNamesFromCMSError,
  SubscriptionManagementCouldNotRetrieveIapContentFromCMSError,
  UpdateAccountCustomerMissingStripeId,
  CreateBillingAgreementAccountCustomerMissingStripeId,
  CreateBillingAgreementActiveBillingAgreement,
  CreateBillingAgreementCurrencyNotFound,
  CreateBillingAgreementPaypalSubscriptionNotFound,
  SubscriptionManagementNoStripeCustomerFoundError,
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

describe('SubscriptionManagementService', () => {
  let accountCustomerManager: AccountCustomerManager;
  let customerManager: CustomerManager;
  let churnInterventionService: ChurnInterventionService;
  let paymentMethodManager: PaymentMethodManager;
  let productConfigurationManager: ProductConfigurationManager;
  let subscriptionManager: SubscriptionManager;
  let subscriptionManagementService: SubscriptionManagementService;
  let setupIntentManager: SetupIntentManager;
  let customerSessionManager: CustomerSessionManager;
  let currencyManager: CurrencyManager;
  let invoiceManager: InvoiceManager;
  let privateCustomerChanged: any;
  let paypalBillingAgreementManager: PaypalBillingAgreementManager;
  let paypalCustomerManager: PaypalCustomerManager;

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
        CurrencyManager,
        CustomerManager,
        GoogleIapClient,
        GoogleIapPurchaseManager,
        InvoiceManager,
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
        {
          provide: LOGGER_PROVIDER,
          useValue: mockLogger,
        },
        {
          provide: ChurnInterventionService,
          useValue: {
            determineStaySubscribedEligibility: jest.fn(),
          },
        },
      ],
    }).compile();

    accountCustomerManager = moduleRef.get(AccountCustomerManager);
    churnInterventionService = moduleRef.get(ChurnInterventionService);
    customerManager = moduleRef.get(CustomerManager);
    invoiceManager = moduleRef.get(InvoiceManager);
    paymentMethodManager = moduleRef.get(PaymentMethodManager);
    productConfigurationManager = moduleRef.get(ProductConfigurationManager);
    subscriptionManager = moduleRef.get(SubscriptionManager);
    subscriptionManagementService = moduleRef.get(
      SubscriptionManagementService
    );
    setupIntentManager = moduleRef.get(SetupIntentManager);
    customerSessionManager = moduleRef.get(CustomerSessionManager);
    currencyManager = moduleRef.get(CurrencyManager);
    paypalBillingAgreementManager = moduleRef.get(
      PaypalBillingAgreementManager
    );
    paypalCustomerManager = moduleRef.get(PaypalCustomerManager);

    privateCustomerChanged = jest
      .spyOn(subscriptionManagementService as any, 'customerChanged')
      .mockResolvedValue({});
  });

  describe('cancelSubscriptionAtPeriodEnd', () => {
    const mockStripeCustomer = StripeCustomerFactory();
    const mockAccountCustomer = ResultAccountCustomerFactory({
      stripeCustomerId: mockStripeCustomer.id,
    });
    const mockSubscription = StripeResponseFactory(
      StripeSubscriptionFactory({
        customer: mockStripeCustomer.id,
      })
    );

    beforeEach(() => {
      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      jest
        .spyOn(subscriptionManager, 'retrieve')
        .mockResolvedValue(mockSubscription);
      jest
        .spyOn(subscriptionManager, 'update')
        .mockResolvedValue(mockSubscription);
    });

    it('successfully updates the subscription', async () => {
      await subscriptionManagementService.cancelSubscriptionAtPeriodEnd(
        mockAccountCustomer.uid,
        mockSubscription.id
      );

      expect(subscriptionManager.update).toHaveBeenCalledWith(
        mockSubscription.id,
        {
          cancel_at_period_end: true,
          metadata: {
            cancelled_for_customer_at: expect.any(Number),
          },
        }
      );
      expect(privateCustomerChanged).toHaveBeenCalledWith(
        mockAccountCustomer.uid
      );
    });

    it('fails with error on mismatching customer id between subscription and account', async () => {
      jest.spyOn(subscriptionManager, 'retrieve').mockResolvedValueOnce(
        StripeResponseFactory(
          StripeSubscriptionFactory({
            customer: 'differentCustomerId',
          })
        )
      );

      await expect(
        subscriptionManagementService.cancelSubscriptionAtPeriodEnd(
          mockAccountCustomer.uid,
          mockSubscription.id
        )
      ).rejects.toBeInstanceOf(CancelSubscriptionCustomerMismatch);
      expect(subscriptionManager.update).not.toHaveBeenCalled();
      expect(privateCustomerChanged).not.toHaveBeenCalled();
    });
  });

  describe('getPageContent', () => {
    const mockProductNameByPriceIdsResultUtil = {
      purchaseForPriceId: jest.fn(),
    };
    beforeEach(() => {
      jest
        .spyOn(productConfigurationManager, 'getPageContentByPriceIds')
        .mockResolvedValue(
          mockProductNameByPriceIdsResultUtil as unknown as PageContentByPriceIdsResultUtil
        );

      mockProductNameByPriceIdsResultUtil.purchaseForPriceId.mockReturnValue(
        PageContentByPriceIdsPurchaseResultFactory()
      );
    });

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
      const mockStaySubscribedCmsChurnEntry =
        ChurnInterventionByProductIdResultFactory();
      const mockSubscriptionContent = SubscriptionContentFactory();
      const mockPaymentMethodInformation = {
        type: SubPlatPaymentMethodType.Card,
        brand: mockPaymentMethod.card?.brand,
        last4: mockPaymentMethod.card?.last4,
        expMonth: mockPaymentMethod.card?.exp_month,
        expYear: mockPaymentMethod.card?.exp_year,
        hasPaymentMethodError: undefined,
      };
      const mockStoreId1 = faker.string.sample();
      const mockStoreId2 = faker.string.sample();
      const mockIapOfferingResult1 = IapWithOfferingResultFactory({
        storeID: mockStoreId1,
      });
      const mockIapOfferingResult2 = IapWithOfferingResultFactory({
        storeID: mockStoreId2,
      });
      const mockIapResult = {
        [mockStoreId1]: mockIapOfferingResult1,
        [mockStoreId2]: mockIapOfferingResult2,
      };
      const mockAppleIapPurchase = AppleIapPurchaseFactory({
        storeId: mockStoreId1,
      });
      const mockGoogleIapPurchase = GoogleIapPurchaseFactory({
        storeId: mockStoreId2,
      });
      const mockAppleIapPurchaseResult = AppleIapPurchaseResultFactory({
        storeIds: [mockStoreId1],
        purchaseDetails: [mockAppleIapPurchase],
      });
      const mockGoogleIapPurchaseResult = GoogleIapPurchaseResultFactory({
        storeIds: [mockStoreId2],
        purchaseDetails: [mockGoogleIapPurchase],
      });
      const mockAppleIapSubscriptionContent = {
        ...mockAppleIapPurchase,
        productName:
          mockIapOfferingResult1.offering.defaultPurchase.purchaseDetails
            .localizations[0]?.productName ||
          mockIapOfferingResult1.offering.defaultPurchase.purchaseDetails
            .productName,
        supportUrl: mockIapOfferingResult1.offering.commonContent.supportUrl,
        webIcon:
          mockIapOfferingResult1.offering.defaultPurchase.purchaseDetails
            .webIcon,
      };
      const mockGoogleIapSubscriptionContent = {
        ...mockGoogleIapPurchase,
        productName:
          mockIapOfferingResult2.offering.defaultPurchase.purchaseDetails
            .localizations[0]?.productName ||
          mockIapOfferingResult2.offering.defaultPurchase.purchaseDetails
            .productName,
        supportUrl: mockIapOfferingResult2.offering.commonContent.supportUrl,
        webIcon:
          mockIapOfferingResult2.offering.defaultPurchase.purchaseDetails
            .webIcon,
      };

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
        .spyOn(productConfigurationManager, 'getIapPageContentByStoreIds')
        .mockResolvedValue(mockIapResult);
      jest
        .spyOn(subscriptionManagementService as any, 'getSubscriptionContent')
        .mockResolvedValue(mockSubscriptionContent);
      jest
        .spyOn(subscriptionManagementService as any, 'getAppleIapPurchases')
        .mockResolvedValue(mockAppleIapPurchaseResult);
      jest
        .spyOn(subscriptionManagementService as any, 'getGoogleIapPurchases')
        .mockResolvedValue(mockGoogleIapPurchaseResult);
      jest
        .spyOn(churnInterventionService, 'determineStaySubscribedEligibility')
        .mockResolvedValue({
          isEligible: true,
          reason: 'eligible',
          cmsChurnInterventionEntry: mockStaySubscribedCmsChurnEntry,
          cmsOfferingContent: null,
        });

      const result =
        await subscriptionManagementService.getPageContent(mockUid);

      expect(result).toEqual({
        accountCreditBalance: {
          balance: mockStripeCustomer.balance,
          currency: mockStripeCustomer.currency,
        },
        defaultPaymentMethod: mockPaymentMethodInformation,
        isStripeCustomer: mockAccountCustomer.stripeCustomerId !== null,
        subscriptions: [mockSubscriptionContent],
        appleIapSubscriptions: [mockAppleIapSubscriptionContent],
        googleIapSubscriptions: [mockGoogleIapSubscriptionContent],
      });
    });

    it('returns no page information - Stripe customer does not exist', async () => {
      const mockUid = faker.string.uuid();
      const mockAccountCustomer = ResultAccountCustomerFactory({
        stripeCustomerId: null,
      });
      const mockAppleIapPurchaseResult = AppleIapPurchaseResultFactory({
        storeIds: [],
        purchaseDetails: [],
      });
      const mockGoogleIapPurchaseResult = GoogleIapPurchaseResultFactory({
        storeIds: [],
        purchaseDetails: [],
      });

      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      jest.spyOn(subscriptionManager, 'listForCustomer').mockResolvedValue([]);
      jest
        .spyOn(subscriptionManagementService as any, 'getAppleIapPurchases')
        .mockResolvedValue(mockAppleIapPurchaseResult);
      jest
        .spyOn(subscriptionManagementService as any, 'getGoogleIapPurchases')
        .mockResolvedValue(mockGoogleIapPurchaseResult);

      const result =
        await subscriptionManagementService.getPageContent(mockUid);
      expect(result).toEqual({
        accountCreditBalance: {
          balance: 0,
          currency: null,
        },
        defaultPaymentMethod: undefined,
        isStripeCustomer: mockAccountCustomer.stripeCustomerId !== null,
        subscriptions: [],
        appleIapSubscriptions: [],
        googleIapSubscriptions: [],
      });
    });

    it('returns page information - Stripe customer but no payment information nor subscriptions', async () => {
      const mockUid = faker.string.uuid();
      const mockAccountCustomer = ResultAccountCustomerFactory();
      const mockStripeCustomer = StripeResponseFactory(
        StripeCustomerFactory({
          currency: 'usd',
        })
      );
      const mockAppleIapPurchaseResult = AppleIapPurchaseResultFactory({
        storeIds: [],
        purchaseDetails: [],
      });
      const mockGoogleIapPurchaseResult = GoogleIapPurchaseResultFactory({
        storeIds: [],
        purchaseDetails: [],
      });

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
        .spyOn(subscriptionManagementService as any, 'getAppleIapPurchases')
        .mockResolvedValue(mockAppleIapPurchaseResult);
      jest
        .spyOn(subscriptionManagementService as any, 'getGoogleIapPurchases')
        .mockResolvedValue(mockGoogleIapPurchaseResult);

      const result =
        await subscriptionManagementService.getPageContent(mockUid);

      expect(result).toEqual({
        accountCreditBalance: {
          balance: mockStripeCustomer.balance,
          currency: mockStripeCustomer.currency,
        },
        defaultPaymentMethod: undefined,
        isStripeCustomer: mockAccountCustomer.stripeCustomerId !== null,
        subscriptions: [],
        appleIapSubscriptions: [],
        googleIapSubscriptions: [],
      });
    });

    it('returns if there are only IAP subscriptions', async () => {
      const mockUid = faker.string.uuid();
      const mockAccountCustomer = ResultAccountCustomerFactory({
        stripeCustomerId: null,
      });
      const mockStoreId1 = faker.string.sample();
      const mockStoreId2 = faker.string.sample();
      const mockIapOfferingResult1 = IapWithOfferingResultFactory({
        storeID: mockStoreId1,
      });
      const mockIapOfferingResult2 = IapWithOfferingResultFactory({
        storeID: mockStoreId2,
      });
      const mockIapResult = {
        [mockStoreId1]: mockIapOfferingResult1,
        [mockStoreId2]: mockIapOfferingResult2,
      };
      const mockAppleIapPurchase = AppleIapPurchaseFactory({
        storeId: mockStoreId1,
      });
      const mockGoogleIapPurchase = GoogleIapPurchaseFactory({
        storeId: mockStoreId2,
      });
      const mockAppleIapPurchaseResult = AppleIapPurchaseResultFactory({
        storeIds: [mockStoreId1],
        purchaseDetails: [mockAppleIapPurchase],
      });
      const mockGoogleIapPurchaseResult = GoogleIapPurchaseResultFactory({
        storeIds: [mockStoreId2],
        purchaseDetails: [mockGoogleIapPurchase],
      });
      const mockAppleIapSubscriptionContent = {
        ...mockAppleIapPurchase,
        productName:
          mockIapOfferingResult1.offering.defaultPurchase.purchaseDetails
            .localizations[0]?.productName ||
          mockIapOfferingResult1.offering.defaultPurchase.purchaseDetails
            .productName,
        supportUrl: mockIapOfferingResult1.offering.commonContent.supportUrl,
        webIcon:
          mockIapOfferingResult1.offering.defaultPurchase.purchaseDetails
            .webIcon,
      };
      const mockGoogleIapSubscriptionContent = {
        ...mockGoogleIapPurchase,
        productName:
          mockIapOfferingResult2.offering.defaultPurchase.purchaseDetails
            .localizations[0]?.productName ||
          mockIapOfferingResult2.offering.defaultPurchase.purchaseDetails
            .productName,
        supportUrl: mockIapOfferingResult2.offering.commonContent.supportUrl,
        webIcon:
          mockIapOfferingResult2.offering.defaultPurchase.purchaseDetails
            .webIcon,
      };

      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      jest
        .spyOn(paymentMethodManager, 'getDefaultPaymentMethod')
        .mockResolvedValue(undefined);
      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      jest.spyOn(subscriptionManager, 'listForCustomer').mockResolvedValue([]);
      jest
        .spyOn(productConfigurationManager, 'getIapPageContentByStoreIds')
        .mockResolvedValue(mockIapResult);
      jest
        .spyOn(subscriptionManagementService as any, 'getAppleIapPurchases')
        .mockResolvedValue(mockAppleIapPurchaseResult);
      jest
        .spyOn(subscriptionManagementService as any, 'getGoogleIapPurchases')
        .mockResolvedValue(mockGoogleIapPurchaseResult);

      const result =
        await subscriptionManagementService.getPageContent(mockUid);

      expect(result).toEqual({
        accountCreditBalance: {
          balance: 0,
          currency: null,
        },
        defaultPaymentMethod: undefined,
        isStripeCustomer: Boolean(mockAccountCustomer.stripeCustomerId),
        subscriptions: [],
        appleIapSubscriptions: [mockAppleIapSubscriptionContent],
        googleIapSubscriptions: [mockGoogleIapSubscriptionContent],
      });
    });

    it('throws if CMS does not retrieve product names for price ids', async () => {
      const mockUid = faker.string.uuid();
      const mockAccountCustomer = ResultAccountCustomerFactory();
      const mockStripeCustomer = StripeResponseFactory(StripeCustomerFactory());
      const mockSubscriptions = StripeSubscriptionFactory();
      const mockAppleIapPurchaseResult = AppleIapPurchaseResultFactory({
        storeIds: [],
        purchaseDetails: [],
      });
      const mockGoogleIapPurchaseResult = GoogleIapPurchaseResultFactory({
        storeIds: [],
        purchaseDetails: [],
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
        .mockResolvedValueOnce(undefined);
      jest
        .spyOn(subscriptionManagementService as any, 'getAppleIapPurchases')
        .mockResolvedValue(mockAppleIapPurchaseResult);
      jest
        .spyOn(subscriptionManagementService as any, 'getGoogleIapPurchases')
        .mockResolvedValue(mockGoogleIapPurchaseResult);
      jest
        .spyOn(productConfigurationManager, 'getPageContentByPriceIds')
        .mockResolvedValue(
          undefined as unknown as PageContentByPriceIdsResultUtil
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
      const mockAppleIapPurchaseResult = AppleIapPurchaseResultFactory({
        storeIds: [],
        purchaseDetails: [],
      });
      const mockGoogleIapPurchaseResult = GoogleIapPurchaseResultFactory({
        storeIds: [],
        purchaseDetails: [],
      });

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
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      jest
        .spyOn(customerManager, 'retrieve')
        .mockResolvedValue(mockStripeCustomer);
      jest
        .spyOn(subscriptionManager, 'listForCustomer')
        .mockResolvedValue([mockSubscription]);
      jest
        .spyOn(subscriptionManagementService as any, 'getAppleIapPurchases')
        .mockResolvedValue(mockAppleIapPurchaseResult);
      jest
        .spyOn(subscriptionManagementService as any, 'getGoogleIapPurchases')
        .mockResolvedValue(mockGoogleIapPurchaseResult);
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
      const mockAppleIapPurchaseResult = AppleIapPurchaseResultFactory({
        storeIds: [],
        purchaseDetails: [],
      });
      const mockGoogleIapPurchaseResult = GoogleIapPurchaseResultFactory({
        storeIds: [],
        purchaseDetails: [],
      });

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
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      jest
        .spyOn(customerManager, 'retrieve')
        .mockResolvedValue(mockStripeCustomer);
      jest
        .spyOn(subscriptionManager, 'listForCustomer')
        .mockResolvedValue([mockSubscription]);
      jest
        .spyOn(subscriptionManagementService as any, 'getAppleIapPurchases')
        .mockResolvedValue(mockAppleIapPurchaseResult);
      jest
        .spyOn(subscriptionManagementService as any, 'getGoogleIapPurchases')
        .mockResolvedValue(mockGoogleIapPurchaseResult);
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
      const mockAppleIapPurchaseResult = AppleIapPurchaseResultFactory({
        storeIds: [],
        purchaseDetails: [],
      });
      const mockGoogleIapPurchaseResult = GoogleIapPurchaseResultFactory({
        storeIds: [],
        purchaseDetails: [],
      });

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
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      jest
        .spyOn(customerManager, 'retrieve')
        .mockResolvedValue(mockStripeCustomer);
      jest
        .spyOn(subscriptionManager, 'listForCustomer')
        .mockResolvedValue([mockSubscription]);
      jest
        .spyOn(subscriptionManagementService as any, 'getAppleIapPurchases')
        .mockResolvedValue(mockAppleIapPurchaseResult);
      jest
        .spyOn(subscriptionManagementService as any, 'getGoogleIapPurchases')
        .mockResolvedValue(mockGoogleIapPurchaseResult);
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
      const mockSubscription = StripeSubscriptionFactory();
      const mockAppleIapPurchaseResult = AppleIapPurchaseResultFactory({
        storeIds: [],
        purchaseDetails: [],
      });
      const mockGoogleIapPurchaseResult = GoogleIapPurchaseResultFactory({
        storeIds: [],
        purchaseDetails: [],
      });

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
        .spyOn(subscriptionManagementService as any, 'getAppleIapPurchases')
        .mockResolvedValue(mockAppleIapPurchaseResult);
      jest
        .spyOn(subscriptionManagementService as any, 'getGoogleIapPurchases')
        .mockResolvedValue(mockGoogleIapPurchaseResult);
      jest
        .spyOn(subscriptionManagementService as any, 'getSubscriptionContent')
        .mockRejectedValue(
          new SubscriptionContentMissingUpcomingInvoicePreviewError(
            mockSubscription.id,
            mockStripeCustomer
          )
        );
      await expect(
        subscriptionManagementService.getPageContent(mockUid)
      ).rejects.toBeInstanceOf(
        SubscriptionContentMissingUpcomingInvoicePreviewError
      );
    });

    it('throws if CMS does not retrieve IAP content for store ids', async () => {
      const mockUid = faker.string.uuid();
      const mockAccountCustomer = ResultAccountCustomerFactory({
        stripeCustomerId: null,
      });
      const mockStoreId1 = faker.string.sample();
      const mockAppleIapPurchase = AppleIapPurchaseFactory();
      const mockAppleIapPurchaseResult = AppleIapPurchaseResultFactory({
        storeIds: [mockStoreId1],
        purchaseDetails: [mockAppleIapPurchase],
      });
      const mockGoogleIapPurchaseResult = GoogleIapPurchaseResultFactory({
        storeIds: [],
        purchaseDetails: [],
      });

      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      jest
        .spyOn(subscriptionManagementService as any, 'getAppleIapPurchases')
        .mockResolvedValue(mockAppleIapPurchaseResult);
      jest
        .spyOn(subscriptionManagementService as any, 'getGoogleIapPurchases')
        .mockResolvedValue(mockGoogleIapPurchaseResult);
      jest
        .spyOn(productConfigurationManager, 'getIapPageContentByStoreIds')
        .mockResolvedValue(undefined as any);

      await expect(
        subscriptionManagementService.getPageContent(mockUid)
      ).rejects.toBeInstanceOf(
        SubscriptionManagementCouldNotRetrieveIapContentFromCMSError
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

  describe('resubscribeSubscription', () => {
    const mockStripeCustomer = StripeCustomerFactory();
    const mockAccountCustomer = ResultAccountCustomerFactory({
      stripeCustomerId: mockStripeCustomer.id,
    });
    const mockSubscription = StripeResponseFactory(
      StripeSubscriptionFactory({
        customer: mockStripeCustomer.id,
      })
    );

    beforeEach(() => {
      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      jest
        .spyOn(subscriptionManager, 'retrieve')
        .mockResolvedValue(mockSubscription);
      jest
        .spyOn(subscriptionManager, 'update')
        .mockResolvedValue(mockSubscription);
    });

    it('successfully updates the subscription', async () => {
      await subscriptionManagementService.resubscribeSubscription(
        mockAccountCustomer.uid,
        mockSubscription.id
      );

      expect(subscriptionManager.update).toHaveBeenCalledWith(
        mockSubscription.id,
        {
          cancel_at_period_end: false,
          metadata: {
            cancelled_for_customer_at: '',
          },
        }
      );
      expect(privateCustomerChanged).toHaveBeenCalledWith(
        mockAccountCustomer.uid
      );
    });

    it('fails with error on mismatching customer id between subscription and account', async () => {
      jest.spyOn(subscriptionManager, 'retrieve').mockResolvedValueOnce(
        StripeResponseFactory(
          StripeSubscriptionFactory({
            customer: 'differentCustomerId',
          })
        )
      );

      await expect(
        subscriptionManagementService.resubscribeSubscription(
          mockAccountCustomer.uid,
          mockSubscription.id
        )
      ).rejects.toBeInstanceOf(ResubscribeSubscriptionCustomerMismatch);
      expect(subscriptionManager.update).not.toHaveBeenCalled();
      expect(privateCustomerChanged).not.toHaveBeenCalled();
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

      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      jest.spyOn(customerManager, 'update').mockResolvedValue(mockCustomer);

      await subscriptionManagementService.setDefaultStripePaymentDetails(
        mockCustomer.id,
        mockPaymentMethod.id
      );

      expect(customerManager.update).toHaveBeenCalledWith(
        mockAccountCustomer.stripeCustomerId,
        {
          invoice_settings: {
            default_payment_method: mockPaymentMethod.id,
          },
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
          'pm_12345'
        )
      ).rejects.toBeInstanceOf(SetDefaultPaymentAccountCustomerMissingStripeId);
    });
  });

  describe('getCurrencyForCustomer', () => {
    it('gets a customers currency by customer.currency', async () => {
      const mockCustomerId = faker.string.uuid();
      const mockAccountCustomer = ResultAccountCustomerFactory({
        uid: mockCustomerId,
      });
      const mockCurrency = faker.finance.currencyCode().toLowerCase();
      const mockCustomer = StripeResponseFactory(
        StripeCustomerFactory({
          id: mockCustomerId,
          currency: mockCurrency,
        })
      );
      const mockPaymentMethod = StripeResponseFactory(
        StripePaymentMethodFactory({ customer: mockCustomerId })
      );

      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      jest
        .spyOn(customerManager, 'getDefaultPaymentMethod')
        .mockResolvedValue(mockPaymentMethod);
      jest.spyOn(customerManager, 'retrieve').mockResolvedValue(mockCustomer);

      const result =
        await subscriptionManagementService.getCurrencyForCustomer(
          mockCustomerId
        );

      expect(result).toEqual(mockCurrency);
    });
    it('gets a customers currency by shipping address', async () => {
      const mockCustomerId = faker.string.uuid();
      const mockAccountCustomer = ResultAccountCustomerFactory({
        uid: mockCustomerId,
      });
      const mockCurrency = faker.finance.currencyCode().toLowerCase();
      const mockCustomer = StripeResponseFactory(
        StripeCustomerFactory({
          id: mockCustomerId,
          currency: null,
          shipping: { address: StripeAddressFactory() },
        })
      );
      const mockPaymentMethod = StripeResponseFactory(
        StripePaymentMethodFactory({ customer: mockCustomerId })
      );

      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      jest
        .spyOn(customerManager, 'getDefaultPaymentMethod')
        .mockResolvedValue(mockPaymentMethod);
      jest.spyOn(customerManager, 'retrieve').mockResolvedValue(mockCustomer);
      jest
        .spyOn(currencyManager, 'getCurrencyForCountry')
        .mockReturnValue(mockCurrency);

      const result =
        await subscriptionManagementService.getCurrencyForCustomer(
          mockCustomerId
        );

      expect(result).toEqual(mockCurrency);
    });
    it('gets a customers currency by billing address', async () => {
      const mockCustomerId = faker.string.uuid();
      const mockAccountCustomer = ResultAccountCustomerFactory({
        uid: mockCustomerId,
      });
      const mockCurrency = faker.finance.currencyCode().toLowerCase();
      const mockCustomer = StripeResponseFactory(
        StripeCustomerFactory({
          id: mockCustomerId,
          currency: null,
        })
      );
      const mockPaymentMethod = StripeResponseFactory(
        StripePaymentMethodFactory({
          customer: mockCustomerId,
          billing_details: {
            address: StripeAddressFactory(),
            email: '',
            name: '',
            phone: '',
          },
        })
      );

      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      jest
        .spyOn(customerManager, 'getDefaultPaymentMethod')
        .mockResolvedValue(mockPaymentMethod);
      jest.spyOn(customerManager, 'retrieve').mockResolvedValue(mockCustomer);
      jest
        .spyOn(currencyManager, 'getCurrencyForCountry')
        .mockReturnValue(mockCurrency);

      const result =
        await subscriptionManagementService.getCurrencyForCustomer(
          mockCustomerId
        );

      expect(result).toEqual(mockCurrency);
    });
    it('returns undefined if no currency can be found', async () => {
      const mockCustomerId = faker.string.uuid();
      const mockAccountCustomer = ResultAccountCustomerFactory({
        uid: mockCustomerId,
      });
      const mockCustomer = StripeResponseFactory(
        StripeCustomerFactory({
          id: mockCustomerId,
          currency: null,
        })
      );
      const mockPaymentMethod = StripeResponseFactory(
        StripePaymentMethodFactory({
          customer: mockCustomerId,
        })
      );

      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      jest
        .spyOn(customerManager, 'getDefaultPaymentMethod')
        .mockResolvedValue(mockPaymentMethod);
      jest.spyOn(customerManager, 'retrieve').mockResolvedValue(mockCustomer);

      const result =
        await subscriptionManagementService.getCurrencyForCustomer(
          mockCustomerId
        );

      expect(result).toBeFalsy();
    });
    it('throws GetAccountCustomerMissingStripeId error', async () => {
      const mockAccountCustomer = ResultAccountCustomerFactory({
        stripeCustomerId: null,
      });

      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);

      await expect(
        subscriptionManagementService.getCurrencyForCustomer('12345')
      ).rejects.toBeInstanceOf(GetAccountCustomerMissingStripeId);
    });
  });

  describe('createPaypalBillingAgreementId', () => {
    it('creates a paypal billing agreement id', async () => {
      const mockUid = faker.string.uuid();
      const mockAccountCustomer = ResultAccountCustomerFactory({
        uid: mockUid,
        stripeCustomerId: faker.string.uuid(),
      });
      const mockPaypalCustomer = ResultPaypalCustomerFactory({
        status: 'Cancelled',
        endedAt: faker.date.recent().valueOf(),
      });
      const mockSubscription = StripeResponseFactory(
        StripeSubscriptionFactory({
          customer: mockAccountCustomer.stripeCustomerId as string,
          collection_method: 'send_invoice',
        })
      );
      const mockBillingAgreement = BillingAgreementFactory();
      const mockStripeCustomer = StripeResponseFactory(StripeCustomerFactory());

      jest
        .spyOn(paypalBillingAgreementManager, 'retrieveActiveId')
        .mockResolvedValue(undefined);
      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      jest
        .spyOn(paypalCustomerManager, 'fetchPaypalCustomersByUid')
        .mockResolvedValue([mockPaypalCustomer]);
      jest
        .spyOn(subscriptionManagementService, 'getCurrencyForCustomer')
        .mockResolvedValue(faker.finance.currencyCode().toLowerCase());
      jest
        .spyOn(subscriptionManager, 'listForCustomer')
        .mockResolvedValue([mockSubscription]);
      jest
        .spyOn(paypalCustomerManager, 'deletePaypalCustomersByUid')
        .mockResolvedValue(BigInt(1));
      jest
        .spyOn(paypalBillingAgreementManager, 'create')
        .mockResolvedValue(faker.string.uuid());
      jest
        .spyOn(paypalBillingAgreementManager, 'retrieve')
        .mockResolvedValue(mockBillingAgreement);
      jest
        .spyOn(currencyManager, 'assertCurrencyCompatibleWithCountry')
        .mockReturnValue();
      jest
        .spyOn(customerManager, 'update')
        .mockResolvedValue(mockStripeCustomer);

      await subscriptionManagementService.createPaypalBillingAgreementId(
        faker.string.uuid(),
        faker.string.uuid()
      );
      expect(privateCustomerChanged).toHaveBeenCalled();
    });
    it('throws an error if the user has an active paypal billing agreement', async () => {
      jest
        .spyOn(paypalBillingAgreementManager, 'retrieveActiveId')
        .mockResolvedValue(faker.string.uuid());

      await expect(
        subscriptionManagementService.createPaypalBillingAgreementId(
          faker.string.uuid(),
          faker.string.uuid()
        )
      ).rejects.toBeInstanceOf(CreateBillingAgreementActiveBillingAgreement);
      expect(privateCustomerChanged).not.toHaveBeenCalled();
    });
    it('throws an error if the account customer has no stripe id', async () => {
      const mockUid = faker.string.uuid();
      const mockAccountCustomer = ResultAccountCustomerFactory({
        uid: mockUid,
        stripeCustomerId: null,
      });

      jest
        .spyOn(paypalBillingAgreementManager, 'retrieveActiveId')
        .mockResolvedValue(undefined);
      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);

      await expect(
        subscriptionManagementService.createPaypalBillingAgreementId(
          faker.string.uuid(),
          faker.string.uuid()
        )
      ).rejects.toBeInstanceOf(
        CreateBillingAgreementAccountCustomerMissingStripeId
      );
      expect(privateCustomerChanged).not.toHaveBeenCalled();
    });
    it('throws an error if no currency can be found', async () => {
      const mockUid = faker.string.uuid();
      const mockAccountCustomer = ResultAccountCustomerFactory({
        uid: mockUid,
        stripeCustomerId: faker.string.uuid(),
      });
      const mockPaypalCustomer = ResultPaypalCustomerFactory({
        status: 'Cancelled',
        endedAt: faker.date.recent().valueOf(),
      });

      jest
        .spyOn(paypalBillingAgreementManager, 'retrieveActiveId')
        .mockResolvedValue(undefined);
      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      jest
        .spyOn(paypalCustomerManager, 'fetchPaypalCustomersByUid')
        .mockResolvedValue([mockPaypalCustomer]);
      jest
        .spyOn(subscriptionManagementService, 'getCurrencyForCustomer')
        .mockResolvedValue(undefined);

      await expect(
        subscriptionManagementService.createPaypalBillingAgreementId(
          faker.string.uuid(),
          faker.string.uuid()
        )
      ).rejects.toBeInstanceOf(CreateBillingAgreementCurrencyNotFound);
      expect(privateCustomerChanged).not.toHaveBeenCalled();
    });
    it('throws an error if the customer has no active paypal subscriptions', async () => {
      const mockUid = faker.string.uuid();
      const mockAccountCustomer = ResultAccountCustomerFactory({
        uid: mockUid,
        stripeCustomerId: faker.string.uuid(),
      });
      const mockPaypalCustomer = ResultPaypalCustomerFactory({
        status: 'Cancelled',
        endedAt: faker.date.recent().valueOf(),
      });

      jest
        .spyOn(paypalBillingAgreementManager, 'retrieveActiveId')
        .mockResolvedValue(undefined);
      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer);
      jest
        .spyOn(paypalCustomerManager, 'fetchPaypalCustomersByUid')
        .mockResolvedValue([mockPaypalCustomer]);
      jest
        .spyOn(subscriptionManagementService, 'getCurrencyForCustomer')
        .mockResolvedValue(faker.finance.currencyCode().toLowerCase());
      jest.spyOn(subscriptionManager, 'listForCustomer').mockResolvedValue([]);

      await expect(
        subscriptionManagementService.createPaypalBillingAgreementId(
          faker.string.uuid(),
          faker.string.uuid()
        )
      ).rejects.toBeInstanceOf(
        CreateBillingAgreementPaypalSubscriptionNotFound
      );
      expect(privateCustomerChanged).not.toHaveBeenCalled();
    });
  });

  describe('getCancelFlowContent', () => {
    it('returns content (flowType - cancel)', async () => {
      const mockUid = faker.string.uuid();
      const mockSubscription = StripeResponseFactory(
        StripeSubscriptionFactory()
      );
      const mockProductNameByPriceIdsResultUtil = {
        purchaseForPriceId: jest.fn(),
      };

      jest
        .spyOn(
          subscriptionManagementService as any,
          'validateAndRetrieveSubscription'
        )
        .mockResolvedValue(mockSubscription);
      jest
        .spyOn(productConfigurationManager, 'getPageContentByPriceIds')
        .mockResolvedValue(
          mockProductNameByPriceIdsResultUtil as unknown as PageContentByPriceIdsResultUtil
        );

      mockProductNameByPriceIdsResultUtil.purchaseForPriceId.mockReturnValue(
        PageContentByPriceIdsPurchaseResultFactory()
      );

      const result = await subscriptionManagementService.getCancelFlowContent(
        mockUid,
        mockSubscription.id
      );

      expect(result.flowType).toEqual('cancel');
    });

    it('returns content (flowType - not_found)', async () => {
      const mockUid = faker.string.uuid();
      const mockSubscription = StripeResponseFactory(
        StripeSubscriptionFactory()
      );

      jest
        .spyOn(
          subscriptionManagementService as any,
          'validateAndRetrieveSubscription'
        )
        .mockResolvedValue(undefined);

      const result = await subscriptionManagementService.getCancelFlowContent(
        mockUid,
        mockSubscription.id
      );

      expect(result.flowType).toEqual('not_found');
    });

    it('throws error - SubscriptionManagementCouldNotRetrieveProductNamesFromCMSError', async () => {
      const mockUid = faker.string.uuid();
      const mockSubscription = StripeResponseFactory(
        StripeSubscriptionFactory()
      );
      const mockProductNameByPriceIdsResultUtil = {
        purchaseForPriceId: jest.fn(),
      };

      jest
        .spyOn(
          subscriptionManagementService as any,
          'validateAndRetrieveSubscription'
        )
        .mockResolvedValue(mockSubscription);
      jest
        .spyOn(productConfigurationManager, 'getPageContentByPriceIds')
        .mockResolvedValue(
          undefined as unknown as PageContentByPriceIdsResultUtil
        );

      mockProductNameByPriceIdsResultUtil.purchaseForPriceId.mockReturnValue(
        PageContentByPriceIdsPurchaseResultFactory()
      );

      await expect(
        subscriptionManagementService.getCancelFlowContent(
          mockUid,
          mockSubscription.id
        )
      ).rejects.toBeInstanceOf(
        SubscriptionManagementCouldNotRetrieveProductNamesFromCMSError
      );
    });

    it('returns not_found when subscription customer does not match', async () => {
      const mockStripeCustomer1 = StripeCustomerFactory();
      const mockStripeCustomer2 = StripeCustomerFactory();
      const mockAccountCustomer1 = ResultAccountCustomerFactory({
        stripeCustomerId: mockStripeCustomer1.id,
      });
      const mockSubscription2 = StripeResponseFactory(
        StripeSubscriptionFactory({
          customer: mockStripeCustomer2.id,
        })
      );
      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer1);

      jest
        .spyOn(subscriptionManager, 'retrieve')
        .mockResolvedValue(mockSubscription2);

      const result = await subscriptionManagementService.getCancelFlowContent(
        mockAccountCustomer1.uid,
        mockSubscription2.id
      );

      expect(result).toEqual({ flowType: 'not_found' });
    });

    it('returns not_found when subscription is not active', async () => {
      const mockStripeCustomer = StripeCustomerFactory();
      const mockAccountCustomer = ResultAccountCustomerFactory({
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
        mockAccountCustomer.uid,
        mockSubscription.id
      );

      expect(result).toEqual({ flowType: 'not_found' });
    });
  });

  describe('getStaySubscribedFlowContent', () => {
    it('returns content (flowType - stay_subscribed)', async () => {
      const mockUid = faker.string.uuid();
      const mockSubscription = StripeResponseFactory(
        StripeSubscriptionFactory()
      );
      const mockStripeCustomer = StripeResponseFactory(StripeCustomerFactory());
      const mockPaymentMethod = StripeResponseFactory(
        StripePaymentMethodFactory({})
      );
      const mockPaymentMethodInformation = {
        type: SubPlatPaymentMethodType.Card,
        brand: mockPaymentMethod.card?.brand,
        last4: mockPaymentMethod.card?.last4,
        expMonth: mockPaymentMethod.card?.exp_month,
        expYear: mockPaymentMethod.card?.exp_year,
        hasPaymentMethodError: undefined,
      };
      const mockProductNameByPriceIdsResultUtil = {
        purchaseForPriceId: jest.fn(),
      };
      const mockUpcomingInvoicePreview = InvoicePreviewFactory();

      jest
        .spyOn(
          subscriptionManagementService as any,
          'validateAndRetrieveSubscription'
        )
        .mockResolvedValue(mockSubscription);
      jest
        .spyOn(customerManager, 'retrieve')
        .mockResolvedValue(mockStripeCustomer);
      jest
        .spyOn(paymentMethodManager, 'getDefaultPaymentMethod')
        .mockResolvedValue(mockPaymentMethodInformation);
      jest
        .spyOn(productConfigurationManager, 'getPageContentByPriceIds')
        .mockResolvedValue(
          mockProductNameByPriceIdsResultUtil as unknown as PageContentByPriceIdsResultUtil
        );
      jest
        .spyOn(invoiceManager, 'previewUpcomingSubscription')
        .mockResolvedValue(mockUpcomingInvoicePreview);

      mockProductNameByPriceIdsResultUtil.purchaseForPriceId.mockReturnValue(
        PageContentByPriceIdsPurchaseResultFactory()
      );

      const result =
        await subscriptionManagementService.getStaySubscribedFlowContent(
          mockUid,
          mockSubscription.id
        );

      expect(result.flowType).toEqual('stay_subscribed');
    });

    it('returns content (flowType - not_found)', async () => {
      const mockUid = faker.string.uuid();
      const mockSubscription = StripeResponseFactory(
        StripeSubscriptionFactory()
      );

      jest
        .spyOn(
          subscriptionManagementService as any,
          'validateAndRetrieveSubscription'
        )
        .mockResolvedValue(undefined);

      const result =
        await subscriptionManagementService.getStaySubscribedFlowContent(
          mockUid,
          mockSubscription.id
        );

      expect(result.flowType).toEqual('not_found');
    });

    it('returns not_found when subscription customer does not match', async () => {
      const mockStripeCustomer1 = StripeCustomerFactory();
      const mockStripeCustomer2 = StripeCustomerFactory();
      const mockAccountCustomer1 = ResultAccountCustomerFactory({
        stripeCustomerId: mockStripeCustomer1.id,
      });
      const mockSubscription2 = StripeResponseFactory(
        StripeSubscriptionFactory({
          customer: mockStripeCustomer2.id,
        })
      );
      jest
        .spyOn(accountCustomerManager, 'getAccountCustomerByUid')
        .mockResolvedValue(mockAccountCustomer1);

      jest
        .spyOn(subscriptionManager, 'retrieve')
        .mockResolvedValue(mockSubscription2);

      const result =
        await subscriptionManagementService.getStaySubscribedFlowContent(
          mockAccountCustomer1.uid,
          mockSubscription2.id
        );

      expect(result).toEqual({ flowType: 'not_found' });
    });

    it('returns not_found when subscription is not active', async () => {
      const mockStripeCustomer = StripeCustomerFactory();
      const mockAccountCustomer = ResultAccountCustomerFactory({
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
          mockAccountCustomer.uid,
          mockSubscription.id
        );

      expect(result).toEqual({ flowType: 'not_found' });
    });

    it('throws error - SubscriptionManagementNoStripeCustomerFoundError', async () => {
      const mockUid = faker.string.uuid();
      const mockSubscription = StripeResponseFactory(
        StripeSubscriptionFactory()
      );

      jest
        .spyOn(
          subscriptionManagementService as any,
          'validateAndRetrieveSubscription'
        )
        .mockResolvedValue(mockSubscription);
      jest
        .spyOn(customerManager, 'retrieve')
        .mockRejectedValue(new CustomerDeletedError(mockUid));

      await expect(
        subscriptionManagementService.getStaySubscribedFlowContent(
          mockUid,
          mockSubscription.id
        )
      ).rejects.toBeInstanceOf(
        SubscriptionManagementNoStripeCustomerFoundError
      );
    });

    it('throws error - SubscriptionManagementCouldNotRetrieveProductNamesFromCMSError', async () => {
      const mockUid = faker.string.uuid();
      const mockSubscription = StripeResponseFactory(
        StripeSubscriptionFactory()
      );
      const mockStripeCustomer = StripeResponseFactory(StripeCustomerFactory());
      const mockPaymentMethod = StripeResponseFactory(
        StripePaymentMethodFactory({})
      );
      const mockPaymentMethodInformation = {
        type: SubPlatPaymentMethodType.Card,
        brand: mockPaymentMethod.card?.brand,
        last4: mockPaymentMethod.card?.last4,
        expMonth: mockPaymentMethod.card?.exp_month,
        expYear: mockPaymentMethod.card?.exp_year,
        hasPaymentMethodError: undefined,
      };
      const mockProductNameByPriceIdsResultUtil = {
        purchaseForPriceId: jest.fn(),
      };

      jest
        .spyOn(
          subscriptionManagementService as any,
          'validateAndRetrieveSubscription'
        )
        .mockResolvedValue(mockSubscription);
      jest
        .spyOn(customerManager, 'retrieve')
        .mockResolvedValue(mockStripeCustomer);
      jest
        .spyOn(paymentMethodManager, 'getDefaultPaymentMethod')
        .mockResolvedValue(mockPaymentMethodInformation);
      jest
        .spyOn(productConfigurationManager, 'getPageContentByPriceIds')
        .mockResolvedValue(
          undefined as unknown as PageContentByPriceIdsResultUtil
        );

      mockProductNameByPriceIdsResultUtil.purchaseForPriceId.mockReturnValue(
        PageContentByPriceIdsPurchaseResultFactory()
      );

      await expect(
        subscriptionManagementService.getStaySubscribedFlowContent(
          mockUid,
          mockSubscription.id
        )
      ).rejects.toBeInstanceOf(
        SubscriptionManagementCouldNotRetrieveProductNamesFromCMSError
      );
    });

    it('throws error - SubscriptionContentMissingUpcomingInvoicePreviewError', async () => {
      const mockUid = faker.string.uuid();
      const mockSubscription = StripeResponseFactory(
        StripeSubscriptionFactory()
      );
      const mockStripeCustomer = StripeResponseFactory(StripeCustomerFactory());
      const mockPaymentMethod = StripeResponseFactory(
        StripePaymentMethodFactory({})
      );
      const mockPaymentMethodInformation = {
        type: SubPlatPaymentMethodType.Card,
        brand: mockPaymentMethod.card?.brand,
        last4: mockPaymentMethod.card?.last4,
        expMonth: mockPaymentMethod.card?.exp_month,
        expYear: mockPaymentMethod.card?.exp_year,
        hasPaymentMethodError: undefined,
      };
      const mockProductNameByPriceIdsResultUtil = {
        purchaseForPriceId: jest.fn(),
      };

      jest
        .spyOn(
          subscriptionManagementService as any,
          'validateAndRetrieveSubscription'
        )
        .mockResolvedValue(mockSubscription);
      jest
        .spyOn(customerManager, 'retrieve')
        .mockResolvedValue(mockStripeCustomer);
      jest
        .spyOn(paymentMethodManager, 'getDefaultPaymentMethod')
        .mockResolvedValue(mockPaymentMethodInformation);
      jest
        .spyOn(productConfigurationManager, 'getPageContentByPriceIds')
        .mockResolvedValue(
          mockProductNameByPriceIdsResultUtil as unknown as PageContentByPriceIdsResultUtil
        );
      jest
        .spyOn(invoiceManager, 'previewUpcomingSubscription')
        .mockResolvedValue(undefined as unknown as InvoicePreview);

      mockProductNameByPriceIdsResultUtil.purchaseForPriceId.mockReturnValue(
        PageContentByPriceIdsPurchaseResultFactory()
      );

      await expect(
        subscriptionManagementService.getStaySubscribedFlowContent(
          mockUid,
          mockSubscription.id
        )
      ).rejects.toBeInstanceOf(
        SubscriptionContentMissingUpcomingInvoicePreviewError
      );
    });
  });
});
