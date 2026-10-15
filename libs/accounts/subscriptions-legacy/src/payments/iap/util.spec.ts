/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { getIapPurchaseType } from './util';
import { MozillaSubscriptionTypes } from '../../subscriptions/types';
import { AppStoreSubscriptionPurchase } from './apple-app-store/subscription-purchase';
import { PlayStoreSubscriptionPurchase } from './google-play/subscription-purchase';

describe('getIapPurchaseType', () => {
  let expected: any;
  let purchase: any;
  let actual: any;
  beforeEach(() => {
    purchase = {};
  });
  it('returns IAP_GOOGLE for a Play Store purchase', () => {
    purchase = new PlayStoreSubscriptionPurchase();
    purchase.purchaseToken = '123';
    actual = getIapPurchaseType(purchase);
    expected = MozillaSubscriptionTypes.IAP_GOOGLE;
    expect(actual).toBe(expected);
  });
  it('returns IAP_APPLE for an App Store purchase', () => {
    purchase = new AppStoreSubscriptionPurchase();
    purchase.originalTransactionId = '1000000000000';
    actual = getIapPurchaseType(purchase);
    expected = MozillaSubscriptionTypes.IAP_APPLE;
    expect(actual).toBe(expected);
  });
  it('throws an error if the purchase is neither Google nor Apple', () => {
    expect(() => getIapPurchaseType(purchase)).toThrow(
      'Purchase is not recognized as either Google or Apple IAP.'
    );
  });
});
