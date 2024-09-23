/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

import { assert } from 'chai';
import { PlayStoreSubscriptionPurchase, GOOGLE_PLAY_FORM_OF_PAYMENT } from '../../../../../lib/payments/iap/google-play/subscription-purchase';
import { SkuType } from '../../../../../lib/payments/iap/google-play/types';

describe('SubscriptionPurchase', () => {
  beforeEach(() => {});

  describe('fromApiResponse', () => {
    it('parses active subscription correctly', () => {
      const apiResponse = {
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

      const subscription = PlayStoreSubscriptionPurchase.fromApiResponse(
        apiResponse,
        'testPackage',
        'testToken',
        'testSku',
        Date.now()
      );
      assert.strictEqual(
        subscription.activeUntilDate().getTime(),
        new Date(parseInt(apiResponse.expiryTimeMillis)).getTime()
      );
      assert.isFalse(subscription.isAccountHold());
      assert.isTrue(subscription.isEntitlementActive());
      assert.isFalse(subscription.isFreeTrial());
      assert.isTrue(subscription.isMutable);
      assert.isFalse(subscription.isTestPurchase());
      assert.isTrue(subscription.willRenew());

      // Verify that values of the original API response are all copied to the SubscriptionPurchase object.
      // We ignore type check because we do some type conversion (i.e. startTimeMillis: convert from string to int),
      // hence we use equal instead of strictEqual below.
      Object.keys(apiResponse).forEach((key) =>
        assert.equal(subscription[key], apiResponse[key])
      );
    });

    it('parses trial subscription correctly', () => {
      const apiResponse = {
        kind: 'androidpublisher#subscriptionPurchase',
        startTimeMillis: Date.now() - 10000 + '', // some time in the past
        expiryTimeMillis: Date.now() + 10000 + '', // some time in the future
        autoRenewing: true,
        priceCurrencyCode: 'JPY',
        priceAmountMicros: '99000000',
        countryCode: 'JP',
        developerPayload: '',
        paymentState: 2,
        orderId: 'GPA.3313-5503-3858-32549',
      };
      const subscription = PlayStoreSubscriptionPurchase.fromApiResponse(
        apiResponse,
        'testPackage',
        'testToken',
        'testSku',
        Date.now()
      );
      assert.isTrue(subscription.isFreeTrial());
    });

    it('parses account hold correctly', () => {
      const apiResponse = {
        kind: 'androidpublisher#subscriptionPurchase',
        startTimeMillis: Date.now() - 20000 + '', // some time in the past
        expiryTimeMillis: Date.now() - 10000 + '', // some time in the past
        autoRenewing: true,
        priceCurrencyCode: 'JPY',
        priceAmountMicros: '99000000',
        countryCode: 'JP',
        developerPayload: '',
        paymentState: 0, // payment haven't been made
        orderId: 'GPA.3313-5503-3858-32549..1',
      };
      const subscription = PlayStoreSubscriptionPurchase.fromApiResponse(
        apiResponse,
        'testPackage',
        'testToken',
        'testSku',
        Date.now()
      );
      assert.isTrue(subscription.isAccountHold());
    });

    it('parses test purchase correctly', () => {
      const apiResponse = {
        kind: 'androidpublisher#subscriptionPurchase',
        startTimeMillis: `${Date.now() - 10000}`, // some time in the past
        expiryTimeMillis: `${Date.now() + 10000}`, // some time in the future
        autoRenewing: true,
        priceCurrencyCode: 'JPY',
        priceAmountMicros: '99000000',
        countryCode: 'JP',
        developerPayload: '',
        paymentState: 1,
        purchaseType: 0,
        orderId: 'GPA.3313-5503-3858-32549',
      };
      const subscription = PlayStoreSubscriptionPurchase.fromApiResponse(
        apiResponse,
        'testPackage',
        'testToken',
        'testSku',
        Date.now()
      );
      assert.isTrue(subscription.isTestPurchase());
    });
  });

  describe('firestore', () => {
    const apiResponse = {
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
    let subscription;

    beforeEach(() => {
      subscription = PlayStoreSubscriptionPurchase.fromApiResponse(
        apiResponse,
        'testPackage',
        'testToken',
        'testSku',
        Date.now()
      );
    });

    it('converts to firestore', () => {
      const result = subscription.toFirestoreObject();
      assert.strictEqual(result.skuType, SkuType.SUBS);
      assert.strictEqual(result.formOfPayment, GOOGLE_PLAY_FORM_OF_PAYMENT);
    });

    it('converts from firestore', () => {
      const firestoreObj = subscription.toFirestoreObject();
      firestoreObj.userId = 'testUser';
      const result =
        PlayStoreSubscriptionPurchase.fromFirestoreObject(firestoreObj);
      // Internal keys are not defined on the subscription purchase.
      assert.isUndefined(result.skuType);
      assert.strictEqual(result.userId, 'testUser');
    });

    it('merges purchase with firestore object', () => {
      // The firestore object will not have its internal keys copied, only keys
      // not on the purchase already are copied over. The subscription does not
      // have a purchaseType key, so we will rely on the merge copying it over.
      const testApiResponse = {
        purchaseType: 0,
      };
      const testSubscription = PlayStoreSubscriptionPurchase.fromApiResponse(
        testApiResponse,
        'testPackage',
        'testToken',
        'testSku',
        Date.now()
      );
      assert.isFalse(subscription.isTestPurchase());
      const firestoreObject = testSubscription.toFirestoreObject();
      testSubscription.mergeWithFirestorePurchaseRecord(firestoreObject);
      assert.isTrue(testSubscription.isTestPurchase());
    });
  });
});
