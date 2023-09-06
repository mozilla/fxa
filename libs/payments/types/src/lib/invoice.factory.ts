/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Invoice } from './invoice.types';
import { faker } from '@faker-js/faker';
import { CustomerFactory } from './customer.factory';
import { SubscriptionFactory } from './subscription.factory';
import { PriceFactory } from './price.factory';

// export const InvoiceFactory = {
//   create(stripeInvoice: Stripe.Invoice): Invoice {
//     if (typeof stripeInvoice.charge === 'string') {
//       // throw error or fetch/expand from stripe
//       throw new Error('charge not expanded');
//     }

//     if (typeof stripeInvoice.customer === 'string') {
//       // throw error or fetch/expand from stripe
//       throw new Error('customer not expanded');
//     }

//     if (typeof stripeInvoice.payment_intent === 'string') {
//       // throw error or fetch/expand from stripe
//       throw new Error('payment_intent not expanded');
//     }

//     if (typeof stripeInvoice.subscription === 'string') {
//       // throw error or fetch/expand from stripe
//       throw new Error('subscription not expanded');
//     }

//     if (typeof stripeInvoice.default_payment_method === 'string') {
//       // throw error or fetch/expand from stripe
//       throw new Error('default_payment_method not expanded');
//     }

//     if (typeof stripeInvoice.default_source === 'string') {
//       // throw error or fetch/expand from stripe
//       throw new Error('default_source not expanded');
//     }

//     if (typeof stripeInvoice.discounts === 'string') {
//       // throw error or fetch/expand from stripe
//       throw new Error('discounts not expanded');
//     }

//     const invoice = {
//       ...stripeInvoice,
//       charge: stripeInvoice.charge,
//       customer: stripeInvoice.customer,
//       payment_intent: stripeInvoice.payment_intent,
//       subscription: stripeInvoice.subscription,
//       default_payment_method: stripeInvoice.default_payment_method,
//       default_source: stripeInvoice.default_source,
//       discounts: stripeInvoice.discounts,
//     } satisfies Invoice;

//     return invoice;
//   },
// };

export const InvoiceFactory = (override: Partial<Invoice>): Invoice => ({
  id: faker.string.alphanumeric(10),
  object: 'invoice',
  account_country: null,
  account_name: null,
  account_tax_ids: null,
  amount_due: 0,
  amount_paid: 0,
  amount_remaining: 0,
  amount_shipping: 0,
  application: null,
  application_fee_amount: null,
  attempt_count: 1,
  attempted: true,
  automatic_tax: {
    enabled: true,
    status: 'complete',
  },
  billing_reason: null,
  charge: faker.string.alphanumeric(10),
  collection_method: 'charge_automatically',
  created: 1,
  currency: 'USD',
  custom_fields: null,
  customer: CustomerFactory({}),
  customer_address: null,
  customer_email: faker.internet.email(),
  customer_name: null,
  customer_phone: null,
  customer_shipping: null,
  customer_tax_exempt: null,
  default_payment_method: faker.string.alphanumeric(10),
  default_source: faker.string.alphanumeric(10),
  default_tax_rates: [],
  description: null,
  discount: null,
  discounts: null,
  due_date: null,
  ending_balance: null,
  footer: null,
  from_invoice: null,
  last_finalization_error: null,
  latest_revision: null,
  lines: {
    data: [
      {
        id: faker.string.alphanumeric(10),
        object: 'line_item',
        amount: 500,
        amount_excluding_tax: 500,
        currency: 'USD',
        description: null,
        discount_amounts: null,
        discountable: true,
        discounts: null,
        livemode: false,
        metadata: {},
        period: {
          end: 1,
          start: 0,
        },
        plan: null,
        price: PriceFactory({}),
        proration: false,
        proration_details: null,
        quantity: null,
        subscription: null,
        type: 'subscription',
        unit_amount_excluding_tax: null,
      },
    ],
    has_more: false,
    url: faker.internet.url(),
  },
  livemode: false,
  metadata: null,
  next_payment_attempt: null,
  number: null,
  on_behalf_of: null,
  paid: false,
  paid_out_of_band: false,
  payment_intent: faker.string.alphanumeric(10),
  payment_settings: {
    default_mandate: null,
    payment_method_options: null,
    payment_method_types: null,
  },
  period_end: 1,
  period_start: 0,
  post_payment_credit_notes_amount: 0,
  pre_payment_credit_notes_amount: 0,
  quote: null,
  receipt_number: null,
  rendering_options: null,
  shipping_cost: null,
  shipping_details: null,
  starting_balance: 500,
  statement_descriptor: null,
  status: null,
  status_transitions: {
    finalized_at: null,
    marked_uncollectible_at: null,
    paid_at: null,
    voided_at: null,
  },
  subscription: SubscriptionFactory({}),
  subtotal: 500,
  subtotal_excluding_tax: 500,
  tax: 100,
  test_clock: null,
  total: 600,
  total_discount_amounts: null,
  total_excluding_tax: 500,
  total_tax_amounts: [],
  transfer_data: null,
  webhooks_delivered_at: null,
  ...override,
});
