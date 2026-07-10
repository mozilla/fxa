/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { GoogleIapPurchaseFactory } from '../billing-and-subscriptions.factories';
import { transformToGoogleIapSubscription } from './transformToGoogleIapSubscription';

const iap = {
  priceId: 'price_g',
  productId: 'prod_g',
  productName: 'Google Prod',
  priceInfo: {
    amount: 100,
    currency: 'usd',
    interval: 'month',
    interval_count: 1,
  },
};

describe('transformToGoogleIapSubscription', () => {
  it('includes cancel_reason when set to a truthy value', () => {
    const purchase = GoogleIapPurchaseFactory({
      sku: 'sku_g',
      cancelReason: 1,
    });

    const result = transformToGoogleIapSubscription(purchase as never, iap);

    expect(result).toMatchObject({
      _subscription_type: 'iap_google',
      sku: 'sku_g',
      cancel_reason: 1,
      price_id: 'price_g',
      product_id: 'prod_g',
      product_name: 'Google Prod',
    });
  });

  it('omits cancel_reason when not set', () => {
    const purchase = GoogleIapPurchaseFactory({ cancelReason: undefined });

    const result = transformToGoogleIapSubscription(purchase as never, iap);

    expect(result).not.toHaveProperty('cancel_reason');
  });
});
