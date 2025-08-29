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
import {
  DefaultPaymentMethod,
  SubPlatPaymentMethodType,
  StripePaymentMethod,
  PayPalPaymentMethod,
} from './types';

type PaymentMethodTypeResponse =
  | StripePaymentMethod
  | PayPalPaymentMethod
  | null;

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
    const paymentMethodType = await this.determineType(
      customer,
      subscriptions
    );
    switch (paymentMethodType?.type) {
      case SubPlatPaymentMethodType.Link:
      case SubPlatPaymentMethodType.Card:
      case SubPlatPaymentMethodType.ApplePay:
      case SubPlatPaymentMethodType.GooglePay:
      case SubPlatPaymentMethodType.Stripe: {
        const paymentMethod = await this.retrieve(
          paymentMethodType.paymentMethodId
        );
        defaultPaymentMethod = {
          type: paymentMethod.type,
          brand: paymentMethod.card?.brand,
          last4: paymentMethod.card?.last4,
          expMonth: paymentMethod.card?.exp_month,
          expYear: paymentMethod.card?.exp_year,
          walletType: paymentMethod.card?.wallet?.type,
        };
        break;
      }
      case SubPlatPaymentMethodType.PayPal:
        const billingAgreementId =
          await this.paypalBillingAgreementManager.retrieveActiveId(uid);
        defaultPaymentMethod = {
          type: 'external_paypal',
          brand: 'paypal',
          billingAgreementId,
        };
        break;
    }
    return defaultPaymentMethod;
  }

  async determineType (
    customer?: StripeCustomer,
    subscriptions?: StripeSubscription[]
  ): Promise <PaymentMethodTypeResponse> {
    // First check if payment method is PayPal
    // Note, this needs to happen first since a customer could also have a
    // default payment method. However if PayPal is set as the payment method,
    // it should take precedence.
    if (
      subscriptions?.length &&
      subscriptions[0].collection_method === 'send_invoice'
    ) {
      return {
        type: SubPlatPaymentMethodType.PayPal,
      };
    }

    if (customer?.invoice_settings.default_payment_method) {
      const paymentMethod = await this.retrieve(
        customer.invoice_settings.default_payment_method
      );
      if (paymentMethod.card?.wallet?.type === 'apple_pay') {
        return {
          type: SubPlatPaymentMethodType.ApplePay,
          paymentMethodId: customer.invoice_settings.default_payment_method,
        }
      } else if (paymentMethod.card?.wallet?.type === 'google_pay') {
        return {
          type: SubPlatPaymentMethodType.GooglePay,
          paymentMethodId: customer.invoice_settings.default_payment_method,
        }
      } else if (paymentMethod.type === 'link') {
        return {
          type: SubPlatPaymentMethodType.Link,
          paymentMethodId: customer.invoice_settings.default_payment_method,
        }
      } else if (paymentMethod.type === 'card') {
        return {
          type: SubPlatPaymentMethodType.Card,
          paymentMethodId: customer.invoice_settings.default_payment_method,
        }
      } else {
        return {
          type: SubPlatPaymentMethodType.Stripe,
          paymentMethodId: customer.invoice_settings.default_payment_method,
        };
      }
    }

    return null;
  };

}
