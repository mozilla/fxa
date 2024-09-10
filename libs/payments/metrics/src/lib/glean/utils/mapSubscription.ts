/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { CmsMetricsData, FxaPaySetupMetrics } from '../glean.types';
import { mapParams } from './mapParams';
import { normalizeGleanFalsyValues } from './normalizeGleanFalsyValues';

/**
 * When necessary, properties populated by PLACEHOLDER_VALUE should
 * be provided by the event emitter, and populated by the appropriate
 * event handler.
 */
const PLACEHOLDER_VALUE = '';

export function mapSubscription({
  metricsData,
  cmsMetricsData,
}: {
  metricsData: FxaPaySetupMetrics;
  cmsMetricsData: CmsMetricsData;
}) {
  const mappedParams = mapParams(metricsData.params);
  return {
    subscription_checkout_type: PLACEHOLDER_VALUE,
    subscription_currency: normalizeGleanFalsyValues(metricsData.currency),
    subscription_error_id: normalizeGleanFalsyValues(metricsData.errorReasonId),
    subscription_interval: mappedParams.interval,
    subscription_offering_id: mappedParams.offeringId,
    subscription_payment_provider: PLACEHOLDER_VALUE,
    subscription_plan_id: cmsMetricsData.priceId,
    subscription_product_id: cmsMetricsData.productId,
    subscription_promotion_code: normalizeGleanFalsyValues(
      metricsData.couponCode
    ),
    subscription_subscribed_plan_ids: PLACEHOLDER_VALUE,
  };
}
