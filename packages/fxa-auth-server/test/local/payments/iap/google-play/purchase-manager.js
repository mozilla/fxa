/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

import sinon from 'sinon';
import { assert } from 'chai';
import { Container } from 'typedi';
import proxyquireModule from 'proxyquire';
const proxyquire = proxyquireModule.noPreserveCache();

import { mockLog } from '../../../../mocks';
import { AuthLogger } from '../../../../../lib/types';
import {
  PurchaseQueryError,
  SkuType,
  PurchaseUpdateError,
  NotificationType,
} from '../../../../../lib/payments/iap/google-play/types';

const mockSubscriptionPurchase = {};
const mockMergePurchase = sinon.fake.returns({});
const { PurchaseManager } = proxyquire(
  '../../../../../lib/payments/iap/google-play/purchase-manager',
  {
    './subscription-purchase': {
      PlayStoreSubscriptionPurchase: mockSubscriptionPurchase,
    },
    'fxa-shared/payments/iap/google-play/purchase-manager': proxyquire(
      'fxa-shared/payments/iap/google-play/purchase-manager',
      {
        './subscription-purchase': {
          PlayStoreSubscriptionPurchase: mockSubscriptionPurchase,
          mergePurchaseWithFirestorePurchaseRecord: mockMergePurchase,
        },
      }
    ),
  }
);

