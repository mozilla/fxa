/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import {
  CartMetrics,
  CmsMetricsData,
  CommonMetrics,
  type SubscriptionCancellationData,
} from '../glean.types';
import { determineCheckoutType } from './determineCheckoutType';
import { mapParams } from './mapParams';
import { normalizeGleanFalsyValues } from './normalizeGleanFalsyValues';

/**
 * When necessary, properties populated by PLACEHOLDER_VALUE should
 * be provided by the event emitter, and populated by the appropriate
 * event handler.
 */
const PLACEHOLDER_VALUE = '';

export function mapSubscription({
  commonMetricsData,
  cartMetricsData,
  cmsMetricsData,
  subscriptionCancellationData,
}: {
  commonMetricsData: CommonMetrics;
  cartMetricsData: CartMetrics;
  cmsMetricsData: CmsMetricsData;
  subscriptionCancellationData?: SubscriptionCancellationData;
}) {
  const mappedParams = mapParams(commonMetricsData.params);
  return {
    subscription_checkout_type: determineCheckoutType(
      cartMetricsData.uid,
      commonMetricsData.searchParams['newAccount']
    ),
    subscription_currency: normalizeGleanFalsyValues(cartMetricsData.currency),
    subscription_error_id: normalizeGleanFalsyValues(
      cartMetricsData.errorReasonId
    ),
    subscription_interval:
      normalizeGleanFalsyValues(subscriptionCancellationData?.interval) ||
      mappedParams.interval,
    subscription_offering_id:
      normalizeGleanFalsyValues(subscriptionCancellationData?.offeringId) ||
      mappedParams.offeringId,
    subscription_payment_provider: PLACEHOLDER_VALUE,
    subscription_plan_id: normalizeGleanFalsyValues(cmsMetricsData.priceId),
    subscription_product_id: normalizeGleanFalsyValues(
      cmsMetricsData.productId
    ),
    subscription_promotion_code: normalizeGleanFalsyValues(
      cartMetricsData.couponCode
    ),
    subscription_subscribed_plan_ids: PLACEHOLDER_VALUE,
    subscription_cancellation_reason: normalizeGleanFalsyValues(
      subscriptionCancellationData?.cancellationReason
    ),
    subscription_provider_event_id: normalizeGleanFalsyValues(
      subscriptionCancellationData?.providerEventId
    ),
  };
}
