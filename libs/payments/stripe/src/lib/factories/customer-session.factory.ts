/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import { StripeCustomerSession } from '../stripe.client.types';

export const StripeCustomerSessionFactory = (
  override?: Partial<StripeCustomerSession>
): StripeCustomerSession => ({
  object: 'customer_session',
  client_secret: faker.string.alphanumeric(24),
  customer: faker.string.alphanumeric(24),
  expires_at: faker.number.int(),
  created: faker.number.int(),
  livemode: false,
  ...override,
});
