/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Container } from 'typedi';

const mockAuthEvents: any = {};
jest.mock('../events', () => ({
  authEvents: mockAuthEvents,
}));

const { CapabilityService } = require('./capability');

const config = require('../../config').default.getProperties();

const {
  mockCMSClients,
  mockLog,
  mockPlans,
  mockCMSPlanIdsToClientCapabilities,
} = require('../../test/mocks');
const { AppConfig, AuthLogger } = require('../types');
const { StripeHelper } = require('./stripe');
const { PlayBilling } = require('./iap/google-play');
const { AppleIAP } = require('./iap/apple-app-store');
const { PaymentConfigManager } = require('./configuration/manager');

const subscriptionCreated =
  require('../../test/local/payments/fixtures/stripe/subscription_created.json')
    .data.object;

const { ProfileClient } = require('@fxa/profile/client');
const {
  PlayStoreSubscriptionPurchase,
} = require('./iap/google-play/subscription-purchase');

const authDbModule = require('fxa-shared/db/models/auth');
const {
  ALL_RPS_CAPABILITIES_KEY,
} = require('fxa-shared/subscriptions/configuration/base');
const { PurchaseQueryError } = require('./iap/google-play/types');
const { CapabilityManager } = require('@fxa/payments/capability');
const { EligibilityManager } = require('@fxa/payments/eligibility');
const {
  SubscriptionEligibilityResult,
} = require('fxa-shared/subscriptions/types');
const Sentry = require('@sentry/node');
const sentryModule = require('../sentry');

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
 */
function deepCopy(object: any) {
  return JSON.parse(JSON.stringify(object));
}

