/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import Emittery from 'emittery';
import { ProductConfigurationManager } from '@fxa/shared/cms';
import { Injectable } from '@nestjs/common';
import { CartManager } from '@fxa/payments/cart';
import { PaymentsGleanManager } from '@fxa/payments/metrics';
import {
  CheckoutEvents,
  CheckoutPaymentEvents,
  PaymentsEmitterEvents,
  SubscriptionEnded,
} from './emitter.types';
import { AccountManager } from '@fxa/shared/account/account';
import { retrieveAdditionalMetricsData } from './util/retrieveAdditionalMetricsData';
import { getSubplatInterval } from '@fxa/payments/customer';
import * as Sentry from '@sentry/nestjs';

@Injectable()
export class PaymentsEmitterService {
  private emitter: Emittery<PaymentsEmitterEvents>;

  constructor(
    private productConfigurationManager: ProductConfigurationManager,
    private paymentsGleanManager: PaymentsGleanManager,
    private cartManager: CartManager,
    private accountManager: AccountManager
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

  async handleSubscriptionEnded(eventData: SubscriptionEnded) {
    const { priceId, priceInterval, priceIntervalCount } = eventData;
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
    console.log(interval, offeringId);

    // todo record Glean metric
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
