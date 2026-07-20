/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { StripePrice } from '@fxa/payments/stripe';

import type { PriceInfo } from '../billing-and-subscriptions.schema';

export const mapPriceInfo = (
  price: StripePrice,
  currency?: string | null
): PriceInfo => {
  if (!price.recurring) {
    throw new Error(
      `Only recurring prices are supported (priceId=${price.id})`
    );
  }

  const normalizedCurrency = currency ? currency.toLowerCase() : null;
  let amount: number | null = null;
  if (normalizedCurrency) {
    const currencyOption = price.currency_options?.[normalizedCurrency];
    if (currencyOption) {
      const { unit_amount, unit_amount_decimal } = currencyOption;
      amount =
        unit_amount ??
        (unit_amount_decimal != null
          ? Math.round(parseFloat(unit_amount_decimal))
          : null);
    }
  }

  return {
    amount,
    currency: normalizedCurrency,
    interval: price.recurring.interval,
    interval_count: price.recurring.interval_count,
  };
};
