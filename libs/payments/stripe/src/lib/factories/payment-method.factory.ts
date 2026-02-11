/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import { StripePaymentMethod } from '../stripe.client.types';

export const StripePaymentMethodFactory = (
  override?: Partial<StripePaymentMethod>
): StripePaymentMethod => ({
  id: `pm_${faker.string.alphanumeric({ length: 14 })}`,
  object: 'payment_method',
  billing_details: {
    address: {
      city: null,
      country: null,
      line1: null,
      line2: null,
      postal_code: null,
      state: null,
    },
    email: null,
    name: null,
    phone: null,
  },
  card: {
    brand: 'visa',
    checks: {
      address_line1_check: null,
      address_postal_code_check: null,
      cvc_check: 'unchecked',
    },
    country: faker.location.countryCode(),
    display_brand: 'visa',
    exp_month: faker.date.future().getUTCMonth(),
    exp_year: faker.date.future().getUTCFullYear(),
    fingerprint: faker.string.uuid(),
    funding: 'credit',
    generated_from: {
      charge: null,
      payment_method_details: null,
      setup_attempt: null,
    },
    last4: faker.string.numeric({ length: 4 }),
    networks: {
      available: ['visa'],
      preferred: null,
    },
    three_d_secure_usage: {
      supported: true,
    },
    wallet: null,
  },
  created: faker.date.past().getTime() / 1000,
  customer: null,
  livemode: true,
  metadata: {},
  type: 'card',
  ...override,
});
