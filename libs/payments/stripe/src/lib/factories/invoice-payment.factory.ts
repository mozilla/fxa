/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import { StripeInvoicePayment } from '../stripe.client.types';

export const StripeInvoicePaymentFactory = (
  override?: Partial<StripeInvoicePayment>
): StripeInvoicePayment => ({
  id: `inpay_${faker.string.alphanumeric({ length: 24 })}`,
  object: 'invoice_payment',
  amount_paid: faker.number.int({ max: 1000 }),
  amount_requested: faker.number.int({ max: 1000 }),
  created: faker.number.int(),
  currency: faker.finance.currencyCode().toLowerCase(),
  invoice: `in_${faker.string.alphanumeric({ length: 24 })}`,
  is_default: true,
  livemode: false,
  payment: {
    type: 'payment_intent',
    payment_intent: `pi_${faker.string.alphanumeric({ length: 24 })}`,
  },
  status: 'paid',
  status_transitions: {
    canceled_at: null,
    paid_at: faker.number.int(),
  },
  ...override,
});
