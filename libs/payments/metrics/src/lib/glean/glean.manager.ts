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
  type AccountsMetricsData,
  type ExperimentationData,
  type SessionMetricsData,
  type StripeMetricsData,
  type SubPlatCmsMetricsData,
} from './glean.types';
import { Inject, Injectable } from '@nestjs/common';
import { PaymentProvidersType } from '@fxa/payments/customer';
import { type PaymentsGleanServerEventsLogger } from './glean.provider';
import { mapSession } from './utils/mapSession';
import { mapUtm } from './utils/mapUtm';
import { mapSubscription } from './utils/mapSubscription';
import { mapRelyingParty } from './utils/mapRelyingParty';
import { normalizeGleanFalsyValues } from './utils/normalizeGleanFalsyValues';
import { PaymentsGleanConfig } from './glean.config';
import { determineCheckoutType } from './utils/determineCheckoutType';

type MethodNames<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? K : never;
}[keyof T];

function isMethodName<T extends object>(
  obj: T,
  key: PropertyKey
): key is MethodNames<T> {
  return key in obj && typeof (obj as any)[key] === 'function';
}

/**
 * When necessary, properties populated by PLACEHOLDER_VALUE should
 * be provided by the event emitter, and populated by the appropriate
 * event handler.
 */
const PLACEHOLDER_FUTURE_USE = '';

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
    paymentProvider?: PaymentProvidersType
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
    paymentProvider?: PaymentProvidersType
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
    paymentProvider?: PaymentProvidersType
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
    paymentProvider?: PaymentProvidersType
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

  recordGenericEvent(
    eventName: string,
    metrics: {
      commonMetricsData: CommonMetrics;
      stripe: StripeMetricsData;
      accounts: AccountsMetricsData;
      cms: SubPlatCmsMetricsData;
      session: SessionMetricsData;
      experimentation: ExperimentationData;
      subscriptionCancellationData?: SubscriptionCancellationData;
    }
  ) {
    if (
      this.isEnabled &&
      isMethodName(this.paymentsGleanServerEventsLogger, eventName)
    ) {
      this.paymentsGleanServerEventsLogger[eventName](
        this.mapMetricsToGleanFormat(metrics)
      );
    }
  }

  private mapMetricsToGleanFormat({
    commonMetricsData,
    stripe,
    accounts,
    cms,
    session,
    experimentation,
    subscriptionCancellationData,
  }: {
    commonMetricsData: CommonMetrics;
    stripe: StripeMetricsData;
    accounts: AccountsMetricsData;
    cms: SubPlatCmsMetricsData;
    session: SessionMetricsData;
    experimentation: ExperimentationData;
    subscriptionCancellationData?: SubscriptionCancellationData;
  }) {
    const { searchParams } = commonMetricsData;
    return {
      user_agent: session.userAgent,
      ip_address: session.ipAddress,
      relying_party_oauth_client_id: '',
      relying_party_service: searchParams['service'] ?? '',
      session_device_type: session.deviceType,
      session_entrypoint_experiment: PLACEHOLDER_FUTURE_USE,
      session_entrypoint_variation: PLACEHOLDER_FUTURE_USE,
      session_entrypoint: searchParams['entrypoint'] ?? '',
      session_flow_id: searchParams['flow_id'] ?? '',
      subscription_checkout_type: determineCheckoutType(
        accounts.uid,
        commonMetricsData.searchParams['newAccount']
      ),
      subscription_currency: stripe.currency ?? '',
      subscription_error_id: PLACEHOLDER_FUTURE_USE,
      subscription_interval: cms.interval ?? '',
      subscription_offering_id: cms.offeringId ?? '',
      subscription_payment_provider: PLACEHOLDER_FUTURE_USE,
      subscription_plan_id: stripe.priceId ?? '',
      subscription_product_id: stripe.productId ?? '',
      subscription_promotion_code: stripe.couponCode ?? '',
      subscription_subscribed_plan_ids: PLACEHOLDER_FUTURE_USE,
      subscription_cancellation_reason:
        subscriptionCancellationData?.cancellationReason ?? '',
      subscription_provider_event_id:
        subscriptionCancellationData?.providerEventId ?? '',
      utm_campaign: searchParams['utm_campaign'] ?? '',
      utm_content: searchParams['utm_content'] ?? '',
      utm_medium: searchParams['utm_medium'] ?? '',
      utm_source: searchParams['utm_source'] ?? '',
      utm_term: searchParams['utm_term'] ?? '',
      nimbus_user_id: experimentation.nimbusUserId,
    };
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
        subscriptionCancellationData,
      }),
      ...mapUtm(commonMetricsData.searchParams),
      nimbus_user_id: experimentationData.nimbusUserId,
    };
  }

  private get isEnabled() {
    return this.paymentsGleanConfig.enabled && process.env['CI'] !== 'true';
  }
}
