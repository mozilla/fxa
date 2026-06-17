/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Container } from 'typedi';
import { createMock } from '@golevelup/ts-jest';
import { AuthLogger } from '../types';

const mockAuthEvents: any = {};
jest.mock('../events', () => ({
  authEvents: mockAuthEvents,
}));

const { CapabilityService } = require('./capability');

const config = require('../../config').default.getProperties();

const {
  mockCMSClients,
  mockCMSPlanIdsToClientCapabilities,
} = require('../../test/mocks');
const { AppConfig } = require('../types');
const { StripeHelper } = require('./stripe');
const { PlayBilling } = require('./iap/google-play');
const { AppleIAP } = require('./iap/apple-app-store');

const subscriptionCreated =
  require('../../test/local/payments/fixtures/stripe/subscription_created.json')
    .data.object;

const { ProfileClient } = require('@fxa/profile/client');
const {
  PlayStoreSubscriptionPurchase,
} = require('./iap/google-play/subscription-purchase');

const authDbModule = require('fxa-shared/db/models/auth');
const { PurchaseQueryError } = require('./iap/google-play/types');
const { CapabilityManager } = require('@fxa/payments/capability');
const { EligibilityManager } = require('@fxa/payments/eligibility');
const {
  SubscriptionEligibilityResult,
} = require('fxa-shared/subscriptions/types');

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
    mockCapabilityManager = {
      getClients: jest.fn().mockResolvedValue(mockCMSClients),
      priceIdsToClientCapabilities: jest
        .fn()
        .mockResolvedValue(mockCMSPlanIdsToClientCapabilities),
    };
    mockConfig = { ...config };
    log = createMock<AuthLogger>();

    Container.set(AppConfig, mockConfig);
    Container.set(AuthLogger, log);
    Container.set(StripeHelper, mockStripeHelper);
    Container.set(PlayBilling, mockPlayBilling);
    Container.set(AppleIAP, mockAppleIAP);
    Container.set(ProfileClient, mockProfileClient);
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

    it('throws an error if eligibilityManager is not found', async () => {
      Container.remove(EligibilityManager);
      capabilityService = new CapabilityService();

      capabilityService.allAbbrevPlansByPlanId = jest.fn().mockResolvedValue({
        plan_123456: mockAbbrevPlans[0],
      });
      capabilityService.getAllSubscribedAbbrevPlans = jest
        .fn()
        .mockResolvedValue([[], []]);

      let err: any;
      try {
        await capabilityService.getPlanEligibility(UID, 'plan_123456');
      } catch (e) {
        err = e;
      }
      expect(err).toBeDefined();
      expect(err.message).toBe('An internal validation check failed.');
    });

    it('returns the eligibility from EligibilityManager', async () => {
      Container.set(EligibilityManager, {});
      capabilityService = new CapabilityService();

      capabilityService.allAbbrevPlansByPlanId = jest.fn().mockResolvedValue({
        plan_123456: mockAbbrevPlans[0],
      });
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
      expect(actual).toEqual([SubscriptionEligibilityResult.CREATE]);
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
  });

  describe('processPriceIdDiff', () => {
    it('should process the product diff', async () => {
      mockAuthEvents.emit = jest.fn().mockReturnValue({});
      mockCapabilityManager.priceIdsToClientCapabilities = jest
        .fn()
        .mockResolvedValueOnce({ c1: ['capRemoved'] })
        .mockResolvedValueOnce({ c1: ['capAdded'] });
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
        c3: ['capAll', 'capD', 'capE'],
        null: [
          'capAll',
          'cap4',
          'cap5',
          'cap6',
          'capC',
          'capD',
          'capE',
          'capZZ',
          'capAlpha',
        ],
      };
      for (const clientId in expected) {
        await assertExpectedCapabilities(clientId, expected[clientId]);
      }
    });

    it('throws when CapabilityManager is not found', async () => {
      Container.remove(CapabilityManager);

      const mockCapabilityService = new CapabilityService();
      const subscribedPrices =
        await mockCapabilityService.subscribedPriceIds(UID);

      let err: any;
      try {
        await mockCapabilityService.planIdsToClientCapabilities(
          subscribedPrices
        );
      } catch (e) {
        err = e;
      }
      expect(err).toBeDefined();
      expect(err.message).toBe('An internal validation check failed.');
    });
  });

  describe('getClients', () => {
    it('returns the clients from CapabilityManager', async () => {
      const clients = await capabilityService.getClients();
      expect(clients).toEqual(mockCMSClients);
      expect(mockCapabilityManager.getClients).toHaveBeenCalledTimes(1);
    });

    it('throws when CapabilityManager is not found', async () => {
      Container.remove(CapabilityManager);
      const mockCapabilityService = new CapabilityService();

      let err: any;
      try {
        await mockCapabilityService.getClients();
      } catch (e) {
        err = e;
      }
      expect(err).toBeDefined();
      expect(err.message).toBe('An internal validation check failed.');
    });
  });
});
