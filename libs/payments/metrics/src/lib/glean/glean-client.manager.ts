/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Glean from '@mozilla/glean/web';
import * as subscriptions from './__generated__/subscriptions';
import type { PaymentsGleanClientConfig } from './glean.config';
import type {
  PageMetricsData,
  RetentionFlowCommonData,
  RetentionFlowEngageData,
  RetentionFlowSubmitData,
  RetentionFlowResultData,
  InterstitialOfferCommonData,
  InterstitialOfferViewData,
  InterstitialOfferEngageData,
  InterstitialOfferSubmitData,
  InterstitialOfferResultData,
} from './glean.types';

function stripUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  ) as Partial<T>;
}

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
        this.paymentsGleanClientConfig.uploadEnabled,
        {
          appDisplayVersion: this.paymentsGleanClientConfig.version,
          channel: this.paymentsGleanClientConfig.channel,
          ...(this.paymentsGleanClientConfig.serverEndpoint && {
            serverEndpoint: this.paymentsGleanClientConfig.serverEndpoint,
          }),
        }
      );

      if (this.paymentsGleanClientConfig.logPings) {
        Glean.setLogPings(this.paymentsGleanClientConfig.logPings);
      }
      if (this.paymentsGleanClientConfig.debugViewTag) {
        Glean.setDebugViewTag(this.paymentsGleanClientConfig.debugViewTag);
      }

      this.initialized = true;
    } catch (err) {
      console.warn('Payments Glean client initialization failed', err);
    }
  }

  recordPageView(args: PageMetricsData) {
    const mapped = this.mapPageViewToGlean(args);
    this.recordWithGlean(() => subscriptions.pageView.record(mapped));
  }

  recordRetentionFlowView(args: RetentionFlowCommonData) {
    const mapped = this.mapRetentionFlowToGlean({ ...args, step: 'view' });
    this.recordWithGlean(() => subscriptions.retentionFlow.record(mapped));
  }

  recordRetentionFlowEngage(args: RetentionFlowEngageData) {
    const mapped = this.mapRetentionFlowToGlean({ ...args, step: 'engage' });
    this.recordWithGlean(() => subscriptions.retentionFlow.record(mapped));
  }

  recordRetentionFlowSubmit(args: RetentionFlowSubmitData) {
    const mapped = this.mapRetentionFlowToGlean({ ...args, step: 'submit' });
    this.recordWithGlean(() => subscriptions.retentionFlow.record(mapped));
  }

  recordRetentionFlowResult(args: RetentionFlowResultData) {
    const mapped = this.mapRetentionFlowToGlean({ ...args, step: 'result' });
    this.recordWithGlean(() => subscriptions.retentionFlow.record(mapped));
  }

  recordInterstitialOfferView(args: InterstitialOfferViewData) {
    const mapped = this.mapInterstitialOfferToGlean({ ...args, step: 'view' });
    this.recordWithGlean(() => subscriptions.interstitialOffer.record(mapped));
  }

  recordInterstitialOfferEngage(args: InterstitialOfferEngageData) {
    const mapped = this.mapInterstitialOfferToGlean({
      ...args,
      step: 'engage',
    });
    this.recordWithGlean(() => subscriptions.interstitialOffer.record(mapped));
  }

  recordInterstitialOfferSubmit(args: InterstitialOfferSubmitData) {
    const mapped = this.mapInterstitialOfferToGlean({
      ...args,
      step: 'submit',
    });
    this.recordWithGlean(() => subscriptions.interstitialOffer.record(mapped));
  }

  recordInterstitialOfferResult(args: InterstitialOfferResultData) {
    const mapped = this.mapInterstitialOfferToGlean({
      ...args,
      step: 'result',
    });
    this.recordWithGlean(() => subscriptions.interstitialOffer.record(mapped));
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
    return stripUndefined({
      page_name: pageMetrics.pageName,
      entrypoint: pageMetrics.entrypoint,
    });
  }

  private mapRetentionFlowToGlean(
    metrics: RetentionFlowCommonData & {
      step: string;
      action?: string;
      outcome?: string;
      errorReason?: string;
    }
  ) {
    return stripUndefined({
      step: metrics.step,
      flow_type: metrics.flowType,
      eligibility_status: metrics.eligibilityStatus,
      action: metrics.action,
      outcome: metrics.outcome,
      error_reason: metrics.errorReason,
      offering_id: metrics.offeringId,
      interval: metrics.interval,
      entrypoint: metrics.entrypoint,
      utm_source: metrics.utmSource,
      utm_medium: metrics.utmMedium,
      utm_campaign: metrics.utmCampaign,
      nimbus_user_id: metrics.nimbusUserId,
    });
  }

  private mapInterstitialOfferToGlean(
    metrics: InterstitialOfferCommonData & {
      step: string;
      action?: string;
      outcome?: string;
      errorReason?: string;
    }
  ) {
    return stripUndefined({
      entrypoint: metrics.entrypoint,
      step: metrics.step,
      action: metrics.action,
      outcome: metrics.outcome,
      error_reason: metrics.errorReason,
      offering_id: metrics.offeringId,
      interval: metrics.interval,
      nimbus_user_id: metrics.nimbusUserId,
      utm_source: metrics.utmSource,
      utm_medium: metrics.utmMedium,
      utm_campaign: metrics.utmCampaign,
    });
  }
}
