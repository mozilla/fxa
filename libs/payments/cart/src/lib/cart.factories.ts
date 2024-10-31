/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';

import {
  InvoicePreviewFactory,
  TaxAddressFactory,
} from '@fxa/payments/customer';
import {
  CartEligibilityStatus,
  CartErrorReasonId,
  CartState,
} from '@fxa/shared/db/mysql/account';
import {
  CheckoutCustomerData,
  FinishCart,
  FinishErrorCart,
  PaymentInfo,
  ResultCart,
  SetupCart,
  SuccessCart,
  TaxAmount,
  UpdateCart,
  WithContextCart,
} from './cart.types';

const OFFERING_CONFIG_IDS = [
  'vpn',
  'relay-phone',
  'relay-email',
  'hubs',
  'mdnplus',
];

const INTERVALS = ['daily', 'weekly', 'monthly', '6monthly', 'yearly'];

export const CheckoutCustomerDataFactory = (
  override?: Partial<CheckoutCustomerData>
): CheckoutCustomerData => ({
  locale: faker.helpers.arrayElement(['en-US', 'de', 'es', 'fr-FR']),
  displayName: faker.person.fullName(),
  ...override,
});

export const SetupCartFactory = (override?: Partial<SetupCart>): SetupCart => ({
  email: 'test@example.com',
  offeringConfigId: faker.helpers.arrayElement(OFFERING_CONFIG_IDS),
  interval: faker.helpers.arrayElement(INTERVALS),
  amount: faker.number.int(10000),
  eligibilityStatus: faker.helpers.enumValue(CartEligibilityStatus),
  ...override,
});

export const TaxAmountFactory = (override?: Partial<TaxAmount>): TaxAmount => ({
  inclusive: false,
  title: faker.location.state({ abbreviated: true }),
  amount: faker.number.int(10000),
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
  ]),
  ...override,
});

export const UpdateCartFactory = (
  override?: Partial<UpdateCart>
): UpdateCart => ({
  ...override,
});

export const FinishCartFactory = (
  override?: Partial<FinishCart>
): FinishCart => ({
  amount: faker.number.int(10000),
  ...override,
});

export const FinishErrorCartFactory = (
  override?: Partial<FinishErrorCart>
): FinishErrorCart => ({
  errorReasonId: CartErrorReasonId.Unknown,
  ...override,
});

export const ResultCartFactory = (
  override?: Partial<ResultCart>
): ResultCart => ({
  id: faker.string.uuid(),
  state: CartState.START,
  errorReasonId: null,
  offeringConfigId: faker.string.uuid(),
  interval: faker.string.numeric(),
  experiment: null,
  taxAddress: TaxAddressFactory(),
  currency: faker.finance.currencyCode(),
  createdAt: faker.date.past().getTime(),
  updatedAt: faker.date.past().getTime(),
  couponCode: null,
  stripeCustomerId: faker.string.uuid(),
  stripeSubscriptionId: faker.string.uuid(),
  email: faker.internet.email(),
  amount: faker.number.int(),
  version: faker.number.int(),
  eligibilityStatus: faker.helpers.enumValue(CartEligibilityStatus),
  ...override,
});

export const WithContextCartFactory = (
  override?: Partial<WithContextCart>
): WithContextCart => ({
  ...ResultCartFactory(),
  metricsOptedOut: false,
  upcomingInvoicePreview: InvoicePreviewFactory(),
  ...override,
});

export const SuccessCartFactory = (
  override?: Partial<SuccessCart>
): SuccessCart => ({
  ...WithContextCartFactory(),
  state: CartState.SUCCESS,
  latestInvoicePreview: InvoicePreviewFactory(),
  paymentInfo: PaymentInfoFactory(),
  ...override,
});
