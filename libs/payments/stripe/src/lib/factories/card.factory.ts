/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import { StripeCard } from '../stripe.client.types';

export const StripeCardFactory = (
  override?: Partial<StripeCard>
): StripeCard => ({
  id: 'card',
  object: 'card',
  address_city: faker.location.city(),
  address_country: faker.location.countryCode(),
  address_line1: null,
  address_line1_check: null,
  address_line2: null,
  address_state: faker.location.state({ abbreviated: true }),
  address_zip: faker.location.zipCode(),
  address_zip_check: null,
  brand: faker.finance.creditCardIssuer(),
  country: faker.location.countryCode(),
  currency: faker.finance.currencyCode(),
  cvc_check: null,
  dynamic_last4: null,
  exp_month: faker.number.int({ min: 1, max: 12 }),
  exp_year: faker.date.future({ years: 10 }).getFullYear(),
  funding: 'credit',
  last4: faker.finance.creditCardNumber().slice(-4),
  metadata: null,
  name: faker.person.fullName(),
  tokenization_method: null,
  ...override,
});
