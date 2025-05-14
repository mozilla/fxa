/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { type PricingForCurrency } from '../types';
import { StripePriceFactory } from '@fxa/payments/stripe';

export const PricingForCurrencyFactory = (
  override?: Partial<PricingForCurrency>
): PricingForCurrency => {
  const price = override?.price || StripePriceFactory();
  return {
    price,
    unitAmountForCurrency: price.unit_amount,
    currencyOptionForCurrency: price.currency_options[0],
    ...override,
  }
};

