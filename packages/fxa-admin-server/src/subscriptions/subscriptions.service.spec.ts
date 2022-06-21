/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Provider } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppStoreSubscriptionPurchase } from 'fxa-shared/payments/iap/apple-app-store/subscription-purchase';
import { PlayStoreSubscriptionPurchase } from 'fxa-shared/payments/iap/google-play/subscription-purchase';
import { STRIPE_PRICE_METADATA } from 'fxa-shared/payments/stripe';
import {
  MockConfig,
  mockConfigOverrides,
  MockLogService,
  MockMetricsFactory,
} from '../mocks';
import { AppStoreService } from './appstore.service';
import { PlayStoreService } from './playstore.service';
import { StripeService } from './stripe.service';
import { SubscriptionsService } from './subscriptions.service';
import { addDays, created } from './test.util';

describe('Subscription Service', () => {
  // Stripe Service Mock
  const mockFetchCustomers = jest.fn();
  const mockLookupLatestInvoice = jest.fn();
  const mockAllAbbrevPlans = jest.fn();
  const mockCreateManageSubscriptionLink = jest.fn();
  const MockStripeService: Provider = {
    provide: StripeService,
    useFactory: () => {
      const realStripeService = jest.requireActual('./stripe.service.ts');
      return {
        ...realStripeService,
        fetchCustomer: mockFetchCustomers,
        lookupLatestInvoice: mockLookupLatestInvoice,
        allAbbrevPlans: mockAllAbbrevPlans,
        createManageSubscriptionLink: mockCreateManageSubscriptionLink,
      };
    },
  };

  // Play Store Service Mock
  const mockPlayStoreGetSubscriptions = jest.fn();
  const MockPlayStore: Provider = {
    provide: PlayStoreService,
    useFactory: () => {
      return {
        getSubscriptions: mockPlayStoreGetSubscriptions,
      };
    },
  };

  // App Store Service Mock
  const mockAppStoreGetSubscriptions = jest.fn();
  const MockAppStore: Provider = {
    provide: AppStoreService,
    useFactory: () => {
      return {
        getSubscriptions: mockAppStoreGetSubscriptions,
      };
    },
  };

  // Subscription service to test
  let service: SubscriptionsService;

  // Defaults
  const uid = 'uid-123';
  const planId = 'plan-123';
  const planName = 'plan 123';
  const productId = 'product-123';
  const productName = 'product 123';
  const subscriptionId = 'subscription-123';
  const manageSubscriptionLink =
    'https://dashboard.stripe.com/test/customers/customer-123';
  const latestInvoice = 'invoice-123';
  const currentPeriodStart = created;
  const currentPeriodEnd = addDays(created, 30);
  const cancelAtPeriodEnd = true;
  const customerId = 'customer-123';
  const status = 'active';
  const orderId = 'order-123';
  const bundleId = 'bundle-123';
  const plan = {
    amount: 1.0,
    configuration: null,
    currency: 'USD',
    interval: 'month',
    interval_count: 1,
    plan_id: planId,
    plan_metadata: {},
    plan_name: planName,
    product_id: productId,
    product_metadata: {},
    product_name: productName,
  };
  const subscription = {
    subscriptions: {
      data: [],
    },
  };

  beforeEach(async () => {
    mockConfigOverrides['featureFlags.subscriptions.appStore'] = true;
    mockConfigOverrides['featureFlags.subscriptions.playStore'] = true;
    mockConfigOverrides['featureFlags.subscriptions.stripe'] = true;

    mockAllAbbrevPlans.mockClear();
    mockFetchCustomers.mockClear();
    mockLookupLatestInvoice.mockClear();
    mockAppStoreGetSubscriptions.mockClear();
    mockPlayStoreGetSubscriptions.mockClear();
    mockCreateManageSubscriptionLink.mockClear();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MockAppStore,
        MockConfig,
        MockLogService,
        MockMetricsFactory,
        MockPlayStore,
        MockStripeService,
        SubscriptionsService,
      ],
    }).compile();

    service = module.get<SubscriptionsService>(SubscriptionsService);
  });

  afterEach(() => {
    delete mockConfigOverrides['featureFlags.subscriptions.playStore'];
    delete mockConfigOverrides['featureFlags.subscriptions.appStore'];
    delete mockConfigOverrides['featureFlags.subscriptions.stripe'];
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should resolve no subscriptions', async () => {
    mockFetchCustomers.mockImplementation(async () => subscription);
    mockAppStoreGetSubscriptions.mockImplementation(async () => []);
    mockPlayStoreGetSubscriptions.mockImplementation(async () => []);

    const subscriptions = await service.getSubscriptions(uid);
    expect(subscriptions).toEqual([]);
    expect(mockAllAbbrevPlans).toBeCalledTimes(1);
    expect(mockFetchCustomers).toBeCalledWith(uid, ['subscriptions']);
    expect(mockAppStoreGetSubscriptions).toBeCalledWith(uid);
    expect(mockPlayStoreGetSubscriptions).toBeCalledWith(uid);
  });

  it('should provide stripe subscriptions', async () => {
    // Arrange
    const endedAt = null;
    const invoice = {
      hosted_invoice_url: 'http://foo.bar/' + latestInvoice,
    };
    const customer = {
      subscriptions: {
        data: [
          {
            customer: customerId,
            // The stripe API returns timestamps in seconds... converting seconds to millis.
            created: created / 1e3,
            cancel_at_period_end: cancelAtPeriodEnd,
            current_period_end: currentPeriodEnd / 1e3,
            current_period_start: currentPeriodStart / 1e3,
            ended_at: endedAt,
            id: subscriptionId,
            latest_invoice: latestInvoice,
            plan: {
              id: planId,
              product: productId,
              product_name: productName,
            },
            status,
          },
        ],
      },
    };

    // Mocks
    mockFetchCustomers.mockImplementation(async () => customer);
    mockLookupLatestInvoice.mockImplementation(async () => invoice);
    mockAppStoreGetSubscriptions.mockImplementation(async (_uid: string) => []);
    mockPlayStoreGetSubscriptions.mockImplementation(
      async (_uid: string) => []
    );
    mockAllAbbrevPlans.mockImplementation(async () => [plan]);
    mockCreateManageSubscriptionLink.mockImplementation(
      async () => manageSubscriptionLink
    );

    // Act
    const subscriptions = await service.getSubscriptions(uid);

    // Assert
    expect(subscriptions).toEqual([
      {
        cancelAtPeriodEnd,
        created,
        currentPeriodEnd,
        currentPeriodStart,
        endedAt,
        latestInvoice: 'http://foo.bar/' + latestInvoice,
        planId,
        productId,
        productName,
        status,
        subscriptionId,
        manageSubscriptionLink,
      },
    ]);
    expect(mockAllAbbrevPlans).toBeCalledTimes(1);
    expect(mockFetchCustomers).toBeCalledWith(uid, ['subscriptions']);
    expect(mockCreateManageSubscriptionLink).toBeCalledWith(customerId);
    expect(mockAppStoreGetSubscriptions).toBeCalledWith(uid);
    expect(mockPlayStoreGetSubscriptions).toBeCalledWith(uid);
  });

  it('should provide app store subscriptions', async () => {
    // Arrange
    const appStoreSubscriptionPurchase: Partial<AppStoreSubscriptionPurchase> =
      {
        autoRenewStatus: 1,
        bundleId,
        expiresDate: currentPeriodEnd,
        isEntitlementActive: () => true,
        isExpired: () => false,
        isFreeTrial: () => false,
        isInBillingRetryPeriod: () => false,
        isInGracePeriod: () => false,
        originalPurchaseDate: created,
        originalTransactionId: subscriptionId,
        productId,
        verifiedAt: currentPeriodStart,
        willRenew: () => true,
      };
    const abbrevPlan = {
      ...plan,
      plan_metadata: {
        [STRIPE_PRICE_METADATA.APP_STORE_PRODUCT_IDS]:
          'product-123,product-234',
      },
    };

    mockFetchCustomers.mockImplementation(async () => subscription);
    mockAppStoreGetSubscriptions.mockImplementation(async (_uid: string) => [
      appStoreSubscriptionPurchase,
    ]);
    mockPlayStoreGetSubscriptions.mockImplementation(
      async (_uid: string) => []
    );
    mockAllAbbrevPlans.mockImplementation(async () => [abbrevPlan]);

    // Act
    const subscriptions = await service.getSubscriptions(uid);

    // Assert
    expect(subscriptions).toEqual([
      {
        cancelAtPeriodEnd: false,
        created: created,
        currentPeriodEnd,
        currentPeriodStart,
        endedAt: null,
        latestInvoice: '',
        planId,
        productId,
        productName,
        status,
        subscriptionId,
      },
    ]);
    expect(mockAllAbbrevPlans).toBeCalledTimes(1);
    expect(mockFetchCustomers).toBeCalledWith(uid, ['subscriptions']);
    expect(mockAppStoreGetSubscriptions).toBeCalledWith(uid);
    expect(mockPlayStoreGetSubscriptions).toBeCalledWith(uid);
  });

  it('should provide play store subscriptions', async () => {
    // Arrange
    const playStorePurchase: Partial<PlayStoreSubscriptionPurchase> = {
      autoRenewing: true,
      countryCode: 'US',
      expiryTimeMillis: currentPeriodEnd,
      isEntitlementActive: () => true,
      orderId: orderId,
      paymentState: 1,
      packageName: productName,
      priceCurrencyCode: plan.currency,
      priceAmountMicros: plan.amount * 10e6,
      purchaseToken: subscriptionId,
      sku: productId,
      startTimeMillis: currentPeriodStart,
      verifiedAt: created,
    };

    mockFetchCustomers.mockImplementation(async () => ({
      subscriptions: { data: [] },
    }));
    mockAppStoreGetSubscriptions.mockImplementation(async (_uid: string) => []);
    mockPlayStoreGetSubscriptions.mockImplementation(async (_uid: string) => [
      playStorePurchase,
    ]);
    mockAllAbbrevPlans.mockImplementation(async () => [
      {
        ...plan,
        plan_metadata: {
          [STRIPE_PRICE_METADATA.PLAY_SKU_IDS]: 'product-123,product-234',
        },
      },
    ]);

    // Act
    const subscriptions = await service.getSubscriptions(uid);

    // Assert
    expect(subscriptions).toEqual([
      {
        cancelAtPeriodEnd: false,
        created,
        currentPeriodEnd,
        currentPeriodStart,
        endedAt: null,
        latestInvoice: '',
        planId,
        productId,
        productName,
        subscriptionId,
        status,
      },
    ]);
    expect(mockAllAbbrevPlans).toBeCalledTimes(1);
    expect(mockFetchCustomers).toBeCalledWith(uid, ['subscriptions']);
    expect(mockAppStoreGetSubscriptions).toBeCalledWith(uid);
    expect(mockPlayStoreGetSubscriptions).toBeCalledWith(uid);
  });

  describe('feature flags', () => {
    beforeEach(() => {
      mockConfigOverrides['featureFlags.subscriptions.appStore'] = false;
      mockConfigOverrides['featureFlags.subscriptions.playStore'] = false;
      mockConfigOverrides['featureFlags.subscriptions.stripe'] = false;
    });

    it('should respect feature flags', async () => {
      mockFetchCustomers.mockImplementation(async () => subscription);
      mockAppStoreGetSubscriptions.mockImplementation(async () => []);
      mockPlayStoreGetSubscriptions.mockImplementation(async () => []);

      const subscriptions = await service.getSubscriptions(uid);
      expect(subscriptions).toEqual([]);
      expect(mockAllAbbrevPlans).toBeCalledTimes(0);
      expect(mockFetchCustomers).toBeCalledTimes(0);
      expect(mockCreateManageSubscriptionLink).toBeCalledTimes(0);
      expect(mockAppStoreGetSubscriptions).toBeCalledTimes(0);
      expect(mockPlayStoreGetSubscriptions).toBeCalledTimes(0);
    });
  });
});
