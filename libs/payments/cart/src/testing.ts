/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';

import type {
  BaseCartDTO,
  FailCartDTO,
  Invoice,
  NeedsInputCartDTO,
  PaymentInfo,
  ProcessingCartDTO,
  StartCartDTO,
  SuccessCartDTO,
  TaxAmount,
} from './lib/cart.types';

export const TaxAmountFactory = (override?: Partial<TaxAmount>): TaxAmount => ({
  inclusive: false,
  title: faker.location.state({ abbreviated: true }),
  amount: faker.number.int(10000),
  ...override,
});

export const InvoiceFactory = (override?: Partial<Invoice>): Invoice => ({
  currency: faker.finance.currencyCode().toLowerCase(),
  totalAmount: faker.number.int({ min: 1, max: 10000 }),
  taxAmounts: [TaxAmountFactory()],
  discountAmount: null,
  subtotal: faker.number.int({ min: 1, max: 10000 }),
  number: null,
  invoiceDate: faker.date.past().getTime(),
  nextInvoiceDate: faker.date.past().getTime(),
  amountDue: faker.number.int({ min: 1, max: 10000 }),
  creditApplied: null,
  startingBalance: faker.number.int({ min: 1, max: 10000 }),
  ...override,
});

export const PaymentInfoFactory = (
  override?: Partial<PaymentInfo>
): PaymentInfo => ({
  type: faker.helpers.arrayElement([
    'card',
    'google_iap',
    'apple_iap',
    'external_paypal',
    'link',
  ]),
  ...override,
});

/**
 * Lightweight BaseCartDTO factory that avoids heavy imports
 * (`@fxa/payments/customer`, `@fxa/shared/db/mysql/account`).
 * Uses string literals matching the real enum values and inlines
 * tax address generation instead of importing TaxAddressFactory.
 */
export const BaseCartDTOFactory = (
  override?: Partial<BaseCartDTO>
): BaseCartDTO => ({
  id: faker.string.uuid(),
  errorReasonId: null,
  offeringConfigId: faker.string.uuid(),
  interval: faker.helpers.arrayElement([
    'daily',
    'weekly',
    'monthly',
    'halfyearly',
    'yearly',
  ]),
  experiment: null,
  taxAddress: {
    countryCode: faker.location.countryCode(),
    postalCode: faker.location.zipCode(),
  },
  currency: faker.finance.currencyCode().toLowerCase(),
  createdAt: faker.date.past().getTime(),
  updatedAt: faker.date.past().getTime(),
  couponCode: null,
  stripeCustomerId: faker.string.uuid(),
  stripeSubscriptionId: faker.string.uuid(),
  stripeIntentId: `pi_${faker.string.alphanumeric({ length: 14 })}`,
  amount: faker.number.int(),
  version: faker.number.int(),
  eligibilityStatus: 'create' as BaseCartDTO['eligibilityStatus'],
  isFreeTrial: false,
  metricsOptedOut: faker.datatype.boolean(),
  offeringPrice: faker.number.int(),
  upcomingInvoicePreview: InvoiceFactory(),
  ...override,
});

export const StartCartDTOFactory = (
  override?: Partial<StartCartDTO>
): StartCartDTO => ({
  ...BaseCartDTOFactory(),
  hasActiveSubscriptions: false,
  ...override,
  state: 'start' as StartCartDTO['state'],
});

export const ProcessingCartDTOFactory = (
  override?: Partial<ProcessingCartDTO>
): ProcessingCartDTO => ({
  ...BaseCartDTOFactory(),
  ...override,
  state: 'processing' as ProcessingCartDTO['state'],
});

export const SuccessCartDTOFactory = (
  override?: Partial<SuccessCartDTO>
): SuccessCartDTO => ({
  ...BaseCartDTOFactory(),
  latestInvoicePreview: InvoiceFactory(),
  paymentInfo: PaymentInfoFactory(),
  hasActiveSubscriptions: true,
  ...override,
  state: 'success' as SuccessCartDTO['state'],
});

export const NeedsInputCartDTOFactory = (
  override?: Partial<NeedsInputCartDTO>
): NeedsInputCartDTO => ({
  ...BaseCartDTOFactory(),
  ...override,
  state: 'needs_input' as NeedsInputCartDTO['state'],
});

export const FailCartDTOFactory = (
  override?: Partial<FailCartDTO>
): FailCartDTO => ({
  ...BaseCartDTOFactory(),
  ...override,
  state: 'fail' as FailCartDTO['state'],
});
