/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import {
  CartMetrics,
  CmsMetricsData,
  CommonMetrics,
  PaymentProvidersType,
  PaymentsGleanProvider,
  SubscriptionCancellationData,
} from './glean.types';
import { Inject, Injectable } from '@nestjs/common';
import { type PaymentsGleanServerEventsLogger } from './glean.provider';
import { mapSession } from './utils/mapSession';
import { mapUtm } from './utils/mapUtm';
import { mapSubscription } from './utils/mapSubscription';
import { mapRelyingParty } from './utils/mapRelyingParty';
import { normalizeGleanFalsyValues } from './utils/normalizeGleanFalsyValues';
import { PaymentsGleanConfig } from './glean.config';
import { mapSubscriptionCancellation } from './utils/mapSubscriptionCancellation';

@Injectable()
export class PaymentsGleanManager {
  constructor(
    private paymentsGleanConfig: PaymentsGleanConfig,
    @Inject(PaymentsGleanProvider)
    private paymentsGleanServerEventsLogger: PaymentsGleanServerEventsLogger
  ) {}

  recordFxaPaySetupView(metrics: {
    commonMetricsData: CommonMetrics;
    cartMetricsData: CartMetrics;
    cmsMetricsData: CmsMetricsData;
  }) {
    if (this.paymentsGleanConfig.enabled) {
      this.paymentsGleanServerEventsLogger.recordPaySetupView(
        this.populateCommonMetrics(metrics)
      );
    }
  }

  recordFxaPaySetupEngage(metrics: {
    commonMetricsData: CommonMetrics;
    cartMetricsData: CartMetrics;
    cmsMetricsData: CmsMetricsData;
  }) {
    if (this.paymentsGleanConfig.enabled) {
      this.paymentsGleanServerEventsLogger.recordPaySetupEngage(
        this.populateCommonMetrics(metrics)
      );
    }
  }

  recordFxaPaySetupSubmit(
    metrics: {
      commonMetricsData: CommonMetrics;
      cartMetricsData: CartMetrics;
      cmsMetricsData: CmsMetricsData;
    },
    paymentProvider?: PaymentProvidersType
  ) {
    if (this.paymentsGleanConfig.enabled) {
      this.paymentsGleanServerEventsLogger.recordPaySetupSubmit({
        ...this.populateCommonMetrics(metrics),
        subscription_payment_provider:
          normalizeGleanFalsyValues(paymentProvider),
      });
    }
  }

  recordFxaPaySetupSuccess(
    metrics: {
      commonMetricsData: CommonMetrics;
      cartMetricsData: CartMetrics;
      cmsMetricsData: CmsMetricsData;
    },
    paymentProvider?: PaymentProvidersType
  ) {
    const commonMetrics = this.populateCommonMetrics(metrics);

    if (this.paymentsGleanConfig.enabled) {
      this.paymentsGleanServerEventsLogger.recordPaySetupSuccess({
        ...commonMetrics,
        subscription_payment_provider:
          normalizeGleanFalsyValues(paymentProvider),
      });
    }
  }

  recordFxaPaySetupFail(
    metrics: {
      commonMetricsData: CommonMetrics;
      cartMetricsData: CartMetrics;
      cmsMetricsData: CmsMetricsData;
    },
    paymentProvider?: PaymentProvidersType
  ) {
    const commonMetrics = this.populateCommonMetrics(metrics);

    if (this.paymentsGleanConfig.enabled) {
      this.paymentsGleanServerEventsLogger.recordPaySetupFail({
        ...commonMetrics,
        subscription_payment_provider:
          normalizeGleanFalsyValues(paymentProvider),
      });
    }
  }

  recordSubscribeSubscriptionEnded(
    metrics: {
      cmsMetricsData: CmsMetricsData;
      cancellationMetrics: SubscriptionCancellationData;
    },
    offeringId?: string,
    interval?: string,
    paymentProvider?: PaymentProvidersType
  ) {
    const commonMetrics = this.populateCommonMetrics({
      cmsMetricsData: metrics.cmsMetricsData,
      subscriptionCancellationData: metrics.cancellationMetrics,
    });

    if (this.paymentsGleanConfig.enabled) {
      this.paymentsGleanServerEventsLogger.recordSubscribeSubscriptionEnded({
        ...commonMetrics,
        subscription_offering_id: normalizeGleanFalsyValues(offeringId),
        subscription_interval: normalizeGleanFalsyValues(interval),
        subscription_payment_provider:
          normalizeGleanFalsyValues(paymentProvider),
      });
    }
  }

  private populateCommonMetrics(metrics: {
    commonMetricsData?: CommonMetrics;
    cartMetricsData?: CartMetrics;
    cmsMetricsData?: CmsMetricsData;
    subscriptionCancellationData?: SubscriptionCancellationData;
  }) {
    const emptyCommonMetricsData: CommonMetrics = {
      ipAddress: '',
      deviceType: '',
      userAgent: '',
      params: {},
      searchParams: {},
    };
    const emptyCartMetricsData: CartMetrics = {
      uid: '',
      errorReasonId: null,
      couponCode: '',
      currency: '',
    };
    const emptyCmsMetricsData: CmsMetricsData = {
      priceId: '',
      productId: '',
    };
    const emptySubscriptionCancellationData: SubscriptionCancellationData = {
      voluntary: false,
      providerEventId: '',
      subscriptionId: '',
    };

    const commonMetricsData =
      metrics.commonMetricsData || emptyCommonMetricsData;
    const cartMetricsData = metrics.cartMetricsData || emptyCartMetricsData;
    const cmsMetricsData = metrics.cmsMetricsData || emptyCmsMetricsData;
    const subscriptionCancellationData =
      metrics.subscriptionCancellationData || emptySubscriptionCancellationData;
    return {
      user_agent: commonMetricsData.userAgent,
      ip_address: commonMetricsData.ipAddress,
      ...mapRelyingParty(commonMetricsData.searchParams),
      ...mapSession(
        commonMetricsData.searchParams,
        commonMetricsData.deviceType
      ),
      ...mapSubscription({
        commonMetricsData,
        cartMetricsData,
        cmsMetricsData,
      }),
      ...mapUtm(commonMetricsData.searchParams),
      ...mapSubscriptionCancellation(subscriptionCancellationData),
    };
  }
}
