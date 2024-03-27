/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import { StripeCustomer } from '../stripe.client.types';

export const CustomerFactory = (
  override?: Partial<StripeCustomer>
): StripeCustomer => ({
  id: `cus_${faker.string.alphanumeric({ length: 14 })}`,
  object: 'customer',
  balance: faker.number.int({ max: 1000 }),
  created: faker.number.int(),
  tax: {
    location: null,
    automatic_tax: 'supported',
    ip_address: faker.internet.ipv4(),
  },
  default_source: faker.string.uuid(),
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
