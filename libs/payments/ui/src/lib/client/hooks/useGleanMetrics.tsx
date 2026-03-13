/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use client';

import { useContext, useMemo } from 'react';
import {
  PaymentsGleanClientManager,
  type PageMetricsData,
  type RetentionFlowEventMetricsData,
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
      recordRetentionFlow(data: RetentionFlowEventMetricsData) {
        manager?.recordRetentionFlow(data);
      },
      recordInterstitialOffer(data: RetentionFlowEventMetricsData) {
        manager?.recordInterstitialOffer(data);
      },
    }),
    [manager]
  );
}