describe('CapabilityService', () => {
  let mockStripeHelper: any;
  let mockPlayBilling: any;
  let mockAppleIAP: any;
  let capabilityService: any;
  let log: any;
  let mockSubscriptionPurchase: any;
  let mockProfileClient: any;
  let mockPaymentConfigManager: any;
  let mockConfigPlans: any;
  let mockCapabilityManager: any;
  let mockConfig: any;

  beforeEach(async () => {
    mockAuthEvents.on = jest.fn().mockReturnValue({});
    mockStripeHelper = {};
    mockPlayBilling = {
      userManager: {},
      purchaseManager: {},
    };
    mockAppleIAP = {
      purchaseManager: {},
    };
    mockProfileClient = {
      deleteCache: jest.fn().mockResolvedValue({}),
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
      allPlans: jest.fn().mockResolvedValue(mockConfigPlans),
      getMergedConfig: (price: any) => price,
    };
    mockStripeHelper.allAbbrevPlans = jest.fn(async () => [
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
    mockStripeHelper.allMergedPlanConfigs = jest.fn(async () => {});
    mockCapabilityManager = {
      getClients: jest.fn().mockResolvedValue(mockCMSClients),
      priceIdsToClientCapabilities: jest
        .fn()
        .mockResolvedValue(mockCMSPlanIdsToClientCapabilities),
    };
    mockConfig = { ...config, cms: { enabled: false } };
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
    jest.restoreAllMocks();
  });

  describe('stripeUpdate', () => {
    beforeEach(() => {
      const fake = jest.fn().mockResolvedValue({
        uid: UID,
        email: EMAIL,
      });
      jest
        .spyOn(authDbModule, 'getUidAndEmailByStripeCustomerId')
        .mockImplementation(fake);
      capabilityService.subscribedPriceIds = jest
        .fn()
        .mockResolvedValue(['price_GWScEDK6LT8cSV']);
      capabilityService.processPriceIdDiff = jest.fn().mockResolvedValue();
    });

    it('handles a stripe price update with new prices', async () => {
      const sub = deepCopy(subscriptionCreated);
      await capabilityService.stripeUpdate({ sub, uid: UID, email: EMAIL });
      expect(
        authDbModule.getUidAndEmailByStripeCustomerId
      ).not.toHaveBeenCalled();
      expect(mockProfileClient.deleteCache).toHaveBeenCalledWith(UID);
      expect(capabilityService.subscribedPriceIds).toHaveBeenCalledWith(UID);
      expect(capabilityService.processPriceIdDiff).toHaveBeenCalledWith({
        uid: UID,
        priorPriceIds: [],
        currentPriceIds: ['price_GWScEDK6LT8cSV'],
      });
    });

    it('handles a stripe price update with removed prices', async () => {
      const sub = deepCopy(subscriptionCreated);
      capabilityService.subscribedPriceIds = jest.fn().mockResolvedValue([]);
      await capabilityService.stripeUpdate({ sub, uid: UID, email: EMAIL });
      expect(
        authDbModule.getUidAndEmailByStripeCustomerId
      ).not.toHaveBeenCalled();
      expect(mockProfileClient.deleteCache).toHaveBeenCalledWith(UID);
      expect(capabilityService.subscribedPriceIds).toHaveBeenCalledWith(UID);
      expect(capabilityService.processPriceIdDiff).toHaveBeenCalledWith({
        uid: UID,
        priorPriceIds: ['price_GWScEDK6LT8cSV'],
        currentPriceIds: [],
      });
    });

    it('handles a stripe price update without uid/email', async () => {
      const sub = deepCopy(subscriptionCreated);
      await capabilityService.stripeUpdate({ sub });
      expect(
        authDbModule.getUidAndEmailByStripeCustomerId
      ).toHaveBeenCalledWith(sub.customer);
      expect(mockProfileClient.deleteCache).toHaveBeenCalledWith(UID);
      expect(capabilityService.subscribedPriceIds).toHaveBeenCalledWith(UID);
      expect(capabilityService.processPriceIdDiff).toHaveBeenCalledWith({
        uid: UID,
        priorPriceIds: [],
        currentPriceIds: ['price_GWScEDK6LT8cSV'],
      });
    });
  });

  describe('iapUpdate', () => {
    let subscriptionPurchase: any;

    beforeEach(() => {
      const fake = jest.fn().mockResolvedValue({
        uid: UID,
        email: EMAIL,
      });
      jest
        .spyOn(authDbModule, 'getUidAndEmailByStripeCustomerId')
        .mockImplementation(fake);
      capabilityService.subscribedPriceIds = jest
        .fn()
        .mockResolvedValue(['prod_FUUNYnlDso7FeB']);
      capabilityService.processPriceIdDiff = jest.fn().mockResolvedValue();
      subscriptionPurchase = PlayStoreSubscriptionPurchase.fromApiResponse(
        VALID_SUB_API_RESPONSE,
        'testPackage',
        'testToken',
        'testSku',
        Date.now()
      );
      mockStripeHelper.iapPurchasesToPriceIds = jest
        .fn()
        .mockResolvedValue(['prod_FUUNYnlDso7FeB']);
    });

    it('handles an IAP purchase with new product', async () => {
      await capabilityService.iapUpdate(UID, EMAIL, subscriptionPurchase);
      expect(mockProfileClient.deleteCache).toHaveBeenCalledWith(UID);
      expect(capabilityService.subscribedPriceIds).toHaveBeenCalledWith(UID);
      expect(capabilityService.processPriceIdDiff).toHaveBeenCalledWith({
        uid: UID,
        priorPriceIds: [],
        currentPriceIds: ['prod_FUUNYnlDso7FeB'],
      });
    });

    it('handles an IAP purchase with a removed product', async () => {
      capabilityService.subscribedPriceIds = jest.fn().mockResolvedValue([]);
      await capabilityService.iapUpdate(UID, EMAIL, subscriptionPurchase);
      expect(mockProfileClient.deleteCache).toHaveBeenCalledWith(UID);
      expect(capabilityService.subscribedPriceIds).toHaveBeenCalledWith(UID);
      expect(capabilityService.processPriceIdDiff).toHaveBeenCalledWith({
        uid: UID,
        priorPriceIds: ['prod_FUUNYnlDso7FeB'],
        currentPriceIds: [],
      });
    });
  });

  describe('fetchSubscribedPricesFromPlay', () => {
    let mockQueryResponse: any;
    let mockSubPurchase: any;

    beforeEach(() => {
      mockSubPurchase = {
        isEntitlementActive: () => true,
      };
      mockQueryResponse = [mockSubPurchase];
      mockPlayBilling.userManager.queryCurrentSubscriptions = jest
        .fn()
        .mockResolvedValue(mockQueryResponse);
      mockStripeHelper.iapPurchasesToPriceIds = jest
        .fn()
        .mockReturnValue(['plan_GOOGLE']);
    });

    afterEach(() => {
      capabilityService.playBilling = mockPlayBilling;
    });

    it('returns [] if Google IAP is disabled', async () => {
      capabilityService.playBilling = undefined;
      const expected: any[] = [];
      const actual = await capabilityService.fetchSubscribedPricesFromPlay(UID);
      expect(actual).toEqual(expected);
    });

    it('returns a subscribed price if found', async () => {
      const expected = ['plan_GOOGLE'];
      const actual = await capabilityService.fetchSubscribedPricesFromPlay(UID);
      expect(
        mockPlayBilling.userManager.queryCurrentSubscriptions
      ).toHaveBeenCalledWith(UID);
      expect(mockStripeHelper.iapPurchasesToPriceIds).toHaveBeenCalledWith(
        mockQueryResponse
      );
      expect(actual).toEqual(expected);
    });

    it('logs a query error and returns [] if the query fails', async () => {
      const error = new Error('Bleh');
      error.name = PurchaseQueryError.OTHER_ERROR;
      mockPlayBilling.userManager.queryCurrentSubscriptions = jest
        .fn()
        .mockRejectedValue(error);
      const expected: any[] = [];
      const actual = await capabilityService.fetchSubscribedPricesFromPlay(UID);
      expect(actual).toEqual(expected);
      expect(log.error).toHaveBeenCalledTimes(1);
      expect(log.error).toHaveBeenCalledWith(
        'Failed to query purchases from Google Play',
        {
          uid: UID,
          err: error,
        }
      );
    });
  });

  describe('fetchSubscribedPricesFromAppStore', () => {
    let mockQueryResponse: any;
    let mockSubPurchase: any;

    beforeEach(() => {
      mockSubPurchase = {
        isEntitlementActive: () => true,
      };
      mockQueryResponse = [mockSubPurchase];
      mockAppleIAP.purchaseManager.queryCurrentSubscriptionPurchases = jest
        .fn()
        .mockResolvedValue(mockQueryResponse);
      mockStripeHelper.iapPurchasesToPriceIds = jest
        .fn()
        .mockReturnValue(['plan_APPLE']);
    });

    afterEach(() => {
      capabilityService.appleIap = mockAppleIAP;
    });

    it('returns [] if Apple IAP is disabled', async () => {
      capabilityService.appleIap = undefined;
      const expected: any[] = [];
      const actual =
        await capabilityService.fetchSubscribedPricesFromAppStore(UID);
      expect(actual).toEqual(expected);
    });

    it('returns a subscribed price if found', async () => {
      const expected = ['plan_APPLE'];
      const actual =
        await capabilityService.fetchSubscribedPricesFromAppStore(UID);
      expect(
        mockAppleIAP.purchaseManager.queryCurrentSubscriptionPurchases
      ).toHaveBeenCalledWith(UID);
      expect(mockStripeHelper.iapPurchasesToPriceIds).toHaveBeenCalledWith(
        mockQueryResponse
      );
      expect(actual).toEqual(expected);
    });

    it('logs a query error and returns [] if the query fails', async () => {
      const error = new Error('Bleh');
      error.name = PurchaseQueryError.OTHER_ERROR;
      mockAppleIAP.purchaseManager.queryCurrentSubscriptionPurchases = jest
        .fn()
        .mockRejectedValue(error);
      const expected: any[] = [];
      const actual =
        await capabilityService.fetchSubscribedPricesFromAppStore(UID);
      expect(actual).toEqual(expected);
      expect(log.error).toHaveBeenCalledTimes(1);
      expect(log.error).toHaveBeenCalledWith(
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
      expect(log.notifyAttachedServices).toHaveBeenCalledTimes(1);
    });
  });

  describe('broadcastCapabilitiesRemoved', () => {
    it('should broadcast the capabilities removed event', async () => {
      const capabilities = ['cap1'];
      capabilityService.broadcastCapabilitiesRemoved({
        uid: UID,
        capabilities,
      });
      expect(log.notifyAttachedServices).toHaveBeenCalledTimes(1);
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
      capabilityService.fetchSubscribedPricesFromStripe = jest
        .fn()
        .mockResolvedValue([]);
      capabilityService.fetchSubscribedPricesFromAppStore = jest
        .fn()
        .mockResolvedValue([]);
      capabilityService.fetchSubscribedPricesFromPlay = jest
        .fn()
        .mockResolvedValue([]);
    });

    it('throws an error for an invalid targetPlanId', async () => {
      let error: any;
      capabilityService.allAbbrevPlansByPlanId = jest
        .fn()
        .mockResolvedValue([]);
      try {
        await capabilityService.getPlanEligibility(UID, 'invalid-id');
      } catch (e) {
        error = e;
      }
      expect(error.message).toBe('Unknown subscription plan');
    });

    it('returns the eligibility from Stripe if eligibilityManager is not found', async () => {
      capabilityService.allAbbrevPlansByPlanId = jest.fn().mockResolvedValue({
        plan_123456: mockAbbrevPlans[0],
      });
      capabilityService.eligibilityFromStripeMetadata = jest
        .fn()
        .mockResolvedValue([SubscriptionEligibilityResult.CREATE]);
      const expected = [SubscriptionEligibilityResult.CREATE];
      const actual = await capabilityService.getPlanEligibility(
        UID,
        'plan_123456'
      );
      expect(actual).toEqual(expected);
    });

    it('returns results from Stripe and logs to Sentry when results do not match', async () => {
      const sentryScope = { setContext: jest.fn() };
      jest
        .spyOn(Sentry, 'withScope')
        .mockImplementation((cb: any) => cb(sentryScope));
      jest.spyOn(sentryModule, 'reportSentryMessage').mockReturnValue({});

      Container.set(EligibilityManager, {});
      capabilityService = new CapabilityService();

      capabilityService.allAbbrevPlansByPlanId = jest.fn().mockResolvedValue({
        plan_123456: mockAbbrevPlans[0],
      });
      capabilityService.eligibilityFromStripeMetadata = jest
        .fn()
        .mockResolvedValue([SubscriptionEligibilityResult.UPGRADE]);
      capabilityService.getAllSubscribedAbbrevPlans = jest
        .fn()
        .mockResolvedValue([[mockAbbrevPlans[1]], []]);
      capabilityService.eligibilityFromEligibilityManager = jest
        .fn()
        .mockResolvedValue([SubscriptionEligibilityResult.CREATE]);

      const actual = await capabilityService.getPlanEligibility(
        UID,
        'plan_123456'
      );
      expect(actual).toEqual([SubscriptionEligibilityResult.UPGRADE]);

      expect(sentryScope.setContext).toHaveBeenCalledTimes(1);
      expect(sentryScope.setContext).toHaveBeenCalledWith(
        'getPlanEligibility',
        {
          stripeSubscribedPlans: [mockAbbrevPlans[1]],
          iapSubscribedPlans: [],
          eligibilityManagerResult: [SubscriptionEligibilityResult.CREATE],
          stripeEligibilityResult: [SubscriptionEligibilityResult.UPGRADE],
          uid: UID,
          targetPlanId: 'plan_123456',
        }
      );
      expect(sentryModule.reportSentryMessage).toHaveBeenCalledTimes(1);
      expect(sentryModule.reportSentryMessage).toHaveBeenCalledWith(
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
    const mockPlanTier2LongInterval: any = {
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
      let mockEligibilityManager: any;

      beforeEach(() => {
        mockEligibilityManager = {};
        Container.set(EligibilityManager, mockEligibilityManager);
        capabilityService = new CapabilityService();
      });

      it('returns blocked_iap for targetPlan with productSet the user is subscribed to with IAP', async () => {
        mockEligibilityManager.getOfferingOverlap = jest
          .fn()
          .mockResolvedValueOnce([])
          .mockResolvedValueOnce([
            {
              comparison: 'same',
              priceId: mockPlanTier1ShortInterval.plan_id,
            },
          ]);
        const actual =
          await capabilityService.eligibilityFromEligibilityManager(
            [],
            [mockPlanTier1ShortInterval],
            mockPlanTier1LongInterval
          );
        expect(actual).toEqual({
          subscriptionEligibilityResult:
            SubscriptionEligibilityResult.BLOCKED_IAP,
          eligibleSourcePlan: mockPlanTier1ShortInterval,
        });
        expect(mockEligibilityManager.getOfferingOverlap).toHaveBeenCalledWith({
          priceIds: [mockPlanTier1ShortInterval.plan_id],
          targetPriceId: mockPlanTier1LongInterval.plan_id,
        });
      });

      it('returns create for targetPlan with offering user is not subscribed to', async () => {
        mockEligibilityManager.getOfferingOverlap = jest
          .fn()
          .mockResolvedValue([]);
        const actual =
          await capabilityService.eligibilityFromEligibilityManager(
            [],
            [],
            mockPlanTier1ShortInterval
          );
        expect(actual).toEqual({
          subscriptionEligibilityResult: SubscriptionEligibilityResult.CREATE,
        });
        expect(mockEligibilityManager.getOfferingOverlap).toHaveBeenCalledWith({
          priceIds: [],
          targetPriceId: mockPlanTier1ShortInterval.plan_id,
        });
      });

      it('returns upgrade for targetPlan with offering user is subscribed to a lower tier of', async () => {
        mockEligibilityManager.getOfferingOverlap = jest
          .fn()
          .mockResolvedValueOnce([
            {
              comparison: 'upgrade',
              priceId: mockPlanTier1ShortInterval.plan_id,
            },
          ])
          .mockResolvedValueOnce([]);
        const actual =
          await capabilityService.eligibilityFromEligibilityManager(
            [mockPlanTier1ShortInterval],
            [],
            mockPlanTier2LongInterval
          );
        expect(actual).toEqual({
          subscriptionEligibilityResult: SubscriptionEligibilityResult.UPGRADE,
          eligibleSourcePlan: mockPlanTier1ShortInterval,
        });
        expect(mockEligibilityManager.getOfferingOverlap).toHaveBeenCalledWith({
          priceIds: [mockPlanTier1ShortInterval.plan_id],
          targetPriceId: mockPlanTier2LongInterval.plan_id,
        });
      });

      it('returns downgrade for targetPlan with offering user is subscribed to a higher tier of', async () => {
        mockEligibilityManager.getOfferingOverlap = jest
          .fn()
          .mockResolvedValueOnce([
            {
              comparison: 'downgrade',
              priceId: mockPlanTier1ShortInterval.plan_id,
            },
          ])
          .mockResolvedValueOnce([]);
        const actual =
          await capabilityService.eligibilityFromEligibilityManager(
            [mockPlanTier2LongInterval],
            [],
            mockPlanTier1ShortInterval
          );
        expect(actual).toEqual({
          subscriptionEligibilityResult:
            SubscriptionEligibilityResult.DOWNGRADE,
          eligibleSourcePlan: undefined,
        });
        expect(mockEligibilityManager.getOfferingOverlap).toHaveBeenCalledWith({
          priceIds: [mockPlanTier2LongInterval.plan_id],
          targetPriceId: mockPlanTier1ShortInterval.plan_id,
        });
      });

      it('returns upgrade for targetPlan with offering user is subscribed to a higher interval of', async () => {
        mockEligibilityManager.getOfferingOverlap = jest
          .fn()
          .mockResolvedValueOnce([
            {
              comparison: 'upgrade',
              priceId: mockPlanTier1ShortInterval.plan_id,
            },
          ])
          .mockResolvedValueOnce([]);
        const actual =
          await capabilityService.eligibilityFromEligibilityManager(
            [mockPlanTier1ShortInterval],
            [],
            mockPlanTier1LongInterval
          );
        expect(actual).toEqual({
          subscriptionEligibilityResult: SubscriptionEligibilityResult.UPGRADE,
          eligibleSourcePlan: mockPlanTier1ShortInterval,
        });
        expect(mockEligibilityManager.getOfferingOverlap).toHaveBeenCalledWith({
          priceIds: [mockPlanTier1ShortInterval.plan_id],
          targetPriceId: mockPlanTier1LongInterval.plan_id,
        });
      });

      it('returns upgrade for targetPlan with offering user is subscribed and interval is not shorter', async () => {
        mockEligibilityManager.getOfferingOverlap = jest
          .fn()
          .mockResolvedValueOnce([
            {
              comparison: 'upgrade',
              priceId: mockPlanTier1ShortInterval.plan_id,
            },
          ])
          .mockResolvedValueOnce([]);
        const actual =
          await capabilityService.eligibilityFromEligibilityManager(
            [mockPlanTier1ShortInterval],
            [],
            mockPlanTier2ShortInterval
          );
        expect(actual).toEqual({
          subscriptionEligibilityResult: SubscriptionEligibilityResult.UPGRADE,
          eligibleSourcePlan: mockPlanTier1ShortInterval,
        });
        expect(mockEligibilityManager.getOfferingOverlap).toHaveBeenCalledWith({
          priceIds: [mockPlanTier1ShortInterval.plan_id],
          targetPriceId: mockPlanTier2ShortInterval.plan_id,
        });
      });

      it('returns upgrade for targetPlan with same offering and longer interval', async () => {
        mockEligibilityManager.getOfferingOverlap = jest
          .fn()
          .mockResolvedValueOnce([
            {
              comparison: 'same',
              priceId: mockPlanTier1ShortInterval.plan_id,
            },
          ])
          .mockResolvedValueOnce([]);
        const actual =
          await capabilityService.eligibilityFromEligibilityManager(
            [mockPlanTier1ShortInterval],
            [],
            mockPlanTier1LongInterval
          );
        expect(actual).toEqual({
          subscriptionEligibilityResult: SubscriptionEligibilityResult.UPGRADE,
          eligibleSourcePlan: mockPlanTier1ShortInterval,
        });
        expect(mockEligibilityManager.getOfferingOverlap).toHaveBeenCalledWith({
          priceIds: [mockPlanTier1ShortInterval.plan_id],
          targetPriceId: mockPlanTier1LongInterval.plan_id,
        });
      });

      it('returns downgrade for targetPlan with shorter interval but higher tier than user is subscribed to', async () => {
        mockEligibilityManager.getOfferingOverlap = jest
          .fn()
          .mockResolvedValueOnce([
            {
              comparison: 'upgrade',
              priceId: mockPlanTier1LongInterval.plan_id,
            },
          ])
          .mockResolvedValueOnce([]);
        Container.set(EligibilityManager, mockEligibilityManager);
        capabilityService = new CapabilityService();
        const actual =
          await capabilityService.eligibilityFromEligibilityManager(
            [mockPlanTier1LongInterval],
            [],
            mockPlanTier2ShortInterval
          );
        expect(actual).toEqual({
          subscriptionEligibilityResult:
            SubscriptionEligibilityResult.DOWNGRADE,
          eligibleSourcePlan: mockPlanTier1LongInterval,
        });
        expect(mockEligibilityManager.getOfferingOverlap).toHaveBeenCalledWith({
          priceIds: [mockPlanTier1LongInterval.plan_id],
          targetPriceId: mockPlanTier2ShortInterval.plan_id,
        });
      });

      it('returns invalid for targetPlan with same offering user is subscribed to', async () => {
        mockEligibilityManager.getOfferingOverlap = jest
          .fn()
          .mockResolvedValueOnce([
            {
              comparison: 'upgrade',
              priceId: mockPlanTier1ShortInterval.plan_id,
            },
          ])
          .mockResolvedValueOnce([]);
        const actual =
          await capabilityService.eligibilityFromEligibilityManager(
            [mockPlanTier1ShortInterval],
            [],
            mockPlanTier1ShortInterval
          );
        expect(actual).toEqual({
          subscriptionEligibilityResult: SubscriptionEligibilityResult.INVALID,
        });
        expect(mockEligibilityManager.getOfferingOverlap).toHaveBeenCalledWith({
          priceIds: [mockPlanTier1ShortInterval.plan_id],
          targetPriceId: mockPlanTier1ShortInterval.plan_id,
        });
      });

      it('returns invalid for targetPlan with same offering user is subscribed to but different currency', async () => {
        mockEligibilityManager.getOfferingOverlap = jest
          .fn()
          .mockResolvedValueOnce([
            {
              comparison: 'same',
              priceId: mockPlanTier2LongInterval.plan_id,
            },
          ])
          .mockResolvedValueOnce([]);
        const actual =
          await capabilityService.eligibilityFromEligibilityManager(
            [mockPlanTier2LongInterval],
            [],
            mockPlanTier2LongIntervalDiffCurr
          );
        expect(actual).toEqual({
          subscriptionEligibilityResult: SubscriptionEligibilityResult.INVALID,
        });
        expect(mockEligibilityManager.getOfferingOverlap).toHaveBeenCalledWith({
          priceIds: [mockPlanTier2LongInterval.plan_id],
          targetPriceId: mockPlanTier2LongIntervalDiffCurr.plan_id,
        });
      });
    });

    describe('FromStripeMetadata', () => {
      it('returns blocked_iap for targetPlan with productSet the user is subscribed to with IAP', async () => {
        capabilityService.fetchSubscribedPricesFromAppStore = jest
          .fn()
          .mockResolvedValue(['plan_123456']);
        const actual = await capabilityService.eligibilityFromStripeMetadata(
          [],
          [mockPlanTier2LongInterval],
          mockPlanTier1ShortInterval
        );
        expect(actual).toEqual({
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
        expect(actual).toEqual({
          subscriptionEligibilityResult: SubscriptionEligibilityResult.CREATE,
        });
      });

      it('returns upgrade for targetPlan with productSet user is subscribed to a lower tier of', async () => {
        capabilityService.fetchSubscribedPricesFromStripe = jest
          .fn()
          .mockResolvedValue([mockPlanTier1ShortInterval.plan_id]);
        const actual = await capabilityService.eligibilityFromStripeMetadata(
          [mockPlanTier1ShortInterval],
          [],
          mockPlanTier2LongInterval
        );
        expect(actual).toEqual({
          subscriptionEligibilityResult: SubscriptionEligibilityResult.UPGRADE,
          eligibleSourcePlan: mockPlanTier1ShortInterval,
        });
      });

      it('returns downgrade for targetPlan with productSet user is subscribed to a higher tier of', async () => {
        capabilityService.fetchSubscribedPricesFromStripe = jest
          .fn()
          .mockResolvedValue([mockPlanTier2LongInterval.plan_id]);
        const actual = await capabilityService.eligibilityFromStripeMetadata(
          [mockPlanTier2LongInterval],
          [],
          mockPlanTier1ShortInterval
        );
        expect(actual).toEqual({
          subscriptionEligibilityResult:
            SubscriptionEligibilityResult.DOWNGRADE,
          eligibleSourcePlan: mockPlanTier2LongInterval,
        });
      });

      it('returns invalid for targetPlan with no product order', async () => {
        capabilityService.fetchSubscribedPricesFromStripe = jest
          .fn()
          .mockResolvedValue([mockPlanTier2LongInterval.plan_id]);
        const actual = await capabilityService.eligibilityFromStripeMetadata(
          [mockPlanTier2LongInterval],
          [],
          mockPlanNoProductOrder
        );
        expect(actual).toEqual({
          subscriptionEligibilityResult: SubscriptionEligibilityResult.INVALID,
        });
      });
    });

    describe('eligibilityManagerResult and stripeEligibilityResult should match', () => {
      let mockEligibilityManager: any;

      beforeEach(() => {
        mockEligibilityManager = {};
        Container.set(EligibilityManager, mockEligibilityManager);
        capabilityService = new CapabilityService();
      });

      it('returns blocked_iap result from both', async () => {
        mockEligibilityManager.getOfferingOverlap = jest
          .fn()
          .mockResolvedValueOnce([])
          .mockResolvedValueOnce([
            {
              comparison: 'same',
              priceId: mockPlanTier1ShortInterval.plan_id,
            },
          ]);

        capabilityService.fetchSubscribedPricesFromAppStore = jest
          .fn()
          .mockResolvedValue(['plan_123456']);

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

        expect(eligiblityActual.subscriptionEligibilityResult).toEqual(
          stripeActual.subscriptionEligibilityResult
        );
      });
    });
  });

  describe('processPriceIdDiff', () => {
    it('should process the product diff', async () => {
      mockAuthEvents.emit = jest.fn().mockReturnValue({});
      await capabilityService.processPriceIdDiff({
        uid: UID,
        priorPriceIds: ['plan_123456', 'plan_876543'],
        currentPriceIds: ['plan_876543', 'plan_ABCDEF'],
      });
      expect(log.notifyAttachedServices).toHaveBeenCalledTimes(2);
    });
  });

  describe('determineClientVisibleSubscriptionCapabilities', () => {
    beforeEach(() => {
      mockStripeHelper.fetchCustomer = jest.fn(async () => ({
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
      mockStripeHelper.iapPurchasesToPriceIds = jest
        .fn()
        .mockReturnValue(['plan_PLAY']);
      mockSubscriptionPurchase = {
        sku: 'play_1234',
        isEntitlementActive: jest.fn().mockReturnValue(true),
      };

      mockPlayBilling.userManager.queryCurrentSubscriptions = jest
        .fn()
        .mockResolvedValue([mockSubscriptionPurchase]);
    });

    async function assertExpectedCapabilities(
      clientId: any,
      expectedCapabilities: any
    ) {
      const allCapabilities =
        await capabilityService.subscriptionCapabilities(UID);
      const resultCapabilities =
        await capabilityService.determineClientVisibleSubscriptionCapabilities(
          // null client represents sessionToken auth from content-server, unfiltered by client
          clientId === 'null' ? null : Buffer.from(clientId, 'hex'),
          allCapabilities
        );
      expect(resultCapabilities.sort()).toEqual(expectedCapabilities.sort());
    }

    it('handles a firestore fetch error', async () => {
      const error = new Error('test error');
      error.name = PurchaseQueryError.OTHER_ERROR;
      mockPlayBilling.userManager.queryCurrentSubscriptions = jest
        .fn()
        .mockRejectedValue(error);
      const allCapabilities =
        await capabilityService.subscriptionCapabilities(UID);
      expect(allCapabilities).toEqual({
        '*': ['capAll'],
        c1: ['capZZ', 'cap4', 'cap5', 'capAlpha'],
        c2: ['cap5', 'cap6', 'capC', 'capD'],
        c3: ['capD', 'capE'],
      });
      expect(
        mockPlayBilling.userManager.queryCurrentSubscriptions
      ).toHaveBeenCalledTimes(1);
      expect(
        mockPlayBilling.userManager.queryCurrentSubscriptions
      ).toHaveBeenCalledWith(UID);
    });

    it('only reveals capabilities relevant to the client', async () => {
      const expected: any = {
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
      mockStripeHelper.allAbbrevPlans = jest.fn(async () => [
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

      let mockCapabilityService: any = {};
      mockCapabilityService = new CapabilityService();

      const subscribedPrices =
        await mockCapabilityService.subscribedPriceIds(UID);

      const mockStripeCapabilities =
        await mockCapabilityService.planIdsToClientCapabilitiesFromStripe(
          subscribedPrices
        );

      const mockCMSCapabilities =
        await mockCapabilityService.planIdsToClientCapabilities(
          subscribedPrices
        );

      expect(mockCMSCapabilities).toEqual(mockStripeCapabilities);
    });

    it('returns results from Stripe and logs to Sentry when results do not match', async () => {
      const sentryScope = { setContext: jest.fn() };
      jest
        .spyOn(Sentry, 'withScope')
        .mockImplementation((cb: any) => cb(sentryScope));
      jest.spyOn(sentryModule, 'reportSentryMessage').mockReturnValue({});

      mockCapabilityManager.priceIdsToClientCapabilities = jest
        .fn()
        .mockResolvedValue({
          c1: ['capAlpha'],
          c4: ['capBeta', 'capDelta', 'capEpsilon'],
          c6: ['capGamma', 'capZeta'],
          c8: ['capOmega'],
        });

      const expected: any = {
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

      expect(sentryScope.setContext).toHaveBeenCalledTimes(5);
      expect(sentryScope.setContext).toHaveBeenCalledWith(
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

      expect(sentryModule.reportSentryMessage).toHaveBeenCalledTimes(5);
      expect(sentryModule.reportSentryMessage).toHaveBeenCalledWith(
        `CapabilityService.planIdsToClientCapabilities - Returned Stripe as plan ids to client capabilities did not match.`,
        'error'
      );
    });
  });

  describe('getClients', () => {
    beforeEach(() => {
      mockStripeHelper.allAbbrevPlans = jest.fn(async () => mockPlans);
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
        expect(actual).toEqual(expected);
      });

      it('adds the capabilities from the Firestore config document when available', async () => {
        const mockPlanConfigs: any = {
          firefox_pro_basic_999: {
            capabilities: {
              [ALL_RPS_CAPABILITIES_KEY]: ['goodnewseveryone'],
              client2: ['wibble', 'quux'],
            },
          },
        };
        mockStripeHelper.allMergedPlanConfigs = jest.fn(
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
        expect(actual).toEqual(expected);
      });
    });

    it('returns results from Stripe when CapabilityManager is not found and logs to Sentry', async () => {
      Container.remove(CapabilityManager);

      let mockCapabilityService: any = {};
      mockCapabilityService = new CapabilityService();

      const mockClientsFromStripe =
        await mockCapabilityService.getClientsFromStripe();

      const clients = await mockCapabilityService.getClients();

      expect(clients).toEqual(mockClientsFromStripe);
    });

    it('returns results from CMS when it matches Stripe', async () => {
      const sentryScope = { setContext: jest.fn() };
      jest
        .spyOn(Sentry, 'withScope')
        .mockImplementation((cb: any) => cb(sentryScope));
      jest.spyOn(sentryModule, 'reportSentryMessage').mockReturnValue({});

      const mockClientsFromCMS = await mockCapabilityManager.getClients();

      const mockClientsFromStripe =
        await capabilityService.getClientsFromStripe();

      expect(mockClientsFromCMS).toEqual(mockClientsFromStripe);

      const clients = await capabilityService.getClients();
      expect(clients).toEqual(mockClientsFromCMS);

      expect(Sentry.withScope).not.toHaveBeenCalled();
      expect(sentryScope.setContext).not.toHaveBeenCalled();
      expect(sentryModule.reportSentryMessage).not.toHaveBeenCalled();
    });

    it('returns results from Stripe and logs to Sentry when results do not match', async () => {
      const sentryScope = { setContext: jest.fn() };
      jest
        .spyOn(Sentry, 'withScope')
        .mockImplementation((cb: any) => cb(sentryScope));
      jest.spyOn(sentryModule, 'reportSentryMessage').mockReturnValue({});

      mockCapabilityManager.getClients = jest.fn().mockResolvedValue([
        {
          capabilities: ['exampleCap0', 'exampleCap1', 'exampleCap3'],
          clientId: 'client1',
        },
      ]);

      const mockClientsFromCMS = await mockCapabilityManager.getClients();

      const mockClientsFromStripe =
        await capabilityService.getClientsFromStripe();

      expect(mockClientsFromCMS).not.toEqual(mockClientsFromStripe);

      const clients = await capabilityService.getClients();
      expect(clients).toEqual(mockClientsFromStripe);

      expect(sentryScope.setContext).toHaveBeenCalledTimes(1);
      expect(sentryScope.setContext).toHaveBeenCalledWith('getClients', {
        cms: mockClientsFromCMS,
        stripe: mockClientsFromStripe,
      });
      expect(sentryModule.reportSentryMessage).toHaveBeenCalledTimes(1);
      expect(sentryModule.reportSentryMessage).toHaveBeenCalledWith(
        `CapabilityService.getClients - Returned Stripe as clients did not match.`,
        'error'
      );

      expect(sentryScope.setContext).toHaveBeenCalledTimes(1);
      expect(sentryScope.setContext).toHaveBeenCalledWith('getClients', {
        cms: mockClientsFromCMS,
        stripe: mockClientsFromStripe,
      });
    });
  });

  describe('CMS flag is enabled', () => {
    it('returns planIdsToClientCapabilities from CMS', async () => {
      mockConfig.cms.enabled = true;

      capabilityService.subscribedPriceIds = jest.fn().mockResolvedValue([UID]);

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

      expect(mockCMSCapabilities).toEqual(expected);
    });

    it('returns getClients from CMS', async () => {
      mockConfig.cms.enabled = true;

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
      expect(mockClientsFromCMS).toEqual(expected);
    });
  });
});
