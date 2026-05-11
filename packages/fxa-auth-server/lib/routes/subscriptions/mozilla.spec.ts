/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { MozillaSubscriptionTypes } = require('fxa-shared/subscriptions/types');
const { ERRNO } = require('@fxa/accounts/errors');
const uuid = require('uuid');
const { getRoute } = require('../../../test/routes_helpers');
const { OAUTH_SCOPE_SUBSCRIPTIONS } = require('fxa-shared/oauth/constants');
const {
  appStoreSubscriptionPurchaseToAppStoreSubscriptionDTO,
  playStoreSubscriptionPurchaseToPlayStoreSubscriptionDTO,
} = require('../../payments/iap/iap-formatter');

// We want to track the call count of these methods without
// stubbing them (i.e. we want to use their real implementation),
// so we use jest.fn wrapping the real implementations.
jest.mock('../../payments/iap/iap-formatter', () => {
  const actual = jest.requireActual('../../payments/iap/iap-formatter');
  return {
    __esModule: true,
    ...actual,
    appStoreSubscriptionPurchaseToAppStoreSubscriptionDTO: jest.fn(
      actual.appStoreSubscriptionPurchaseToAppStoreSubscriptionDTO
    ),
    playStoreSubscriptionPurchaseToPlayStoreSubscriptionDTO: jest.fn(
      actual.playStoreSubscriptionPurchaseToPlayStoreSubscriptionDTO
    ),
  };
});

const { mozillaSubscriptionRoutes } = require('./mozilla');

const UID = uuid.v4({}, Buffer.alloc(16)).toString('hex');
const TEST_EMAIL = 'testo@example.gg';
const ACCOUNT_LOCALE = 'en-US';

const MOCK_SCOPES = ['profile:email', OAUTH_SCOPE_SUBSCRIPTIONS];
const VALID_REQUEST = {
  auth: {
    credentials: {
      scope: MOCK_SCOPES,
      user: `${UID}`,
      email: `${TEST_EMAIL}`,
    },
  },
  query: {
    uid: `${UID}`,
  },
};
const mockCustomer = { id: 'cus_testo', subscriptions: { data: {} } };
const mockSubscription = {
  _subscription_type: 'web',
  subscription_id: 'sub_1JhyIYBVqmGyQTMa3XMF6ADj',
};
const expectedBillingDetails = {
  payment_provider: 'dinersclub',
};
const mockSubsAndBillingDetails = {
  ...expectedBillingDetails,
  customerCurrency: 'usd',
  subscriptions: [mockSubscription],
};
const mockPrice = {
  currency_options: {
    usd: {
      unit_amount: 400,
    },
  },
  recurring: {
    interval: 'month',
    interval_count: 1,
  },
};
const mockSubscriptionManagementPriceInfo = {
  amount: mockPrice.currency_options.usd.unit_amount,
  currency: 'usd',
  interval: mockPrice.recurring.interval,
  interval_count: mockPrice.recurring.interval_count,
};
const mockFormattedWebSubscription = {
  created: 1588972390,
  current_period_end: 1591650790,
  current_period_start: 1588972390,
  plan_changed: null,
  previous_product: null,
  product_name: 'Amazing Product',
  status: 'active',
  subscription_id: 'sub_12345',
};

const startTime = `${Date.now() - 10000}`;
const endTime = `${Date.now() + 10000}`;

const mockPlayStoreSubscriptionPurchase = {
  kind: 'androidpublisher#subscriptionPurchase',
  startTimeMillis: startTime,
  expiryTimeMillis: endTime,
  autoRenewing: true,
  priceCurrencyCode: 'usd',
  priceAmountMicros: '99000000',
  countryCode: 'US',
  developerPayload: '',
  paymentState: 1,
  orderId: 'GPA.3313-5503-3858-32549',
  packageName: 'testPackage',
  purchaseToken: 'testToken',
  sku: 'sku',
  verifiedAt: Date.now(),
  isEntitlementActive: jest.fn().mockReturnValue(true),
};

const mockAppendedPlayStoreSubscriptionPurchase = {
  ...mockPlayStoreSubscriptionPurchase,
  price_id: 'price_lol',
  product_id: 'prod_lol',
  product_name: 'LOL Product',
  _subscription_type: MozillaSubscriptionTypes.IAP_GOOGLE,
};

const mockGooglePlaySubscription = {
  _subscription_type: MozillaSubscriptionTypes.IAP_GOOGLE,
  price_id: mockAppendedPlayStoreSubscriptionPurchase.price_id,
  product_id: mockAppendedPlayStoreSubscriptionPurchase.product_id,
  product_name: mockAppendedPlayStoreSubscriptionPurchase.product_name,
  auto_renewing: mockPlayStoreSubscriptionPurchase.autoRenewing,
  expiry_time_millis: mockPlayStoreSubscriptionPurchase.expiryTimeMillis,
  package_name: mockPlayStoreSubscriptionPurchase.packageName,
  sku: mockPlayStoreSubscriptionPurchase.sku,
};

