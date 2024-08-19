/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { AmountExceedsPayPalCharLimitError } from '../paypal.error';

/*
 * Convert amount in cents to paypal AMT string.
 * We use Stripe to manage everything and plans are recorded in an AmountInCents.
 * PayPal AMT field requires a string of 10 characters or less, as documented here:
 * https://developer.paypal.com/docs/nvp-soap-api/do-reference-transaction-nvp/#payment-details-fields
 * https://developer.paypal.com/docs/api/payments/v1/#definition-amount
 */
export function getPayPalAmountStringFromAmountInCents(
  amountInCents: number
): string {
  if (amountInCents.toString().length > 10) {
    throw new AmountExceedsPayPalCharLimitError(amountInCents);
  }
  // Left pad with zeros if necessary, so we always get a minimum of 0.01.
  const amountAsString = String(amountInCents).padStart(3, '0');
  const dollars = amountAsString.slice(0, -2);
  const cents = amountAsString.slice(-2);
  return `${dollars}.${cents}`;
}
