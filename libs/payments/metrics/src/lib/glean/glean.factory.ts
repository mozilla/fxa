/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import {
  CancellationReason,
  CartMetrics,
  CmsMetricsData,
  CommonMetrics,
  FlowType,
  Outcome,
  PageName,
  Source,
  Step,
  SubscriptionCancellationData,
  type AccountsMetricsData,
  type ExperimentationData,
  type GenericGleanSubManageEvent,
  type GleanMetricsData,
  type PageMetricsData,
  type RetentionFlowEventMetricsData,
  type RetentionEligibilityMetricsData,
  type SessionMetricsData,
  type StripeMetricsData,
  type SubPlatCmsMetricsData,
} from './glean.types';
import { ResultCartFactory } from '@fxa/payments/cart';
import { SubplatInterval, TaxAddressFactory } from '@fxa/payments/customer';

export const CheckoutParamsFactory = (
  override?: Record<string, string>
): Record<string, string> => ({
  locale: faker.helpers.arrayElement(['en-US', 'de', 'es', 'fr-FR']),
  offeringId: faker.helpers.arrayElement([
    'vpn',
    'relay-phone',
    'relay-email',
    'hubs',
    'mdnplus',
  ]),
  interval: faker.helpers.enumValue(SubplatInterval),
  cartId: faker.string.uuid(),
  ...override,
});

export const CommonMetricsFactory = (
  override?: Partial<CommonMetrics>
): CommonMetrics => ({
  ipAddress: faker.internet.ip(),
  deviceType: faker.string.alphanumeric(),
  userAgent: faker.internet.userAgent(),
  params: {},
  searchParams: {},
  experimentationId: faker.string.uuid(),
  ...override,
});

export const CartMetricsFactory = (
  override?: Partial<CartMetrics>
): CartMetrics => {
  const resultCart = ResultCartFactory({
    ...override,
  });

  return {
    uid: resultCart.uid,
    errorReasonId: resultCart.errorReasonId,
    couponCode: resultCart.couponCode,
    currency: faker.finance.currencyCode().toLowerCase(),
    stripeCustomerId: `cus_${faker.string.alphanumeric({ length: 14 })}`,
    taxAddress: resultCart.taxAddress,
    ...override,
  };
};

export const CmsMetricsDataFactory = (
  override?: Partial<CmsMetricsData>
): CmsMetricsData => ({
  productId: `product_${faker.string.alphanumeric({ length: 14 })}`,
  priceId: `price_${faker.string.alphanumeric({ length: 14 })}`,
  ...override,
});

export const SubscriptionCancellationDataFactory = (
  override?: Partial<SubscriptionCancellationData>
): SubscriptionCancellationData => {
  return {
    offeringId: faker.helpers.arrayElement([
      'vpn',
      'relay-phone',
      'relay-email',
      'hubs',
      'mdnplus',
    ]),
    interval: faker.helpers.enumValue(SubplatInterval),
    cancellationReason: faker.helpers.enumValue(CancellationReason),
    providerEventId: faker.string.uuid(),
    ...override,
  };
};

export const ExperimentationDataFactory = (
  override?: Partial<ExperimentationData>
): ExperimentationData => ({
  nimbusUserId: faker.string.uuid(),
  ...override,
});

export const GenericGleanSubManageEventFactory = (
  override?: Partial<GenericGleanSubManageEvent>
): GenericGleanSubManageEvent => ({
  eventName: faker.string.alpha({ length: 10 }),
  uid: faker.string.uuid(),
  commonMetrics: CommonMetricsFactory(),
  subscriptionId: `sub_${faker.string.alphanumeric({ length: 14 })}`,
  ...override,
});

export const StripeMetricsDataFactory = (
  override?: Partial<StripeMetricsData>
): StripeMetricsData => ({
  ...override,
});

export const StripeMetricsDataPopulatedFactory = (
  override?: Partial<StripeMetricsData>
): StripeMetricsData => ({
  customerId: `cus_${faker.string.alphanumeric({ length: 14 })}`,
  couponCode: faker.string.alpha({ length: 10 }),
  currency: faker.finance.currencyCode().toLowerCase(),
  taxAddress: TaxAddressFactory(),
  productId: `prod_${faker.string.alphanumeric({ length: 14 })}`,
  priceId: `price_${faker.string.alphanumeric({ length: 14 })}`,
  ...override,
});

export const AccountsMetricsDataFactory = (
  override?: Partial<AccountsMetricsData>
): AccountsMetricsData => ({
  uid: faker.string.uuid(),
  metricsOptOut: faker.datatype.boolean(),
  ...override,
});
export const SubPlatCmsMetricsDataFactory = (
  override?: Partial<SubPlatCmsMetricsData>
): SubPlatCmsMetricsData => ({
  ...override,
});

export const SessionMetricsDataFactory = (
  override?: Partial<SessionMetricsData>
): SessionMetricsData => ({
  ipAddress: faker.internet.ip(),
  deviceType: faker.string.alpha({ length: 10 }),
  userAgent: faker.string.alpha({ length: 10 }),
  ...override,
});

export const GleanMetricsDataFactory = (
  override?: Partial<GleanMetricsData>
): GleanMetricsData => ({
  stripe: StripeMetricsDataFactory(),
  accounts: AccountsMetricsDataFactory(),
  cms: SubPlatCmsMetricsDataFactory(),
  session: SessionMetricsDataFactory(),
  experimentation: ExperimentationDataFactory(),
  ...override,
});

export const PageViewEventFactory = (override?: Partial<PageMetricsData>) => ({
  pageName: faker.helpers.arrayElement<PageName>([
    'management',
    'stay_standard',
    'cancel_standard',
  ]),
  source: faker.helpers.arrayElement<Source>([
    'email',
    'internal_nav',
    'deep_link',
  ]),
  offeringId: faker.string.alphanumeric(8),
  interval: faker.helpers.enumValue(SubplatInterval),
  ...override,
});

export const RetentionFlowEventFactory = (
  override?: Partial<RetentionFlowEventMetricsData>
) => ({
  flowType: faker.helpers.arrayElement<FlowType>(['cancel', 'stay']),
  step: faker.helpers.arrayElement<Step>(['engage', 'submit', 'result']),
  outcome: faker.helpers.arrayElement<Outcome>(['success', 'error']),
  offeringId: faker.string.alphanumeric(8),
  interval: faker.helpers.enumValue(SubplatInterval),
  ...override,
});

export const RetentionEligibilityFactory = (
  override?: Partial<RetentionEligibilityMetricsData>
) => ({
  product: faker.helpers.arrayElement([
    'vpn',
    'relaypremiumphone',
    'relaypremium',
    'mdnplus5m',
    'mdnplus10m',
    'mdnplus5y',
    'mdnplus10y',
  ]),
  interval: faker.helpers.arrayElement(['monthly', 'yearly']),
  eligibilityStatus: faker.helpers.arrayElement([
    'eligible_for_stay',
    'eligible_for_cancel',
    'eligible_for_offer',
  ]),
  ...override,
});
