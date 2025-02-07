/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import { StripeAddress } from '../stripe.client.types';

export const StripeAddressFactory = (override?: Partial<StripeAddress>) => ({
  city: '',
  line1: '',
  line2: '',
  state: '',
  postal_code: faker.location.zipCode(),
  country: faker.location.countryCode(),
  ...override,
});
