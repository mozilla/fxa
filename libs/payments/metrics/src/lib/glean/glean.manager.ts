/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { CmsMetricsData, FxaPaySetupViewMetrics } from './glean.types';
import { Inject, Injectable } from '@nestjs/common';
import {
  PaymentsGleanProvider,
  type PaymentsGleanServerEventsLogger,
} from './glean.provider';
import { mapSession } from './utils/mapSession';
import { mapUtm } from './utils/mapUtm';
import { mapSubscription } from './utils/mapSubscription';
import { mapRelyingParty } from './utils/mapRelyingParty';
import { normalizeGleanFalsyValues } from './utils/normalizeGleanFalsyValues';

@Injectable()
export class PaymentsGleanManager {
  constructor(
    @Inject(PaymentsGleanProvider)
    private paymentsGleanServerEventsLogger: PaymentsGleanServerEventsLogger
  ) {}

  async recordFxaPaySetupView(
    metricsData: FxaPaySetupViewMetrics,
    cmsMetricsData: CmsMetricsData
  ) {
    const commonMetrics = this.populateCommonMetrics(
      metricsData,
      cmsMetricsData
    );

    const fxaPaySetupViewMetrics = {
      ...commonMetrics,
      subscription_checkout_type: metricsData.checkoutType,
    };

    //TODO - Add metrics validation as part of FXA-10135

    this.paymentsGleanServerEventsLogger.recordPaySetupView(
      fxaPaySetupViewMetrics
    );
  }

  private populateCommonMetrics(
    metricsData: FxaPaySetupViewMetrics,
    cmsMetricsData: CmsMetricsData
  ) {
    return {
      user_agent: metricsData.userAgent,
      ip_address: metricsData.ipAddress,
      account_user_id: normalizeGleanFalsyValues(metricsData.uid),
      ...mapRelyingParty(metricsData.searchParams),
      ...mapSession(metricsData.searchParams, metricsData.deviceType),
      ...mapSubscription({ metricsData, cmsMetricsData }),
      ...mapUtm(metricsData.searchParams),
    };
  }
}
