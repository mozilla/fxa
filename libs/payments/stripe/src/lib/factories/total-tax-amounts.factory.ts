/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import { StripeInvoiceLineItemTax } from '../stripe.client.types';

export const StripeInvoiceLineItemTaxFactory = (
  override?: Partial<StripeInvoiceLineItemTax>
): StripeInvoiceLineItemTax => ({
  amount: faker.number.int(),
  tax_behavior: 'exclusive',
  tax_rate_details: {
    tax_rate: `txr_${faker.string.alphanumeric({ length: 24 })}`,
  },
  taxability_reason: 'standard_rated',
  taxable_amount: faker.number.int(),
  type: 'tax_rate_details',
  ...override,
});
