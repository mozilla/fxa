/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use client';

import { useEffect } from 'react';
import { useGleanMetrics } from '../hooks/useGleanMetrics';
import type { PageMetricsData } from '@fxa/payments/metrics/client';

export function GleanPageView({
  metricsEnabled,
  pageMetrics,
}: {
  metricsEnabled: boolean;
  pageMetrics: PageMetricsData;
}) {
  const glean = useGleanMetrics(metricsEnabled);

  useEffect(() => {
    glean.recordPageView(pageMetrics);
  }, []);

  return null;
}
