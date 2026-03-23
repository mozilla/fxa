/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import sinon from 'sinon';

const { MozillaSubscriptionTypes } = require('fxa-shared/subscriptions/types');
const { ERRNO } = require('@fxa/accounts/errors');
const uuid = require('uuid');
const sandbox = sinon.createSandbox();
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

const {
  MozillaSubscriptionHandler,
  SubscriptionManagementPriceMappingError,
  mozillaSubscriptionRoutes,
} = require('./mozilla');

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
  isEntitlementActive: sinon.fake.returns(true),
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
  isEntitlementActive: sinon.fake.returns(true),
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
  getIapPageContentByStoreId: sandbox.stub(),
};
let priceManager: any;
let productConfigurationManager: any;

async function runTest(routePath: any, routeDependencies: any = {}) {
  const playSubscriptions = {
    getSubscriptions: sandbox
      .stub()
      .resolves([mockAppendedPlayStoreSubscriptionPurchase]),
  };
  const appStoreSubscriptions = {
    getSubscriptions: sandbox
      .stub()
      .resolves([mockAppendedAppStoreSubscriptionPurchase]),
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
      getBillingDetailsAndSubscriptions: sandbox
        .stub()
        .resolves(mockSubsAndBillingDetails),
      fetchCustomer: sandbox.stub().resolves(mockCustomer),
      formatSubscriptionsForSupport: sandbox
        .stub()
        .resolves([mockFormattedWebSubscription]),
    };
    (
      appStoreSubscriptionPurchaseToAppStoreSubscriptionDTO as jest.Mock
    ).mockClear();
    (
      playStoreSubscriptionPurchaseToPlayStoreSubscriptionDTO as jest.Mock
    ).mockClear();
    priceManager = mocks.mockPriceManager();
    productConfigurationManager = mocks.mockProductConfigurationManager();
    productConfigurationManager.getIapOfferings = sandbox
      .stub()
      .resolves(iapOfferingUtil);
    iapOfferingUtil.getIapPageContentByStoreId = sandbox
      .stub()
      .returns(mockIapOffering);
    priceManager.retrieve = sandbox.stub().resolves(mockPrice);
    priceManager.retrieveByInterval = sandbox.stub().resolves(mockPrice);
  });

  afterEach(() => {
    sandbox.restore();
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
        (
          playStoreSubscriptionPurchaseToPlayStoreSubscriptionDTO as jest.Mock
        ).mock.calls.length
      ).toBe(1);
      expect(
        (
          appStoreSubscriptionPurchaseToAppStoreSubscriptionDTO as jest.Mock
        ).mock.calls.length
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
        (
          playStoreSubscriptionPurchaseToPlayStoreSubscriptionDTO as jest.Mock
        ).mock.calls.length
      ).toBe(1);
      expect(
        (
          appStoreSubscriptionPurchaseToAppStoreSubscriptionDTO as jest.Mock
        ).mock.calls.length
      ).toBe(1);
    });

    it('gets customer billing details and only Stripe subscriptions', async () => {
      const playSubscriptions = {
        getSubscriptions: sandbox.stub().resolves([]),
      };
      const appStoreSubscriptions = {
        getSubscriptions: sandbox.stub().resolves([]),
      };
      stripeHelper.addPriceInfoToIapPurchases = sandbox.stub().resolves([]);

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
        getBillingDetailsAndSubscriptions: sandbox.stub().resolves(null),
        addPriceInfoToIapPurchases: sandbox
          .stub()
          .resolves([mockGooglePlaySubscription]),
      };
      const appStoreSubscriptions = {
        getSubscriptions: sandbox.stub().resolves([]),
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
        getBillingDetailsAndSubscriptions: sandbox.stub().resolves(null),
        addPriceInfoToIapPurchases: sandbox
          .stub()
          .resolves([mockAppStoreSubscription]),
      };
      const playSubscriptions = {
        getSubscriptions: sandbox.stub().resolves([]),
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
        getSubscriptions: sandbox.stub().resolves([]),
      };
      const appStoreSubscriptions = {
        getSubscriptions: sandbox.stub().resolves([]),
      };
      const stripeHelper = {
        getBillingDetailsAndSubscriptions: sandbox.stub().resolves(null),
        addPriceInfoToIapPurchases: sandbox.stub().resolves([]),
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

describe('plan-eligibility', () => {
  beforeEach(() => {
    priceManager = mocks.mockPriceManager();
    productConfigurationManager = mocks.mockProductConfigurationManager();
    capabilityService = {
      getPlanEligibility: sandbox.stub().resolves({
        subscriptionEligibilityResult: 'eligibility',
      }),
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('GET /customer/plan-eligibility/example-planid', () => {
    it('gets plan eligibility', async () => {
      const resp = await runTest(
        '/oauth/mozilla-subscriptions/customer/plan-eligibility/{planId}'
      );
      expect(resp).toEqual({
        eligibility: 'eligibility',
        currentPlan: undefined,
      });
    });
  });
});

describe('MozillaSubscriptionHandler', () => {
  let mozillaSubscriptionsHandler: any;
  const playSubscriptions = {
    getSubscriptions: sandbox.stub(),
  };
  const appStoreSubscriptions = {
    getSubscriptions: sandbox.stub(),
  };

  const mockSubId = 'sub_123';
  const mockSkuId = 'sku';
  const mockAppleProductId = 'product_ios';
  const mockPriceInfo1 = {
    amount: 400,
    currency: 'usd',
    interval: 'month',
    interval_count: 1,
  };
  const mockPriceInfo2 = {
    amount: 400,
    currency: 'usd',
    interval: 'year',
    interval_count: 1,
  };
  const mockPriceInfo3 = {
    amount: null,
    currency: null,
    interval: 'month',
    interval_count: 1,
  };
  const mockPriceInfoMap = [
    { uniqueId: mockSubId, priceInfo: mockPriceInfo1 },
    { uniqueId: mockSkuId, priceInfo: mockPriceInfo2 },
    { uniqueId: mockAppleProductId, priceInfo: mockPriceInfo3 },
  ];

  beforeEach(() => {
    priceManager = mocks.mockPriceManager();
    productConfigurationManager = mocks.mockProductConfigurationManager();
    mozillaSubscriptionsHandler = new MozillaSubscriptionHandler(
      log,
      db,
      mockConfig,
      customs,
      stripeHelper,
      playSubscriptions,
      appStoreSubscriptions,
      capabilityService
    );
    productConfigurationManager.getIapOfferings = sandbox
      .stub()
      .resolves(iapOfferingUtil);
    iapOfferingUtil.getIapPageContentByStoreId = sandbox
      .stub()
      .returns(mockIapOffering);
    priceManager.retrieve = sandbox.stub().resolves(mockPrice);
    priceManager.retrieveByInterval = sandbox.stub().resolves(mockPrice);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('fetchIapPriceInfo', () => {
    it('successfully fetches price info for google play store', async () => {
      const result = await mozillaSubscriptionsHandler.fetchIapPriceInfo(
        [{ sku: mockSkuId, priceCurrencyCode: 'usd' }],
        []
      );
      expect(result).toEqual([
        { uniqueId: mockSkuId, priceInfo: mockPriceInfo1 },
      ]);
    });

    it('successfully fetches price info for app store', async () => {
      const result = await mozillaSubscriptionsHandler.fetchIapPriceInfo(
        [],
        [{ productId: mockAppleProductId, currency: 'usd' }]
      );
      expect(result).toEqual([
        { uniqueId: mockAppleProductId, priceInfo: mockPriceInfo1 },
      ]);
    });

    it('throws if IAP CMS config could not be found', async () => {
      iapOfferingUtil.getIapPageContentByStoreId = sandbox
        .stub()
        .returns(undefined);
      try {
        await mozillaSubscriptionsHandler.fetchIapPriceInfo([], []);
      } catch (error: any) {
        expect(error).toBeInstanceOf(SubscriptionManagementPriceMappingError);
        expect(error.message).toBe('IAP offering CMS config not found');
      }
    });

    it('throws if Price not found for IAP', async () => {
      priceManager.retrieveByInterval = sandbox.stub().resolves(undefined);
      try {
        await mozillaSubscriptionsHandler.fetchIapPriceInfo([], []);
      } catch (error: any) {
        expect(error).toBeInstanceOf(SubscriptionManagementPriceMappingError);
        expect(error.message).toBe('Price not found for IAP');
      }
    });
  });

  describe('findPriceInfo', () => {
    it('successfully returns the correct Price', () => {
      const result = mozillaSubscriptionsHandler.findPriceInfo(
        mockSubId,
        mockPriceInfoMap
      );
      expect(result).toBe(mockPriceInfo1);
    });

    it('successfully returns undefined if feature is disabled', () => {
      const mozillaSubscriptionsHandler = new MozillaSubscriptionHandler(
        log,
        db,
        {
          subscriptions: {
            billingPriceInfoFeature: false,
          },
        },
        customs,
        stripeHelper,
        playSubscriptions,
        appStoreSubscriptions,
        capabilityService
      );
      const result = mozillaSubscriptionsHandler.findPriceInfo(
        mockSubId,
        mockPriceInfoMap
      );
      expect(result).toBeUndefined();
    });

    it('throws if price is not found', () => {
      try {
        mozillaSubscriptionsHandler.findPriceInfo(
          'doesnotexist',
          mockPriceInfoMap
        );
        throw new Error('an error should have been thrown');
      } catch (error: any) {
        expect(error).toBeInstanceOf(SubscriptionManagementPriceMappingError);
      }
    });
  });

  describe('mapPriceInfo', () => {
    it('successfully maps a price and with currency', () => {
      const result = mozillaSubscriptionsHandler.mapPriceInfo(mockPrice, 'usd');
      expect(result).toEqual(mockPriceInfo1);
    });
    it('successfully maps a price and with invalid currency', () => {
      const result = mozillaSubscriptionsHandler.mapPriceInfo(
        mockPrice,
        'invalid'
      );
      expect(result).toEqual({
        ...mockPriceInfo3,
        currency: 'invalid',
      });
    });
    it('successfully maps a price and without currency', () => {
      const result = mozillaSubscriptionsHandler.mapPriceInfo(mockPrice);
      expect(result).toEqual(mockPriceInfo3);
    });
    it('throws if price does not have recurring', () => {
      try {
        mozillaSubscriptionsHandler.mapPriceInfo({});
        throw new Error('an error should have been thrown');
      } catch (error: any) {
        expect(error).toBeInstanceOf(SubscriptionManagementPriceMappingError);
        expect(error.message).toBe('Only support recurring prices');
      }
    });
  });
});
