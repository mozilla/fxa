/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import Emittery from 'emittery';
import { ProductConfigurationManager } from '@fxa/shared/cms';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { CartManager, TaxChangeAllowedStatus } from '@fxa/payments/cart';
import { PaymentsGleanManager } from '@fxa/payments/metrics';
import { LocationStatus } from '@fxa/payments/eligibility';
import {
  CheckoutEvents,
  CheckoutPaymentEvents,
  PaymentsEmitterEvents,
  SP3RolloutEvent,
  SubscriptionEndedEvents,
  type AuthEvents,
} from './emitter.types';
import { AccountManager } from '@fxa/shared/account/account';
import { retrieveAdditionalMetricsData } from './util/retrieveAdditionalMetricsData';
import {
  getSubplatInterval,
  CustomerManager,
  SubscriptionManager,
  PaymentMethodManager,
  type SubPlatPaymentMethodType,
} from '@fxa/payments/customer';
import * as Sentry from '@sentry/nestjs';
import { StatsD, StatsDService } from '@fxa/shared/metrics/statsd';
import { EmitterServiceHandleAuthError } from './emitter.error';
import { NimbusManager } from '@fxa/payments/experiments';

@Injectable()
export class PaymentsEmitterService {
  private emitter: Emittery<PaymentsEmitterEvents>;

  constructor(
    private accountManager: AccountManager,
    private cartManager: CartManager,
    private customerManager: CustomerManager,
    private log: Logger,
    private nimbusManager: NimbusManager,
    private paymentsGleanManager: PaymentsGleanManager,
    private paymentMethodManager: PaymentMethodManager,
    private productConfigurationManager: ProductConfigurationManager,
    @Inject(StatsDService) public statsd: StatsD,
    private subscriptionManager: SubscriptionManager
  ) {
    this.emitter = new Emittery<PaymentsEmitterEvents>();
    this.emitter.on('checkoutView', this.handleCheckoutView.bind(this));
    this.emitter.on('checkoutEngage', this.handleCheckoutEngage.bind(this));
    this.emitter.on('checkoutSubmit', this.handleCheckoutSubmit.bind(this));
    this.emitter.on('checkoutSuccess', this.handleCheckoutSuccess.bind(this));
    this.emitter.on('checkoutFail', this.handleCheckoutFail.bind(this));
    this.emitter.on(
      'subscriptionEnded',
      this.handleSubscriptionEnded.bind(this)
    );
    this.emitter.on('sp3Rollout', this.handleSP3Rollout.bind(this));
    this.emitter.on('locationView', this.handleLocationView.bind(this));
    this.emitter.on('auth', this.handleAuthEvent.bind(this));
  }

  getEmitter(): Emittery<PaymentsEmitterEvents> {
    return this.emitter;
  }

  async handleAuthEvent(eventData: AuthEvents) {
    const { type, errorMessage } = eventData;
    this.statsd.increment('auth_event', { type });

    if (errorMessage) {
      this.log.error(new EmitterServiceHandleAuthError(errorMessage));
    }
  }

  async handleCheckoutView(eventData: CheckoutEvents) {
    const additionalData = await retrieveAdditionalMetricsData(
      this.productConfigurationManager,
      this.cartManager,
      eventData.params
    );

    const metricsOptOut = await this.retrieveOptOut(
      additionalData.cartMetricsData.uid
    );

    if (!metricsOptOut) {
      let experiments;
      const generatedNimbusUserId = this.nimbusManager.generateNimbusId(
        additionalData.cartMetricsData.uid,
        eventData.experimentationId
      );
      try {
        experiments = await this.nimbusManager.fetchExperiments({
          nimbusUserId: generatedNimbusUserId,
          language: additionalData.locale,
          region: additionalData.cartMetricsData.taxAddress?.countryCode,
        });
      } catch (error) {
        this.log.error(error);
        Sentry.captureException(error);
      }

      const nimbusUserId =
        experiments?.Enrollments?.at(0)?.nimbus_user_id ||
        generatedNimbusUserId;

      this.paymentsGleanManager.recordFxaPaySetupView({
        commonMetricsData: eventData,
        ...additionalData,
        experimentationData: { nimbusUserId },
      });
    }
  }

  async handleCheckoutEngage(eventData: CheckoutEvents) {
    const additionalData = await retrieveAdditionalMetricsData(
      this.productConfigurationManager,
      this.cartManager,
      eventData.params
    );

    const metricsOptOut = await this.retrieveOptOut(
      additionalData.cartMetricsData.uid
    );
    if (!metricsOptOut) {
      this.paymentsGleanManager.recordFxaPaySetupEngage({
        commonMetricsData: eventData,
        ...additionalData,
      });
    }
  }

