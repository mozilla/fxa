/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import { StripeTaxRate } from '../stripe.client.types';

export const StripeTaxRateFactory = (
  override?: Partial<StripeTaxRate>
): StripeTaxRate => ({
  id: `txr_${faker.string.alphanumeric({ length: 14 })}`,
  object: 'tax_rate',
  active: true,
  country: null,
  created: faker.number.int(),
  description: 'VAT Germany',
  display_name: 'VAT',
  effective_percentage: null,
  flat_amount: {
    amount: faker.number.int({ max: 100 }),
    currency: faker.finance.currencyCode(),
  },
  inclusive: false,
  jurisdiction: faker.location.state({ abbreviated: true }),
  jurisdiction_level: null,
  livemode: false,
  metadata: {},
  percentage: faker.number.int({ min: 0, max: 100 }),
  rate_type: null,
  state: null,
  tax_type: null,
  ...override,
});
