/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { PaymentsMetricsAggregatorService } from './payments-metrics-aggregator.service';

export const MockPaymentsMetricsAggregatorServiceFactory = {
  provide: PaymentsMetricsAggregatorService,
  useFactory: () =>
    ({
      handleUserDelete: () => {},
      recordGenericSubManageEvent: () => {},
      retrieveSubManageMetricsData: () => {},
      mapStripeMetricsData: () => {},
      mapAccountsMetricsData: () => {},
      mapSubPlatCmsMetricsData: () => {},
      mapSessionMetricsData: () => {},
      mapExperimentationMetricsData: () => {},
    }) as any,
};