  async handleCheckoutSubmit(eventData: CheckoutPaymentEvents) {
    const additionalData = await retrieveAdditionalMetricsData(
      this.productConfigurationManager,
      this.cartManager,
      eventData.params
    );

    const metricsOptOut = await this.retrieveOptOut(
      additionalData.cartMetricsData.uid
    );
    if (!metricsOptOut) {
      this.paymentsGleanManager.recordFxaPaySetupSubmit(
        {
          commonMetricsData: eventData,
          ...additionalData,
        },
        eventData.paymentProvider
      );
    }
  }

  async handleCheckoutSuccess(eventData: CheckoutPaymentEvents) {
    const additionalData = await retrieveAdditionalMetricsData(
      this.productConfigurationManager,
      this.cartManager,
      eventData.params
    );

    const metricsOptOut = await this.retrieveOptOut(
      additionalData.cartMetricsData.uid
    );

    if (!metricsOptOut) {
      // Determine payment method type
      let paymentMethodType: SubPlatPaymentMethodType | undefined;
      if (additionalData.cartMetricsData.stripeCustomerId) {
        const { stripeCustomerId } = additionalData.cartMetricsData;
        const customer = await this.customerManager.retrieve(stripeCustomerId);
        const subscriptions =
          await this.subscriptionManager.listForCustomer(stripeCustomerId);
        const paymentMethodTypeResponse =
          await this.paymentMethodManager.determineType(
            customer,
            subscriptions
          );

        if (paymentMethodTypeResponse?.type) {
          paymentMethodType = paymentMethodTypeResponse.type;
        }
      }

      this.paymentsGleanManager.recordFxaPaySetupSuccess(
        {
          commonMetricsData: eventData,
          ...additionalData,
        },
        paymentMethodType
      );
    }
  }

  async handleCheckoutFail(eventData: CheckoutPaymentEvents) {
    const additionalData = await retrieveAdditionalMetricsData(
      this.productConfigurationManager,
      this.cartManager,
      eventData.params
    );

    const metricsOptOut = await this.retrieveOptOut(
      additionalData.cartMetricsData.uid
    );
    if (!metricsOptOut) {
      this.paymentsGleanManager.recordFxaPaySetupFail({
        commonMetricsData: eventData,
        ...additionalData,
      });
    }
  }

  async handleSubscriptionEnded(eventData: SubscriptionEndedEvents) {
    const {
      productId,
      priceId,
      priceInterval,
      priceIntervalCount,
      providerEventId,
      cancellationReason,
      uid,
    } = eventData;
    let offeringId: string | undefined;
    try {
      const cms =
        await this.productConfigurationManager.getPurchaseDetailsForEligibility(
          [priceId]
        );
      const offering = cms?.offeringForPlanId(priceId);
      offeringId = offering?.apiIdentifier;
    } catch (error) {
      Sentry.captureException(error);
    }

    const interval =
      priceInterval && priceIntervalCount
        ? getSubplatInterval(priceInterval, priceIntervalCount)
        : undefined;

    const metricsOptOut = await this.retrieveOptOut(uid);

    if (!metricsOptOut) {
      this.paymentsGleanManager.recordFxaSubscriptionEnded(
        {
          cmsMetricsData: {
            priceId,
            productId,
          },
          subscriptionCancellationData: {
            offeringId,
            interval,
            cancellationReason,
            providerEventId,
          },
        },
        eventData.paymentProvider
      );
    }
  }

  async handleSP3Rollout(eventData: SP3RolloutEvent) {
    const { version, offeringId, interval, shadowMode } = eventData;

    this.statsd.increment('sp3_rollout', {
      version,
      offering_id: offeringId,
      interval,
      shadow_mode: shadowMode ? 'true' : 'false',
    });
  }

  async handleLocationView(status: LocationStatus | TaxChangeAllowedStatus) {
    this.statsd.increment('sp3_location_view', {
      location_status: status,
    });
  }

  private async retrieveOptOut(uid?: string): Promise<boolean> {
    if (!uid) return false;

    try {
      const accounts = await this.accountManager.getAccounts([uid]);
      return accounts[0].metricsOptOutAt !== null;
    } catch (error) {
      return true; // Default to opt out
    }
  }
}
