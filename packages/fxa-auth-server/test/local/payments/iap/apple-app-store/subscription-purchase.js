/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

import { assert } from 'chai';
import { SubscriptionStatus, OfferType, Environment } from 'app-store-server-api/dist/cjs';
import { deepCopy } from '../../util';

import {
  APPLE_APP_STORE_FORM_OF_PAYMENT,
  SUBSCRIPTION_PURCHASE_REQUIRED_PROPERTIES,
  AppStoreSubscriptionPurchase,
} from '../../../../../lib/payments/iap/apple-app-store/subscription-purchase';

import appStoreApiResponse from '../../fixtures/apple-app-store/api_response_subscription_status.json';
import renewalInfo from '../../fixtures/apple-app-store/decoded_renewal_info.json';
import transactionInfo from '../../fixtures/apple-app-store/decoded_transaction_info.json';

describe('SubscriptionPurchase', () => {
  const autoRenewStatus = 1;
  const transactionId = '2000000000000000';
  const originalTransactionId = '1000000000000000';
  const bundleId = 'org.mozilla.ios.SkydivingWithFoxkeh';
  const productId = 'skydiving.with.foxkeh';
  const status = SubscriptionStatus.Active;
  const type = 'Auto-Renewable Subscription';
  const expirationIntent = 1;
  const expiresDate = 1649330045000;
  const isInBillingRetry = false;
  const environment = 'Production';
  const inAppOwnershipType = 'PURCHASED';
  const originalPurchaseDate = 1627306493000;
  const autoRenewProductId = productId;
  const purchaseDate = 1649329745000;
  const apiResponse = deepCopy(appStoreApiResponse);
  const decodedTransactionInfo = deepCopy(transactionInfo);
  const decodedRenewalInfo = deepCopy(renewalInfo);
  const verifiedAt = Date.now();
  describe('fromApiResponse', () => {
    const expected = {
      autoRenewStatus,
      bundleId,
      originalTransactionId,
      transactionId,
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
      purchaseDate,
    };

    it('parses an active subscription correctly', () => {
      const subscription = AppStoreSubscriptionPurchase.fromApiResponse(
        apiResponse,
        status,
        decodedTransactionInfo,
        decodedRenewalInfo,
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
      assert.deepEqual(expected, subscription);
    });

    it('parses a free trial subscription correctly', () => {
      const subscription = AppStoreSubscriptionPurchase.fromApiResponse(
        apiResponse,
        status,
        // https://developer.apple.com/documentation/appstoreserverapi/offeridentifier/
        // > The offerIdentifier applies only when the offerType has a value of 2 or 3.
        { ...decodedTransactionInfo, offerType: OfferType.Introductory },
        decodedRenewalInfo,
        originalTransactionId,
        verifiedAt
      );
      assert.isTrue(subscription.isFreeTrial());
    });

    it('parses a subscription with other offer types correctly', () => {
      const expectedWithOtherOffer = deepCopy(expected);
      expectedWithOtherOffer.renewalOfferType = OfferType.Promotional;
      expectedWithOtherOffer.renewalOfferIdentifier = 'WOW123';
      const actual = AppStoreSubscriptionPurchase.fromApiResponse(
        apiResponse,
        status,
        decodedTransactionInfo,
        {
          ...decodedRenewalInfo,
          offerType: OfferType.Promotional,
          offerIdentifier: 'WOW123',
        },
        originalTransactionId,
        verifiedAt
      );
      assert.deepEqual(actual, expectedWithOtherOffer);
    });

    it('parses a test purchase correctly', () => {
      const subscription = AppStoreSubscriptionPurchase.fromApiResponse(
        { ...apiResponse, environment: Environment.Sandbox },
        status,
        decodedTransactionInfo,
        decodedRenewalInfo,
        originalTransactionId,
        verifiedAt
      );
      assert.isTrue(subscription.isTestPurchase());
    });
  });

  describe('firestore', () => {
    let subscription;

    beforeEach(() => {
      subscription = AppStoreSubscriptionPurchase.fromApiResponse(
        apiResponse,
        status,
        decodedTransactionInfo,
        decodedRenewalInfo,
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
      const result =
        AppStoreSubscriptionPurchase.fromFirestoreObject(firestoreObj);
      // Internal keys are not defined on the subscription purchase.
      assert.isUndefined(result.formOfPayment);
      assert.strictEqual(result.userId, 'testUser');
    });

    it('merges purchase with firestore object', () => {
      // The firestore object will not have its internal keys copied, only keys
      // not on the purchase already are copied over. The subscription does not
      // have a offerType key, so we will rely on the merge copying it over.
      const freeTrialDecodedTransactionInfo = {
        ...decodedTransactionInfo,
        offerType: OfferType.Introductory,
      };
      const testSubscription = AppStoreSubscriptionPurchase.fromApiResponse(
        apiResponse,
        status,
        freeTrialDecodedTransactionInfo,
        decodedRenewalInfo,
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
