/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { MemoryRouter } from 'react-router';
import UpdateFirefox from '.';
import { MetricsFlow } from '../../lib/metrics-flow';

export const MOCK_METRICS_FLOW: MetricsFlow = {
  deviceId: '0123456789abcdef0123456789abcdef',
  flowBeginTime: 1700000000000,
  flowId: 'a'.repeat(64),
};

export const Subject = ({
  search = '?context=fx_desktop_v1&service=sync',
  metricsFlow = MOCK_METRICS_FLOW,
}: {
  search?: string;
  metricsFlow?: MetricsFlow | null;
}) => (
  <MemoryRouter initialEntries={[`/update_firefox${search}`]}>
    <UpdateFirefox {...{ metricsFlow }} />
  </MemoryRouter>
);
