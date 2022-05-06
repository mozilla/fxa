/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const sinon = require('sinon');
const assert = { ...sinon.assert, ...require('chai').assert };
const { Container } = require('typedi');

const { mockLog } = require('../../mocks');
const { AuthLogger } = require('../../../lib/types');
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
  PurchaseQueryError,
} = require('../../../lib/payments/iap/google-play/types');

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
    log = mockLog();
    Container.set(AuthLogger, log);
    Container.set(StripeHelper, mockStripeHelper);
    Container.set(PlayBilling, mockPlayBilling);
    Container.set(AppleIAP, mockAppleIAP);
    Container.set(ProfileClient, mockProfileClient);
    Container.set(PaymentConfigManager, mockPaymentConfigManager);
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
        c1: ['cap4', 'cap5', 'capZZ', 'capAlpha'],
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
  });
});
