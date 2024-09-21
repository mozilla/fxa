/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Inject, Injectable } from '@nestjs/common';
import { StatsD } from 'hot-shots';

import { EligibilityService } from '@fxa/payments/eligibility';
import {
  PaypalBillingAgreementManager,
  PaypalCustomerManager,
} from '@fxa/payments/paypal';
import {
  CustomerManager,
  InvoiceManager,
  PaymentMethodManager,
  PromotionCodeManager,
  STRIPE_CUSTOMER_METADATA,
  SubplatInterval,
  SubscriptionManager,
  TaxAddress,
} from '@fxa/payments/customer';
import {
  AccountCustomerManager,
  StripeSubscription,
  StripeCustomer,
  StripePromotionCode,
} from '@fxa/payments/stripe';
import { AccountManager } from '@fxa/shared/account/account';
import { ProductConfigurationManager } from '@fxa/shared/cms';
import { StatsDService } from '@fxa/shared/metrics/statsd';
import {
  CartTotalMismatchError,
  CartEligibilityMismatchError,
  CartEmailNotFoundError,
  CartInvalidPromoCodeError,
} from './cart.error';
import { CartManager } from './cart.manager';
import { CheckoutCustomerData, ResultCart } from './cart.types';
import { handleEligibilityStatusMap } from './cart.utils';
import { CheckoutError, CheckoutPaymentError } from './checkout.error';

@Injectable()
export class CheckoutService {
  constructor(
    private accountCustomerManager: AccountCustomerManager,
    private accountManager: AccountManager,
    private cartManager: CartManager,
    private customerManager: CustomerManager,
    private eligibilityService: EligibilityService,
    private invoiceManager: InvoiceManager,
    private paymentMethodManager: PaymentMethodManager,
    private paypalBillingAgreementManager: PaypalBillingAgreementManager,
    private paypalCustomerManager: PaypalCustomerManager,
    private productConfigurationManager: ProductConfigurationManager,
    private promotionCodeManager: PromotionCodeManager,
    private subscriptionManager: SubscriptionManager,
    @Inject(StatsDService) private statsd: StatsD
  ) {}

