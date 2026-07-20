/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { StripeSubscriptionFactory } from '@fxa/payments/stripe';
import { hasSubscriptionRequiringPaymentMethod } from './hasSubscriptionRequiringPaymentMethod';

describe('hasSubscriptionRequiringPaymentMethod', () => {
  it('returns true when any subscription is not cancelling at period end', () => {
    const subs = [
      StripeSubscriptionFactory({ cancel_at_period_end: true }),
      StripeSubscriptionFactory({ cancel_at_period_end: false }),
    ];
    expect(hasSubscriptionRequiringPaymentMethod(subs)).toBe(true);
  });

  it('returns false when all subscriptions are cancelling at period end', () => {
    const subs = [
      StripeSubscriptionFactory({ cancel_at_period_end: true }),
      StripeSubscriptionFactory({ cancel_at_period_end: true }),
    ];
    expect(hasSubscriptionRequiringPaymentMethod(subs)).toBe(false);
  });

  it('returns false for an empty list', () => {
    expect(hasSubscriptionRequiringPaymentMethod([])).toBe(false);
  });
});
