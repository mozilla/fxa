/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { MozillaSubscriptionTypes } from 'fxa-shared/subscriptions/types';

import { ERRNO } from '../../../../lib/error';

('use strict');

const sinon = require('sinon');
const chai = require('chai');
const assert = { ...sinon.assert, ...chai.assert };
const uuid = require('uuid');
const sandbox = sinon.createSandbox();
const proxyquire = require('proxyquire');
const { getRoute } = require('../../../routes_helpers');
const { OAUTH_SCOPE_SUBSCRIPTIONS } = require('fxa-shared/oauth/constants');
const UID = uuid.v4({}, Buffer.alloc(16)).toString('hex');
const TEST_EMAIL = 'testo@example.gg';
const ACCOUNT_LOCALE = 'en-US';
const {
  appStoreSubscriptionPurchaseToAppStoreSubscriptionDTO,
  playStoreSubscriptionPurchaseToPlayStoreSubscriptionDTO,
} = require('../../../../lib/payments/iap/iap-formatter');

// We want to track the call count of these methods without
// stubbing them (i.e. we want to use their real implementation),
// so we use spies.
const iapFormatterSpy = {
  appStoreSubscriptionPurchaseToAppStoreSubscriptionDTO,
  playStoreSubscriptionPurchaseToPlayStoreSubscriptionDTO,
};
const { mozillaSubscriptionRoutes } = proxyquire(
  '../../../../lib/routes/subscriptions/mozilla',
  {
    '../../payments/iap/iap-formatter': iapFormatterSpy,
  }
);

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
const mockSubsAndBillingDetails = {
  subscriptions: [
    {
      _subscription_type: 'web',
      subscription_id: 'sub_1JhyIYBVqmGyQTMa3XMF6ADj',
    },
  ],
  payment_provider: 'dinersclub',
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
  priceCurrencyCode: 'JPY',
  priceAmountMicros: '99000000',
  countryCode: 'JP',
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
const mocks = require('../../../mocks');
const log = mocks.mockLog();
const db = mocks.mockDB({
  uid: UID,
  email: TEST_EMAIL,
  locale: ACCOUNT_LOCALE,
});
const customs = mocks.mockCustoms();
let stripeHelper;
let capabilityService;

async function runTest(routePath, routeDependencies = {}) {
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
    sandbox.spy(
      iapFormatterSpy,
      'appStoreSubscriptionPurchaseToAppStoreSubscriptionDTO'
    );
    sandbox.spy(
      iapFormatterSpy,
      'playStoreSubscriptionPurchaseToPlayStoreSubscriptionDTO'
    );
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('GET /customer/billing-and-subscriptions', () => {
    it('gets customer billing details and Stripe, Google Play, and App Store subscriptions', async () => {
      const resp = await runTest(
        '/oauth/mozilla-subscriptions/customer/billing-and-subscriptions'
      );
      assert.deepEqual(resp, {
        ...mockSubsAndBillingDetails,
        subscriptions: [
          ...mockSubsAndBillingDetails.subscriptions,
          mockGooglePlaySubscription,
          mockAppStoreSubscription,
        ],
      });
      assert.equal(
        iapFormatterSpy.playStoreSubscriptionPurchaseToPlayStoreSubscriptionDTO
          .callCount,
        1
      );
      assert.equal(
        iapFormatterSpy.appStoreSubscriptionPurchaseToAppStoreSubscriptionDTO
          .callCount,
        1
      );
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
      assert.deepEqual(resp, {
        ...mockSubsAndBillingDetails,
        subscriptions: [...mockSubsAndBillingDetails.subscriptions],
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
      assert.deepEqual(resp, {
        subscriptions: [mockGooglePlaySubscription],
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
      assert.deepEqual(resp, {
        subscriptions: [mockAppStoreSubscription],
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
        assert.fail('an error should have been thrown');
      } catch (e) {
        assert.strictEqual(e.errno, ERRNO.UNKNOWN_SUBSCRIPTION_CUSTOMER);
      }
    });
  });
});

describe('plan-eligibility', () => {
  beforeEach(() => {
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
      assert.deepEqual(resp, {
        eligibility: 'eligibility',
        currentPlan: undefined,
      });
    });
  });
});
