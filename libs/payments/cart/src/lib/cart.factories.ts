/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';

import { TaxAddressFactory } from '@fxa/payments/customer';
import {
  CartEligibilityStatus,
  CartErrorReasonId,
  CartState,
} from '@fxa/shared/db/mysql/account';
import {
  FinishCart,
  FinishErrorCart,
  PaymentInfo,
  ResultCart,
  SetupCart,
  TaxAmount,
  UpdateCart,
  UpdateCartInput,
  type BaseCartDTO,
  type FailCartDTO,
  type Invoice,
  type NeedsInputCartDTO,
  type ProcessingCartDTO,
  type StartCartDTO,
  type SuccessCartDTO,
} from './cart.types';
import type { SubscriptionAttributionParams } from './checkout.types';

const OFFERING_CONFIG_IDS = [
  'vpn',
  'relay-phone',
  'relay-email',
  'hubs',
  'mdnplus',
];

const INTERVALS = ['daily', 'weekly', 'monthly', 'halfyearly', 'yearly'];

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

export const SubscriptionAttributionFactory = (
  override?: Partial<SubscriptionAttributionParams>
): SubscriptionAttributionParams => {
  return {
    utm_campaign: faker.lorem.words(3),
    utm_content: faker.lorem.words(3),
    utm_medium: faker.lorem.words(3),
    utm_source: faker.lorem.words(3),
    utm_term: faker.lorem.words(3),
    session_flow_id: faker.string.uuid(),
    session_entrypoint: faker.internet.url(),
    session_entrypoint_experiment: faker.lorem.words(3),
    session_entrypoint_variation: faker.lorem.words(3),
    ...override,
  };
};

export const SetupCartFactory = (override?: Partial<SetupCart>): SetupCart => ({
  offeringConfigId: faker.helpers.arrayElement(OFFERING_CONFIG_IDS),
  interval: faker.helpers.arrayElement(INTERVALS),
  amount: faker.number.int(10000),
  eligibilityStatus: faker.helpers.enumValue(CartEligibilityStatus),
  taxAddress: {
    countryCode: faker.location.countryCode(),
    postalCode: faker.location.zipCode(),
  },
  currency: faker.finance.currencyCode().toLowerCase(),
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
    'link',
  ]),
  ...override,
});

export const UpdateCartInputFactory = (
  override?: Partial<UpdateCartInput>
): UpdateCartInput => ({
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
  errorReasonId: CartErrorReasonId.UNKNOWN,
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
  currency: faker.finance.currencyCode().toLowerCase(),
  createdAt: faker.date.past().getTime(),
  updatedAt: faker.date.past().getTime(),
  couponCode: null,
  stripeCustomerId: faker.string.uuid(),
  stripeSubscriptionId: faker.string.uuid(),
  stripeIntentId: `pi_${faker.string.alphanumeric({ length: 14 })}`,
  amount: faker.number.int(),
  version: faker.number.int(),
  eligibilityStatus: faker.helpers.enumValue(CartEligibilityStatus),
  ...override,
});

export const BaseCartDTOFactory = (
  override?: Partial<BaseCartDTO>
): BaseCartDTO => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { state, ...baseResultCart } = ResultCartFactory(override);
  return {
    ...baseResultCart,
    metricsOptedOut: true,
    offeringPrice: faker.number.int(),
    upcomingInvoicePreview: InvoiceFactory(),
    taxAddress: TaxAddressFactory(),
    currency: faker.finance.currencyCode().toLowerCase(),
    ...override,
  };
};

export const StartCartDTOFactory = (
  override?: Partial<StartCartDTO>
): StartCartDTO => ({
  ...BaseCartDTOFactory(),
  hasActiveSubscriptions: false,
  ...override,
  state: CartState.START,
});

export const ProcessingCartDTOFactory = (
  override?: Partial<ProcessingCartDTO>
): ProcessingCartDTO => ({
  ...BaseCartDTOFactory(),
  ...override,
  state: CartState.PROCESSING,
});
export const SuccessCartDTOFactory = (
  override?: Partial<SuccessCartDTO>
): SuccessCartDTO => ({
  ...BaseCartDTOFactory(),
  latestInvoicePreview: InvoiceFactory(),
  paymentInfo: PaymentInfoFactory(),
  hasActiveSubscriptions: true,
  ...override,
  state: CartState.SUCCESS,
});

export const NeedsInputCartDTOFactory = (
  override?: Partial<NeedsInputCartDTO>
): NeedsInputCartDTO => ({
  ...BaseCartDTOFactory(),
  ...override,
  state: CartState.NEEDS_INPUT,
});

export const FailCartDTOFactory = (
  override?: Partial<FailCartDTO>
): FailCartDTO => ({
  ...BaseCartDTOFactory(),
  ...override,
  state: CartState.FAIL,
});
