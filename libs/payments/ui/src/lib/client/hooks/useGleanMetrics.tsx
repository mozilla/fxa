/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use client';

import { useContext, useMemo } from 'react';
import {
  PaymentsGleanClientManager,
  type PageMetricsData,
  type RetentionFlowCommonData,
  type RetentionFlowEngageData,
  type RetentionFlowSubmitData,
  type RetentionFlowResultData,
  type InterstitialOfferViewData,
  type InterstitialOfferEngageData,
  type InterstitialOfferSubmitData,
  type InterstitialOfferResultData,
} from '@fxa/payments/metrics/client';
import { ConfigContext } from '../providers/ConfigProvider';

export function useGleanMetrics(metricsEnabled: boolean) {
  const { glean } = useContext(ConfigContext);

  const manager = useMemo(() => {
    if (!metricsEnabled || !glean) return null;
    return new PaymentsGleanClientManager(glean);
  }, [metricsEnabled, glean]);

  return useMemo(
    () => ({
      recordPageView(data: PageMetricsData) {
        manager?.recordPageView(data);
      },
      recordRetentionFlowView(data: RetentionFlowCommonData) {
        manager?.recordRetentionFlowView(data);
      },
      recordRetentionFlowEngage(data: RetentionFlowEngageData) {
        manager?.recordRetentionFlowEngage(data);
      },
      recordRetentionFlowSubmit(data: RetentionFlowSubmitData) {
        manager?.recordRetentionFlowSubmit(data);
      },
      recordRetentionFlowResult(data: RetentionFlowResultData) {
        manager?.recordRetentionFlowResult(data);
      },
      recordInterstitialOfferView(data: InterstitialOfferViewData) {
        manager?.recordInterstitialOfferView(data);
      },
      recordInterstitialOfferEngage(data: InterstitialOfferEngageData) {
        manager?.recordInterstitialOfferEngage(data);
      },
      recordInterstitialOfferSubmit(data: InterstitialOfferSubmitData) {
        manager?.recordInterstitialOfferSubmit(data);
      },
      recordInterstitialOfferResult(data: InterstitialOfferResultData) {
        manager?.recordInterstitialOfferResult(data);
      },
    }),
    [manager]
  );
}
