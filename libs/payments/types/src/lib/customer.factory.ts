/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Customer } from './customer.types';
import { faker } from '@faker-js/faker';

// export const CustomerFactory = {
//   create(stripeCustomer: Stripe.Customer): Customer {
//     if (typeof stripeCustomer.default_source === 'string') {
//       // throw error or fetch/expand from stripe
//       throw new Error('default_source not expanded');
//     }

//     const customer = {
//       ...stripeCustomer,
//       default_source: stripeCustomer.default_source,
//     } satisfies Customer;

//     return customer;
//   },
// };

export const CustomerFactory = (override: Partial<Customer>): Customer => ({
  id: 'customer',
  object: 'customer',
  balance: 0,
  created: 1,
  default_source: {
    id: 'card',
    object: 'card',
    address_city: 'Anytown',
    address_country: 'US',
    address_line1: null,
    address_line1_check: null,
    address_line2: null,
    address_state: 'WA',
    address_zip: '98332',
    address_zip_check: null,
    brand: 'Visa',
    country: 'US',
    currency: 'USD',
    cvc_check: null,
    dynamic_last4: null,
    exp_month: faker.number.int({ min: 1, max: 12 }),
    exp_year: faker.date.future({ years: 10 }).getFullYear(),
    funding: 'credit',
    last4: '4242',
    metadata: null,
    name: faker.person.fullName(),
    tokenization_method: null,
  },
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
