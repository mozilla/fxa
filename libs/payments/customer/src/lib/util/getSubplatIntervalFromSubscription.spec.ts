/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  StripePriceFactory,
  StripePriceRecurringFactory,
  StripeSubscriptionFactory,
  StripeSubscriptionItemFactory,
} from '@fxa/payments/stripe';
import { SubplatInterval } from '../types';
import {
  getSubplatIntervalFromSubscription,
  PriceNotRecurringError,
} from './getSubplatIntervalFromSubscription';

describe('getSubplatIntervalFromSubscription', () => {
  const priceRecurring = StripePriceRecurringFactory({
    interval: 'month',
    interval_count: 1,
  });
  const price = StripePriceFactory({ recurring: priceRecurring });
  const subscription = StripeSubscriptionFactory({
    items: {
      object: 'list',
      data: [StripeSubscriptionItemFactory({ price })],
      has_more: false,
      url: `/v1/subscription_items?subscription=`,
    },
  });

  it('returns the correct offering and interval', () => {
    expect(getSubplatIntervalFromSubscription(subscription)).toBe(
      SubplatInterval.Monthly
    );
  });

  it('does not find offering and interval', () => {
    price.recurring = StripePriceRecurringFactory({
      interval: 'day',
      interval_count: 5,
    });
    expect(getSubplatIntervalFromSubscription(subscription)).toBe(undefined);
  });

  it('does not find offering and interval', async () => {
    price.recurring = null;
    expect(() => getSubplatIntervalFromSubscription(subscription)).toThrow(
      PriceNotRecurringError
    );
  });
});
