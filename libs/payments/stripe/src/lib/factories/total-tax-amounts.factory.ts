/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import { StripeInvoiceLineItemTaxAmount } from '../stripe.client.types';
import { StripeTaxRateFactory } from './tax-rate.factory';

export const StripeTotalTaxAmountsFactory = (
  override?: Partial<StripeInvoiceLineItemTaxAmount>
): StripeInvoiceLineItemTaxAmount => ({
  amount: faker.number.int(),
  inclusive: false,
  tax_rate: StripeTaxRateFactory(),
  taxability_reason: null,
  taxable_amount: null,
  ...override,
});
