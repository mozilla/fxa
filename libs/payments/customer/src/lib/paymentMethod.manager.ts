/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable } from '@nestjs/common';
import { Stripe } from 'stripe';
import { PaypalBillingAgreementManager } from '@fxa/payments/paypal';
import {
  StripeClient,
  StripeCustomer,
  StripeSubscription,
} from '@fxa/payments/stripe';
import { DefaultPaymentMethod } from './types';
import { determinePaymentMethodType } from './util/determinePaymentMethodType';

@Injectable()
export class PaymentMethodManager {
  constructor(
    private stripeClient: StripeClient,
    private paypalBillingAgreementManager: PaypalBillingAgreementManager
  ) {}

  async attach(
    paymentMethodId: string,
    params: Stripe.PaymentMethodAttachParams
  ) {
    return this.stripeClient.paymentMethodsAttach(paymentMethodId, params);
  }

  async retrieve(paymentMethodId: string) {
    return this.stripeClient.paymentMethodRetrieve(paymentMethodId);
  }

  async getDefaultPaymentMethod(
    customer: StripeCustomer,
    subscriptions: StripeSubscription[],
    uid: string
  ) {
    let defaultPaymentMethod: DefaultPaymentMethod | undefined;
    const paymentMethodType = determinePaymentMethodType(
      customer,
      subscriptions
    );
    if (paymentMethodType?.type === 'stripe') {
      const paymentMethod = await this.retrieve(
        paymentMethodType.paymentMethodId
      );
      defaultPaymentMethod = {
        type: paymentMethod.type,
        brand: paymentMethod.card?.brand,
        last4: paymentMethod.card?.last4,
        expMonth: paymentMethod.card?.exp_month,
        expYear: paymentMethod.card?.exp_year,
      };
    } else if (paymentMethodType?.type === 'external_paypal') {
      const billingAgreementId =
        await this.paypalBillingAgreementManager.retrieveActiveId(uid);
      defaultPaymentMethod = {
        type: 'external_paypal',
        brand: 'paypal',
        billingAgreementId,
      };
    }
    return defaultPaymentMethod;
  }
}
