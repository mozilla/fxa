/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable } from '@nestjs/common';
import { EligibilityService } from '@fxa/payments/eligibility';
import { PayPalManager, PaypalCustomerManager } from '@fxa/payments/paypal';
import {
  AccountCustomerManager,
  StripeClient,
  StripeManager,
  StripeSubscription,
  SubplatInterval,
  TaxAddress,
} from '@fxa/payments/stripe';
import { CheckoutError, CheckoutPaymentError } from './checkout.error';
import {
  CartTotalMismatchError,
  CartEligibilityMismatchError,
  CartEmailNotFoundError,
} from './cart.error';
import { CartManager } from './cart.manager';
import { CheckoutCustomerData, ResultCart } from './cart.types';
import { handleEligibilityStatusMap } from './cart.utils';
import { ContentfulService } from '@fxa/shared/contentful';
import { AccountManager } from '@fxa/shared/account/account';

@Injectable()
export class CheckoutService {
  constructor(
    private stripeClient: StripeClient,
    private stripeManager: StripeManager,
    private paypalCustomerManager: PaypalCustomerManager,
    private paypalManager: PayPalManager,
    private cartManager: CartManager,
    private eligibilityService: EligibilityService,
    private contentfulService: ContentfulService,
    private accountManager: AccountManager,
    private accountCustomerManager: AccountCustomerManager
  ) {}

  async prePaySteps(cart: ResultCart, customerData: CheckoutCustomerData) {
    let customer, stripeCustomerId, uid;
    const taxAddress = cart.taxAddress as any as TaxAddress;

    if (!cart.email) {
      throw new CartEmailNotFoundError(cart.id);
    }

    // if uid not found, create stub account customer
    // TODO: update hardcoded verifierVersion
    // https://mozilla-hub.atlassian.net/browse/FXA-9693
    if (!cart.uid) {
      uid = await this.accountManager.createAccountStub(
        cart.email,
        1, // verifierVersion
        customerData.locale
      );
    } else {
      uid = cart.uid;
    }

    // if stripeCustomerId not found, create plain stripe account
    if (!cart.stripeCustomerId) {
      customer = await this.stripeManager.createPlainCustomer({
        uid,
        email: cart.email,
        displayName: customerData.displayName,
        taxAddress,
      });

      stripeCustomerId = customer.id;
    } else {
      stripeCustomerId = cart.stripeCustomerId;
      customer = await this.stripeManager.fetchActiveCustomer(stripeCustomerId);
    }

    // create accountCustomer if it does not exist
    if (!cart.uid) {
      await this.accountCustomerManager.createAccountCustomer({
        uid: uid,
        stripeCustomerId: stripeCustomerId,
        updatedAt: Date.now(),
      });
    }

    // update cart
    // TODO: update code so it's conditional only when cart data needs to be updated
    // NOTE: originally done as two separate calls dependent on if
    // uid, stripeCustomerId, or both were not found, it was then merged into one
    // https://github.com/mozilla/fxa/pull/16924#discussion_r1608740674
    await this.cartManager.updateFreshCart(cart.id, cart.version, {
      uid: uid,
      stripeCustomerId: stripeCustomerId,
    });

    // validate customer is eligible for product via eligibility service
    // throws cart eligibility mismatch error if no match found
    const eligibility = await this.eligibilityService.checkEligibility(
      cart.interval as SubplatInterval,
      cart.offeringConfigId,
      stripeCustomerId
    );

    const cartEligibilityStatus = handleEligibilityStatusMap[eligibility];

    if (cartEligibilityStatus !== cart.eligibilityStatus) {
      throw new CartEligibilityMismatchError(
        cart.id,
        cart.eligibilityStatus,
        cartEligibilityStatus
      );
    }

    // re-validate total amount against upcoming invoice
    // throws cart total mismatch error if no match found
    const priceId = await this.contentfulService.retrieveStripePlanId(
      cart.offeringConfigId,
      cart.interval as SubplatInterval
    );

    const upcomingInvoice = await this.stripeManager.previewInvoice({
      priceId: priceId,
      customer: customer,
      taxAddress: taxAddress,
    });

    if (upcomingInvoice.subtotal !== cart.amount) {
      throw new CartTotalMismatchError(
        cart.id,
        cart.amount,
        upcomingInvoice.subtotal
      );
    }

    // check if customer already has subscription to price and cancel if they do
    await this.stripeManager.cancelIncompleteSubscriptionsToPrice(
      stripeCustomerId,
      priceId
    );

    const enableAutomaticTax =
      this.stripeManager.isCustomerStripeTaxEligible(customer);

    const promotionCode = cart.couponCode
      ? await this.stripeManager.getPromotionCodeByName(cart.couponCode, true)
      : undefined;

    return {
      uid: uid,
      customer,
      enableAutomaticTax,
      promotionCode,
      priceId,
    };
  }

  async postPaySteps(cart: ResultCart, subscription: StripeSubscription) {
    // TODO: Add tax ID to customer
    // TODO: call customerChanged
    // TODO: save promo code to subscription's metadata
    // TODO: call sendFinishSetupEmailForStubAccount
    console.log(cart.id, subscription.id);
  }

  async payWithStripe(
    cart: ResultCart,
    paymentMethodId: string,
    customerData: CheckoutCustomerData
  ) {
    const { customer, enableAutomaticTax, promotionCode, priceId } =
      await this.prePaySteps(cart, customerData);

    await this.stripeClient.paymentMethodsAttach(paymentMethodId, {
      customer: customer.id,
    });

    await this.stripeClient.customersUpdate(customer.id, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // TODO: increment statsd for stripe_subscription with payment provider stripe

    const subscription = await this.stripeClient.subscriptionsCreate({
      customer: customer.id,
      automatic_tax: {
        enabled: enableAutomaticTax,
      },
      promotion_code: promotionCode?.id,
      items: [
        {
          price: priceId,
        },
      ],
      // TODO: Generate and use idempotency key using util
    });

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
  }

  async payWithPaypal(
    cart: ResultCart,
    customerData: CheckoutCustomerData,
    token?: string
  ) {
    const { uid, customer, enableAutomaticTax, promotionCode, priceId } =
      await this.prePaySteps(cart, customerData);

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
          price: priceId,
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
