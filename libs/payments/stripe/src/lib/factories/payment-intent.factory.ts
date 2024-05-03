/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import { StripePaymentIntent } from '../stripe.client.types';

export const StripePaymentIntentFactory = (
  override?: Partial<StripePaymentIntent>
): StripePaymentIntent => ({
  id: `promo_${faker.string.alphanumeric({ length: 14 })}`,
  object: 'payment_intent',
  amount: faker.number.int({ min: 1000, max: 5000 }),
  amount_capturable: 0,
  amount_details: {
    tip: {},
  },
  amount_received: 0,
  application: null,
  application_fee_amount: null,
  automatic_payment_methods: {
    enabled: true,
  },
  canceled_at: null,
  cancellation_reason: null,
  capture_method: 'automatic',
  client_secret: faker.string.uuid(),
  confirmation_method: 'automatic',
  created: faker.date.past().getTime() / 1000,
  currency: faker.finance.currencyCode(),
  customer: null,
  description: null,
  invoice: null,
  last_payment_error: null,
  latest_charge: null,
  livemode: true,
  metadata: {},
  next_action: null,
  on_behalf_of: null,
  payment_method: null,
  payment_method_configuration_details: null,
  payment_method_options: {
    card: {
      installments: null,
      mandate_options: null,
      network: null,
      request_three_d_secure: 'automatic',
    },
    link: {
      persistent_token: null,
    },
  },
  payment_method_types: ['card', 'link'],
  processing: null,
  receipt_email: null,
  review: null,
  setup_future_usage: null,
  shipping: null,
  source: null,
  statement_descriptor: null,
  statement_descriptor_suffix: null,
  status: 'requires_payment_method',
  transfer_data: null,
  transfer_group: null,
  ...override,
});
