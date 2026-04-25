/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  StripePriceFactory,
  StripeSubscriptionFactory,
  StripeSubscriptionItemFactory,
} from '@fxa/payments/stripe';
import { transformToWebSubscription } from './transformToWebSubscription';

describe('transformToWebSubscription', () => {
  it('maps subscription fields onto a WebSubscription', () => {
    const price = StripePriceFactory({ id: 'price_w' });
    const sub = StripeSubscriptionFactory({
      id: 'sub_w',
      status: 'active',
      created: 1,
      current_period_start: 2,
      current_period_end: 3,
      cancel_at_period_end: false,
      ended_at: null,
      items: {
        object: 'list',
        data: [
          StripeSubscriptionItemFactory({
            price: { ...price, product: 'prod_w' },
          }),
        ],
        has_more: false,
        url: '',
      },
    });
    const priceInfo = {
      amount: 100,
      currency: 'usd',
      interval: 'month',
      interval_count: 1,
    };

    const result = transformToWebSubscription(sub, price.id, priceInfo);

    expect(result).toEqual({
      _subscription_type: 'web',
      created: 1,
      current_period_end: 3,
      current_period_start: 2,
      cancel_at_period_end: false,
      end_at: null,
      plan_id: price.id,
      product_id: 'prod_w',
      priceInfo,
      status: 'active',
      subscription_id: 'sub_w',
    });
  });

  it('uses ended_at for end_at when set', () => {
    const sub = StripeSubscriptionFactory({ ended_at: 42 });

    const result = transformToWebSubscription(sub, 'price_x', {
      amount: null,
      currency: null,
      interval: 'month',
      interval_count: 1,
    });

    expect(result.end_at).toBe(42);
  });

  it('throws when the subscription has no product id', () => {
    const price = StripePriceFactory();
    const sub = StripeSubscriptionFactory({
      id: 'sub_missing_prod',
      items: {
        object: 'list',
        data: [
          StripeSubscriptionItemFactory({
            price: { ...price, product: null as unknown as string },
          }),
        ],
        has_more: false,
        url: '',
      },
    });

    expect(() =>
      transformToWebSubscription(sub, 'price_y', {
        amount: null,
        currency: null,
        interval: 'month',
        interval_count: 1,
      })
    ).toThrow(/sub_missing_prod/);
  });
});
