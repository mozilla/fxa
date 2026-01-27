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
  DefaultPaymentMethodError,
  PaymentMethodErrorType,
  PaymentProvider,
  SubPlatPaymentMethodType,
  type PaymentMethodTypeResponse,
} from './types';
import { getPaymentMethodErrorContent } from './util/getPaymentMethodErrorContent';

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
    let hasPaymentMethodError: DefaultPaymentMethodError | undefined;
    const paymentMethodType = await this.determineType(customer, subscriptions);
    switch (paymentMethodType?.type) {
      case SubPlatPaymentMethodType.Link:
      case SubPlatPaymentMethodType.Card:
      case SubPlatPaymentMethodType.ApplePay:
      case SubPlatPaymentMethodType.GooglePay:
      case SubPlatPaymentMethodType.Stripe: {
        const paymentMethod = await this.retrieve(
          paymentMethodType.paymentMethodId
        );

        if (paymentMethod.card) {
          const expiry = new Date(
            paymentMethod.card.exp_year,
            paymentMethod.card.exp_month,
            0,
            23,
            59,
            59,
            999
          );

          const isValid = expiry.getTime() > Date.now();
          if (!isValid) {
            hasPaymentMethodError =
              paymentMethodType.type === SubPlatPaymentMethodType.Card
                ? getPaymentMethodErrorContent(
                    PaymentMethodErrorType.CardExpired,
                    paymentMethodType.type
                  )
                : getPaymentMethodErrorContent(
                    PaymentMethodErrorType.GenericIssue,
                    paymentMethodType.type
                  );
          }
        }
        defaultPaymentMethod = {
          type: paymentMethodType.type,
          brand: paymentMethod.card?.brand,
          last4: paymentMethod.card?.last4,
          expMonth: paymentMethod.card?.exp_month,
          expYear: paymentMethod.card?.exp_year,
          hasPaymentMethodError,
        };
        break;
      }
      case SubPlatPaymentMethodType.PayPal:
        const billingAgreementId =
          await this.paypalBillingAgreementManager.retrieveActiveId(uid);

        if (!billingAgreementId) {
          hasPaymentMethodError = getPaymentMethodErrorContent(
            PaymentMethodErrorType.GenericIssue,
            SubPlatPaymentMethodType.PayPal
          );
        }

        defaultPaymentMethod = {
          type: SubPlatPaymentMethodType.PayPal,
          billingAgreementId,
          hasPaymentMethodError,
        };
        break;
    }
    return defaultPaymentMethod;
  }

  async determineType(
    customer?: StripeCustomer,
    subscriptions?: StripeSubscription[]
  ): Promise<PaymentMethodTypeResponse> {
    // First check if payment method is PayPal
    // Note, this needs to happen first since a customer could also have a
    // default payment method. However if PayPal is set as the payment method,
    // it should take precedence.
    if (
      subscriptions?.length &&
      subscriptions[0].collection_method === 'send_invoice'
    ) {
      return {
        provider: PaymentProvider.PayPal,
        type: SubPlatPaymentMethodType.PayPal,
      };
    }

    if (customer?.invoice_settings.default_payment_method) {
      const paymentMethod = await this.retrieve(
        customer.invoice_settings.default_payment_method
      );
      if (paymentMethod.card?.wallet?.type === 'apple_pay') {
        return {
          provider: PaymentProvider.Stripe,
          type: SubPlatPaymentMethodType.ApplePay,
          paymentMethodId: customer.invoice_settings.default_payment_method,
        };
      } else if (paymentMethod.card?.wallet?.type === 'google_pay') {
        return {
          provider: PaymentProvider.Stripe,
          type: SubPlatPaymentMethodType.GooglePay,
          paymentMethodId: customer.invoice_settings.default_payment_method,
        };
      } else if (
        paymentMethod.type === 'link' ||
        paymentMethod.card?.wallet?.type === 'link'
      ) {
        return {
          provider: PaymentProvider.Stripe,
          type: SubPlatPaymentMethodType.Link,
          paymentMethodId: customer.invoice_settings.default_payment_method,
        };
      } else if (paymentMethod.type === 'card') {
        return {
          provider: PaymentProvider.Stripe,
          type: SubPlatPaymentMethodType.Card,
          paymentMethodId: customer.invoice_settings.default_payment_method,
        };
      } else {
        return {
          provider: PaymentProvider.Stripe,
          type: SubPlatPaymentMethodType.Stripe,
          paymentMethodId: customer.invoice_settings.default_payment_method,
        };
      }
    }

    return null;
  }
}
