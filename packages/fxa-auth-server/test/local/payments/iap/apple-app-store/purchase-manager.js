/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const sinon = require('sinon');
const { assert } = require('chai');
const { default: Container } = require('typedi');
const proxyquire = require('proxyquire').noPreserveCache();
const {
  NotificationType,
  NotificationSubtype,
  SubscriptionStatus,
} = require('app-store-server-api/dist/cjs');

const { mockLog } = require('../../../../mocks');
const { AppConfig, AuthLogger } = require('../../../../../lib/types');
const {
  PurchaseQueryError,
  PurchaseUpdateError,
} = require('../../../../../lib/payments/iap/apple-app-store/types');
const {
  AppStoreSubscriptionPurchase,
} = require('../../../../../lib/payments/iap/apple-app-store/subscription-purchase');

const sandbox = sinon.createSandbox();

const mockBundleId = 'testBundleId';
const mockOriginalTransactionId = 'testOriginalTransactionId';
const mockSubscriptionPurchase = {};
const mockMergePurchase = sinon.fake.returns({});
const mockDecodedNotificationPayload = {
  data: {
    signedTransactionInfo: {},
  },
};
const mockDecodeNotificationPayload = sandbox.fake.resolves(
  mockDecodedNotificationPayload
);
const mockDecodeTransactionInfo = sandbox.fake.resolves({
  bundleId: mockBundleId,
  originalTransactionId: mockOriginalTransactionId,
});
const mockDecodeRenewalInfo = sandbox.fake.resolves({});
const mockApiResult = {
  bundleId: mockBundleId,
  data: [
    {
      lastTransactions: [
        {
          originalTransactionId: mockOriginalTransactionId,
          status: SubscriptionStatus.Active,
          signedTransactionInfo: {},
          signedRenewalInfo: {},
        },
      ],
    },
  ],
};

const { NOTIFICATION_TYPES_FOR_NON_SUBSCRIPTION_PURCHASES, PurchaseManager } =
  proxyquire(
    '../../../../../lib/payments/iap/apple-app-store/purchase-manager',
    {
      'app-store-server-api': {
        decodeNotificationPayload: mockDecodeNotificationPayload,
        decodeTransaction: mockDecodeTransactionInfo,
      },
      'fxa-shared/payments/iap/apple-app-store/purchase-manager': proxyquire(
        'fxa-shared/payments/iap/apple-app-store/purchase-manager',
        {
          './subscription-purchase': {
            AppStoreSubscriptionPurchase: mockSubscriptionPurchase,
            mergePurchaseWithFirestorePurchaseRecord: mockMergePurchase,
          },
          'app-store-server-api': {
            decodeRenewalInfo: mockDecodeRenewalInfo,
            decodeTransaction: mockDecodeTransactionInfo,
          },
        }
      ),
    }
  );

// For queryCurrentSubscriptionPurchases method only which is the analog to
// Google Play's UserManager.queryCurrentSubscriptions originally.
// These tests use an actual SubscriptionPurchase class and helper methods
// from that module.
// TODO: rename proxyquired PurchaseManager to use MockPurchaseManager alias
// and use real name here.
const { PurchaseManager: UnmockedPurchaseManager } = proxyquire(
  '../../../../../lib/payments/iap/apple-app-store/purchase-manager',
  {
    'fxa-shared/payments/iap/apple-app-store/purchase-manager': proxyquire(
      'fxa-shared/payments/iap/apple-app-store/purchase-manager',
      {
        'app-store-server-api': {
          decodeRenewalInfo: mockDecodeRenewalInfo,
          decodeTransaction: mockDecodeTransactionInfo,
        },
      }
    ),
  }
);