describe('PurchaseManager', () => {
  let log;
  let mockPurchaseDbRef;
  let mockApiClient;

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
    assert.ok(purchaseManager);
  });

  describe('querySubscriptionPurchase', () => {
    let purchaseManager;
    let mockPurchaseDoc;
    let mockSubscription;
    const mockApiResult = {};
    const firestoreObject = {};

    beforeEach(() => {
      mockApiClient.purchases = {
        subscriptions: {
          get: (object, callback) => {
            callback(undefined, { data: mockApiResult });
          },
        },
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
        linkedPurchaseToken: undefined,
      };
      mockSubscriptionPurchase.fromApiResponse =
        sinon.fake.returns(mockSubscription);

      purchaseManager = new PurchaseManager(mockPurchaseDbRef, mockApiClient);
    });

    it('queries with no found firestore doc or linked purchase', async () => {
      purchaseManager.disableReplacedSubscription = sinon.fake.resolves({});
      const result = await purchaseManager.querySubscriptionPurchase(
        'testPackage',
        'testSku',
        'testToken'
      );
      assert.strictEqual(result, mockSubscription);
      sinon.assert.calledOnce(mockPurchaseDbRef.doc);
      sinon.assert.calledOnce(mockPurchaseDbRef.doc().get);
      sinon.assert.calledOnce(mockSubscriptionPurchase.fromApiResponse);
      sinon.assert.calledOnce(mockSubscription.toFirestoreObject);
      sinon.assert.notCalled(purchaseManager.disableReplacedSubscription);
      sinon.assert.calledWithExactly(mockPurchaseDoc.ref.set, firestoreObject);
    });

    it('queries with no found firestore doc with linked purchase', async () => {
      purchaseManager.disableReplacedSubscription = sinon.fake.resolves({});
      mockSubscription.linkedPurchaseToken = 'testToken2';
      const result = await purchaseManager.querySubscriptionPurchase(
        'testPackage',
        'testSku',
        'testToken'
      );
      assert.strictEqual(result, mockSubscription);
      sinon.assert.calledOnce(mockPurchaseDbRef.doc);
      sinon.assert.calledOnce(mockPurchaseDbRef.doc().get);
      sinon.assert.calledOnce(mockSubscriptionPurchase.fromApiResponse);
      sinon.assert.calledOnce(mockSubscription.toFirestoreObject);
      sinon.assert.calledWithExactly(
        purchaseManager.disableReplacedSubscription,
        'testPackage',
        'testSku',
        mockSubscription.linkedPurchaseToken
      );
      sinon.assert.calledWithExactly(mockPurchaseDoc.ref.set, firestoreObject);
    });

    it('queries with found firestore doc', async () => {
      mockPurchaseDoc.data = sinon.fake.returns({});
      mockPurchaseDoc.exists = true;
      const result = await purchaseManager.querySubscriptionPurchase(
        'testPackage',
        'testSku',
        'testToken'
      );
      assert.strictEqual(result, mockSubscription);
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

    it('throws unexpected library error', async () => {
      mockPurchaseDoc.ref.set = sinon.fake.rejects(new Error('test'));
      try {
        await purchaseManager.querySubscriptionPurchase(
          'testPackage',
          'testSku',
          'testToken'
        );
        assert.fail('Expected error');
      } catch (err) {
        assert.equal(err.name, PurchaseQueryError.OTHER_ERROR);
      }
    });
  });

  describe('disableReplacedSubscription', () => {
    let purchaseManager;
    let mockPurchaseDoc;
    let mockSubscription;
    const mockApiResult = {};
    const firestoreObject = {};

    beforeEach(() => {
      mockApiClient.purchases = {
        subscriptions: {
          get: (object, callback) => {
            callback(undefined, { data: mockApiResult });
          },
        },
      };
      mockPurchaseDoc = {
        exists: true,
        data: sinon.fake.returns({ replacedByAnotherPurchase: true }),
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
        linkedPurchaseToken: undefined,
      };
      mockSubscriptionPurchase.fromApiResponse =
        sinon.fake.returns(mockSubscription);

      purchaseManager = new PurchaseManager(mockPurchaseDbRef, mockApiClient);
    });

    it('does nothing for an existing replaced purchase', async () => {
      const result = await purchaseManager.disableReplacedSubscription(
        'testPackage',
        'testSku',
        'testToken'
      );
      assert.isUndefined(result);
      sinon.assert.calledOnce(mockPurchaseDbRef.doc);
      sinon.assert.calledOnce(mockPurchaseDbRef.doc().get);
      sinon.assert.calledOnce(mockPurchaseDoc.data);
      sinon.assert.notCalled(mockPurchaseDoc.ref.update);
    });

    it('marks a cached purchase as replaced', async () => {
      mockPurchaseDoc.data = sinon.fake.returns({});
      const result = await purchaseManager.disableReplacedSubscription(
        'testPackage',
        'testSku',
        'testToken'
      );
      assert.isUndefined(result);
      sinon.assert.calledOnce(mockPurchaseDbRef.doc);
      sinon.assert.calledOnce(mockPurchaseDbRef.doc().get);
      sinon.assert.calledOnce(mockPurchaseDoc.data);
      sinon.assert.calledOnce(mockPurchaseDoc.ref.update);
    });

    it('caches an unseen token as replaced with no linked purchase', async () => {
      mockPurchaseDoc.exists = false;
      const result = await purchaseManager.disableReplacedSubscription(
        'testPackage',
        'testSku',
        'testToken'
      );
      assert.isUndefined(result);
      sinon.assert.calledOnce(mockSubscriptionPurchase.fromApiResponse);
      sinon.assert.calledWithExactly(mockPurchaseDoc.ref.set, firestoreObject);
    });

    it('caches an unseen token as replaced and calls self for linked purchase', async () => {
      mockPurchaseDoc.exists = false;
      mockSubscription.linkedPurchaseToken = 'testToken2';
      const callFuncOne =
        purchaseManager.disableReplacedSubscription.bind(purchaseManager);
      const callFuncTwo = sinon.fake.resolves({});
      const purchaseStub = sinon.stub(
        purchaseManager,
        'disableReplacedSubscription'
      );
      purchaseStub.onFirstCall().callsFake(callFuncOne);
      purchaseStub.onSecondCall().callsFake(callFuncTwo);

      const result = await purchaseManager.disableReplacedSubscription(
        'testPackage',
        'testSku',
        'testToken'
      );
      assert.isUndefined(result);
      sinon.assert.calledOnce(mockSubscriptionPurchase.fromApiResponse);
      sinon.assert.calledOnce(callFuncTwo);
      sinon.assert.calledWithExactly(mockPurchaseDoc.ref.set, firestoreObject);
    });
  });

  describe('forceRegisterToUserAccount', () => {
    let purchaseManager;

    beforeEach(() => {
      mockPurchaseDbRef.doc = sinon.fake.returns({
        update: sinon.fake.resolves({}),
      });
      purchaseManager = new PurchaseManager(mockPurchaseDbRef, mockApiClient);
    });

    it('updates the user for a doc', async () => {
      const result = await purchaseManager.forceRegisterToUserAccount(
        'testToken',
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

  describe('getPurchase', () => {
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
      purchaseManager = new PurchaseManager(mockPurchaseDbRef, mockApiClient);
      mockSubscriptionPurchase.fromFirestoreObject = sinon.fake.returns({});
    });

    it('returns an existing doc', async () => {
      const result = await purchaseManager.getPurchase('testToken');
      assert.deepEqual(result, {});
    });

    it('returns undefined with no doc', async () => {
      mockPurchaseDoc.exists = false;
      const result = await purchaseManager.getPurchase('testToken');
      assert.isUndefined(result);
    });
  });

  describe('deletePurchases', () => {
    let purchaseManager;
    let mockPurchaseDoc;
    let mockBatch;

    beforeEach(() => {
      mockPurchaseDoc = {
        docs: [
          {
            ref: 'testRef',
          },
        ],
      };
      mockBatch = {
        delete: sinon.fake.resolves({}),
        commit: sinon.fake.resolves({}),
      };
      mockPurchaseDbRef.where = sinon.fake.returns({
        get: sinon.fake.resolves(mockPurchaseDoc),
      });
      mockPurchaseDbRef.firestore = {
        batch: sinon.fake.returns(mockBatch),
      };
      purchaseManager = new PurchaseManager(mockPurchaseDbRef, mockApiClient);
    });

    it('deletes a purchase', async () => {
      const result = await purchaseManager.deletePurchases('testToken');
      assert.isUndefined(result);
      sinon.assert.calledOnceWithExactly(mockBatch.delete, 'testRef');
      sinon.assert.calledOnce(mockBatch.commit);
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
      purchaseManager = new PurchaseManager(mockPurchaseDbRef, mockApiClient);
      purchaseManager.querySubscriptionPurchase =
        sinon.fake.resolves(mockSubscription);
      purchaseManager.forceRegisterToUserAccount = sinon.fake.resolves({});
    });

    it('registers successfully for non-cached token', async () => {
      const result = await purchaseManager.registerToUserAccount(
        'testPackage',
        'testSku',
        'testToken',
        SkuType.SUBS,
        'testUserId'
      );
      assert.strictEqual(result, mockSubscription);
      sinon.assert.calledOnce(purchaseManager.querySubscriptionPurchase);
      sinon.assert.calledOnce(purchaseManager.forceRegisterToUserAccount);
    });

    it('skips doing anything for cached token', async () => {
      mockPurchaseDoc.exists = true;
      mockSubscription.userId = 'testUserId';
      mockSubscriptionPurchase.fromFirestoreObject =
        sinon.fake.returns(mockSubscription);
      const result = await purchaseManager.registerToUserAccount(
        'testPackage',
        'testSku',
        'testToken',
        SkuType.SUBS,
        'testUserId'
      );
      assert.strictEqual(result, mockSubscription);
      sinon.assert.notCalled(purchaseManager.querySubscriptionPurchase);
      sinon.assert.notCalled(purchaseManager.forceRegisterToUserAccount);
    });

    it('throws conflict error for existing token registered to other user', async () => {
      mockPurchaseDoc.exists = true;
      mockSubscription.userId = 'otherUserId';
      mockSubscriptionPurchase.fromFirestoreObject =
        sinon.fake.returns(mockSubscription);
      try {
        await purchaseManager.registerToUserAccount(
          'testPackage',
          'testSku',
          'testToken',
          SkuType.SUBS,
          'testUserId'
        );
        assert.fail('Expected error');
      } catch (err) {
        assert.equal(err.name, PurchaseUpdateError.CONFLICT);
        sinon.assert.calledOnce(log.info);
      }
    });

    it('throws invalid token error on non-registerable purchase', async () => {
      mockSubscription.isRegisterable = sinon.fake.returns(false);
      try {
        await purchaseManager.registerToUserAccount(
          'testPackage',
          'testSku',
          'testToken',
          SkuType.SUBS,
          'testUserId'
        );
        assert.fail('Expected error');
      } catch (err) {
        assert.equal(err.name, PurchaseUpdateError.INVALID_TOKEN);
        sinon.assert.calledOnce(mockSubscription.isRegisterable);
      }
    });

    it('throws invalid token error if purchase cant be queried', async () => {
      purchaseManager.querySubscriptionPurchase = sinon.fake.rejects(
        new Error('Oops')
      );
      try {
        await purchaseManager.registerToUserAccount(
          'testPackage',
          'testSku',
          'testToken',
          SkuType.SUBS,
          'testUserId'
        );
        assert.fail('Expected error');
      } catch (err) {
        assert.equal(err.name, PurchaseUpdateError.INVALID_TOKEN);
        assert.equal(err.message, 'Oops');
      }
    });
  });

  describe('processDeveloperNotification', () => {
    let purchaseManager;
    let mockSubscription;
    let mockNotification;

    beforeEach(() => {
      mockNotification = {};
      mockSubscription = {};

      purchaseManager = new PurchaseManager(mockPurchaseDbRef, mockApiClient);
      purchaseManager.querySubscriptionPurchase =
        sinon.fake.resolves(mockSubscription);
    });

    it('returns null without a notification', async () => {
      const result = await purchaseManager.processDeveloperNotification(
        'testPackage',
        mockNotification
      );
      assert.isNull(result);
    });

    it('returns null with a SUBSCRIPTION_PURCHASED type', async () => {
      mockNotification.subscriptionNotification = mockSubscription;
      mockSubscription.notificationType =
        NotificationType.SUBSCRIPTION_PURCHASED;
      const result = await purchaseManager.processDeveloperNotification(
        'testPackage',
        mockNotification
      );
      assert.isNull(result);
    });

    it('returns a subscription for other valid subscription notifications', async () => {
      mockNotification.subscriptionNotification = mockSubscription;
      mockSubscription.notificationType = NotificationType.SUBSCRIPTION_RENEWED;
      const result = await purchaseManager.processDeveloperNotification(
        'testPackage',
        mockNotification
      );
      assert.deepEqual(result, mockSubscription);
      sinon.assert.calledOnce(purchaseManager.querySubscriptionPurchase);
    });
  });
});
