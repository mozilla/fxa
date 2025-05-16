/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { StripePrice } from "@fxa/payments/stripe";
import { Stripe } from "stripe";

/**
 * Returns the unit amount in cents
 * Note, decimal places in unit_amount_decimal are not supported
 * and only unit amounts in cents will be returned.
 */
export function determinePriceUnitAmount({ unit_amount, unit_amount_decimal }: StripePrice | Stripe.Price.CurrencyOptions) {
  return (!unit_amount && unit_amount_decimal) ? parseInt(unit_amount_decimal) : unit_amount;
}
