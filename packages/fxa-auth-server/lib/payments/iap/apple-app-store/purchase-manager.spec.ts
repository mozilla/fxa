/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Container } from 'typedi';
import {
  NotificationType,
  NotificationSubtype,
  SubscriptionStatus,
} from 'app-store-server-api/dist/cjs';

import { AppConfig, AuthLogger } from '../../../types';
import { PurchaseQueryError, PurchaseUpdateError } from './types';

// Get the real AppStoreSubscriptionPurchase (not the mocked version) for
// queryCurrentSubscriptionPurchases tests that need actual class behavior.
const { AppStoreSubscriptionPurchase } = jest.requireActual(
  'fxa-shared/payments/iap/apple-app-store/subscription-purchase'
);

const { mockLog } = require('../../../../test/mocks');

const mockBundleId = 'testBundleId';
const mockOriginalTransactionId = 'testOriginalTransactionId';
const mockSubscriptionPurchase: any = {};
const mockMergePurchase = jest.fn().mockReturnValue({});
const mockDecodedNotificationPayload = {
  data: {
    signedTransactionInfo: {},
  },
};
const mockDecodeNotificationPayload = jest
  .fn()
  .mockResolvedValue(mockDecodedNotificationPayload);
const mockDecodedTransactionInfo = {
  bundleId: mockBundleId,
  originalTransactionId: mockOriginalTransactionId,
};
const mockDecodeTransactionInfo = jest
  .fn()
  .mockResolvedValue(mockDecodedTransactionInfo);
const mockDecodedRenewalInfo = {
  autoRenewStatus: 0,
};
const mockDecodeRenewalInfo = jest
  .fn()
  .mockResolvedValue(mockDecodedRenewalInfo);
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

// Mock app-store-server-api decode functions.
// Use wrapper functions to defer access to sandbox fakes past hoisting.
jest.mock('app-store-server-api', () => ({
  ...jest.requireActual('app-store-server-api'),
  decodeNotificationPayload: (...args: any[]) =>
    (mockDecodeNotificationPayload as any)(...args),
  decodeTransaction: (...args: any[]) =>
    (mockDecodeTransactionInfo as any)(...args),
  decodeRenewalInfo: (...args: any[]) =>
    (mockDecodeRenewalInfo as any)(...args),
}));

// Mock subscription-purchase module for mocked PurchaseManager tests.
// Use getters so the factory (hoisted by Jest) can reference variables
// defined later without hitting temporal dead zone.
jest.mock(
  'fxa-shared/payments/iap/apple-app-store/subscription-purchase',
  () => ({
    get AppStoreSubscriptionPurchase() {
      return mockSubscriptionPurchase;
    },
    get mergePurchaseWithFirestorePurchaseRecord() {
      return mockMergePurchase;
    },
  })
);

// Must require after jest.mock
const {
  PurchaseManager,
  NOTIFICATION_TYPES_FOR_NON_SUBSCRIPTION_PURCHASES,
} = require('./purchase-manager');

