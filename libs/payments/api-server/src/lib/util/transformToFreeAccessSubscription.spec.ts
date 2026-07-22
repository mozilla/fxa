/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { transformToFreeAccessSubscription } from './transformToFreeAccessSubscription';

// A unix timestamp in seconds — the unit the free_access schema expects.
const CURRENT_PERIOD_END = 4_070_995_200; // 2099-01-02T00:00:00Z

describe('transformToFreeAccessSubscription', () => {
  it('maps offering product identity into a free_access subscription', () => {
    const result = transformToFreeAccessSubscription({
      currentPeriodEnd: CURRENT_PERIOD_END,
      productId: 'prod_vpn',
    });

    expect(result).toEqual({
      _subscription_type: 'free_access',
      current_period_end: CURRENT_PERIOD_END,
      product_id: 'prod_vpn',
    });
  });

  it('passes the current_period_end through unchanged', () => {
    const result = transformToFreeAccessSubscription({
      currentPeriodEnd: CURRENT_PERIOD_END,
      productId: 'prod_vpn',
    });

    expect(result.current_period_end).toBe(CURRENT_PERIOD_END);
  });

  it('does not report any billing data for a free grant', () => {
    const result = transformToFreeAccessSubscription({
      currentPeriodEnd: CURRENT_PERIOD_END,
      productId: 'prod_vpn',
    });

    expect(result).not.toHaveProperty('price_id');
    expect(result).not.toHaveProperty('plan_id');
    expect(result).not.toHaveProperty('priceInfo');
    expect(result).not.toHaveProperty('subscription_id');
  });
});
