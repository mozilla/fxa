/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Stripe } from 'stripe';

/** Represents all subscription statuses that are considered active for a PayPal customer */
export const ACTIVE_SUBSCRIPTION_STATUSES: Stripe.Subscription['status'][] = [
  'active',
  'past_due',
  'trialing',
];

// Stripe minimum charge amounts as set here
// https://stripe.com/docs/currencies#minimum-and-maximum-charge-amounts
export const STRIPE_MINIMUM_CHARGE_AMOUNTS = {
  usd: 50,
  aed: 200,
  aud: 50,
  bgn: 100,
  brl: 50,
  cad: 50,
  chf: 50,
  czk: 1500,
  dkk: 250,
  eur: 50,
  gbp: 30,
  hkd: 400,
  huf: 17500,
  inr: 50,
  jpy: 50,
  mxn: 1000,
  myr: 200,
  nok: 300,
  nzd: 50,
  pln: 200,
  ron: 200,
  sek: 300,
  sgd: 50,
} as { [key: string]: number };
