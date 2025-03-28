/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import { InvoicePreview } from './types';

export const InvoicePreviewFactory = (
  override?: Partial<InvoicePreview>
): InvoicePreview => ({
  currency: faker.finance.currencyCode(),
  listAmount: faker.number.int({ max: 1000 }),
  totalAmount: faker.number.int({ max: 1000 }),
  taxAmounts: [],
  discountAmount: null,
  subtotal: faker.number.int({ max: 1000 }),
  discountEnd: null,
  discountType: faker.helpers.arrayElement(['forever', 'once', 'repeating']),
  number:
    faker.string.alphanumeric({ length: 8 }).toLocaleUpperCase() +
    '-' +
    faker.string.numeric({ length: 4, allowLeadingZeros: true }),
  ...override,
  nextInvoiceDate: faker.date.future().getDate(),
});
