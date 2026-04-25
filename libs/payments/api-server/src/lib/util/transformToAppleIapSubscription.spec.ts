/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { AppleIapPurchaseFactory } from '../billing-and-subscriptions.factories';
import { transformToAppleIapSubscription } from './transformToAppleIapSubscription';

const iap = {
  priceId: 'price_a',
  productId: 'prod_a',
  productName: 'Apple Prod',
  priceInfo: {
    amount: 100,
    currency: 'usd',
    interval: 'month',
    interval_count: 1,
  },
};

describe('transformToAppleIapSubscription', () => {
  it('includes expiry_time_millis and is_in_billing_retry_period when set', () => {
    const purchase = AppleIapPurchaseFactory({
      productId: 'apple.prod',
      expiresDate: 999,
      isInBillingRetry: true,
    });

    const result = transformToAppleIapSubscription(purchase as never, iap);

    expect(result).toMatchObject({
      _subscription_type: 'iap_apple',
      app_store_product_id: 'apple.prod',
      expiry_time_millis: 999,
      is_in_billing_retry_period: true,
      price_id: 'price_a',
      product_id: 'prod_a',
      product_name: 'Apple Prod',
    });
  });

  it('omits expiry_time_millis and is_in_billing_retry_period when undefined', () => {
    const purchase = AppleIapPurchaseFactory({
      expiresDate: undefined,
      isInBillingRetry: undefined,
    });

    const result = transformToAppleIapSubscription(purchase as never, iap);

    expect(result).not.toHaveProperty('expiry_time_millis');
    expect(result).not.toHaveProperty('is_in_billing_retry_period');
  });
});