const mockAppStoreSubscriptionPurchase = {
  autoRenewStatus: 1,
  productId: 'wow',
  bundleId: 'hmm',
  currency: 'usd',
  isEntitlementActive: jest.fn().mockReturnValue(true),
};

const mockAppendedAppStoreSubscriptionPurchase = {
  ...mockAppStoreSubscriptionPurchase,
  price_id: 'price_123',
  product_id: 'prod_123',
  product_name: 'Cooking with Foxkeh',
  _subscription_type: MozillaSubscriptionTypes.IAP_APPLE,
};

const mockAppStoreSubscription = {
  _subscription_type: MozillaSubscriptionTypes.IAP_APPLE,
  app_store_product_id: 'wow',
  auto_renewing: true,
  bundle_id: 'hmm',
  price_id: 'price_123',
  product_id: 'prod_123',
  product_name: 'Cooking with Foxkeh',
};

const mockIapOffering = {
  offering: {
    defaultPurchase: {
      stripePlanChoices: [],
    },
  },
};

const mocks = require('../../../test/mocks');
const log = mocks.mockLog();
const db = mocks.mockDB({
  uid: UID,
  email: TEST_EMAIL,
  locale: ACCOUNT_LOCALE,
});
const customs = mocks.mockCustoms();
const mockConfig = {
  subscriptions: {
    billingPriceInfoFeature: true,
  },
};
let stripeHelper: any;
let capabilityService: any;
const iapOfferingUtil: any = {
  getIapPageContentByStoreId: jest.fn(),
};
let priceManager: any;
let productConfigurationManager: any;

async function runTest(routePath: any, routeDependencies: any = {}) {
  const playSubscriptions = {
    getSubscriptions: jest
      .fn()
      .mockResolvedValue([mockAppendedPlayStoreSubscriptionPurchase]),
  };
  const appStoreSubscriptions = {
    getSubscriptions: jest
      .fn()
      .mockResolvedValue([mockAppendedAppStoreSubscriptionPurchase]),
  };
  const routes = mozillaSubscriptionRoutes({
    log,
    db,
    customs,
    config: mockConfig,
    stripeHelper,
    capabilityService,
    playSubscriptions,
    appStoreSubscriptions,
    ...routeDependencies,
  });
  const route = getRoute(routes, routePath, 'GET');
  const request = mocks.mockRequest(VALID_REQUEST);
  return route.handler(request);
}

