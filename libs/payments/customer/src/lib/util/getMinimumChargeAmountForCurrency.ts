/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { STRIPE_MINIMUM_CHARGE_AMOUNTS } from '@fxa/payments/stripe';
import { StripeNoMinimumChargeAmountAvailableError } from '../customer.error';

/**
 * Returns minimum charge amount for currency
 * Throws error for invalid currency
 */
export function getMinimumChargeAmountForCurrency(currency: string): number {
  const normalizedCurrency = currency.toLowerCase();
  if (STRIPE_MINIMUM_CHARGE_AMOUNTS[normalizedCurrency]) {
    return STRIPE_MINIMUM_CHARGE_AMOUNTS[normalizedCurrency];
  }

  throw new StripeNoMinimumChargeAmountAvailableError(normalizedCurrency);
}
