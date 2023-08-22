/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import { Stripe } from 'stripe';
import { CardFactory } from './card.factory';

export const CustomerFactory = (
  override?: Partial<Stripe.Customer>
): Stripe.Customer => ({
  id: `cus_${faker.string.alphanumeric({ length: 14 })}`,
  object: 'customer',
  balance: faker.number.int({ max: 1000 }),
  created: faker.number.int(),
  default_source: CardFactory(),
  description: '',
  email: faker.internet.email(),
  invoice_settings: {
    custom_fields: null,
    default_payment_method: 'pm',
    footer: null,
    rendering_options: null,
  },
  livemode: false,
  metadata: {},
  shipping: null,
  ...override,
});
