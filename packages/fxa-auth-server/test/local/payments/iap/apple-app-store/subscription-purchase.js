/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const {
  SubscriptionStatus,
  OfferType,
  Environment,
} = require('app-store-server-api/dist/cjs');

const {
  APPLE_APP_STORE_FORM_OF_PAYMENT,
  SUBSCRIPTION_PURCHASE_REQUIRED_PROPERTIES,
  SubscriptionPurchase,
} = require('../../../../../lib/payments/iap/apple-app-store/subscription-purchase');

describe('SubscriptionPurchase', () => {
  const autoRenewStatus = 1;
  const originalTransactionId = '1000000000000000';
  const bundleId = 'org.mozilla.ios.Product';
  const subscriptionGroupIdentifier = '22222222';
  const productId = `${bundleId}.product.1_month_subscription`;
  const status = SubscriptionStatus.Active;
  const type = 'Auto-Renewable Subscription';
  const expirationIntent = 1;
  const expiresDate = 1649330045000;
  const isInBillingRetry = false;
  const environment = 'Production';
  const inAppOwnershipType = 'PURCHASED';
  const originalPurchaseDate = 1627306493000;
  const autoRenewProductId = productId;
  const apiResponse = {
    data: {
      subscriptionGroupIdentifier,
      lastTransactions: [
        {
          originalTransactionId,
          status,
          signedRenewalInfo: {},
          signedTransactionInfo: {},
        },
      ],
    },
    environment,
    appAppleId: '1234567890',
    bundleId,
  };
  const transactionInfo = {
    transactionId: '2000000000000000',
    originalTransactionId,
    webOrderLineItemId: '2000000000000000',
    bundleId,
    productId,
    subscriptionGroupIdentifier,
    purchaseDate: 1649329745000,
    originalPurchaseDate,
    expiresDate,
    quantity: 1,
    type,
    inAppOwnershipType,
    signedDate: 1649792142801,
    environment,
  };
  const renewalInfo = {
    expirationIntent,
    originalTransactionId,
    autoRenewProductId,
    productId,
    autoRenewStatus,
    isInBillingRetryPeriod: isInBillingRetry,
    signedDate: 1649792142801,
    environment,
  };
  const verifiedAt = Date.now();
  describe('fromApiResponse', () => {
    it('parses active subscription correctly', () => {
      const subscription = SubscriptionPurchase.fromApiResponse(
        apiResponse,
        status,
        transactionInfo,
        renewalInfo,
        originalTransactionId,
        verifiedAt
      );

      assert.isTrue(subscription.isEntitlementActive());
      assert.isTrue(subscription.willRenew());
      assert.isFalse(subscription.isTestPurchase());
      assert.isFalse(subscription.isInBillingRetryPeriod());
      assert.isFalse(subscription.isInGracePeriod());
      assert.isFalse(subscription.isFreeTrial());

      // Verify that the required properties of the original API response
      // are all copied to the SubscriptionPurchase object.
      SUBSCRIPTION_PURCHASE_REQUIRED_PROPERTIES.forEach((key) => {
        assert.isDefined(
          subscription[key],
          `Required key, ${key}, is in API response and SubscriptionPurchase`
        );
      });
      const expected = {
        autoRenewStatus,
        bundleId,
        originalTransactionId,
        productId,
        status,
        type,
        verifiedAt,
        expirationIntent,
        expiresDate,
        isInBillingRetry,
        environment,
        inAppOwnershipType,
        originalPurchaseDate,
        autoRenewProductId,
      };
      assert.deepEqual(expected, subscription);
    });

    it('parses trial subscription correctly', () => {
      const subscription = SubscriptionPurchase.fromApiResponse(
        apiResponse,
        status,
        transactionInfo,
        { ...renewalInfo, offerType: OfferType.Introductory },
        originalTransactionId,
        verifiedAt
      );
      assert.isTrue(subscription.isFreeTrial());
    });

    it('parses test purchase correctly', () => {
      const subscription = SubscriptionPurchase.fromApiResponse(
        { ...apiResponse, environment: Environment.Sandbox },
        status,
        transactionInfo,
        renewalInfo,
        originalTransactionId,
        verifiedAt
      );
      assert.isTrue(subscription.isTestPurchase());
    });
  });

  describe('firestore', () => {
    let subscription;

    beforeEach(() => {
      subscription = SubscriptionPurchase.fromApiResponse(
        apiResponse,
        status,
        transactionInfo,
        renewalInfo,
        originalTransactionId,
        verifiedAt
      );
    });

    it('converts to firestore', () => {
      const result = subscription.toFirestoreObject();
      assert.strictEqual(result.formOfPayment, APPLE_APP_STORE_FORM_OF_PAYMENT);
    });

    it('converts from firestore', () => {
      const firestoreObj = subscription.toFirestoreObject();
      firestoreObj.userId = 'testUser';
      const result = SubscriptionPurchase.fromFirestoreObject(firestoreObj);
      // Internal keys are not defined on the subscription purchase.
      assert.isUndefined(result.formOfPayment);
      assert.strictEqual(result.userId, 'testUser');
    });

    it('merges purchase with firestore object', () => {
      // The firestore object will not have its internal keys copied, only keys
      // not on the purchase already are copied over. The subscription does not
      // have a offerType key, so we will rely on the merge copying it over.
      const testRenewalInfo = {
        ...renewalInfo,
        offerType: OfferType.Introductory,
      };
      const testSubscription = SubscriptionPurchase.fromApiResponse(
        apiResponse,
        status,
        transactionInfo,
        testRenewalInfo, // decoded from apiResponse
        originalTransactionId,
        verifiedAt
      );
      assert.isFalse(subscription.isFreeTrial());
      const firestoreObject = testSubscription.toFirestoreObject();
      testSubscription.mergeWithFirestorePurchaseRecord(firestoreObject);
      assert.isTrue(testSubscription.isFreeTrial());
    });
  });
});
