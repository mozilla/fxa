/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type {
  StripePaymentIntent,
  StripeSetupIntent,
} from '@fxa/payments/stripe';

export function isPaymentIntent(
  intent: StripePaymentIntent | StripeSetupIntent
): intent is StripePaymentIntent {
  return intent.object === 'payment_intent';
}
