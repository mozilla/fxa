/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/** Migrated from test/local/payments/iap/google-play/subscription-purchase.js (Mocha → Jest). */

import {
  PlayStoreSubscriptionPurchase,
  GOOGLE_PLAY_FORM_OF_PAYMENT,
} from './subscription-purchase';
import { SkuType } from './types';

describe('SubscriptionPurchase', () => {
  beforeEach(() => {});

  describe('fromApiResponse', () => {
    it('parses active subscription correctly', () => {
      const apiResponse: Record<string, any> = {
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
      expect(subscription.activeUntilDate().getTime()).toBe(
        new Date(parseInt(apiResponse.expiryTimeMillis)).getTime()
      );
      expect(subscription.isAccountHold()).toBe(false);
      expect(subscription.isEntitlementActive()).toBe(true);
      expect(subscription.isFreeTrial()).toBe(false);
      expect(subscription.isMutable).toBe(true);
      expect(subscription.isTestPurchase()).toBe(false);
      expect(subscription.willRenew()).toBe(true);

      // Verify that values of the original API response are all copied to the SubscriptionPurchase object.
      // We ignore type check because we do some type conversion (i.e. startTimeMillis: convert from string to int),
      // hence we use loose equality (==) instead of strict equality below.
      Object.keys(apiResponse).forEach((key) =>
        // eslint-disable-next-line eqeqeq
        expect((subscription as any)[key] == apiResponse[key]).toBe(true)
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
      expect(subscription.isFreeTrial()).toBe(true);
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
      expect(subscription.isAccountHold()).toBe(true);
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
      expect(subscription.isTestPurchase()).toBe(true);
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
    let subscription: any;

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
      expect(result.skuType).toBe(SkuType.SUBS);
      expect(result.formOfPayment).toBe(GOOGLE_PLAY_FORM_OF_PAYMENT);
    });

    it('converts from firestore', () => {
      const firestoreObj = subscription.toFirestoreObject();
      firestoreObj.userId = 'testUser';
      const result =
        PlayStoreSubscriptionPurchase.fromFirestoreObject(firestoreObj);
      // Internal keys are not defined on the subscription purchase.
      expect((result as any).skuType).toBeUndefined();
      expect(result.userId).toBe('testUser');
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
      expect(subscription.isTestPurchase()).toBe(false);
      const firestoreObject = testSubscription.toFirestoreObject();
      testSubscription.mergeWithFirestorePurchaseRecord(firestoreObject);
      expect(testSubscription.isTestPurchase()).toBe(true);
    });
  });
});
