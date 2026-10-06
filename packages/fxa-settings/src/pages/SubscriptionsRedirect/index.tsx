/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useEffect } from 'react';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';
import { hardNavigate } from 'fxa-react/lib/utils';
import { currentAccount } from '../../lib/cache';
import { getMetricsFlow, MetricsFlow } from '../../lib/metrics-flow';
import { useConfig } from '../../models';

// payments-next landing signs the user in itself, so no token is passed.
export function getSubscriptionsRedirect({
  paymentsNextUrl,
  flow,
  metricsEnabled,
}: {
  paymentsNextUrl: string;
  flow: MetricsFlow | null;
  metricsEnabled: boolean;
}) {
  const params = new URLSearchParams();

  if (metricsEnabled && flow) {
    if (flow.deviceId) params.set('device_id', flow.deviceId);
    params.set('flow_begin_time', String(flow.flowBeginTime));
    params.set('flow_id', flow.flowId);
  }

  const query = params.toString();
  return `${paymentsNextUrl}/subscriptions/landing${query ? `?${query}` : ''}`;
}

const SubscriptionsRedirectPage = () => {
  const config = useConfig();

  useEffect(() => {
    hardNavigate(
      getSubscriptionsRedirect({
        paymentsNextUrl: config.servers.paymentsNext.url,
        flow: getMetricsFlow(),
        metricsEnabled: currentAccount()?.metricsEnabled !== false,
      })
    );
  }, [config]);

  return <LoadingSpinner fullScreen />;
};

export default SubscriptionsRedirectPage;
