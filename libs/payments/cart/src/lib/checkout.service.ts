/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  StripeClient,
  StripeManager,
  StripeSubscription,
} from '@fxa/payments/stripe';
import { PayPalManager, PaypalCustomerManager } from '@fxa/payments/paypal';
import { Injectable } from '@nestjs/common';
import { ResultCart } from './cart.types';
import { CheckoutError, CheckoutPaymentError } from './checkout.error';

@Injectable()
export class CheckoutService {
  constructor(
    private stripeClient: StripeClient,
    private stripeManager: StripeManager,
    private paypalCustomerManager: PaypalCustomerManager,
    private paypalManager: PayPalManager
  ) {}

  async prePaySteps(cart: ResultCart) {
    // TODO:
    // - If uid not present, create user stub account and update cart
    // - Check if customer exists, create via stripe manager and update cart
    // - Make sure shipping address of customer is updated with cart taxAddress
    // - Check if customer is eligible for product in cart
    // - Check if amount to be charged matches amount in cart
    // - Cancel incomplete subscriptions to price user is subscribing to

    const { stripeCustomerId } = cart;
    if (!stripeCustomerId) {
      // TODO: this is a placeholder and won't be necessary once the above todo items are done
      throw new Error("Stripe customer doesn't exist");
    }
    const customer = await this.stripeManager.fetchActiveCustomer(
      stripeCustomerId
    );

    const enableAutomaticTax =
      this.stripeManager.isCustomerStripeTaxEligible(customer);

    const promotionCode = cart.couponCode
      ? await this.stripeManager.getPromotionCodeByName(cart.couponCode, true)
      : undefined;

    return {
      uid: cart.uid || 'SEE TODO',
      customer,
      enableAutomaticTax,
      promotionCode,
    };
  }

  async postPaySteps(cart: ResultCart, subscription: StripeSubscription) {
    // TODO: Add tax ID to customer
    // TODO: call customerChanged
    // TODO: save promo code to subscription's metadata
    // TODO: call sendFinishSetupEmailForStubAccount
    console.log(cart.id, subscription.id);
  }

  async payWithStripe(cart: ResultCart, paymentMethodId: string) {
    const { customer, enableAutomaticTax, promotionCode } =
      await this.prePaySteps(cart);

    // Looks like the new approach doesn't require the paymentMethodId from
    // the frontend anymore.
    //    await this.stripeClient.paymentMethodsAttach(paymentMethodId, {
    //      customer: customer.id,
    //    });

    //    await this.stripeClient.customersUpdate(customer.id, {
    //      invoice_settings: {
    //        default_payment_method: paymentMethodId,
    //      },
    //    });

    // TODO: increment statsd for stripe_subscription with payment provider stripe

    const subscription = await this.stripeClient.subscriptionsCreate({
      customer: customer.id,
      automatic_tax: {
        enabled: enableAutomaticTax,
      },
      promotion_code: promotionCode?.id,
      items: [
        {
          price: 'price_1LwVGQBVqmGyQTMavfvTYMbD', // TODO: fetch price from cart after FXA-8893
        },
      ],
      payment_behavior: 'default_incomplete',
      payment_settings: {
        save_default_payment_method: 'on_subscription',
      },
      // TODO: Generate and use idempotency key using util
    });

    const pendingSetupIntent = subscription.pending_setup_intent
      ? await this.stripeClient.setupIntentsRetrieve(
          subscription.pending_setup_intent
        )
      : null;

    const paymentIntent = await this.stripeManager.getLatestPaymentIntent(
      subscription
    );
    if (!paymentIntent) {
      throw new CheckoutError(
        'Could not retrieve paymentIntent for subscription',
        {
          info: {
            subscription,
          },
        }
      );
    }

    if (paymentIntent.last_payment_error) {
      await this.stripeManager.cancelSubscription(subscription.id);

      throw new CheckoutPaymentError(
        'Checkout payment intent has error on payment attempt',
        {
          info: {
            error: paymentIntent.last_payment_error,
          },
        }
      );
    }

    await this.postPaySteps(cart, subscription);

    let result;
    if (pendingSetupIntent !== null) {
      result = {
        type: 'setup',
        clientSecret: pendingSetupIntent.client_secret,
      };
    } else {
      result = {
        type: 'payment',
        clientSecret: paymentIntent.client_secret,
      };
    }
    return result;
  }

  async payWithPaypal(cart: ResultCart, token?: string) {
    const { uid, customer, enableAutomaticTax, promotionCode } =
      await this.prePaySteps(cart);

    const paypalSubscriptions =
      await this.paypalManager.getCustomerPayPalSubscriptions(customer.id);

    const billingAgreementId =
      await this.paypalManager.getOrCreateBillingAgreementId(
        uid,
        !!paypalSubscriptions.length,
        token
      );

    // TODO: increment statsd for stripe_subscription with payment provider paypal
    //
    const subscription = await this.stripeClient.subscriptionsCreate({
      customer: customer.id,
      automatic_tax: {
        enabled: enableAutomaticTax,
      },
      collection_method: 'send_invoice',
      days_until_due: 1,
      promotion_code: promotionCode?.id,
      items: [
        {
          price: undefined, // TODO: fetch price from cart after FXA-8893
        },
      ],
      // TODO: Generate and use idempotency key
    });

    await this.paypalCustomerManager.deletePaypalCustomersByUid(uid);
    await this.paypalCustomerManager.createPaypalCustomer({
      uid,
      billingAgreementId,
      status: 'active',
      endedAt: null,
    });
    // TODO: set billingAgreementId on customer metadata (existing is updateCustomerPaypalAgreement)

    if (!subscription.latest_invoice) {
      throw new CheckoutError('latest_invoice does not exist on subscription');
    }
    const latestInvoice = await this.stripeClient.invoicesRetrieve(
      subscription.latest_invoice
    );
    try {
      this.paypalManager.processInvoice(latestInvoice);
    } catch (e) {
      await this.stripeManager.cancelSubscription(subscription.id);
      await this.paypalManager.cancelBillingAgreement(billingAgreementId);
    }

    await this.postPaySteps(cart, subscription);
  }
}
