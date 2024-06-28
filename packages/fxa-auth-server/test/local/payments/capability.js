/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const config = require('../../../config').default.getProperties();
const sinon = require('sinon');
const assert = { ...sinon.assert, ...require('chai').assert };
const { Container } = require('typedi');

const {
  mockCMSClients,
  mockLog,
  mockPlans,
  mockCMSPlanIdsToClientCapabilities,
} = require('../../mocks');
const { AppConfig, AuthLogger } = require('../../../lib/types');
const { StripeHelper } = require('../../../lib/payments/stripe');
const { PlayBilling } = require('../../../lib/payments/iap/google-play');
const { AppleIAP } = require('../../../lib/payments/iap/apple-app-store');
const {
  PaymentConfigManager,
} = require('../../../lib/payments/configuration/manager');

const subscriptionCreated =
  require('./fixtures/stripe/subscription_created.json').data.object;

const { ProfileClient } = require('../../../lib/types');
const {
  PlayStoreSubscriptionPurchase,
} = require('../../../lib/payments/iap/google-play/subscription-purchase');
const proxyquire = require('proxyquire').noPreserveCache();

const authDbModule = require('fxa-shared/db/models/auth');
const {
  ALL_RPS_CAPABILITIES_KEY,
} = require('fxa-shared/subscriptions/configuration/base');
const {
  PurchaseQueryError,
} = require('../../../lib/payments/iap/google-play/types');
const {
  CapabilityManager,
} = require('../../../../../libs/payments/capability/src');
const {
  EligibilityManager,
} = require('../../../../../libs/payments/eligibility/src');
const {
  SubscriptionEligibilityResult,
} = require('fxa-shared/subscriptions/types');
const Sentry = require('@sentry/node');

const mockAuthEvents = {};

const { CapabilityService } = proxyquire('../../../lib/payments/capability', {
  '../events': {
    authEvents: mockAuthEvents,
  },
});

const VALID_SUB_API_RESPONSE = {
  kind: 'androidpublisher#subscriptionPurchase',
  startTimeMillis: `${Date.now() - 10000}`, // some time in the past
  expiryTimeMillis: `${Date.now() + 10000}`, // some time in the future
  autoRenewing: true,
  priceCurrencyCode: 'JPY',
  priceAmountMicros: '99000000',
  countryCode: 'JP',
  developerPayload: '',
  paymentState: 1,
  orderId: 'GPA.3313-5503-3858-32549',
};

const UID = 'uid8675309';
const EMAIL = 'user@example.com';

/**
 * To prevent the modification of the test objects loaded, which can impact other tests referencing the object,
 * a deep copy of the object can be created which uses the test object as a template
 *
 * @param {Object} object
 */
function deepCopy(object) {
  return JSON.parse(JSON.stringify(object));
}

