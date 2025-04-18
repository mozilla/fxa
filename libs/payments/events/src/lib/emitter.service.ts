/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import Emittery from 'emittery';
import { ProductConfigurationManager } from '@fxa/shared/cms';
import { Inject, Injectable } from '@nestjs/common';
import { CartManager } from '@fxa/payments/cart';
import { PaymentsGleanManager } from '@fxa/payments/metrics';
import { LocationStatus } from '@fxa/payments/eligibility';
import {
  CheckoutEvents,
  CheckoutPaymentEvents,
  PaymentsEmitterEvents,
  SP3RolloutEvent,
  SubscriptionEndedEvents,
} from './emitter.types';
import { AccountManager } from '@fxa/shared/account/account';
import { retrieveAdditionalMetricsData } from './util/retrieveAdditionalMetricsData';
import { getSubplatInterval } from '@fxa/payments/customer';
import * as Sentry from '@sentry/nestjs';
import { StatsD, StatsDService } from '@fxa/shared/metrics/statsd';

@Injectable()
export class PaymentsEmitterService {
  private emitter: Emittery<PaymentsEmitterEvents>;

  constructor(
    private productConfigurationManager: ProductConfigurationManager,
    private paymentsGleanManager: PaymentsGleanManager,
    private cartManager: CartManager,
    private accountManager: AccountManager,
    @Inject(StatsDService) public statsd: StatsD
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
  }

  getEmitter(): Emittery<PaymentsEmitterEvents> {
    return this.emitter;
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
      this.paymentsGleanManager.recordFxaPaySetupView({
        commonMetricsData: eventData,
        ...additionalData,
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
      this.paymentsGleanManager.recordFxaPaySetupSuccess(
        {
          commonMetricsData: eventData,
          ...additionalData,
        },
        eventData.paymentProvider
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
      this.paymentsGleanManager.recordFxaPaySetupFail(
        {
          commonMetricsData: eventData,
          ...additionalData,
        },
        eventData.paymentProvider
      );
    }
  }

  async handleSubscriptionEnded(eventData: SubscriptionEndedEvents) {
    const {
      productId,
      priceId,
      priceInterval,
      priceIntervalCount,
      providerEventId,
      voluntaryCancellation,
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
            voluntaryCancellation,
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

  async handleLocationView(status: LocationStatus) {
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
