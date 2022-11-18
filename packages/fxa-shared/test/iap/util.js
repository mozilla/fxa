const { assert } = require('chai');

const { getIapPurchaseType } = require('../../payments/iap/util');
const { MozillaSubscriptionTypes } = require('fxa-shared/subscriptions/types');
const {
  AppStoreSubscriptionPurchase,
} = require('../../payments/iap/apple-app-store/subscription-purchase');
const {
  PlayStoreSubscriptionPurchase,
} = require('../../payments/iap/google-play/subscription-purchase');

describe('getIapPurchaseType', () => {
  let expected;
  let purchase;
  let actual;
  beforeEach(() => {
    purchase = {};
  });
  it('returns IAP_GOOGLE for a Play Store purchase', () => {
    purchase = new PlayStoreSubscriptionPurchase();
    purchase.purchaseToken = '123';
    actual = getIapPurchaseType(purchase);
    expected = MozillaSubscriptionTypes.IAP_GOOGLE;
    assert.equal(actual, expected);
  });
  it('returns IAP_APPLE for an App Store purchase', () => {
    purchase = new AppStoreSubscriptionPurchase();
    purchase.originalTransactionId = '1000000000000';
    actual = getIapPurchaseType(purchase);
    expected = MozillaSubscriptionTypes.IAP_APPLE;
    assert.equal(actual, expected);
  });
  it('throws an error if the purchase is neither Google nor Apple', () => {
    try {
      getIapPurchaseType(purchase);
      assert.fail();
    } catch (error) {
      assert.equal(
        error.message,
        'Purchase is not recognized as either Google or Apple IAP.'
      );
    }
  });
});