describe('CapabilityService', () => {
  let mockStripeHelper;
  let mockPlayBilling;
  let mockAppleIAP;
  let capabilityService;
  let log;
  let mockSubscriptionPurchase;
  let mockProfileClient;
  let mockPaymentConfigManager;
  let mockConfigPlans;
  let mockCapabilityManager;
  let mockConfig;

  beforeEach(async () => {
    mockAuthEvents.on = sinon.fake.returns({});
    mockStripeHelper = {};
    mockPlayBilling = {
      userManager: {},
      purchaseManager: {},
    };
    mockAppleIAP = {
      purchaseManager: {},
    };
    mockProfileClient = {
      deleteCache: sinon.fake.resolves({}),
    };
    mockConfigPlans = [
      {
        stripePriceId: 'plan_123456',
        capabilities: {
          c1: ['capAlpha'],
        },
      },
    ];
    mockPaymentConfigManager = {
      allPlans: sinon.fake.resolves(mockConfigPlans),
      getMergedConfig: (price) => price,
    };
    mockStripeHelper.allAbbrevPlans = sinon.spy(async () => [
      {
        plan_id: 'plan_123456',
        product_id: 'prod_123456',
        plan_metadata: {
          capabilities: 'capAll',
          'capabilities:c1': 'cap4,cap5',
          'capabilities:c2': 'cap5,cap6',
        },
        product_metadata: {
          'capabilities:c1': 'capZZ',
        },
      },
      {
        plan_id: 'plan_876543',
        product_id: 'prod_876543',
        plan_metadata: {
          'capabilities:c2': 'capC,   capD',
          'capabilities:c3': 'capD, capE',
        },
      },
      {
        plan_id: 'plan_ABCDEF',
        product_id: 'prod_ABCDEF',
        product_metadata: {
          'capabilities:c3': ' capZ,   capW   ',
        },
      },
      {
        plan_id: 'plan_456789',
        product_id: 'prod_456789',
        product_metadata: {
          'capabilities:c3': '   capZ,capW',
        },
      },
      {
        plan_id: 'plan_PLAY',
        product_id: 'prod_PLAY',
        product_metadata: {
          'capabilities:c3': '   capP',
        },
      },
    ]);
    mockStripeHelper.allMergedPlanConfigs = sinon.spy(async () => {});
    mockCapabilityManager = {
      getClients: sinon.fake.resolves(mockCMSClients),
      priceIdsToClientCapabilities: sinon.fake.resolves(
        mockCMSPlanIdsToClientCapabilities
      ),
    };
    mockConfig = { ...config, contentful: { enabled: false } };
    log = mockLog();

    Container.set(AppConfig, mockConfig);
    Container.set(AuthLogger, log);
    Container.set(StripeHelper, mockStripeHelper);
    Container.set(PlayBilling, mockPlayBilling);
    Container.set(AppleIAP, mockAppleIAP);
    Container.set(ProfileClient, mockProfileClient);
    Container.set(PaymentConfigManager, mockPaymentConfigManager);
    Container.set(CapabilityManager, mockCapabilityManager);
    capabilityService = new CapabilityService();
  });

  afterEach(() => {
    Container.reset();
    sinon.restore();
  });

  describe('stripeUpdate', () => {
    beforeEach(() => {
      const fake = sinon.fake.resolves({
        uid: UID,
        email: EMAIL,
      });
      sinon.replace(authDbModule, 'getUidAndEmailByStripeCustomerId', fake);
      capabilityService.subscribedPriceIds = sinon.fake.resolves([
        'price_GWScEDK6LT8cSV',
      ]);
      capabilityService.processPriceIdDiff = sinon.fake.resolves();
    });

    it('handles a stripe price update with new prices', async () => {
      const sub = deepCopy(subscriptionCreated);
      await capabilityService.stripeUpdate({ sub, uid: UID, email: EMAIL });
      assert.notCalled(authDbModule.getUidAndEmailByStripeCustomerId);
      assert.calledWith(mockProfileClient.deleteCache, UID);
      assert.calledWith(capabilityService.subscribedPriceIds, UID);
      assert.calledWith(capabilityService.processPriceIdDiff, {
        uid: UID,
        priorPriceIds: [],
        currentPriceIds: ['price_GWScEDK6LT8cSV'],
      });
    });

    it('handles a stripe price update with removed prices', async () => {
      const sub = deepCopy(subscriptionCreated);
      capabilityService.subscribedPriceIds = sinon.fake.resolves([]);
      await capabilityService.stripeUpdate({ sub, uid: UID, email: EMAIL });
      assert.notCalled(authDbModule.getUidAndEmailByStripeCustomerId);
      assert.calledWith(mockProfileClient.deleteCache, UID);
      assert.calledWith(capabilityService.subscribedPriceIds, UID);
      assert.calledWith(capabilityService.processPriceIdDiff, {
        uid: UID,
        priorPriceIds: ['price_GWScEDK6LT8cSV'],
        currentPriceIds: [],
      });
    });

    it('handles a stripe price update without uid/email', async () => {
      const sub = deepCopy(subscriptionCreated);
      await capabilityService.stripeUpdate({ sub });
      assert.calledWith(
        authDbModule.getUidAndEmailByStripeCustomerId,
        sub.customer
      );
      assert.calledWith(mockProfileClient.deleteCache, UID);
      assert.calledWith(capabilityService.subscribedPriceIds, UID);
      assert.calledWith(capabilityService.processPriceIdDiff, {
        uid: UID,
        priorPriceIds: [],
        currentPriceIds: ['price_GWScEDK6LT8cSV'],
      });
    });
  });

  describe('iapUpdate', () => {
    let subscriptionPurchase;

    beforeEach(() => {
      const fake = sinon.fake.resolves({
        uid: UID,
        email: EMAIL,
      });
      sinon.replace(authDbModule, 'getUidAndEmailByStripeCustomerId', fake);
      capabilityService.subscribedPriceIds = sinon.fake.resolves([
        'prod_FUUNYnlDso7FeB',
      ]);
      capabilityService.processPriceIdDiff = sinon.fake.resolves();
      subscriptionPurchase = PlayStoreSubscriptionPurchase.fromApiResponse(
        VALID_SUB_API_RESPONSE,
        'testPackage',
        'testToken',
        'testSku',
        Date.now()
      );
      mockStripeHelper.iapPurchasesToPriceIds = sinon.fake.resolves([
        'prod_FUUNYnlDso7FeB',
      ]);
    });

    it('handles an IAP purchase with new product', async () => {
      await capabilityService.iapUpdate(UID, EMAIL, subscriptionPurchase);
      assert.calledWith(mockProfileClient.deleteCache, UID);
      assert.calledWith(capabilityService.subscribedPriceIds, UID);
      assert.calledWith(capabilityService.processPriceIdDiff, {
        uid: UID,
        priorPriceIds: [],
        currentPriceIds: ['prod_FUUNYnlDso7FeB'],
      });
    });

    it('handles an IAP purchase with a removed product', async () => {
      capabilityService.subscribedPriceIds = sinon.fake.resolves([]);
      await capabilityService.iapUpdate(UID, EMAIL, subscriptionPurchase);
      assert.calledWith(mockProfileClient.deleteCache, UID);
      assert.calledWith(capabilityService.subscribedPriceIds, UID);
      assert.calledWith(capabilityService.processPriceIdDiff, {
        uid: UID,
        priorPriceIds: ['prod_FUUNYnlDso7FeB'],
        currentPriceIds: [],
      });
    });
  });

  describe('fetchSubscribedPricesFromPlay', () => {
    let mockQueryResponse;
    let mockSubscriptionPurchase;

    beforeEach(() => {
      mockSubscriptionPurchase = {
        isEntitlementActive: () => true,
      };
      mockQueryResponse = [mockSubscriptionPurchase];
      mockPlayBilling.userManager.queryCurrentSubscriptions = sinon
        .stub()
        .resolves(mockQueryResponse);
      mockStripeHelper.iapPurchasesToPriceIds = sinon.fake.returns([
        'plan_GOOGLE',
      ]);
    });

    afterEach(() => {
      capabilityService.playBilling = mockPlayBilling;
    });

    it('returns [] if Google IAP is disabled', async () => {
      capabilityService.playBilling = undefined;
      const expected = [];
      const actual = await capabilityService.fetchSubscribedPricesFromPlay(UID);
      assert.deepEqual(actual, expected);
    });

    it('returns a subscribed price if found', async () => {
      const expected = ['plan_GOOGLE'];
      const actual = await capabilityService.fetchSubscribedPricesFromPlay(UID);
      assert.calledWith(
        mockPlayBilling.userManager.queryCurrentSubscriptions,
        UID
      );
      assert.calledWith(
        mockStripeHelper.iapPurchasesToPriceIds,
        mockQueryResponse
      );
      assert.deepEqual(actual, expected);
    });

    it('logs a query error and returns [] if the query fails', async () => {
      const error = new Error('Bleh');
      error.name = PurchaseQueryError.OTHER_ERROR;
      mockPlayBilling.userManager.queryCurrentSubscriptions = sinon
        .stub()
        .rejects(error);
      const expected = [];
      const actual = await capabilityService.fetchSubscribedPricesFromPlay(UID);
      assert.deepEqual(actual, expected);
      assert.calledOnceWithExactly(
        log.error,
        'Failed to query purchases from Google Play',
        {
          uid: UID,
          err: error,
        }
      );
    });
  });

  describe('fetchSubscribedPricesFromAppStore', () => {
    let mockQueryResponse;
    let mockSubscriptionPurchase;

    beforeEach(() => {
      mockSubscriptionPurchase = {
        isEntitlementActive: () => true,
      };
      mockQueryResponse = [mockSubscriptionPurchase];
      mockAppleIAP.purchaseManager.queryCurrentSubscriptionPurchases = sinon
        .stub()
        .resolves(mockQueryResponse);
      mockStripeHelper.iapPurchasesToPriceIds = sinon.fake.returns([
        'plan_APPLE',
      ]);
    });

    afterEach(() => {
      capabilityService.appleIap = mockAppleIAP;
    });

    it('returns [] if Apple IAP is disabled', async () => {
      capabilityService.appleIap = undefined;
      const expected = [];
      const actual = await capabilityService.fetchSubscribedPricesFromAppStore(
        UID
      );
      assert.deepEqual(actual, expected);
    });

    it('returns a subscribed price if found', async () => {
      const expected = ['plan_APPLE'];
      const actual = await capabilityService.fetchSubscribedPricesFromAppStore(
        UID
      );
      assert.calledWith(
        mockAppleIAP.purchaseManager.queryCurrentSubscriptionPurchases,
        UID
      );
      assert.calledWith(
        mockStripeHelper.iapPurchasesToPriceIds,
        mockQueryResponse
      );
      assert.deepEqual(actual, expected);
    });

    it('logs a query error and returns [] if the query fails', async () => {
      const error = new Error('Bleh');
      error.name = PurchaseQueryError.OTHER_ERROR;
      mockAppleIAP.purchaseManager.queryCurrentSubscriptionPurchases = sinon
        .stub()
        .rejects(error);
      const expected = [];
      const actual = await capabilityService.fetchSubscribedPricesFromAppStore(
        UID
      );
      assert.deepEqual(actual, expected);
      assert.calledOnceWithExactly(
        log.error,
        'Failed to query purchases from Apple App Store',
        {
          uid: UID,
          err: error,
        }
      );
    });
  });

  describe('broadcastCapabilitiesAdded', () => {
    it('should broadcast the capabilities added', async () => {
      const capabilities = ['cap2'];
      capabilityService.broadcastCapabilitiesAdded({ uid: UID, capabilities });
      sinon.assert.calledOnce(log.notifyAttachedServices);
    });
  });

  describe('broadcastCapabilitiesRemoved', () => {
    it('should broadcast the capabilities removed event', async () => {
      const capabilities = ['cap1'];
      capabilityService.broadcastCapabilitiesRemoved({
        uid: UID,
        capabilities,
      });
      sinon.assert.calledOnce(log.notifyAttachedServices);
    });
  });

  describe('getPlanEligibility', () => {
    const mockAbbrevPlans = [
      {
        plan_id: 'plan_123456',
        product_id: 'prod_123456',
        product_metadata: {
          productSet: 'set1,set2',
          productOrder: 1,
        },
      },
      {
        plan_id: 'plan_876543',
        product_id: 'prod_876543',
        product_metadata: {
          productSet: 'set2,set3',
          productOrder: 1,
        },
      },
      {
        plan_id: 'plan_ABCDEF',
        product_id: 'prod_ABCDEF',
        product_metadata: {
          productSet: 'set1,set2',
          productOrder: 2,
        },
      },
    ];

    beforeEach(() => {
      capabilityService.fetchSubscribedPricesFromStripe = sinon.fake.resolves(
        []
      );
      capabilityService.fetchSubscribedPricesFromAppStore = sinon.fake.resolves(
        []
      );
      capabilityService.fetchSubscribedPricesFromPlay = sinon.fake.resolves([]);
    });

    it('throws an error for an invalid targetPlanId', async () => {
      let error;
      capabilityService.allAbbrevPlansByPlanId = sinon.fake.resolves([]);
      try {
        await capabilityService.getPlanEligibility(UID, 'invalid-id');
      } catch (e) {
        error = e;
      }
      assert.equal(error.message, 'Unknown subscription plan');
    });

    it('returns the eligibility from Stripe if eligibilityManager is not found', async () => {
      capabilityService.allAbbrevPlansByPlanId = sinon.fake.resolves({
        plan_123456: mockAbbrevPlans[0],
      });
      capabilityService.eligibilityFromStripeMetadata = sinon.fake.resolves([
        SubscriptionEligibilityResult.CREATE,
      ]);
      const expected = [SubscriptionEligibilityResult.CREATE];
      const actual = await capabilityService.getPlanEligibility(
        UID,
        'plan_123456'
      );
      assert.deepEqual(actual, expected);
    });

    it('returns results from Stripe and logs to Sentry when results do not match', async () => {
      const sentryScope = { setContext: sinon.stub() };
      sinon.stub(Sentry, 'withScope').callsFake((cb) => cb(sentryScope));
      sinon.stub(Sentry, 'captureMessage');

      Container.set(EligibilityManager, {});
      capabilityService = new CapabilityService();

      capabilityService.allAbbrevPlansByPlanId = sinon.fake.resolves({
        plan_123456: mockAbbrevPlans[0],
      });
      capabilityService.eligibilityFromStripeMetadata = sinon.fake.resolves([
        SubscriptionEligibilityResult.UPGRADE,
      ]);
      capabilityService.getAllSubscribedAbbrevPlans = sinon.fake.resolves([
        mockAbbrevPlans[1],
        [],
      ]);
      capabilityService.eligibilityFromEligibilityManager = sinon.fake.resolves(
        [SubscriptionEligibilityResult.CREATE]
      );
      capabilityService.logToSentry = sinon.fake.returns(true);

      const actual = await capabilityService.getPlanEligibility(
        UID,
        'plan_123456'
      );
      assert.deepEqual(actual, [SubscriptionEligibilityResult.UPGRADE]);

      sinon.assert.calledOnceWithExactly(
        sentryScope.setContext,
        'getPlanEligibility',
        {
          eligibilityManagerResult: [SubscriptionEligibilityResult.CREATE],
          stripeEligibilityResult: [SubscriptionEligibilityResult.UPGRADE],
          uid: UID,
          targetPlanId: 'plan_123456',
        }
      );
      sinon.assert.calledOnceWithExactly(
        Sentry.captureMessage,
        `Eligibility mismatch for uid8675309 on plan_123456`,
        'error'
      );
    });
  });

  describe('eligibility', () => {
    const mockPlanTier1ShortInterval = {
      plan_id: 'plan_123456',
      product_id: 'prod_123456',
      product_metadata: {
        productSet: 'set1,set2',
        productOrder: 1,
      },
      interval: 'week',
      interval_count: 1,
    };
    const mockPlanTier1LongInterval = {
      plan_id: 'plan_876543',
      product_id: 'prod_876543',
      product_metadata: {
        productSet: 'set2,set3',
        productOrder: 1,
      },
      interval: 'week',
      interval_count: 2,
    };
    const mockPlanTier2ShortInterval = {
      plan_id: 'plan_ABCDEF',
      product_id: 'prod_ABCDEF',
      product_metadata: {
        productSet: 'set1,set2',
        productOrder: 2,
      },
      interval: 'week',
      interval_count: 1,
    };
    const mockPlanTier2LongInterval = {
      currency: 'usd',
      plan_id: 'plan_GHIJKL',
      product_id: 'prod_ABCDEF',
      product_metadata: {
        productSet: 'set1,set2',
        productOrder: 2,
      },
      interval: 'month',
      interval_count: 1,
    };
    const mockPlanTier2LongIntervalDiffCurr = {
      ...mockPlanTier2LongInterval,
      currency: 'eur',
    };
    const mockPlanNoProductOrder = {
      plan_id: 'plan_NOPRODUCTORDER',
      product_id: 'prod_ABCDEF',
      product_metadata: {
        productSet: 'set1,set2',
      },
    };

    describe('FromEligibilityManager', () => {
      let mockEligibilityManager;

      beforeEach(() => {
        mockEligibilityManager = {};
        Container.set(EligibilityManager, mockEligibilityManager);
        capabilityService = new CapabilityService();
      });

      it('returns blocked_iap for targetPlan with productSet the user is subscribed to with IAP', async () => {
        mockEligibilityManager.getOfferingOverlap = sinon.fake.resolves([
          {
            comparison: 'same',
            offeringProductId: mockPlanTier1ShortInterval.product_id,
            type: 'offering',
          },
        ]);
        const actual =
          await capabilityService.eligibilityFromEligibilityManager(
            [],
            [mockPlanTier1ShortInterval],
            mockPlanTier1LongInterval
          );
        assert.deepEqual(actual, {
          subscriptionEligibilityResult:
            SubscriptionEligibilityResult.BLOCKED_IAP,
          eligibleSourcePlan: mockPlanTier1ShortInterval,
        });
      });

      it('returns create for targetPlan with offering user is not subscribed to', async () => {
        mockEligibilityManager.getOfferingOverlap = sinon.fake.resolves([]);
        const actual =
          await capabilityService.eligibilityFromEligibilityManager(
            [],
            [],
            mockPlanTier1ShortInterval
          );
        assert.deepEqual(actual, {
          subscriptionEligibilityResult: SubscriptionEligibilityResult.CREATE,
        });
      });

      it('returns upgrade for targetPlan with offering user is subscribed to a lower tier of', async () => {
        mockEligibilityManager.getOfferingOverlap = sinon.fake.resolves([
          {
            comparison: 'upgrade',
            priceId: mockPlanTier1ShortInterval.plan_id,
            type: 'price',
          },
        ]);
        const actual =
          await capabilityService.eligibilityFromEligibilityManager(
            [mockPlanTier1ShortInterval],
            [],
            mockPlanTier2LongInterval
          );
        assert.deepEqual(actual, {
          subscriptionEligibilityResult: SubscriptionEligibilityResult.UPGRADE,
          eligibleSourcePlan: mockPlanTier1ShortInterval,
        });
      });

      it('returns downgrade for targetPlan with offering user is subscribed to a higher tier of', async () => {
        mockEligibilityManager.getOfferingOverlap = sinon.fake.resolves([
          {
            comparison: 'downgrade',
            priceId: mockPlanTier1ShortInterval.plan_id,
            type: 'price',
          },
        ]);
        const actual =
          await capabilityService.eligibilityFromEligibilityManager(
            [mockPlanTier2LongInterval],
            [],
            mockPlanTier1ShortInterval
          );
        assert.deepEqual(actual, {
          subscriptionEligibilityResult:
            SubscriptionEligibilityResult.DOWNGRADE,
          eligibleSourcePlan: undefined,
        });
      });

      it('returns upgrade for targetPlan with offering user is subscribed to a higher interval of', async () => {
        mockEligibilityManager.getOfferingOverlap = sinon.fake.resolves([
          {
            comparison: 'upgrade',
            priceId: mockPlanTier1ShortInterval.plan_id,
            type: 'price',
          },
        ]);
        const actual =
          await capabilityService.eligibilityFromEligibilityManager(
            [mockPlanTier1ShortInterval],
            [],
            mockPlanTier1LongInterval
          );
        assert.deepEqual(actual, {
          subscriptionEligibilityResult: SubscriptionEligibilityResult.UPGRADE,
          eligibleSourcePlan: mockPlanTier1ShortInterval,
        });
      });

      it('returns upgrade for targetPlan with offering user is subscribed and interval is not shorter', async () => {
        mockEligibilityManager.getOfferingOverlap = sinon.fake.resolves([
          {
            comparison: 'upgrade',
            priceId: mockPlanTier1ShortInterval.plan_id,
            type: 'price',
          },
        ]);
        const actual =
          await capabilityService.eligibilityFromEligibilityManager(
            [mockPlanTier1ShortInterval],
            [],
            mockPlanTier2ShortInterval
          );
        assert.deepEqual(actual, {
          subscriptionEligibilityResult: SubscriptionEligibilityResult.UPGRADE,
          eligibleSourcePlan: mockPlanTier1ShortInterval,
        });
      });

      it('returns upgrade for targetPlan with same offering and longer interval', async () => {
        mockEligibilityManager.getOfferingOverlap = sinon.fake.resolves([
          {
            comparison: 'same',
            priceId: mockPlanTier1ShortInterval.plan_id,
            type: 'price',
          },
        ]);
        const actual =
          await capabilityService.eligibilityFromEligibilityManager(
            [mockPlanTier1ShortInterval],
            [],
            mockPlanTier1LongInterval
          );
        assert.deepEqual(actual, {
          subscriptionEligibilityResult: SubscriptionEligibilityResult.UPGRADE,
          eligibleSourcePlan: mockPlanTier1ShortInterval,
        });
      });

      it('returns downgrade for targetPlan with shorter interval but higher tier than user is subscribed to', async () => {
        mockEligibilityManager.getOfferingOverlap = sinon.fake.resolves([
          {
            comparison: 'upgrade',
            priceId: mockPlanTier1LongInterval.plan_id,
            type: 'price',
          },
        ]);
        Container.set(EligibilityManager, mockEligibilityManager);
        capabilityService = new CapabilityService();
        const actual =
          await capabilityService.eligibilityFromEligibilityManager(
            [mockPlanTier1LongInterval],
            [],
            mockPlanTier2ShortInterval
          );
        assert.deepEqual(actual, {
          subscriptionEligibilityResult:
            SubscriptionEligibilityResult.DOWNGRADE,
          eligibleSourcePlan: mockPlanTier1LongInterval,
        });
      });

      it('returns invalid for targetPlan with same offering user is subscribed to', async () => {
        mockEligibilityManager.getOfferingOverlap = sinon.fake.resolves([
          {
            comparison: 'upgrade',
            priceId: mockPlanTier1ShortInterval.plan_id,
            type: 'price',
          },
        ]);
        const actual =
          await capabilityService.eligibilityFromEligibilityManager(
            [mockPlanTier1ShortInterval],
            [],
            mockPlanTier1ShortInterval
          );
        assert.deepEqual(actual, {
          subscriptionEligibilityResult: SubscriptionEligibilityResult.INVALID,
        });
      });

      it('returns invalid for targetPlan with same offering user is subscribed to but different currency', async () => {
        mockEligibilityManager.getOfferingOverlap = sinon.fake.resolves([
          {
            comparison: 'same',
            priceId: mockPlanTier2LongInterval.plan_id,
            type: 'price',
          },
        ]);
        const actual =
          await capabilityService.eligibilityFromEligibilityManager(
            [mockPlanTier2LongInterval],
            [],
            mockPlanTier2LongIntervalDiffCurr
          );
        assert.deepEqual(actual, {
          subscriptionEligibilityResult: SubscriptionEligibilityResult.INVALID,
        });
      });
    });

    describe('FromStripeMetadata', () => {
      it('returns blocked_iap for targetPlan with productSet the user is subscribed to with IAP', async () => {
        capabilityService.fetchSubscribedPricesFromAppStore =
          sinon.fake.resolves(['plan_123456']);
        const actual = await capabilityService.eligibilityFromStripeMetadata(
          [],
          [mockPlanTier2LongInterval],
          mockPlanTier1ShortInterval
        );
        assert.deepEqual(actual, {
          subscriptionEligibilityResult:
            SubscriptionEligibilityResult.BLOCKED_IAP,
          eligibleSourcePlan: mockPlanTier2LongInterval,
        });
      });

      it('returns create for targetPlan with productSet user is not subscribed to', async () => {
        const actual = await capabilityService.eligibilityFromStripeMetadata(
          [],
          [],
          mockPlanTier1ShortInterval
        );
        assert.deepEqual(actual, {
          subscriptionEligibilityResult: SubscriptionEligibilityResult.CREATE,
        });
      });

      it('returns upgrade for targetPlan with productSet user is subscribed to a lower tier of', async () => {
        capabilityService.fetchSubscribedPricesFromStripe = sinon.fake.resolves(
          [mockPlanTier1ShortInterval.plan_id]
        );
        const actual = await capabilityService.eligibilityFromStripeMetadata(
          [mockPlanTier1ShortInterval],
          [],
          mockPlanTier2LongInterval
        );
        assert.deepEqual(actual, {
          subscriptionEligibilityResult: SubscriptionEligibilityResult.UPGRADE,
          eligibleSourcePlan: mockPlanTier1ShortInterval,
        });
      });

      it('returns downgrade for targetPlan with productSet user is subscribed to a higher tier of', async () => {
        capabilityService.fetchSubscribedPricesFromStripe = sinon.fake.resolves(
          [mockPlanTier2LongInterval.plan_id]
        );
        const actual = await capabilityService.eligibilityFromStripeMetadata(
          [mockPlanTier2LongInterval],
          [],
          mockPlanTier1ShortInterval
        );
        assert.deepEqual(actual, {
          subscriptionEligibilityResult:
            SubscriptionEligibilityResult.DOWNGRADE,
          eligibleSourcePlan: mockPlanTier2LongInterval,
        });
      });

      it('returns invalid for targetPlan with no product order', async () => {
        capabilityService.fetchSubscribedPricesFromStripe = sinon.fake.resolves(
          [mockPlanTier2LongInterval.plan_id]
        );
        const actual = await capabilityService.eligibilityFromStripeMetadata(
          [mockPlanTier2LongInterval],
          [],
          mockPlanNoProductOrder
        );
        assert.deepEqual(actual, {
          subscriptionEligibilityResult: SubscriptionEligibilityResult.INVALID,
        });
      });
    });

    describe('eligibilityManagerResult and stripeEligibilityResult should match', () => {
      let mockEligibilityManager;

      beforeEach(() => {
        mockEligibilityManager = {};
        Container.set(EligibilityManager, mockEligibilityManager);
        capabilityService = new CapabilityService();
      });

      it('returns blocked_iap result from both', async () => {
        mockEligibilityManager.getOfferingOverlap = sinon.fake.resolves([
          {
            comparison: 'same',
            offeringProductId: mockPlanTier1ShortInterval.product_id,
            type: 'offering',
          },
        ]);

        capabilityService.fetchSubscribedPricesFromAppStore =
          sinon.fake.resolves(['plan_123456']);

        const eligiblityActual =
          await capabilityService.eligibilityFromEligibilityManager(
            [],
            [mockPlanTier1ShortInterval],
            mockPlanTier1LongInterval
          );

        const stripeActual =
          await capabilityService.eligibilityFromStripeMetadata(
            [],
            [mockPlanTier1ShortInterval],
            mockPlanTier1LongInterval
          );

        assert.deepEqual(
          eligiblityActual.subscriptionEligibilityResult,
          stripeActual.subscriptionEligibilityResult
        );
      });
    });
  });

  describe('processPriceIdDiff', () => {
    it('should process the product diff', async () => {
      mockAuthEvents.emit = sinon.fake.returns({});
      await capabilityService.processPriceIdDiff({
        uid: UID,
        priorPriceIds: ['plan_123456', 'plan_876543'],
        currentPriceIds: ['plan_876543', 'plan_ABCDEF'],
      });
      sinon.assert.calledTwice(log.notifyAttachedServices);
    });
  });

  describe('determineClientVisibleSubscriptionCapabilities', () => {
    beforeEach(() => {
      mockStripeHelper.fetchCustomer = sinon.spy(async () => ({
        subscriptions: {
          data: [
            {
              status: 'active',
              items: {
                data: [{ price: { id: 'plan_123456' } }],
              },
            },
            {
              status: 'active',
              items: {
                data: [{ price: { id: 'plan_876543' } }],
              },
            },
            {
              status: 'incomplete',
              items: {
                data: [{ price: { id: 'plan_456789' } }],
              },
            },
          ],
        },
      }));
      mockStripeHelper.iapPurchasesToPriceIds = sinon.fake.returns([
        'plan_PLAY',
      ]);
      mockSubscriptionPurchase = {
        sku: 'play_1234',
        isEntitlementActive: sinon.fake.returns(true),
      };

      mockPlayBilling.userManager.queryCurrentSubscriptions = sinon
        .stub()
        .resolves([mockSubscriptionPurchase]);
    });

    async function assertExpectedCapabilities(clientId, expectedCapabilities) {
      const allCapabilities = await capabilityService.subscriptionCapabilities(
        UID
      );
      const resultCapabilities =
        await capabilityService.determineClientVisibleSubscriptionCapabilities(
          // null client represents sessionToken auth from content-server, unfiltered by client
          clientId === 'null' ? null : Buffer.from(clientId, 'hex'),
          allCapabilities
        );
      assert.deepEqual(resultCapabilities.sort(), expectedCapabilities.sort());
    }

    it('handles a firestore fetch error', async () => {
      const error = new Error('test error');
      error.name = PurchaseQueryError.OTHER_ERROR;
      mockPlayBilling.userManager.queryCurrentSubscriptions = sinon
        .stub()
        .rejects(error);
      const allCapabilities = await capabilityService.subscriptionCapabilities(
        UID
      );
      assert.deepEqual(allCapabilities, {
        '*': ['capAll'],
        c1: ['capZZ', 'cap4', 'cap5', 'capAlpha'],
        c2: ['cap5', 'cap6', 'capC', 'capD'],
        c3: ['capD', 'capE'],
      });
      assert.calledOnceWithExactly(
        mockPlayBilling.userManager.queryCurrentSubscriptions,
        UID
      );
    });

    it('only reveals capabilities relevant to the client', async () => {
      const expected = {
        c0: ['capAll'],
        c1: ['capAll', 'cap4', 'cap5', 'capZZ', 'capAlpha'],
        c2: ['capAll', 'cap5', 'cap6', 'capC', 'capD'],
        c3: ['capAll', 'capD', 'capE', 'capP'],
        null: [
          'capAll',
          'cap4',
          'cap5',
          'cap6',
          'capC',
          'capD',
          'capE',
          'capP',
          'capZZ',
          'capAlpha',
        ],
      };
      for (const clientId in expected) {
        await assertExpectedCapabilities(clientId, expected[clientId]);
      }
    });

    it('supports capabilities visible to all clients', async () => {
      mockStripeHelper.allAbbrevPlans = sinon.spy(async () => [
        {
          plan_id: 'plan_123456',
          product_id: 'prod_123456',
          product_metadata: {
            capabilities: 'cap1,cap2,cap3',
          },
        },
        {
          plan_id: 'plan_876543',
          product_id: 'prod_876543',
          product_metadata: {
            capabilities: 'capA,capB,capC',
          },
        },
        {
          plan_id: 'plan_ABCDEF',
          product_id: 'prod_ABCDEF',
          product_metadata: {
            capabilities: 'cap00,  cap01,cap02',
          },
        },
      ]);
      mockConfigPlans[0].capabilities = {
        '*': ['capAlpha'],
      };

      for (const clientId of ['c0', 'c1', 'c2', 'c3', 'null']) {
        const expected = [
          'cap1',
          'cap2',
          'cap3',
          'capA',
          'capB',
          'capC',
          'capAlpha',
        ];
        await assertExpectedCapabilities(clientId, expected);
      }
    });

    it('returns results from Stripe when CapabilityManager is not found and logs to Sentry', async () => {
      Container.remove(CapabilityManager);

      let mockCapabilityService = {};
      mockCapabilityService = new CapabilityService();

      const subscribedPrices = await mockCapabilityService.subscribedPriceIds(
        UID
      );

      const mockStripeCapabilities =
        await mockCapabilityService.planIdsToClientCapabilitiesFromStripe(
          subscribedPrices
        );

      const mockCMSCapabilities =
        await mockCapabilityService.planIdsToClientCapabilities(
          subscribedPrices
        );

      assert.deepEqual(mockCMSCapabilities, mockStripeCapabilities);
    });

    it('returns results from Stripe and logs to Sentry when results do not match', async () => {
      const sentryScope = { setContext: sinon.stub() };
      sinon.stub(Sentry, 'withScope').callsFake((cb) => cb(sentryScope));
      sinon.stub(Sentry, 'captureMessage');

      mockCapabilityManager.priceIdsToClientCapabilities = sinon.fake.resolves({
        c1: ['capAlpha'],
        c4: ['capBeta', 'capDelta', 'capEpsilon'],
        c6: ['capGamma', 'capZeta'],
        c8: ['capOmega'],
      });

      const expected = {
        c0: ['capAll'],
        c1: ['capAll', 'cap4', 'cap5', 'capZZ', 'capAlpha'],
        c2: ['capAll', 'cap5', 'cap6', 'capC', 'capD'],
        c3: ['capAll', 'capD', 'capE', 'capP'],
        null: [
          'capAll',
          'cap4',
          'cap5',
          'cap6',
          'capC',
          'capD',
          'capE',
          'capP',
          'capZZ',
          'capAlpha',
        ],
      };

      for (const clientId in expected) {
        await assertExpectedCapabilities(clientId, expected[clientId]);
      }

      sinon.assert.callCount(sentryScope.setContext, 5);
      sinon.assert.calledWithExactly(
        sentryScope.setContext,
        'planIdsToClientCapabilities',
        {
          subscribedPrices: ['plan_123456', 'plan_876543', 'plan_PLAY'],
          cms: {
            c1: ['capAlpha'],
            c4: ['capBeta', 'capDelta', 'capEpsilon'],
            c6: ['capGamma', 'capZeta'],
            c8: ['capOmega'],
          },
          stripe: {
            c1: ['capZZ', 'cap4', 'cap5', 'capAlpha'],
            '*': ['capAll'],
            c2: ['cap5', 'cap6', 'capC', 'capD'],
            c3: ['capD', 'capE', 'capP'],
          },
        }
      );

      sinon.assert.callCount(Sentry.captureMessage, 5);
      sinon.assert.calledWithExactly(
        Sentry.captureMessage,
        `CapabilityService.planIdsToClientCapabilities - Returned Stripe as plan ids to client capabilities did not match.`,
        'error'
      );
    });
  });

  describe('getClients', () => {
    beforeEach(() => {
      mockStripeHelper.allAbbrevPlans = sinon.spy(async () => mockPlans);
    });

    describe('getClientsFromStripe', () => {
      it('returns the clients and their capabilities', async () => {
        const expected = [
          {
            capabilities: ['exampleCap0', 'exampleCap1', 'exampleCap3'],
            clientId: 'client1',
          },
          {
            capabilities: [
              'exampleCap0',
              'exampleCap2',
              'exampleCap4',
              'exampleCap5',
              'exampleCap6',
              'exampleCap7',
            ],
            clientId: 'client2',
          },
        ];
        const actual = await capabilityService.getClientsFromStripe();
        assert.deepEqual(
          actual,
          expected,
          'Clients were not returned correctly'
        );
      });

      it('adds the capabilities from the Firestore config document when available', async () => {
        const mockPlanConfigs = {
          firefox_pro_basic_999: {
            capabilities: {
              [ALL_RPS_CAPABILITIES_KEY]: ['goodnewseveryone'],
              client2: ['wibble', 'quux'],
            },
          },
        };
        mockStripeHelper.allMergedPlanConfigs = sinon.spy(
          async () => mockPlanConfigs
        );
        const expected = [
          {
            capabilities: [
              'exampleCap0',
              'exampleCap1',
              'exampleCap3',
              'goodnewseveryone',
            ],
            clientId: 'client1',
          },
          {
            capabilities: [
              'exampleCap0',
              'exampleCap2',
              'exampleCap4',
              'exampleCap5',
              'exampleCap6',
              'exampleCap7',
              'goodnewseveryone',
              'quux',
              'wibble',
            ],
            clientId: 'client2',
          },
        ];
        const actual = await capabilityService.getClientsFromStripe();
        assert.deepEqual(actual, expected);
      });
    });

    it('returns results from Stripe when CapabilityManager is not found and logs to Sentry', async () => {
      Container.remove(CapabilityManager);

      let mockCapabilityService = {};
      mockCapabilityService = new CapabilityService();

      const mockClientsFromStripe =
        await mockCapabilityService.getClientsFromStripe();

      const clients = await mockCapabilityService.getClients();

      assert.deepEqual(clients, mockClientsFromStripe);
    });

    it('returns results from CMS when it matches Stripe', async () => {
      const sentryScope = { setContext: sinon.stub() };
      sinon.stub(Sentry, 'withScope').callsFake((cb) => cb(sentryScope));
      sinon.stub(Sentry, 'captureMessage');

      const mockClientsFromCMS = await mockCapabilityManager.getClients();

      const mockClientsFromStripe =
        await capabilityService.getClientsFromStripe();

      assert.deepEqual(mockClientsFromCMS, mockClientsFromStripe);

      const clients = await capabilityService.getClients();
      assert.deepEqual(clients, mockClientsFromCMS);

      sinon.assert.notCalled(Sentry.withScope);
      sinon.assert.notCalled(sentryScope.setContext);
      sinon.assert.notCalled(Sentry.captureMessage);
    });

    it('returns results from Stripe and logs to Sentry when results do not match', async () => {
      const sentryScope = { setContext: sinon.stub() };
      sinon.stub(Sentry, 'withScope').callsFake((cb) => cb(sentryScope));
      sinon.stub(Sentry, 'captureMessage');

      mockCapabilityManager.getClients = sinon.fake.resolves([
        {
          capabilities: ['exampleCap0', 'exampleCap1', 'exampleCap3'],
          clientId: 'client1',
        },
      ]);

      const mockClientsFromCMS = await mockCapabilityManager.getClients();

      const mockClientsFromStripe =
        await capabilityService.getClientsFromStripe();

      assert.notDeepEqual(mockClientsFromCMS, mockClientsFromStripe);

      const clients = await capabilityService.getClients();
      assert.deepEqual(clients, mockClientsFromStripe);

      sinon.assert.calledOnceWithExactly(sentryScope.setContext, 'getClients', {
        cms: mockClientsFromCMS,
        stripe: mockClientsFromStripe,
      });
      sinon.assert.calledOnceWithExactly(
        Sentry.captureMessage,
        `CapabilityService.getClients - Returned Stripe as clients did not match.`,
        'error'
      );

      // Test logToSentry logic. Remove if no longer necessary
      await capabilityService.getClients();

      sinon.assert.calledOnceWithExactly(sentryScope.setContext, 'getClients', {
        cms: mockClientsFromCMS,
        stripe: mockClientsFromStripe,
      });
    });
  });

  describe('CMS flag is enabled', () => {
    it('returns planIdsToClientCapabilities from CMS', async () => {
      mockConfig.contentful.enabled = true;

      capabilityService.subscribedPriceIds = sinon.fake.resolves([UID]);

      const mockCMSCapabilities =
        await mockCapabilityManager.priceIdsToClientCapabilities(
          capabilityService.subscribedPrices
        );

      const expected = {
        '*': ['capAll'],
        c1: ['capZZ', 'cap4', 'cap5', 'capAlpha'],
        c2: ['cap5', 'cap6', 'capC', 'capD'],
        c3: ['capD', 'capE'],
      };

      assert.deepEqual(mockCMSCapabilities, expected);
    });

    it('returns getClients from CMS', async () => {
      mockConfig.contentful.enabled = true;

      const mockClientsFromCMS = await mockCapabilityManager.getClients();

      const expected = [
        {
          capabilities: ['exampleCap0', 'exampleCap1', 'exampleCap3'],
          clientId: 'client1',
        },
        {
          capabilities: [
            'exampleCap0',
            'exampleCap2',
            'exampleCap4',
            'exampleCap5',
            'exampleCap6',
            'exampleCap7',
          ],
          clientId: 'client2',
        },
      ];
      assert.deepEqual(mockClientsFromCMS, expected);
    });
  });
});
