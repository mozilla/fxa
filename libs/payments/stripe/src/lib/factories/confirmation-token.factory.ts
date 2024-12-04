/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import Stripe from 'stripe';

export const StripeConfirmationTokenFactory = (
  override?: Partial<Stripe.ConfirmationToken>
): Stripe.ConfirmationToken => ({
  id: 'card',
  object: 'confirmation_token',
  created: faker.date.past().getTime() / 1000,
  expires_at: null,
  livemode: true,
  mandate_data: null,
  payment_intent: null,
  payment_method_options: null,
  payment_method_preview: null,
  return_url: null,
  setup_future_usage: null,
  setup_intent: null,
  shipping: null,
  use_stripe_sdk: true,
  ...override,
});
