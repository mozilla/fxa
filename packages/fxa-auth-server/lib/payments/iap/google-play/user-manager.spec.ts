/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/** Migrated from test/local/payments/iap/google-play/user-manager.js (Mocha → Jest). */

import sinon from 'sinon';
import { Container } from 'typedi';

import { AuthLogger } from '../../../types';
import { UserManager } from './user-manager';
import {
  PlayStoreSubscriptionPurchase,
} from './subscription-purchase';
import { PurchaseQueryError } from './types';

const { mockLog } = require('../../../../test/mocks');

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
  let log: any;
  let mockCollRef: any;
  let mockPurchaseManager: any;
  let userManager: any;
  let queryResult: any;

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
      expect(result).toEqual([subscriptionPurchase]);
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
      expect(result).toEqual([]);
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
      await expect(
        userManager.queryCurrentSubscriptions(USER_ID)
      ).rejects.toMatchObject({ name: PurchaseQueryError.OTHER_ERROR });
    });
  });
});