  async prePaySteps(cart: ResultCart, customerData: CheckoutCustomerData) {
    const taxAddress = cart.taxAddress as any as TaxAddress;

    if (!cart.email) {
      throw new CartEmailNotFoundError(cart.id);
    }

    // if uid not found, create stub account customer
    // TODO: update hardcoded verifierVersion
    // https://mozilla-hub.atlassian.net/browse/FXA-9693
    let uid = cart.uid;
    if (!uid) {
      uid = await this.accountManager.createAccountStub(
        cart.email,
        1, // verifierVersion
        customerData.locale
      );
    }

    let stripeCustomerId = cart.stripeCustomerId;
    let customer: StripeCustomer;
    if (!stripeCustomerId) {
      customer = await this.customerManager.create({
        uid,
        email: cart.email,
        displayName: customerData.displayName,
        taxAddress,
      });

      stripeCustomerId = customer.id;
    } else {
      customer = await this.customerManager.retrieve(stripeCustomerId);
    }

    if (!cart.uid) {
      await this.accountCustomerManager.createAccountCustomer({
        uid: uid,
        stripeCustomerId: stripeCustomerId,
      });
    }

    // Cart only needs to be updated if we created a stub account or if we created a customer
    if (!cart.uid || !cart.stripeCustomerId) {
      await this.cartManager.updateFreshCart(cart.id, cart.version, {
        uid: uid,
        stripeCustomerId: stripeCustomerId,
      });
    }

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
    const price = await this.productConfigurationManager.retrieveStripePrice(
      cart.offeringConfigId,
      cart.interval as SubplatInterval
    );

    const upcomingInvoice = await this.invoiceManager.preview({
      priceId: price.id,
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
    await this.subscriptionManager.cancelIncompleteSubscriptionsToPrice(
      stripeCustomerId,
      price.id
    );

    const enableAutomaticTax = this.customerManager.isTaxEligible(customer);

    let promotionCode: StripePromotionCode | undefined;
    if (cart.couponCode) {
      try {
        await this.promotionCodeManager.assertValidPromotionCodeNameForPrice(
          cart.couponCode,
          price
        );

        promotionCode = await this.promotionCodeManager.retrieveByName(
          cart.couponCode
        );
      } catch (e) {
        throw new CartInvalidPromoCodeError(cart.couponCode, cart.id);
      }
    }

    return {
      uid: uid,
      customer,
      enableAutomaticTax,
      promotionCode,
      price,
    };
  }

  async postPaySteps(cart: ResultCart, subscription: StripeSubscription) {
    const { customer: customerId, currency } = subscription;

    await this.customerManager.setTaxId(customerId, currency);

    // TODO: call customerChanged

    if (cart.couponCode) {
      const subscriptionMetadata = {
        ...subscription.metadata,
        [STRIPE_CUSTOMER_METADATA.SubscriptionPromotionCode]: cart.couponCode,
      };
      await this.subscriptionManager.update(subscription.id, {
        metadata: subscriptionMetadata,
      });
    }

    // TODO: call sendFinishSetupEmailForStubAccount
    console.log(cart.id, subscription.id);
  }

  async payWithStripe(
    cart: ResultCart,
    paymentMethodId: string,
    customerData: CheckoutCustomerData
  ) {
    const { customer, enableAutomaticTax, promotionCode, price } =
      await this.prePaySteps(cart, customerData);

    await this.paymentMethodManager.attach(paymentMethodId, {
      customer: customer.id,
    });

    await this.customerManager.update(customer.id, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    this.statsd.increment('stripe_subscription', {
      payment_provider: 'stripe',
    });

    const subscription = await this.subscriptionManager.create(
      {
        customer: customer.id,
        automatic_tax: {
          enabled: enableAutomaticTax,
        },
        promotion_code: promotionCode?.id,
        items: [
          {
            price: price.id,
          },
        ],
      },
      {
        idempotencyKey: cart.id,
      }
    );

    const paymentIntent = await this.subscriptionManager.getLatestPaymentIntent(
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
      await this.subscriptionManager.cancel(subscription.id);

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
    const { uid, customer, enableAutomaticTax, promotionCode, price } =
      await this.prePaySteps(cart, customerData);

    const paypalSubscriptions =
      await this.subscriptionManager.getCustomerPayPalSubscriptions(
        customer.id
      );

    const billingAgreementId =
      await this.paypalBillingAgreementManager.retrieveOrCreateId(
        uid,
        !!paypalSubscriptions.length,
        token
      );

    this.statsd.increment('stripe_subscription', {
      payment_provider: 'paypal',
    });

    const subscription = await this.subscriptionManager.create(
      {
        customer: customer.id,
        automatic_tax: {
          enabled: enableAutomaticTax,
        },
        collection_method: 'send_invoice',
        days_until_due: 1,
        promotion_code: promotionCode?.id,
        items: [
          {
            price: price.id,
          },
        ],
      },
      {
        idempotencyKey: cart.id,
      }
    );

    await this.paypalCustomerManager.deletePaypalCustomersByUid(uid);
    await this.paypalCustomerManager.createPaypalCustomer({
      uid,
      billingAgreementId,
      status: 'active',
      endedAt: null,
    });

    await this.customerManager.update(customer.id, {
      metadata: {
        [STRIPE_CUSTOMER_METADATA.PaypalAgreement]: billingAgreementId,
      },
    });

    if (!subscription.latest_invoice) {
      throw new CheckoutError('latest_invoice does not exist on subscription');
    }
    const latestInvoice = await this.invoiceManager.retrieve(
      subscription.latest_invoice
    );
    try {
      this.invoiceManager.processPayPalInvoice(latestInvoice);
    } catch (e) {
      await this.subscriptionManager.cancel(subscription.id);
      await this.paypalBillingAgreementManager.cancel(billingAgreementId);
    }

    await this.postPaySteps(cart, subscription);
  }
}
