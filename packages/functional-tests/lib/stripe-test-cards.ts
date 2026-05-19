/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Stripe test card numbers for use in functional tests.
 * See: https://docs.stripe.com/testing#cards
 */

export const StripeTestCards = {
  SUCCESS: '4242424242424242',
  THREE_DS_AUTHENTICATE: '4000000000003220',
  DECLINED: '4000000000000002',
  INSUFFICIENT_FUNDS: '4000000000009995',
  EXPIRED: '4000000000000069',
} as const;

export type StripeTestCard =
  (typeof StripeTestCards)[keyof typeof StripeTestCards];

export const TestCardDefaults = {
  EXP_MONTH: 12,
  EXP_YEAR: new Date().getFullYear() + 3,
  CVC: '123',
} as const;
