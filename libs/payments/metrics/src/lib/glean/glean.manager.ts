/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  CancellationReason,
  CartMetrics,
  CmsMetricsData,
  CommonMetrics,
  PaymentsGleanProvider,
  SubscriptionCancellationData,
  type ExperimentationData,
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
import type { SubPlatPaymentMethodType } from '@fxa/payments/customer';

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
    experimentationData: ExperimentationData;
  }) {
    if (this.isEnabled) {
      this.paymentsGleanServerEventsLogger.recordPaySetupView(
        this.populateCommonMetrics(metrics)
      );
    }
  }

  recordFxaPaySetupEngage(metrics: {
    commonMetricsData: CommonMetrics;
    cartMetricsData: CartMetrics;
    cmsMetricsData: CmsMetricsData;
    experimentationData: ExperimentationData;
  }) {
    if (this.isEnabled) {
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
      experimentationData: ExperimentationData;
    },
    paymentProvider?: SubPlatPaymentMethodType
  ) {
    if (this.isEnabled) {
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
      experimentationData: ExperimentationData;
    },
    paymentProvider?: SubPlatPaymentMethodType
  ) {
    const commonMetrics = this.populateCommonMetrics(metrics);

    if (this.isEnabled) {
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
      experimentationData: ExperimentationData;
    },
    paymentProvider?: SubPlatPaymentMethodType
  ) {
    const commonMetrics = this.populateCommonMetrics(metrics);

    if (this.isEnabled) {
      this.paymentsGleanServerEventsLogger.recordPaySetupFail({
        ...commonMetrics,
        subscription_payment_provider:
          normalizeGleanFalsyValues(paymentProvider),
      });
    }
  }

  recordFxaSubscriptionEnded(
    metrics: {
      cmsMetricsData: CmsMetricsData;
      subscriptionCancellationData: SubscriptionCancellationData;
    },
    paymentProvider?: SubPlatPaymentMethodType
  ) {
    const commonMetrics = this.populateCommonMetrics(metrics);

    if (this.isEnabled) {
      this.paymentsGleanServerEventsLogger.recordSubscriptionEnded({
        ...commonMetrics,
        subscription_payment_provider:
          normalizeGleanFalsyValues(paymentProvider),
      });
    }
  }

  private populateCommonMetrics(metrics: {
    commonMetricsData?: CommonMetrics;
    cartMetricsData?: CartMetrics;
    cmsMetricsData?: CmsMetricsData;
    experimentationData?: ExperimentationData;
    subscriptionCancellationData?: SubscriptionCancellationData;
  }) {
    const emptyCommonMetricsData: CommonMetrics = {
      ipAddress: '',
      deviceType: '',
      userAgent: '',
      experimentationId: '',
      params: {},
      searchParams: {},
    };
    const emptyCartMetricsData: CartMetrics = {
      stripeCustomerId: '',
      uid: '',
      errorReasonId: null,
      couponCode: '',
      currency: '',
      taxAddress: { countryCode: '', postalCode: '' },
    };
    const emptyCmsMetricsData: CmsMetricsData = {
      priceId: '',
      productId: '',
    };
    const emptySubscriptionCancellationData: SubscriptionCancellationData = {
      offeringId: '',
      interval: '',
      cancellationReason: CancellationReason.Involuntary,
      providerEventId: '',
    };
    const emptyExperimentationData: ExperimentationData = {
      nimbusUserId: '',
    };
    const commonMetricsData =
      metrics.commonMetricsData || emptyCommonMetricsData;
    const cartMetricsData = metrics.cartMetricsData || emptyCartMetricsData;
    const cmsMetricsData = metrics.cmsMetricsData || emptyCmsMetricsData;
    const subscriptionCancellationData =
      metrics.subscriptionCancellationData || emptySubscriptionCancellationData;
    const experimentationData =
      metrics.experimentationData || emptyExperimentationData;
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
      nimbus_user_id: experimentationData.nimbusUserId,
    };
  }

  private get isEnabled() {
    return this.paymentsGleanConfig.enabled && process.env['CI'] !== 'true';
  }
}
