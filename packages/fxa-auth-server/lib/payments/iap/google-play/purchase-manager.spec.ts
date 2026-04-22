/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Container } from 'typedi';

import { AuthLogger } from '../../../types';
import {
  PurchaseQueryError,
  SkuType,
  PurchaseUpdateError,
  NotificationType,
} from './types';

const { mockLog } = require('../../../../test/mocks');

// Mock subscription purchase module used by both auth-server and fxa-shared.
// Use a delegating function pattern so the mock factory (hoisted by Jest)
// can reference variables defined later.
const mockSubscriptionPurchase: any = {};
const mockMergePurchase = jest.fn().mockReturnValue({});

jest.mock('./subscription-purchase', () => ({
  get PlayStoreSubscriptionPurchase() {
    return mockSubscriptionPurchase;
  },
}));

jest.mock('fxa-shared/payments/iap/google-play/subscription-purchase', () => ({
  get PlayStoreSubscriptionPurchase() {
    return mockSubscriptionPurchase;
  },
  get mergePurchaseWithFirestorePurchaseRecord() {
    return mockMergePurchase;
  },
}));

// Must require after jest.mock
const { PurchaseManager } = require('./purchase-manager');

describe('PurchaseManager', () => {
  let log: any;
  let mockPurchaseDbRef: any;
  let mockApiClient: any;

  beforeEach(() => {
    log = mockLog();
    mockPurchaseDbRef = {};
    mockApiClient = {};
    Container.set(AuthLogger, log);
  });

  afterEach(() => {
    Container.reset();
  });

  it('can be instantiated', () => {
    const purchaseManager = new PurchaseManager(
      mockPurchaseDbRef,
      mockApiClient
    );
    expect(purchaseManager).toBeTruthy();
  });

  describe('querySubscriptionPurchase', () => {
    let purchaseManager: any;
    let mockPurchaseDoc: any;
    let mockSubscription: any;
    const mockApiResult = {};
    const firestoreObject = {};

    beforeEach(() => {
      mockApiClient.purchases = {
        subscriptions: {
          get: (object: any, callback: any) => {
            callback(undefined, { data: mockApiResult });
          },
        },
      };
      mockPurchaseDoc = {
        exists: false,
        ref: {
          set: jest.fn().mockResolvedValue({}),
          update: jest.fn().mockResolvedValue({}),
        },
      };
      mockPurchaseDbRef.doc = jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue(mockPurchaseDoc),
      });
      mockSubscription = {
        toFirestoreObject: jest.fn().mockReturnValue(firestoreObject),
        linkedPurchaseToken: undefined,
      };
      mockSubscriptionPurchase.fromApiResponse = jest
        .fn()
        .mockReturnValue(mockSubscription);

      purchaseManager = new PurchaseManager(mockPurchaseDbRef, mockApiClient);
    });

    it('queries with no found firestore doc or linked purchase', async () => {
      purchaseManager.disableReplacedSubscription = jest
        .fn()
        .mockResolvedValue({});
      const result = await purchaseManager.querySubscriptionPurchase(
        'testPackage',
        'testSku',
        'testToken'
      );
      expect(result).toBe(mockSubscription);
      expect(mockPurchaseDbRef.doc).toHaveBeenCalledTimes(1);
      expect(mockPurchaseDbRef.doc().get).toHaveBeenCalledTimes(1);
      expect(mockSubscriptionPurchase.fromApiResponse).toHaveBeenCalledTimes(1);
      expect(mockSubscription.toFirestoreObject).toHaveBeenCalledTimes(1);
      expect(
        purchaseManager.disableReplacedSubscription
      ).not.toHaveBeenCalled();
      expect(mockPurchaseDoc.ref.set).toHaveBeenCalledWith(firestoreObject);
    });

    it('queries with no found firestore doc with linked purchase', async () => {
      purchaseManager.disableReplacedSubscription = jest
        .fn()
        .mockResolvedValue({});
      mockSubscription.linkedPurchaseToken = 'testToken2';
      const result = await purchaseManager.querySubscriptionPurchase(
        'testPackage',
        'testSku',
        'testToken'
      );
      expect(result).toBe(mockSubscription);
      expect(mockPurchaseDbRef.doc).toHaveBeenCalledTimes(1);
      expect(mockPurchaseDbRef.doc().get).toHaveBeenCalledTimes(1);
      expect(mockSubscriptionPurchase.fromApiResponse).toHaveBeenCalledTimes(1);
      expect(mockSubscription.toFirestoreObject).toHaveBeenCalledTimes(1);
      expect(purchaseManager.disableReplacedSubscription).toHaveBeenCalledWith(
        'testPackage',
        'testSku',
        mockSubscription.linkedPurchaseToken
      );
      expect(mockPurchaseDoc.ref.set).toHaveBeenCalledWith(firestoreObject);
    });

    it('queries with found firestore doc', async () => {
      mockPurchaseDoc.data = jest.fn().mockReturnValue({});
      mockPurchaseDoc.exists = true;
      const result = await purchaseManager.querySubscriptionPurchase(
        'testPackage',
        'testSku',
        'testToken'
      );
      expect(result).toBe(mockSubscription);
      expect(mockPurchaseDbRef.doc).toHaveBeenCalledTimes(1);
      expect(mockPurchaseDbRef.doc().get).toHaveBeenCalledTimes(1);
      expect(mockSubscriptionPurchase.fromApiResponse).toHaveBeenCalledTimes(1);
      expect(mockSubscription.toFirestoreObject).toHaveBeenCalledTimes(1);
      expect(mockPurchaseDoc.ref.update).toHaveBeenCalledWith(firestoreObject);
      expect(mockMergePurchase).toHaveBeenCalledTimes(1);
      expect(mockPurchaseDoc.data).toHaveBeenCalledTimes(1);
    });

    it('throws unexpected library error', async () => {
      mockPurchaseDoc.ref.set = jest.fn().mockRejectedValue(new Error('test'));
      await expect(
        purchaseManager.querySubscriptionPurchase(
          'testPackage',
          'testSku',
          'testToken'
        )
      ).rejects.toMatchObject({ name: PurchaseQueryError.OTHER_ERROR });
    });
  });

  describe('disableReplacedSubscription', () => {
    let purchaseManager: any;
    let mockPurchaseDoc: any;
    let mockSubscription: any;
    const mockApiResult = {};
    const firestoreObject = {};

    beforeEach(() => {
      mockApiClient.purchases = {
        subscriptions: {
          get: (object: any, callback: any) => {
            callback(undefined, { data: mockApiResult });
          },
        },
      };
      mockPurchaseDoc = {
        exists: true,
        data: jest.fn().mockReturnValue({ replacedByAnotherPurchase: true }),
        ref: {
          set: jest.fn().mockResolvedValue({}),
          update: jest.fn().mockResolvedValue({}),
        },
      };
      mockPurchaseDbRef.doc = jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue(mockPurchaseDoc),
      });
      mockSubscription = {
        toFirestoreObject: jest.fn().mockReturnValue(firestoreObject),
        linkedPurchaseToken: undefined,
      };
      mockSubscriptionPurchase.fromApiResponse = jest
        .fn()
        .mockReturnValue(mockSubscription);

      purchaseManager = new PurchaseManager(mockPurchaseDbRef, mockApiClient);
    });

    it('does nothing for an existing replaced purchase', async () => {
      const result = await purchaseManager.disableReplacedSubscription(
        'testPackage',
        'testSku',
        'testToken'
      );
      expect(result).toBeUndefined();
      expect(mockPurchaseDbRef.doc).toHaveBeenCalledTimes(1);
      expect(mockPurchaseDbRef.doc().get).toHaveBeenCalledTimes(1);
      expect(mockPurchaseDoc.data).toHaveBeenCalledTimes(1);
      expect(mockPurchaseDoc.ref.update).not.toHaveBeenCalled();
    });

    it('marks a cached purchase as replaced', async () => {
      mockPurchaseDoc.data = jest.fn().mockReturnValue({});
      const result = await purchaseManager.disableReplacedSubscription(
        'testPackage',
        'testSku',
        'testToken'
      );
      expect(result).toBeUndefined();
      expect(mockPurchaseDbRef.doc).toHaveBeenCalledTimes(1);
      expect(mockPurchaseDbRef.doc().get).toHaveBeenCalledTimes(1);
      expect(mockPurchaseDoc.data).toHaveBeenCalledTimes(1);
      expect(mockPurchaseDoc.ref.update).toHaveBeenCalledTimes(1);
    });

    it('caches an unseen token as replaced with no linked purchase', async () => {
      mockPurchaseDoc.exists = false;
      const result = await purchaseManager.disableReplacedSubscription(
        'testPackage',
        'testSku',
        'testToken'
      );
      expect(result).toBeUndefined();
      expect(mockSubscriptionPurchase.fromApiResponse).toHaveBeenCalledTimes(1);
      expect(mockPurchaseDoc.ref.set).toHaveBeenCalledWith(firestoreObject);
    });

    it('caches an unseen token as replaced and calls self for linked purchase', async () => {
      mockPurchaseDoc.exists = false;
      mockSubscription.linkedPurchaseToken = 'testToken2';
      const callFuncOne =
        purchaseManager.disableReplacedSubscription.bind(purchaseManager);
      const callFuncTwo = jest.fn().mockResolvedValue({});
      const purchaseStub = jest.spyOn(
        purchaseManager,
        'disableReplacedSubscription'
      );
      purchaseStub
        .mockImplementationOnce(callFuncOne)
        .mockImplementationOnce(callFuncTwo);

      const result = await purchaseManager.disableReplacedSubscription(
        'testPackage',
        'testSku',
        'testToken'
      );
      expect(result).toBeUndefined();
      expect(mockSubscriptionPurchase.fromApiResponse).toHaveBeenCalledTimes(1);
      expect(callFuncTwo).toHaveBeenCalledTimes(1);
      expect(mockPurchaseDoc.ref.set).toHaveBeenCalledWith(firestoreObject);
    });
  });

  describe('forceRegisterToUserAccount', () => {
    let purchaseManager: any;

    beforeEach(() => {
      mockPurchaseDbRef.doc = jest.fn().mockReturnValue({
        update: jest.fn().mockResolvedValue({}),
      });
      purchaseManager = new PurchaseManager(mockPurchaseDbRef, mockApiClient);
    });

    it('updates the user for a doc', async () => {
      const result = await purchaseManager.forceRegisterToUserAccount(
        'testToken',
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
        purchaseManager.forceRegisterToUserAccount('testToken', 'testUserId')
      ).rejects.toMatchObject({ name: PurchaseQueryError.OTHER_ERROR });
    });
  });

  describe('getPurchase', () => {
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
      purchaseManager = new PurchaseManager(mockPurchaseDbRef, mockApiClient);
      mockSubscriptionPurchase.fromFirestoreObject = jest
        .fn()
        .mockReturnValue({});
    });

    it('returns an existing doc', async () => {
      const result = await purchaseManager.getPurchase('testToken');
      expect(result).toEqual({});
    });

    it('returns undefined with no doc', async () => {
      mockPurchaseDoc.exists = false;
      const result = await purchaseManager.getPurchase('testToken');
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
      purchaseManager = new PurchaseManager(mockPurchaseDbRef, mockApiClient);
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
      purchaseManager = new PurchaseManager(mockPurchaseDbRef, mockApiClient);
      purchaseManager.querySubscriptionPurchase = jest
        .fn()
        .mockResolvedValue(mockSubscription);
      purchaseManager.forceRegisterToUserAccount = jest
        .fn()
        .mockResolvedValue({});
    });

    it('registers successfully for non-cached token', async () => {
      const result = await purchaseManager.registerToUserAccount(
        'testPackage',
        'testSku',
        'testToken',
        SkuType.SUBS,
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

    it('skips doing anything for cached token', async () => {
      mockPurchaseDoc.exists = true;
      mockSubscription.userId = 'testUserId';
      mockSubscriptionPurchase.fromFirestoreObject = jest
        .fn()
        .mockReturnValue(mockSubscription);
      const result = await purchaseManager.registerToUserAccount(
        'testPackage',
        'testSku',
        'testToken',
        SkuType.SUBS,
        'testUserId'
      );
      expect(result).toBe(mockSubscription);
      expect(purchaseManager.querySubscriptionPurchase).not.toHaveBeenCalled();
      expect(purchaseManager.forceRegisterToUserAccount).not.toHaveBeenCalled();
    });

    it('throws conflict error for existing token registered to other user', async () => {
      mockPurchaseDoc.exists = true;
      mockSubscription.userId = 'otherUserId';
      mockSubscriptionPurchase.fromFirestoreObject = jest
        .fn()
        .mockReturnValue(mockSubscription);
      await expect(
        purchaseManager.registerToUserAccount(
          'testPackage',
          'testSku',
          'testToken',
          SkuType.SUBS,
          'testUserId'
        )
      ).rejects.toMatchObject({ name: PurchaseUpdateError.CONFLICT });
      expect(log.info).toHaveBeenCalledTimes(1);
    });

    it('throws invalid token error on non-registerable purchase', async () => {
      mockSubscription.isRegisterable = jest.fn().mockReturnValue(false);
      await expect(
        purchaseManager.registerToUserAccount(
          'testPackage',
          'testSku',
          'testToken',
          SkuType.SUBS,
          'testUserId'
        )
      ).rejects.toMatchObject({ name: PurchaseUpdateError.INVALID_TOKEN });
      expect(mockSubscription.isRegisterable).toHaveBeenCalledTimes(1);
    });

    it('throws invalid token error if purchase cant be queried', async () => {
      purchaseManager.querySubscriptionPurchase = jest
        .fn()
        .mockRejectedValue(new Error('Oops'));
      await expect(
        purchaseManager.registerToUserAccount(
          'testPackage',
          'testSku',
          'testToken',
          SkuType.SUBS,
          'testUserId'
        )
      ).rejects.toMatchObject({
        name: PurchaseUpdateError.INVALID_TOKEN,
        message: 'Oops',
      });
    });
  });

  describe('processDeveloperNotification', () => {
    let purchaseManager: any;
    let mockSubscription: any;
    let mockNotification: any;

    beforeEach(() => {
      mockNotification = {};
      mockSubscription = {};

      purchaseManager = new PurchaseManager(mockPurchaseDbRef, mockApiClient);
      purchaseManager.querySubscriptionPurchase = jest
        .fn()
        .mockResolvedValue(mockSubscription);
    });

    it('returns null without a notification', async () => {
      const result = await purchaseManager.processDeveloperNotification(
        'testPackage',
        mockNotification
      );
      expect(result).toBeNull();
    });

    it('returns null with a SUBSCRIPTION_PURCHASED type', async () => {
      mockNotification.subscriptionNotification = mockSubscription;
      mockSubscription.notificationType =
        NotificationType.SUBSCRIPTION_PURCHASED;
      const result = await purchaseManager.processDeveloperNotification(
        'testPackage',
        mockNotification
      );
      expect(result).toBeNull();
    });

    it('returns a subscription for other valid subscription notifications', async () => {
      mockNotification.subscriptionNotification = mockSubscription;
      mockSubscription.notificationType = NotificationType.SUBSCRIPTION_RENEWED;
      const result = await purchaseManager.processDeveloperNotification(
        'testPackage',
        mockNotification
      );
      expect(result).toEqual(mockSubscription);
      expect(purchaseManager.querySubscriptionPurchase).toHaveBeenCalledTimes(
        1
      );
    });
  });
});
