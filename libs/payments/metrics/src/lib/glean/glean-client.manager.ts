/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Glean from '@mozilla/glean/web';
import { Injectable } from '@nestjs/common';
import * as subscriptions from './__generated__/subscriptions';
import { PaymentsGleanClientConfig } from './glean.config';
import type {
  PageMetricsData,
  RetentionFlowEventMetricsData,
} from './glean.types';

@Injectable()
export class PaymentsGleanClientManager {
  private initialized = false;

  constructor(private paymentsGleanClientConfig: PaymentsGleanClientConfig) {}

  initialize() {
    if (this.initialized) return;
    if (typeof window === 'undefined') return;
    if (!this.isEnabled) return;

    try {
      Glean.initialize(
        this.paymentsGleanClientConfig.applicationId,
        this.isEnabled,
        {
          appDisplayVersion: this.paymentsGleanClientConfig.version,
          channel: this.paymentsGleanClientConfig.channel,
        }
      );

      this.initialized = true;
    } catch (err) {
      console.warn('Payments Glean client initialization failed', err);
    }
  }

  recordPageView(args: PageMetricsData) {
    this.recordWithGlean(() =>
      subscriptions.pageView.record(this.mapPageViewToGlean(args))
    );
  }

  recordRetentionFlow(args: RetentionFlowEventMetricsData) {
    this.recordWithGlean(() =>
      subscriptions.retentionFlow.record(this.mapRetentionFlowToGlean(args))
    );
  }

  recordInterstitialOffer(args: RetentionFlowEventMetricsData) {
    this.recordWithGlean(() =>
      subscriptions.interstitialOffer.record(this.mapRetentionFlowToGlean(args))
    );
  }

  private get isEnabled() {
    return (
      this.paymentsGleanClientConfig.enabled && process.env['CI'] !== 'true'
    );
  }

  private recordWithGlean(fn: () => void) {
    if (typeof window === 'undefined') return;
    if (!this.initialized) {
      this.initialize();
    }
    if (!this.isEnabled) return;

    try {
      fn();
    } catch (err) {
      console.warn('Glean client metric record failed', err);
    }
  }

  private mapPageViewToGlean(pageMetrics: PageMetricsData) {
    return {
      page_name: pageMetrics.pageName,
      page_variant: pageMetrics.pageVariant ?? '',
      source: pageMetrics.source ?? '',
      offering_id: pageMetrics.offeringId ?? '',
      interval: pageMetrics.interval ?? '',
    };
  }

  private mapRetentionFlowToGlean(
    retentionFlowMetrics: RetentionFlowEventMetricsData
  ) {
    return {
      flow_type: retentionFlowMetrics.flowType,
      step: retentionFlowMetrics.step,
      outcome: retentionFlowMetrics.outcome,
      error_reason: retentionFlowMetrics.errorReason ?? '',
      offering_id: retentionFlowMetrics.offeringId ?? '',
      interval: retentionFlowMetrics.interval ?? '',
      eligibility_status: retentionFlowMetrics.eligibilityStatus ?? '',
      entrypoint: retentionFlowMetrics.entrypoint ?? '',
      utm_source: retentionFlowMetrics.utmSource ?? '',
      utm_medium: retentionFlowMetrics.utmMedium ?? '',
      utm_campaign: retentionFlowMetrics.utmCampaign ?? '',
      nimbus_user_id: retentionFlowMetrics.nimbusUserId ?? '',
    };
  }
}
