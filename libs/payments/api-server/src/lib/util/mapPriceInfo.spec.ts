/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  StripePriceFactory,
  StripePriceRecurringFactory,
} from '@fxa/payments/stripe';
import { mapPriceInfo } from './mapPriceInfo';

describe('mapPriceInfo', () => {
  it('returns amount, currency, interval, and interval_count', () => {
    const price = StripePriceFactory({
      currency: 'usd',
      unit_amount: 500,
      recurring: StripePriceRecurringFactory({
        interval: 'month',
        interval_count: 1,
      }),
    });

    const result = mapPriceInfo(price, 'USD');

    expect(result).toEqual({
      amount: 500,
      currency: 'usd',
      interval: 'month',
      interval_count: 1,
    });
  });

  it('falls back to unit_amount_decimal when unit_amount is missing', () => {
    const price = StripePriceFactory({
      currency: 'usd',
      recurring: StripePriceRecurringFactory({ interval: 'year' }),
      currency_options: {
        usd: {
          custom_unit_amount: null,
          tax_behavior: 'exclusive',
          unit_amount: null,
          unit_amount_decimal: '1234.50',
        },
      },
    });

    const result = mapPriceInfo(price, 'usd');

    expect(result.amount).toBe(1235);
  });

  it('returns amount null when the currency has no currency option', () => {
    const price = StripePriceFactory({
      currency: 'usd',
      recurring: StripePriceRecurringFactory({ interval: 'month' }),
      currency_options: {},
    });

    const result = mapPriceInfo(price, 'usd');

    expect(result.amount).toBeNull();
  });

  it('returns currency null and amount null when no currency is provided', () => {
    const price = StripePriceFactory({
      recurring: StripePriceRecurringFactory({ interval: 'month' }),
    });

    const result = mapPriceInfo(price, null);

    expect(result.currency).toBeNull();
    expect(result.amount).toBeNull();
  });

  it('throws when the price is not recurring', () => {
    const price = StripePriceFactory({
      id: 'price_onetime',
      recurring: null,
    });

    expect(() => mapPriceInfo(price, 'usd')).toThrow(
      /Only recurring prices are supported/
    );
  });
});