describe('mozilla-subscriptions', () => {
  beforeEach(() => {
    capabilityService = {};
    stripeHelper = {
      getBillingDetailsAndSubscriptions: jest
        .fn()
        .mockResolvedValue(mockSubsAndBillingDetails),
      fetchCustomer: jest.fn().mockResolvedValue(mockCustomer),
      formatSubscriptionsForSupport: jest
        .fn()
        .mockResolvedValue([mockFormattedWebSubscription]),
    };
    (
      appStoreSubscriptionPurchaseToAppStoreSubscriptionDTO as jest.Mock
    ).mockClear();
    (
      playStoreSubscriptionPurchaseToPlayStoreSubscriptionDTO as jest.Mock
    ).mockClear();
    priceManager = mocks.mockPriceManager();
    productConfigurationManager = mocks.mockProductConfigurationManager();
    productConfigurationManager.getIapOfferings = jest
      .fn()
      .mockResolvedValue(iapOfferingUtil);
    iapOfferingUtil.getIapPageContentByStoreId = jest
      .fn()
      .mockReturnValue(mockIapOffering);
    priceManager.retrieve = jest.fn().mockResolvedValue(mockPrice);
    priceManager.retrieveByInterval = jest.fn().mockResolvedValue(mockPrice);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('GET /customer/billing-and-subscriptions', () => {
    it('gets customer billing details and Stripe, Google Play, and App Store subscriptions', async () => {
      const resp = await runTest(
        '/oauth/mozilla-subscriptions/customer/billing-and-subscriptions'
      );
      expect(resp).toEqual({
        ...expectedBillingDetails,
        subscriptions: [
          {
            ...mockSubscription,
            priceInfo: mockSubscriptionManagementPriceInfo,
          },
          {
            ...mockGooglePlaySubscription,
            priceInfo: mockSubscriptionManagementPriceInfo,
          },
          {
            ...mockAppStoreSubscription,
            priceInfo: mockSubscriptionManagementPriceInfo,
          },
        ],
      });
      expect(
        (playStoreSubscriptionPurchaseToPlayStoreSubscriptionDTO as jest.Mock)
          .mock.calls.length
      ).toBe(1);
      expect(
        (appStoreSubscriptionPurchaseToAppStoreSubscriptionDTO as jest.Mock)
          .mock.calls.length
      ).toBe(1);
    });

    it('gets customer billing details and Stripe, Google Play, and App Store subscriptions without priceInfo', async () => {
      const resp = await runTest(
        '/oauth/mozilla-subscriptions/customer/billing-and-subscriptions',
        {
          config: { subscriptions: { billingPriceInfoFeature: false } },
        }
      );
      expect(resp).toEqual({
        ...expectedBillingDetails,
        subscriptions: [
          {
            ...mockSubscription,
            priceInfo: undefined,
          },
          {
            ...mockGooglePlaySubscription,
            priceInfo: undefined,
          },
          {
            ...mockAppStoreSubscription,
            priceInfo: undefined,
          },
        ],
      });
      expect(
        (playStoreSubscriptionPurchaseToPlayStoreSubscriptionDTO as jest.Mock)
          .mock.calls.length
      ).toBe(1);
      expect(
        (appStoreSubscriptionPurchaseToAppStoreSubscriptionDTO as jest.Mock)
          .mock.calls.length
      ).toBe(1);
    });

    it('gets customer billing details and only Stripe subscriptions', async () => {
      const playSubscriptions = {
        getSubscriptions: jest.fn().mockResolvedValue([]),
      };
      const appStoreSubscriptions = {
        getSubscriptions: jest.fn().mockResolvedValue([]),
      };
      stripeHelper.addPriceInfoToIapPurchases = jest.fn().mockResolvedValue([]);

      const resp = await runTest(
        '/oauth/mozilla-subscriptions/customer/billing-and-subscriptions',
        {
          playSubscriptions,
          appStoreSubscriptions,
        }
      );
      expect(resp).toEqual({
        ...expectedBillingDetails,
        subscriptions: [
          {
            ...mockSubscription,
            priceInfo: mockSubscriptionManagementPriceInfo,
          },
        ],
      });
    });

    it('gets customer billing details and only Google Play subscriptions', async () => {
      const stripeHelper = {
        getBillingDetailsAndSubscriptions: jest.fn().mockResolvedValue(null),
        addPriceInfoToIapPurchases: jest
          .fn()
          .mockResolvedValue([mockGooglePlaySubscription]),
      };
      const appStoreSubscriptions = {
        getSubscriptions: jest.fn().mockResolvedValue([]),
      };
      const resp = await runTest(
        '/oauth/mozilla-subscriptions/customer/billing-and-subscriptions',
        {
          stripeHelper,
          appStoreSubscriptions,
        }
      );
      expect(resp).toEqual({
        subscriptions: [
          {
            ...mockGooglePlaySubscription,
            priceInfo: mockSubscriptionManagementPriceInfo,
          },
        ],
      });
    });

    it('gets customer billing details and only App Store subscriptions', async () => {
      const stripeHelper = {
        getBillingDetailsAndSubscriptions: jest.fn().mockResolvedValue(null),
        addPriceInfoToIapPurchases: jest
          .fn()
          .mockResolvedValue([mockAppStoreSubscription]),
      };
      const playSubscriptions = {
        getSubscriptions: jest.fn().mockResolvedValue([]),
      };
      const resp = await runTest(
        '/oauth/mozilla-subscriptions/customer/billing-and-subscriptions',
        {
          stripeHelper,
          playSubscriptions,
        }
      );
      expect(resp).toEqual({
        subscriptions: [
          {
            ...mockAppStoreSubscription,
            priceInfo: mockSubscriptionManagementPriceInfo,
          },
        ],
      });
    });

    it('throws an error when there are no subscriptions', async () => {
      const playSubscriptions = {
        getSubscriptions: jest.fn().mockResolvedValue([]),
      };
      const appStoreSubscriptions = {
        getSubscriptions: jest.fn().mockResolvedValue([]),
      };
      const stripeHelper = {
        getBillingDetailsAndSubscriptions: jest.fn().mockResolvedValue(null),
        addPriceInfoToIapPurchases: jest.fn().mockResolvedValue([]),
      };
      try {
        await runTest(
          '/oauth/mozilla-subscriptions/customer/billing-and-subscriptions',
          {
            playSubscriptions,
            stripeHelper,
            appStoreSubscriptions,
          }
        );
        throw new Error('an error should have been thrown');
      } catch (e: any) {
        expect(e.errno).toBe(ERRNO.UNKNOWN_SUBSCRIPTION_CUSTOMER);
      }
    });
  });
});
