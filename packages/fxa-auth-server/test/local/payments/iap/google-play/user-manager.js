/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

import sinon from 'sinon';
import { assert } from 'chai';
import { Container } from 'typedi';
import { mockLog } from '../../../../mocks';
import { UserManager } from '../../../../../lib/payments/iap/google-play/user-manager';
import { AuthLogger } from '../../../../../lib/types';
import { PlayStoreSubscriptionPurchase } from '../../../../../lib/payments/iap/google-play/subscription-purchase';
import { PurchaseQueryError } from '../../../../../lib/payments/iap/google-play/types';

const USER_ID = 'testUser';
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

describe('UserManager', () => {
  let log;
  let mockCollRef;
  let mockPurchaseManager;
  let userManager;
  let queryResult;

  beforeEach(() => {
    log = mockLog();
    queryResult = {
      docs: [],
    };
    mockCollRef = {
      where: () => mockCollRef,
      get: sinon.fake.resolves(queryResult),
    };
    mockPurchaseManager = {};
    Container.set(AuthLogger, log);
    userManager = new UserManager(mockCollRef, mockPurchaseManager);
  });

  afterEach(() => {
    Container.reset();
  });

  describe('queryCurrentSubscriptions', () => {
    it('returns the current subscriptions', async () => {
      const subscriptionPurchase =
        PlayStoreSubscriptionPurchase.fromApiResponse(
          VALID_SUB_API_RESPONSE,
          'testPackage',
          'testToken',
          'testSku',
          Date.now()
        );
      const subscriptionSnapshot = {
        data: sinon.fake.returns(subscriptionPurchase.toFirestoreObject()),
      };
      queryResult.docs.push(subscriptionSnapshot);
      const result = await userManager.queryCurrentSubscriptions(USER_ID);
      assert.deepEqual(result, [subscriptionPurchase]);
      sinon.assert.calledOnce(mockCollRef.get);
    });

    it('queries expired subscription purchases', async () => {
      const subscriptionPurchase =
        PlayStoreSubscriptionPurchase.fromApiResponse(
          VALID_SUB_API_RESPONSE,
          'testPackage',
          'testToken',
          'testSku',
          Date.now()
        );
      subscriptionPurchase.expiryTimeMillis = Date.now() - 10000;
      subscriptionPurchase.autoRenewing = false;
      const subscriptionSnapshot = {
        data: sinon.fake.returns(subscriptionPurchase.toFirestoreObject()),
      };
      queryResult.docs.push(subscriptionSnapshot);
      mockPurchaseManager.querySubscriptionPurchase =
        sinon.fake.resolves(subscriptionPurchase);
      const result = await userManager.queryCurrentSubscriptions(USER_ID);
      assert.deepEqual(result, []);
      sinon.assert.calledOnce(mockPurchaseManager.querySubscriptionPurchase);
    });

    it('throws library error on failure', async () => {
      const subscriptionPurchase =
        PlayStoreSubscriptionPurchase.fromApiResponse(
          VALID_SUB_API_RESPONSE,
          'testPackage',
          'testToken',
          'testSku',
          Date.now()
        );
      subscriptionPurchase.expiryTimeMillis = Date.now() - 10000;
      subscriptionPurchase.autoRenewing = false;
      const subscriptionSnapshot = {
        data: sinon.fake.returns(subscriptionPurchase.toFirestoreObject()),
      };
      queryResult.docs.push(subscriptionSnapshot);
      mockPurchaseManager.querySubscriptionPurchase = sinon.fake.rejects(
        new Error('oops')
      );
      try {
        await userManager.queryCurrentSubscriptions(USER_ID);
        assert.fail('should have thrown');
      } catch (err) {
        assert.strictEqual(err.name, PurchaseQueryError.OTHER_ERROR);
      }
    });
  });
});