describe('PurchaseManager', () => {
  let log;
  let mockAppStoreHelper;
  let mockPurchaseDbRef;

  const mockConfig = {
    authFirestore: {
      prefix: 'mock-fxa-',
    },
    subscriptions: {
      appStore: {
        credentials: {
          org_mozilla_ios_FirefoxVPN: {
            issuerId: 'issuer_id',
            serverApiKey: 'key',
            serverApiKeyId: 'key_id',
          },
        },
      },
    },
  };

  beforeEach(() => {
    mockAppStoreHelper = {};
    log = mockLog();
    Container.set(AuthLogger, log);
    Container.set(AppConfig, mockConfig);
  });

  afterEach(() => {
    Container.reset();
  });

  it('can be instantiated', () => {
    const purchaseManager = new PurchaseManager(
      mockPurchaseDbRef,
      mockAppStoreHelper
    );
    assert.ok(purchaseManager);
  });

  describe('querySubscriptionPurchase', () => {
    let purchaseManager;
    let mockPurchaseDoc;
    let mockSubscription;
    const firestoreObject = {};
    mockPurchaseDbRef = {};

    beforeEach(() => {
      mockAppStoreHelper = {
        getSubscriptionStatuses: sinon.fake.resolves(mockApiResult),
      };
      mockPurchaseDoc = {
        exists: false,
        ref: {
          set: sinon.fake.resolves({}),
          update: sinon.fake.resolves({}),
        },
      };
      mockPurchaseDbRef.doc = sinon.fake.returns({
        get: sinon.fake.resolves(mockPurchaseDoc),
      });
      mockSubscription = {
        toFirestoreObject: sinon.fake.returns(firestoreObject),
      };
      mockSubscriptionPurchase.fromApiResponse =
        sinon.fake.returns(mockSubscription);
      purchaseManager = new PurchaseManager(
        mockPurchaseDbRef,
        mockAppStoreHelper
      );
    });

    afterEach(() => {
      sandbox.reset();
    });

    it('queries with no found firestore doc', async () => {
      const result = await purchaseManager.querySubscriptionPurchase(
        mockBundleId,
        mockOriginalTransactionId
      );
      assert.strictEqual(result, mockSubscription);

      sinon.assert.calledOnce(mockAppStoreHelper.getSubscriptionStatuses);
      sinon.assert.calledOnce(mockDecodeTransactionInfo);
      sinon.assert.calledOnce(mockDecodeRenewalInfo);

      sinon.assert.calledOnce(mockPurchaseDbRef.doc);
      sinon.assert.calledOnce(mockPurchaseDbRef.doc().get);
      sinon.assert.calledOnce(mockSubscriptionPurchase.fromApiResponse);
      sinon.assert.calledOnce(mockSubscription.toFirestoreObject);

      sinon.assert.calledWithExactly(mockPurchaseDoc.ref.set, firestoreObject);
    });

    it('queries with found firestore doc', async () => {
      mockPurchaseDoc.data = sinon.fake.returns({});
      mockPurchaseDoc.exists = true;
      const result = await purchaseManager.querySubscriptionPurchase(
        mockBundleId,
        mockOriginalTransactionId
      );
      assert.strictEqual(result, mockSubscription);

      sinon.assert.calledOnce(mockAppStoreHelper.getSubscriptionStatuses);
      sinon.assert.calledOnce(mockDecodeTransactionInfo);
      sinon.assert.calledOnce(mockDecodeRenewalInfo);

      sinon.assert.calledOnce(mockPurchaseDbRef.doc);
      sinon.assert.calledOnce(mockPurchaseDbRef.doc().get);
      sinon.assert.calledOnce(mockSubscriptionPurchase.fromApiResponse);
      sinon.assert.calledOnce(mockSubscription.toFirestoreObject);

      sinon.assert.calledWithExactly(
        mockPurchaseDoc.ref.update,
        firestoreObject
      );
      sinon.assert.calledOnce(mockMergePurchase);
      sinon.assert.calledOnce(mockPurchaseDoc.data);
    });

    it('adds notification type and subtype to the purchase if passed in', async () => {
      mockPurchaseDoc.data = sinon.fake.returns({});
      mockPurchaseDoc.exists = true;
      const notificationType = 'foo';
      const notificationSubtype = 'bar';
      const mockSubscriptionWithNotificationProps = {
        ...mockSubscription,
        latestNotificationType: notificationType,
        latestNotificationSubtype: notificationSubtype,
      };
      const result = await purchaseManager.querySubscriptionPurchase(
        mockBundleId,
        mockOriginalTransactionId,
        notificationType,
        notificationSubtype
      );
      assert.deepEqual(result, mockSubscriptionWithNotificationProps);
    });

    it('adds only notificationType to the purchase if notificationSubtype is undefined when passed in', async () => {
      mockPurchaseDoc.data = sinon.fake.returns({});
      mockPurchaseDoc.exists = true;
      const notificationType = 'foo';
      const notificationSubtype = undefined;
      const mockSubscriptionWithNotificationProp = {
        ...mockSubscription,
        latestNotificationType: notificationType,
      };
      const result = await purchaseManager.querySubscriptionPurchase(
        mockBundleId,
        mockOriginalTransactionId,
        notificationType,
        notificationSubtype
      );
      assert.deepEqual(result, mockSubscriptionWithNotificationProp);
    });

    it('throws unexpected library error', async () => {
      mockPurchaseDoc.ref.set = sinon.fake.rejects(new Error('test'));
      try {
        await purchaseManager.querySubscriptionPurchase(
          mockBundleId,
          mockOriginalTransactionId
        );
        assert.fail('Expected error');
      } catch (err) {
        assert.equal(err.name, PurchaseQueryError.OTHER_ERROR);
      }
    });
  });

  describe('forceRegisterToUserAccount', () => {
    let purchaseManager;

    beforeEach(() => {
      mockPurchaseDbRef.doc = sinon.fake.returns({
        update: sinon.fake.resolves({}),
      });
      purchaseManager = new PurchaseManager(
        mockPurchaseDbRef,
        mockAppStoreHelper
      );
    });

    it('updates the user for a doc', async () => {
      const result = await purchaseManager.forceRegisterToUserAccount(
        mockBundleId,
        'testUserId'
      );
      assert.isUndefined(result);
      sinon.assert.calledOnce(mockPurchaseDbRef.doc);
      sinon.assert.calledWithExactly(mockPurchaseDbRef.doc().update, {
        userId: 'testUserId',
      });
    });

    it('throws library error on unknown', async () => {
      mockPurchaseDbRef.doc = sinon.fake.returns({
        update: sinon.fake.rejects(new Error('Oops')),
      });
      try {
        await purchaseManager.forceRegisterToUserAccount(
          'testToken',
          'testUserId'
        );
        assert.fail('Expected error');
      } catch (err) {
        assert.equal(err.name, PurchaseQueryError.OTHER_ERROR);
      }
    });
  });

  describe('getSubscriptionPurchase', () => {
    let purchaseManager;
    let mockPurchaseDoc;

    beforeEach(() => {
      mockPurchaseDoc = {
        exists: true,
        data: sinon.fake.returns({}),
      };

      mockPurchaseDbRef.doc = sinon.fake.returns({
        get: sinon.fake.resolves(mockPurchaseDoc),
      });
      purchaseManager = new PurchaseManager(
        mockPurchaseDbRef,
        mockAppStoreHelper
      );
      mockSubscriptionPurchase.fromFirestoreObject = sinon.fake.returns({});
    });

    it('returns an existing doc', async () => {
      const result = await purchaseManager.getSubscriptionPurchase(
        mockOriginalTransactionId
      );
      assert.deepEqual(result, {});
    });

    it('returns undefined with no doc', async () => {
      mockPurchaseDoc.exists = false;
      const result = await purchaseManager.getSubscriptionPurchase(
        mockOriginalTransactionId
      );
      assert.isUndefined(result);
    });
  });

  describe('registerToUserAccount', () => {
    let purchaseManager;
    let mockPurchaseDoc;
    let mockSubscription;

    beforeEach(() => {
      mockPurchaseDoc = {
        exists: false,
        data: sinon.fake.returns({}),
        ref: {
          set: sinon.fake.resolves({}),
          update: sinon.fake.resolves({}),
        },
      };
      mockSubscription = {};
      mockSubscription.isRegisterable = sinon.fake.returns(true);
      mockPurchaseDbRef.doc = sinon.fake.returns({
        get: sinon.fake.resolves(mockPurchaseDoc),
      });
      purchaseManager = new PurchaseManager(
        mockPurchaseDbRef,
        mockAppStoreHelper
      );
      purchaseManager.querySubscriptionPurchase =
        sinon.fake.resolves(mockSubscription);
      purchaseManager.forceRegisterToUserAccount = sinon.fake.resolves({});
    });

    it('registers successfully for non-cached original transaction id', async () => {
      const result = await purchaseManager.registerToUserAccount(
        mockBundleId,
        mockOriginalTransactionId,
        'testUserId'
      );
      assert.strictEqual(result, mockSubscription);
      sinon.assert.calledOnce(purchaseManager.querySubscriptionPurchase);
      sinon.assert.calledOnce(purchaseManager.forceRegisterToUserAccount);
    });

    it('skips doing anything for cached original transaction id', async () => {
      mockPurchaseDoc.exists = true;
      mockSubscription.userId = 'testUserId';
      mockSubscriptionPurchase.fromFirestoreObject =
        sinon.fake.returns(mockSubscription);
      const result = await purchaseManager.registerToUserAccount(
        mockBundleId,
        mockOriginalTransactionId,
        'testUserId'
      );
      assert.strictEqual(result, mockSubscription);
      sinon.assert.notCalled(purchaseManager.querySubscriptionPurchase);
      sinon.assert.notCalled(purchaseManager.forceRegisterToUserAccount);
    });

    it('throws conflict error for existing original transaction id registered to other user', async () => {
      mockPurchaseDoc.exists = true;
      mockSubscription.userId = 'otherUserId';
      mockSubscriptionPurchase.fromFirestoreObject =
        sinon.fake.returns(mockSubscription);
      try {
        await purchaseManager.registerToUserAccount(
          mockBundleId,
          mockOriginalTransactionId,
          'testUserId'
        );
        assert.fail('Expected error');
      } catch (err) {
        assert.equal(err.name, PurchaseUpdateError.CONFLICT);
        sinon.assert.calledOnce(log.info);
      }
    });

    it('throws invalid original transaction id error if purchase cant be queried', async () => {
      purchaseManager.querySubscriptionPurchase = sinon.fake.rejects(
        new Error('Oops')
      );
      try {
        await purchaseManager.registerToUserAccount(
          mockBundleId,
          mockOriginalTransactionId,
          'testUserId'
        );
        assert.fail('Expected error');
      } catch (err) {
        assert.equal(
          err.name,
          PurchaseUpdateError.INVALID_ORIGINAL_TRANSACTION_ID
        );
        assert.equal(err.message, 'Oops');
      }
    });
  });

  describe('queryCurrentSubscriptionPurchases', () => {
    let purchaseManager;
    let mockPurchaseDbRef;
    let mockPurchaseDoc;
    let mockStatus;
    let queryResult;
    const USER_ID = 'testUser';
    const mockVerifiedAt = 123;

    beforeEach(() => {
      queryResult = {
        docs: [],
      };
      mockStatus = SubscriptionStatus.Active;
      mockPurchaseDbRef = {
        where: () => mockPurchaseDbRef,
        get: sinon.fake.resolves(queryResult),
      };
      mockPurchaseDoc = {
        exists: false,
        ref: {
          set: sinon.fake.resolves({}),
          update: sinon.fake.resolves({}),
        },
      };
      mockPurchaseDbRef.doc = sinon.fake.returns({
        get: sinon.fake.resolves(mockPurchaseDoc),
      });
      purchaseManager = new UnmockedPurchaseManager(
        mockPurchaseDbRef,
        mockAppStoreHelper
      );
    });

    afterEach(() => {
      Container.reset();
    });

    it('returns the current subscriptions', async () => {
      const subscriptionPurchase = AppStoreSubscriptionPurchase.fromApiResponse(
        mockApiResult,
        mockStatus,
        {},
        {},
        mockOriginalTransactionId,
        mockVerifiedAt
      );
      const subscriptionSnapshot = {
        data: sinon.fake.returns(subscriptionPurchase.toFirestoreObject()),
      };
      queryResult.docs.push(subscriptionSnapshot);
      const result = await purchaseManager.queryCurrentSubscriptionPurchases(
        USER_ID
      );
      assert.deepEqual(result, [subscriptionPurchase]);
      sinon.assert.calledOnce(mockPurchaseDbRef.get);
    });

    it('queries expired subscription purchases', async () => {
      const mockApiExpiredResult = {
        bundleId: mockBundleId,
        data: [
          {
            lastTransactions: [
              {
                originalTransactionId: mockOriginalTransactionId,
                status: SubscriptionStatus.Expired,
                signedTransactionInfo: {},
                signedRenewalInfo: {},
              },
            ],
          },
        ],
      };
      mockStatus = SubscriptionStatus.Expired;
      const subscriptionPurchase = AppStoreSubscriptionPurchase.fromApiResponse(
        mockApiExpiredResult,
        mockStatus,
        {},
        {},
        mockOriginalTransactionId,
        mockVerifiedAt
      );
      const subscriptionSnapshot = {
        data: sinon.fake.returns(subscriptionPurchase.toFirestoreObject()),
      };
      queryResult.docs.push(subscriptionSnapshot);
      purchaseManager.querySubscriptionPurchase =
        sinon.fake.resolves(subscriptionPurchase);
      const result = await purchaseManager.queryCurrentSubscriptionPurchases(
        USER_ID
      );
      assert.deepEqual(result, []);
      sinon.assert.calledOnce(purchaseManager.querySubscriptionPurchase);
    });

    it('throws library error on failure', async () => {
      const mockApiExpiredResult = {
        bundleId: mockBundleId,
        data: [
          {
            lastTransactions: [
              {
                originalTransactionId: mockOriginalTransactionId,
                status: SubscriptionStatus.Expired,
                signedTransactionInfo: {},
                signedRenewalInfo: {},
              },
            ],
          },
        ],
      };
      mockStatus = SubscriptionStatus.Expired;
      const subscriptionPurchase = AppStoreSubscriptionPurchase.fromApiResponse(
        mockApiExpiredResult,
        mockStatus,
        {},
        {},
        mockOriginalTransactionId,
        mockVerifiedAt
      );
      const subscriptionSnapshot = {
        data: sinon.fake.returns(subscriptionPurchase.toFirestoreObject()),
      };
      queryResult.docs.push(subscriptionSnapshot);
      purchaseManager.querySubscriptionPurchase = sinon.fake.rejects(
        new Error('oops')
      );
      try {
        await purchaseManager.queryCurrentSubscriptionPurchases(USER_ID);
        assert.fail('should have thrown');
      } catch (err) {
        assert.strictEqual(err.name, PurchaseQueryError.OTHER_ERROR);
      }
    });
  });

  describe('decodeNotificationPayload', () => {
    let mockPayload;
    let purchaseManager;

    beforeEach(() => {
      mockPayload = {};
      purchaseManager = new PurchaseManager(
        mockPurchaseDbRef,
        mockAppStoreHelper
      );
    });
    it('decodes the notification payload', async () => {
      const expected = {
        bundleId: mockBundleId,
        decodedPayload: mockDecodedNotificationPayload,
        originalTransactionId: mockOriginalTransactionId,
      };
      const result = await purchaseManager.decodeNotificationPayload(
        mockPayload
      );
      assert.deepEqual(result, expected);
    });
  });

  describe('processNotification', () => {
    let purchaseManager;
    let mockSubscription;
    let mockNotification;

    beforeEach(() => {
      mockNotification = {};
      mockSubscription = {};

      purchaseManager = new PurchaseManager(
        mockPurchaseDbRef,
        mockAppStoreHelper
      );
      purchaseManager.querySubscriptionPurchase =
        sinon.fake.resolves(mockSubscription);
    });

    it('returns null for not applicable notifications', async () => {
      mockNotification.notificationType =
        NOTIFICATION_TYPES_FOR_NON_SUBSCRIPTION_PURCHASES[0];
      const result = await purchaseManager.processNotification(
        mockBundleId,
        mockOriginalTransactionId,
        mockNotification
      );
      assert.isNull(result);
    });

    it('returns null for new subscriptions', async () => {
      mockNotification.notificationType = NotificationType.Subscribed;
      mockNotification.subtype = NotificationSubtype.InitialBuy;
      const result = await purchaseManager.processNotification(
        mockBundleId,
        mockOriginalTransactionId,
        mockNotification
      );
      assert.isNull(result);
    });

    it('returns a subscription for other valid subscription notifications', async () => {
      mockNotification.notificationType = NotificationType.DidRenew;
      const result = await purchaseManager.processNotification(
        mockBundleId,
        mockOriginalTransactionId,
        mockNotification
      );
      assert.deepEqual(result, mockSubscription);
      sinon.assert.calledOnce(purchaseManager.querySubscriptionPurchase);
    });
  });
});
