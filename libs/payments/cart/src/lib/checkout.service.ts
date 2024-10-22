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
  PaymentIntentManager,
  PromotionCodeManager,
  STRIPE_CUSTOMER_METADATA,
  STRIPE_SUBSCRIPTION_METADATA,
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
import { ProfileClient } from '@fxa/profile/client';
import { AccountManager } from '@fxa/shared/account/account';
import { ProductConfigurationManager } from '@fxa/shared/cms';
import { StatsDService } from '@fxa/shared/metrics/statsd';
import { NotifierService } from '@fxa/shared/notifier';
import {
  CartTotalMismatchError,
  CartEligibilityMismatchError,
  CartEmailNotFoundError,
  CartInvalidPromoCodeError,
  CartInvalidCurrencyError,
} from './cart.error';
import { CartManager } from './cart.manager';
import { CheckoutCustomerData, ResultCart } from './cart.types';
import { handleEligibilityStatusMap } from './cart.utils';
import { CheckoutError } from './checkout.error';
import { PrePayStepsResult } from './checkout.types';
import assert from 'assert';

@Injectable()
export class CheckoutService {
  constructor(
    private accountCustomerManager: AccountCustomerManager,
    private accountManager: AccountManager,
    private cartManager: CartManager,
    private customerManager: CustomerManager,
    private eligibilityService: EligibilityService,
    private invoiceManager: InvoiceManager,
    private notifierService: NotifierService,
    private paymentIntents: PaymentIntentManager,
    private paypalBillingAgreementManager: PaypalBillingAgreementManager,
    private paypalCustomerManager: PaypalCustomerManager,
    private productConfigurationManager: ProductConfigurationManager,
    private profileClient: ProfileClient,
    private promotionCodeManager: PromotionCodeManager,
    private subscriptionManager: SubscriptionManager,
    @Inject(StatsDService) private statsd: StatsD
  ) {}

  /**
   * Reload the customer data to reflect a change.
   */
  private async customerChanged(uid: string) {
    await this.profileClient.deleteCache(uid);

    this.notifierService.send({
      event: 'profileDataChange',
      data: {
        ts: Date.now() / 1000,
        uid,
      },
    });
  }

  async prePaySteps(
    cart: ResultCart,
    customerData: CheckoutCustomerData
  ): Promise<PrePayStepsResult> {
    const taxAddress = cart.taxAddress as any as TaxAddress;
    let version = cart.version;

    if (!cart.email) {
      throw new CartEmailNotFoundError(cart.id);
    }

    if (!cart.currency) {
      throw new CartInvalidCurrencyError(
        cart.currency || undefined,
        taxAddress.countryCode
      );
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

    if (uid && stripeCustomerId) {
      await this.accountCustomerManager.createAccountCustomer({
        uid,
        stripeCustomerId,
      });
    }

    // Cart only needs to be updated if we created a stub account or if we created a customer
    if (!cart.uid || !cart.stripeCustomerId) {
      await this.cartManager.updateFreshCart(cart.id, cart.version, {
        uid: uid,
        stripeCustomerId: stripeCustomerId,
      });
      version += 1;
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

    const upcomingInvoice = await this.invoiceManager.previewUpcoming({
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
      email: cart.email,
      enableAutomaticTax,
      promotionCode,
      version,
      price,
    };
  }

  async postPaySteps(
    cart: ResultCart,
    version: number,
    subscription: StripeSubscription,
    uid: string
  ) {
    const { customer: customerId, currency } = subscription;

    await this.customerManager.setTaxId(customerId, currency);

    await this.customerChanged(uid);

    if (cart.couponCode) {
      const subscriptionMetadata = {
        ...subscription.metadata,
        [STRIPE_CUSTOMER_METADATA.SubscriptionPromotionCode]: cart.couponCode,
      };
      await this.subscriptionManager.update(subscription.id, {
        metadata: subscriptionMetadata,
      });
    }
    await this.cartManager.finishCart(cart.id, version, {});

    // TODO: call sendFinishSetupEmailForStubAccount
    console.log(cart.id, subscription.id);
  }

  async payWithStripe(
    cart: ResultCart,
    confirmationTokenId: string,
    customerData: CheckoutCustomerData
  ) {
    const { uid, customer, enableAutomaticTax, promotionCode, version, price } =
      await this.prePaySteps(cart, customerData);

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
        payment_behavior: 'default_incomplete',
        metadata: {
          // Note: These fields are due to missing Fivetran support on Stripe multi-currency plans
          [STRIPE_SUBSCRIPTION_METADATA.Amount]: cart.amount,
          [STRIPE_SUBSCRIPTION_METADATA.Currency]: cart.currency,
        },
      },
      {
        idempotencyKey: cart.id,
      }
    );

    await this.cartManager.updateFreshCart(cart.id, version, {
      stripeSubscriptionId: subscription.id,
    });
    const updatedVersion = version + 1;

    assert(
      subscription.latest_invoice,
      'latest_invoice does not exist on subscription'
    );
    const invoice = await this.invoiceManager.retrieve(
      subscription.latest_invoice
    );

    assert(
      invoice.payment_intent,
      'payment_intent does not exist on subscription'
    );
    // Confirm intent with collected payment method
    const { status, payment_method } = await this.paymentIntents.confirm(
      invoice.payment_intent,
      {
        confirmation_token: confirmationTokenId,
      }
    );

    if (status === 'succeeded') {
      if (payment_method) {
        await this.customerManager.update(customer.id, {
          invoice_settings: {
            default_payment_method: payment_method,
          },
        });
      }
      await this.postPaySteps(cart, updatedVersion, subscription, uid);
    }
    return status;
  }

  async payWithPaypal(
    cart: ResultCart,
    customerData: CheckoutCustomerData,
    token?: string
  ) {
    const {
      uid,
      customer,
      enableAutomaticTax,
      promotionCode,
      price,
      version: updatedVersion,
    } = await this.prePaySteps(cart, customerData);

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
        metadata: {
          // Note: These fields are due to missing Fivetran support on Stripe multi-currency plans
          [STRIPE_SUBSCRIPTION_METADATA.Amount]: cart.amount,
          [STRIPE_SUBSCRIPTION_METADATA.Currency]: cart.currency,
        },
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

    await this.postPaySteps(cart, updatedVersion, subscription, uid);
  }
}
