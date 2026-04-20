/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import Stripe from 'stripe';

export const StripeConfirmationTokenPaymentMethodPreviewCardFactory = (
  override?: Partial<Stripe.ConfirmationToken.PaymentMethodPreview.Card>
): Stripe.ConfirmationToken.PaymentMethodPreview.Card => ({
  brand: 'visa',
  checks: null,
  country: faker.location.countryCode(),
  display_brand: 'visa',
  exp_month: faker.number.int({ min: 1, max: 12 }),
  exp_year: faker.date.future().getUTCFullYear(),
  funding: 'credit',
  generated_from: null,
  last4: faker.string.numeric({ length: 4 }),
  networks: null,
  three_d_secure_usage: null,
  wallet: null,
  ...override,
});

export const StripeConfirmationTokenPaymentMethodPreviewFactory = (
  override?: Partial<Stripe.ConfirmationToken.PaymentMethodPreview>
): Stripe.ConfirmationToken.PaymentMethodPreview => ({
  billing_details: {
    address: null,
    email: null,
    name: null,
    phone: null,
  },
  card: StripeConfirmationTokenPaymentMethodPreviewCardFactory(),
  customer: null,
  type: 'card',
  ...override,
});

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
