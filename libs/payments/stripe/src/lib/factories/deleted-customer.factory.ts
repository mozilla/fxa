/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import { StripeDeletedCustomer } from '../stripe.client.types';

export const StripeDeletedCustomerFactory = (
  override?: Partial<StripeDeletedCustomer>
): StripeDeletedCustomer => ({
  id: `cus_${faker.string.alphanumeric({ length: 24 })}`,
  object: 'customer',
  deleted: true,
  ...override,
});