describe('PurchaseManager', () => {
  let log: any;
  let mockAppStoreHelper: any;
  let mockPurchaseDbRef: any;

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
    expect(purchaseManager).toBeTruthy();
  });

  describe('querySubscriptionPurchase', () => {
    let purchaseManager: any;
    let mockPurchaseDoc: any;
    const firestoreObject = {};
    mockPurchaseDbRef = {};

    beforeEach(() => {
      mockAppStoreHelper = {
        getSubscriptionStatuses: jest.fn().mockResolvedValue(mockApiResult),
      };
      mockPurchaseDoc = {
        exists: false,
        ref: {
          set: jest.fn().mockResolvedValue({}),
        },
      };
      mockPurchaseDbRef.doc = jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue(mockPurchaseDoc),
      });
      mockSubscriptionPurchase.toFirestoreObject = jest
        .fn()
        .mockReturnValue(firestoreObject);
      mockSubscriptionPurchase.fromApiResponse = jest
        .fn()
        .mockReturnValue(mockSubscriptionPurchase);
      purchaseManager = new PurchaseManager(
        mockPurchaseDbRef,
        mockAppStoreHelper
      );
      mockMergePurchase.mockClear();
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('queries with no found firestore doc', async () => {
      const result = await purchaseManager.querySubscriptionPurchase(
        mockBundleId,
        mockOriginalTransactionId
      );
      expect(result).toBe(mockSubscriptionPurchase);

      expect(mockAppStoreHelper.getSubscriptionStatuses).toHaveBeenCalledTimes(
        1
      );
      expect(mockDecodeTransactionInfo).toHaveBeenCalledTimes(1);
      expect(mockDecodeRenewalInfo).toHaveBeenCalledTimes(1);
      expect(log.debug).toHaveBeenCalledTimes(1);
      expect(log.debug).toHaveBeenCalledWith(
        'appleIap.querySubscriptionPurchase.getSubscriptionStatuses',
        {
          bundleId: mockBundleId,
          originalTransactionId: mockOriginalTransactionId,
          transactionInfo: mockDecodedTransactionInfo,
          renewalInfo: mockDecodedRenewalInfo,
        }
      );

      expect(mockPurchaseDbRef.doc).toHaveBeenCalledTimes(1);
      expect(mockPurchaseDbRef.doc().get).toHaveBeenCalledTimes(1);
      expect(mockSubscriptionPurchase.fromApiResponse).toHaveBeenCalledTimes(1);
      expect(mockSubscriptionPurchase.toFirestoreObject).toHaveBeenCalledTimes(
        1
      );

      expect(mockPurchaseDoc.ref.set).toHaveBeenCalledWith(firestoreObject);
    });

    it('logs the notification type and subtype if present', async () => {
      const mockTriggerNotificationType = 'WOW';
      const mockTriggerNotificationSubtype = 'IMPRESS';
      await purchaseManager.querySubscriptionPurchase(
        mockBundleId,
        mockOriginalTransactionId,
        mockTriggerNotificationType,
        mockTriggerNotificationSubtype
      );

      expect(log.debug).toHaveBeenCalledTimes(1);
      expect(log.debug).toHaveBeenCalledWith(
        'appleIap.querySubscriptionPurchase.getSubscriptionStatuses',
        {
          bundleId: mockBundleId,
          originalTransactionId: mockOriginalTransactionId,
          transactionInfo: mockDecodedTransactionInfo,
          renewalInfo: mockDecodedRenewalInfo,
          notificationType: mockTriggerNotificationType,
          notificationSubtype: mockTriggerNotificationSubtype,
        }
      );
    });

    it("throws if there's an App Store Server client or API error", async () => {
      mockAppStoreHelper.getSubscriptionStatuses = jest
        .fn()
        .mockRejectedValue(new Error('Oops'));
      await expect(
        purchaseManager.querySubscriptionPurchase(
          mockBundleId,
          mockOriginalTransactionId
        )
      ).rejects.toMatchObject({ name: PurchaseQueryError.OTHER_ERROR });
    });

    it('queries with found firestore doc with no userId', async () => {
      mockPurchaseDoc.data = jest.fn().mockReturnValue({});
      mockPurchaseDoc.exists = true;
      const result = await purchaseManager.querySubscriptionPurchase(
        mockBundleId,
        mockOriginalTransactionId
      );
      expect(result).toBe(mockSubscriptionPurchase);

      expect(mockAppStoreHelper.getSubscriptionStatuses).toHaveBeenCalledTimes(
        1
      );
      expect(mockDecodeTransactionInfo).toHaveBeenCalledTimes(1);
      expect(mockDecodeRenewalInfo).toHaveBeenCalledTimes(1);

      expect(mockPurchaseDbRef.doc).toHaveBeenCalledTimes(1);
      expect(mockPurchaseDbRef.doc().get).toHaveBeenCalledTimes(1);
      expect(mockSubscriptionPurchase.fromApiResponse).toHaveBeenCalledTimes(1);
      expect(mockSubscriptionPurchase.toFirestoreObject).toHaveBeenCalledTimes(
        1
      );

      expect(mockPurchaseDoc.ref.set).toHaveBeenCalledWith(firestoreObject);
      expect(mockMergePurchase).toHaveBeenCalledTimes(1);
      expect(mockPurchaseDoc.data).toHaveBeenCalledTimes(2);
    });

    it('queries with found firestore doc with userId and preserves the userId', async () => {
      mockPurchaseDoc.data = jest.fn().mockReturnValue({ userId: 'amazing' });
      mockPurchaseDoc.exists = true;
      const result = await purchaseManager.querySubscriptionPurchase(
        mockBundleId,
        mockOriginalTransactionId
      );
      expect(result).toBe(mockSubscriptionPurchase);

      expect(mockAppStoreHelper.getSubscriptionStatuses).toHaveBeenCalledTimes(
        1
      );
      expect(mockDecodeTransactionInfo).toHaveBeenCalledTimes(1);
      expect(mockDecodeRenewalInfo).toHaveBeenCalledTimes(1);

      expect(mockPurchaseDbRef.doc).toHaveBeenCalledTimes(1);
      expect(mockPurchaseDbRef.doc().get).toHaveBeenCalledTimes(1);
      expect(mockSubscriptionPurchase.fromApiResponse).toHaveBeenCalledTimes(1);
      expect(mockSubscriptionPurchase.toFirestoreObject).toHaveBeenCalledTimes(
        1
      );

      expect(mockPurchaseDoc.ref.set).toHaveBeenCalledWith({
        userId: 'amazing',
        ...firestoreObject,
      });
      expect(mockMergePurchase).toHaveBeenCalledTimes(1);
      expect(mockPurchaseDoc.data).toHaveBeenCalledTimes(2);
    });

    it('adds notification type and subtype to the purchase if passed in', async () => {
      mockPurchaseDoc.data = jest.fn().mockReturnValue({});
      mockPurchaseDoc.exists = true;
      const notificationType = 'foo';
      const notificationSubtype = 'bar';
      const mockSubscriptionWithNotificationProps = {
        ...mockSubscriptionPurchase,
        latestNotificationType: notificationType,
        latestNotificationSubtype: notificationSubtype,
      };
      const result = await purchaseManager.querySubscriptionPurchase(
        mockBundleId,
        mockOriginalTransactionId,
        notificationType,
        notificationSubtype
      );
      expect(result).toEqual(mockSubscriptionWithNotificationProps);
    });

    it('adds only notificationType to the purchase if notificationSubtype is undefined when passed in', async () => {
      mockPurchaseDoc.data = jest.fn().mockReturnValue({});
      mockPurchaseDoc.exists = true;
      const notificationType = 'foo';
      const notificationSubtype = undefined;
      const mockSubscriptionWithNotificationProp = {
        ...mockSubscriptionPurchase,
        latestNotificationType: notificationType,
      };
      const result = await purchaseManager.querySubscriptionPurchase(
        mockBundleId,
        mockOriginalTransactionId,
        notificationType,
        notificationSubtype
      );
      expect(result).toEqual(mockSubscriptionWithNotificationProp);
    });

    it('throws unexpected library error', async () => {
      mockPurchaseDoc.ref.set = jest.fn().mockRejectedValue(new Error('test'));
      await expect(
        purchaseManager.querySubscriptionPurchase(
          mockBundleId,
          mockOriginalTransactionId
        )
      ).rejects.toMatchObject({ name: PurchaseQueryError.OTHER_ERROR });
    });
  });

  describe('forceRegisterToUserAccount', () => {
    let purchaseManager: any;

    beforeEach(() => {
      mockPurchaseDbRef.doc = jest.fn().mockReturnValue({
        update: jest.fn().mockResolvedValue({}),
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
      expect(result).toBeUndefined();
      expect(mockPurchaseDbRef.doc).toHaveBeenCalledTimes(1);
      expect(mockPurchaseDbRef.doc().update).toHaveBeenCalledWith({
        userId: 'testUserId',
      });
    });

    it('throws library error on unknown', async () => {
      mockPurchaseDbRef.doc = jest.fn().mockReturnValue({
        update: jest.fn().mockRejectedValue(new Error('Oops')),
      });
      await expect(
        purchaseManager.forceRegisterToUserAccount(
          mockOriginalTransactionId,
          'testUserId'
        )
      ).rejects.toMatchObject({ name: PurchaseQueryError.OTHER_ERROR });
    });
  });

  describe('getSubscriptionPurchase', () => {
    let purchaseManager: any;
    let mockPurchaseDoc: any;

    beforeEach(() => {
      mockPurchaseDoc = {
        exists: true,
        data: jest.fn().mockReturnValue({}),
      };

      mockPurchaseDbRef.doc = jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue(mockPurchaseDoc),
      });
      purchaseManager = new PurchaseManager(
        mockPurchaseDbRef,
        mockAppStoreHelper
      );
      mockSubscriptionPurchase.fromFirestoreObject = jest
        .fn()
        .mockReturnValue({});
    });

    it('returns an existing doc', async () => {
      const result = await purchaseManager.getSubscriptionPurchase(
        mockOriginalTransactionId
      );
      expect(result).toEqual({});
    });

    it('returns undefined with no doc', async () => {
      mockPurchaseDoc.exists = false;
      const result = await purchaseManager.getSubscriptionPurchase(
        mockOriginalTransactionId
      );
      expect(result).toBeUndefined();
    });
  });

  describe('deletePurchases', () => {
    let purchaseManager: any;
    let mockPurchaseDoc: any;
    let mockBatch: any;

    beforeEach(() => {
      mockPurchaseDoc = {
        docs: [
          {
            ref: 'testRef',
          },
        ],
      };
      mockBatch = {
        delete: jest.fn().mockResolvedValue({}),
        commit: jest.fn().mockResolvedValue({}),
      };
      mockPurchaseDbRef.where = jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue(mockPurchaseDoc),
      });
      mockPurchaseDbRef.firestore = {
        batch: jest.fn().mockReturnValue(mockBatch),
      };
      purchaseManager = new PurchaseManager(
        mockPurchaseDbRef,
        mockAppStoreHelper
      );
    });

    it('deletes a purchase', async () => {
      const result = await purchaseManager.deletePurchases('testToken');
      expect(result).toBeUndefined();
      expect(mockBatch.delete).toHaveBeenCalledTimes(1);
      expect(mockBatch.delete).toHaveBeenCalledWith('testRef');
      expect(mockBatch.commit).toHaveBeenCalledTimes(1);
    });
  });

  describe('registerToUserAccount', () => {
    let purchaseManager: any;
    let mockPurchaseDoc: any;
    let mockSubscription: any;

    beforeEach(() => {
      mockPurchaseDoc = {
        exists: false,
        data: jest.fn().mockReturnValue({}),
        ref: {
          set: jest.fn().mockResolvedValue({}),
          update: jest.fn().mockResolvedValue({}),
        },
      };
      mockSubscription = {};
      mockSubscription.isRegisterable = jest.fn().mockReturnValue(true);
      mockPurchaseDbRef.doc = jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue(mockPurchaseDoc),
      });
      purchaseManager = new PurchaseManager(
        mockPurchaseDbRef,
        mockAppStoreHelper
      );
      purchaseManager.querySubscriptionPurchase = jest
        .fn()
        .mockResolvedValue(mockSubscription);
      purchaseManager.forceRegisterToUserAccount = jest
        .fn()
        .mockResolvedValue({});
    });

    it('registers successfully for non-cached original transaction id', async () => {
      const result = await purchaseManager.registerToUserAccount(
        mockBundleId,
        mockOriginalTransactionId,
        'testUserId'
      );
      expect(result).toBe(mockSubscription);
      expect(purchaseManager.querySubscriptionPurchase).toHaveBeenCalledTimes(
        1
      );
      expect(purchaseManager.forceRegisterToUserAccount).toHaveBeenCalledTimes(
        1
      );
    });

    it('skips doing anything for cached original transaction id', async () => {
      mockPurchaseDoc.exists = true;
      mockSubscription.userId = 'testUserId';
      mockSubscriptionPurchase.fromFirestoreObject = jest
        .fn()
        .mockReturnValue(mockSubscription);
      const result = await purchaseManager.registerToUserAccount(
        mockBundleId,
        mockOriginalTransactionId,
        'testUserId'
      );
      expect(result).toBe(mockSubscription);
      expect(purchaseManager.querySubscriptionPurchase).not.toHaveBeenCalled();
      expect(purchaseManager.forceRegisterToUserAccount).not.toHaveBeenCalled();
    });

    it('throws conflict error for existing original transaction id registered to other user', async () => {
      mockPurchaseDoc.exists = true;
      mockSubscription.userId = 'otherUserId';
      mockSubscriptionPurchase.fromFirestoreObject = jest
        .fn()
        .mockReturnValue(mockSubscription);
      await expect(
        purchaseManager.registerToUserAccount(
          mockBundleId,
          mockOriginalTransactionId,
          'testUserId'
        )
      ).rejects.toMatchObject({ name: PurchaseUpdateError.CONFLICT });
      expect(log.info).toHaveBeenCalledTimes(1);
    });

    it('throws invalid original transaction id error if purchase cant be queried', async () => {
      purchaseManager.querySubscriptionPurchase = jest
        .fn()
        .mockRejectedValue(new Error('Oops'));
      await expect(
        purchaseManager.registerToUserAccount(
          mockBundleId,
          mockOriginalTransactionId,
          'testUserId'
        )
      ).rejects.toMatchObject({
        name: PurchaseUpdateError.INVALID_ORIGINAL_TRANSACTION_ID,
        message: 'Oops',
      });
    });
  });

  // For queryCurrentSubscriptionPurchases method only which is the analog to
  // Google Play's UserManager.queryCurrentSubscriptions originally.
  // These tests use an actual SubscriptionPurchase class and helper methods
  // from that module.
  describe('queryCurrentSubscriptionPurchases', () => {
    let purchaseManager: any;
    let localPurchaseDbRef: any;
    let mockPurchaseDoc: any;
    let mockStatus: any;
    let queryResult: any;
    const USER_ID = 'testUser';
    const mockVerifiedAt = 123;

    beforeEach(() => {
      queryResult = {
        docs: [],
      };
      mockStatus = SubscriptionStatus.Active;
      localPurchaseDbRef = {
        where: () => localPurchaseDbRef,
        get: jest.fn().mockResolvedValue(queryResult),
      } as any;
      mockPurchaseDoc = {
        exists: false,
        ref: {
          set: jest.fn().mockResolvedValue({}),
          update: jest.fn().mockResolvedValue({}),
        },
      };
      localPurchaseDbRef.doc = jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue(mockPurchaseDoc),
      });
      // Use a fresh PurchaseManager that relies on internal mock for
      // subscription-purchase module via jest.mock at file top level.
      // Set up mockSubscriptionPurchase.fromFirestoreObject to delegate
      // to the real class for these tests.
      mockSubscriptionPurchase.fromFirestoreObject = (obj: any) =>
        AppStoreSubscriptionPurchase.fromFirestoreObject(obj);
      purchaseManager = new PurchaseManager(
        localPurchaseDbRef,
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
        data: jest
          .fn()
          .mockReturnValue(subscriptionPurchase.toFirestoreObject()),
      };
      queryResult.docs.push(subscriptionSnapshot);
      const result =
        await purchaseManager.queryCurrentSubscriptionPurchases(USER_ID);
      expect(result).toEqual([subscriptionPurchase]);
      expect(localPurchaseDbRef.get).toHaveBeenCalledTimes(1);
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
        data: jest
          .fn()
          .mockReturnValue(subscriptionPurchase.toFirestoreObject()),
      };
      queryResult.docs.push(subscriptionSnapshot);
      purchaseManager.querySubscriptionPurchase = jest
        .fn()
        .mockResolvedValue(subscriptionPurchase);
      const result =
        await purchaseManager.queryCurrentSubscriptionPurchases(USER_ID);
      expect(result).toEqual([]);
      expect(purchaseManager.querySubscriptionPurchase).toHaveBeenCalledTimes(
        1
      );
    });

    it('skips NOT_FOUND error for expired purchases', async () => {
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
        data: jest
          .fn()
          .mockReturnValue(subscriptionPurchase.toFirestoreObject()),
      };
      queryResult.docs.push(subscriptionSnapshot);
      const notFoundError = new Error('NOT_FOUND');
      notFoundError.name = PurchaseQueryError.NOT_FOUND;
      purchaseManager.querySubscriptionPurchase = jest
        .fn()
        .mockRejectedValue(notFoundError);

      const result =
        await purchaseManager.queryCurrentSubscriptionPurchases(USER_ID);

      expect(result).toEqual([]);
      expect(purchaseManager.querySubscriptionPurchase).toHaveBeenCalledTimes(
        1
      );
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
        data: jest
          .fn()
          .mockReturnValue(subscriptionPurchase.toFirestoreObject()),
      };
      queryResult.docs.push(subscriptionSnapshot);
      purchaseManager.querySubscriptionPurchase = jest
        .fn()
        .mockRejectedValue(new Error('oops'));
      await expect(
        purchaseManager.queryCurrentSubscriptionPurchases(USER_ID)
      ).rejects.toMatchObject({ name: PurchaseQueryError.OTHER_ERROR });
    });
  });

  describe('decodeNotificationPayload', () => {
    let mockPayload: any;
    let purchaseManager: any;

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
      const result =
        await purchaseManager.decodeNotificationPayload(mockPayload);
      expect(result).toEqual(expected);
    });
  });

  describe('processNotification', () => {
    let purchaseManager: any;
    let mockSubscription: any;
    let mockNotification: any;

    beforeEach(() => {
      mockNotification = {};
      mockSubscription = {};

      purchaseManager = new PurchaseManager(
        mockPurchaseDbRef,
        mockAppStoreHelper
      );
      purchaseManager.querySubscriptionPurchase = jest
        .fn()
        .mockResolvedValue(mockSubscription);
    });

    it('returns null for not applicable notifications', async () => {
      mockNotification.notificationType =
        NOTIFICATION_TYPES_FOR_NON_SUBSCRIPTION_PURCHASES[0];
      const result = await purchaseManager.processNotification(
        mockBundleId,
        mockOriginalTransactionId,
        mockNotification
      );
      expect(result).toBeNull();
    });

    it('returns null for new subscriptions', async () => {
      mockNotification.notificationType = NotificationType.Subscribed;
      mockNotification.subtype = NotificationSubtype.InitialBuy;
      const result = await purchaseManager.processNotification(
        mockBundleId,
        mockOriginalTransactionId,
        mockNotification
      );
      expect(result).toBeNull();
    });

    it('returns a subscription for other valid subscription notifications', async () => {
      mockNotification.notificationType = NotificationType.DidRenew;
      const result = await purchaseManager.processNotification(
        mockBundleId,
        mockOriginalTransactionId,
        mockNotification
      );
      expect(result).toEqual(mockSubscription);
      expect(purchaseManager.querySubscriptionPurchase).toHaveBeenCalledTimes(
        1
      );
    });
  });
});
