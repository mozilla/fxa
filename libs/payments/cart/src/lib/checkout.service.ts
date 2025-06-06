/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Inject, Injectable } from '@nestjs/common';
import * as Sentry from '@sentry/nestjs';
import assertNotNull from 'assert';
import { StatsD } from 'hot-shots';

import {
  EligibilityService,
  EligibilityStatus,
  type SubscriptionEligibilityUpgradeDowngradeResult,
} from '@fxa/payments/eligibility';
import {
  PaypalBillingAgreementManager,
  PaypalCustomerManager,
} from '@fxa/payments/paypal';
import {
  CustomerManager,
  InvoiceManager,
  PaymentIntentManager,
  PriceManager,
  PromotionCodeManager,
  retrieveSubscriptionItem,
  STRIPE_CUSTOMER_METADATA,
  STRIPE_SUBSCRIPTION_METADATA,
  SubplatInterval,
  SubscriptionManager,
} from '@fxa/payments/customer';
import {
  AccountCustomerManager,
  StripeSubscription,
  StripeCustomer,
  StripePromotionCode,
} from '@fxa/payments/stripe';
import { AccountManager } from '@fxa/shared/account/account';
import { ProfileClient } from '@fxa/profile/client';
import { ProductConfigurationManager } from '@fxa/shared/cms';
import { StatsDService } from '@fxa/shared/metrics/statsd';
import { NotifierService } from '@fxa/shared/notifier';
import {
  CartTotalMismatchError,
  CartEligibilityMismatchError,
  CartAccountNotFoundError,
  CartInvalidPromoCodeError,
  CartCurrencyNotFoundError,
  CartUidNotFoundError,
  CartError,
  CartNoTaxAddressError,
} from './cart.error';
import { CartManager } from './cart.manager';
import { CheckoutCustomerData, ResultCart } from './cart.types';
import { handleEligibilityStatusMap } from './cart.utils';
import { PrePayStepsResult } from './checkout.types';
import assert from 'assert';
import { CheckoutPaymentError, CheckoutUpgradeError } from './checkout.error';

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
    private paymentIntentManager: PaymentIntentManager,
    private paypalBillingAgreementManager: PaypalBillingAgreementManager,
    private paypalCustomerManager: PaypalCustomerManager,
    private priceManager: PriceManager,
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
    const taxAddress = cart.taxAddress;
    if (!taxAddress) {
      throw new CartNoTaxAddressError(cart.id);
    }

    let version = cart.version;

    if (!cart.currency) {
      throw new CartCurrencyNotFoundError(
        cart.currency || undefined,
        taxAddress.countryCode
      );
    }

    const uid = cart.uid;
    if (!uid) {
      throw new CartUidNotFoundError(cart.id);
    }

    const fxaAccounts = await this.accountManager.getAccounts([uid]);
    if (!(fxaAccounts && fxaAccounts.length > 0)) {
      throw new CartAccountNotFoundError(cart.id);
    }
    const email = fxaAccounts[0].email;

    let stripeCustomerId = cart.stripeCustomerId;
    let customer: StripeCustomer;
    if (!stripeCustomerId) {
      customer = await this.customerManager.create({
        uid,
        email,
        displayName: customerData.displayName,
        taxAddress,
      });

      stripeCustomerId = customer.id;
    } else {
      customer = await this.customerManager.retrieve(stripeCustomerId);

      await this.customerManager.update(stripeCustomerId, {
        shipping: {
          name: email,
          address: {
            country: taxAddress.countryCode,
            postal_code: taxAddress.postalCode,
          },
        },
      });
    }

    if (uid && !cart.stripeCustomerId) {
      await this.accountCustomerManager.createAccountCustomer({
        uid,
        stripeCustomerId,
      });
    }

    // Cart only needs to be updated if we created a customer
    if (!cart.uid || !cart.stripeCustomerId) {
      await this.cartManager.updateFreshCart(cart.id, cart.version, {
        uid,
        stripeCustomerId,
      });
      version += 1;
    }

    // validate customer is eligible for product via eligibility service
    // throws cart eligibility mismatch error if no match found
    const eligibility = await this.eligibilityService.checkEligibility(
      cart.interval as SubplatInterval,
      cart.offeringConfigId,
      uid,
      stripeCustomerId
    );

    const cartEligibilityStatus =
      handleEligibilityStatusMap[eligibility.subscriptionEligibilityResult];

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
      currency: cart.currency,
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
          price,
          cart.currency
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
      version,
      price,
      eligibility,
    };
  }

  async postPaySteps(args: {
    cart: ResultCart;
    version: number;
    subscription: StripeSubscription;
    uid: string;
    paymentProvider: 'stripe' | 'paypal';
  }) {
    const { cart, version, subscription, uid, paymentProvider } = args;
    const { customer: customerId, currency } = subscription;

    await this.customerManager.setTaxId(customerId, currency);

    await this.customerChanged(uid);

    if (cart.couponCode) {
      await this.subscriptionManager.update(subscription.id, {
        metadata: {
          ...subscription.metadata,
          [STRIPE_SUBSCRIPTION_METADATA.SubscriptionPromotionCode]:
            cart.couponCode,
        },
      });
    }

    await this.cartManager.finishCart(cart.id, version, {});

    this.statsd.increment('subscription_success', {
      payment_provider: paymentProvider,
      offering_id: cart.offeringConfigId,
      interval: cart.interval,
    });
  }

  async payWithStripe(
    cart: ResultCart,
    confirmationTokenId: string,
    customerData: CheckoutCustomerData
  ) {
    const {
      uid,
      customer,
      enableAutomaticTax,
      promotionCode,
      version,
      price,
      eligibility,
    } = await this.prePaySteps(cart, customerData);

    this.statsd.increment('stripe_subscription', {
      payment_provider: 'stripe',
    });

    const { unitAmountForCurrency } =
      await this.priceManager.retrievePricingForCurrency(
        price.id,
        cart.currency
      );
    assertNotNull(unitAmountForCurrency);

    const subscription =
      eligibility.subscriptionEligibilityResult !== EligibilityStatus.UPGRADE
        ? await this.subscriptionManager.create(
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
              currency: cart.currency ?? undefined,
              metadata: {
                // Note: These fields are due to missing Fivetran support on Stripe multi-currency plans
                [STRIPE_SUBSCRIPTION_METADATA.Amount]: unitAmountForCurrency,
                [STRIPE_SUBSCRIPTION_METADATA.Currency]: cart.currency,
              },
            },
            {
              idempotencyKey: cart.id,
            }
          )
        : await this.upgradeSubscription(
            customer.id,
            price.id,
            eligibility.fromPrice.id,
            cart,
            eligibility.redundantOverlaps || []
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

    if (invoice.amount_due === 0) {
      // invoices without charge do not generate a payent intent
      assert(
        invoice.status === 'paid',
        'Zero-charge stripe invoice expected to be in a paid status'
      );
      const paymentMethod = await this.customerManager.getDefaultPaymentMethod(
        customer.id
      );
      assert(
        !!paymentMethod,
        'Payment method expected on customer for stripe zero-charge payment processing'
      );
    } else {
      assert(
        invoice.payment_intent,
        'payment_intent does not exist on subscription'
      );
      // Confirm intent with collected payment method
      const paymentIntent = await this.paymentIntentManager.confirm(
        invoice.payment_intent,
        {
          confirmation_token: confirmationTokenId,
          off_session: false,
        }
      );

      if (paymentIntent.status === 'requires_action') {
        await this.cartManager.setNeedsInputCart(cart.id);
        return;
      } else if (paymentIntent.status === 'succeeded') {
        if (paymentIntent.payment_method) {
          await this.customerManager.update(customer.id, {
            invoice_settings: {
              default_payment_method: paymentIntent.payment_method,
            },
          });
        } else {
          throw new CartError(
            'Failed to update customer default payment method',
            { cartId: cart.id }
          );
        }
      } else {
        throw new CheckoutPaymentError(
          `Expected payment intent status to be one of [requires_action, succeeded], instead found: ${paymentIntent.status}`
        );
      }
    }
    await this.postPaySteps({
      cart,
      version: updatedVersion,
      subscription,
      uid,
      paymentProvider: 'stripe',
    });
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
      version,
      eligibility,
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

    const { unitAmountForCurrency } =
      await this.priceManager.retrievePricingForCurrency(
        price.id,
        cart.currency
      );
    assertNotNull(unitAmountForCurrency);

    this.statsd.increment('stripe_subscription', {
      payment_provider: 'paypal',
    });

    const subscription =
      eligibility.subscriptionEligibilityResult !== EligibilityStatus.UPGRADE
        ? await this.subscriptionManager.create(
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
              currency: cart.currency ?? undefined,
              metadata: {
                // Note: These fields are due to missing Fivetran support on Stripe multi-currency plans
                [STRIPE_SUBSCRIPTION_METADATA.Amount]: unitAmountForCurrency,
                [STRIPE_SUBSCRIPTION_METADATA.Currency]: cart.currency,
              },
            },
            {
              idempotencyKey: cart.id,
            }
          )
        : await this.upgradeSubscription(
            customer.id,
            price.id,
            eligibility.fromPrice.id,
            cart,
            eligibility.redundantOverlaps || []
          );

    await this.paypalCustomerManager.deletePaypalCustomersByUid(uid);
    await Promise.all([
      this.paypalCustomerManager.createPaypalCustomer({
        uid,
        billingAgreementId,
        status: 'active',
        endedAt: null,
      }),
      this.customerManager.update(customer.id, {
        metadata: {
          [STRIPE_CUSTOMER_METADATA.PaypalAgreement]: billingAgreementId,
        },
      }),
      this.cartManager.updateFreshCart(cart.id, version, {
        stripeSubscriptionId: subscription.id,
      }),
    ]);

    const updatedVersion = version + 1;

    if (!subscription.latest_invoice) {
      throw new CartError('No latest invoice found for subscription', {
        subscriptionId: subscription.id,
      });
    }
    const latestInvoice = await this.invoiceManager.retrieve(
      subscription.latest_invoice
    );
    const processedInvoice =
      await this.invoiceManager.processPayPalInvoice(latestInvoice);
    if (['paid', 'open'].includes(processedInvoice.status ?? '')) {
      await this.postPaySteps({
        cart,
        version: updatedVersion,
        subscription,
        uid,
        paymentProvider: 'paypal',
      });
    } else {
      throw new CheckoutPaymentError(
        `Expected processed invoice status to be one of [paid, open], instead found: ${processedInvoice.status}`
      );
    }
  }

  async upgradeSubscription(
    customerId: string,
    toPriceId: string,
    fromPriceId: string,
    cart: ResultCart,
    redundantOverlaps: SubscriptionEligibilityUpgradeDowngradeResult[]
  ) {
    const upgradeSubscription =
      await this.subscriptionManager.retrieveForCustomerAndPrice(
        customerId,
        fromPriceId
      );

    if (!upgradeSubscription) {
      throw new CheckoutUpgradeError(
        'Could not determine subscription for upgrade',
        { info: { customerId, toPriceId, fromPriceId } }
      );
    }

    const upgradeSubscriptionItem =
      retrieveSubscriptionItem(upgradeSubscription);

    const { unitAmountForCurrency } =
      await this.priceManager.retrievePricingForCurrency(
        toPriceId,
        cart.currency
      );
    assertNotNull(unitAmountForCurrency);

    const upgradedSubscription = await this.subscriptionManager.update(
      upgradeSubscription.id,
      {
        cancel_at_period_end: false,
        items: [
          {
            id: upgradeSubscriptionItem.id,
            price: toPriceId,
          },
        ],
        proration_behavior: 'always_invoice',
        payment_behavior: 'default_incomplete',
        metadata: {
          // Note: These fields are due to missing Fivetran support on Stripe multi-currency plans
          [STRIPE_SUBSCRIPTION_METADATA.Amount]: unitAmountForCurrency,
          [STRIPE_SUBSCRIPTION_METADATA.Currency]: cart.currency,
          [STRIPE_SUBSCRIPTION_METADATA.PreviousPlanId]: fromPriceId,
          [STRIPE_SUBSCRIPTION_METADATA.PlanChangeDate]: Math.floor(
            Date.now() / 1000
          ),
        },
      }
    );

    try {
      for (const redundantOverlap of redundantOverlaps) {
        const redundantSubscription =
          await this.subscriptionManager.retrieveForCustomerAndPrice(
            customerId,
            redundantOverlap.fromPrice.id
          );

        if (!redundantSubscription) {
          Sentry.captureMessage(
            `Redundant overlap subscription not found for customer`,
            {
              extra: {
                customerId: customerId,
                fromPriceId: redundantOverlap.fromPrice.id,
                sp2: false,
              },
            }
          );
          continue;
        }

        await this.subscriptionManager.update(redundantSubscription.id, {
          metadata: {
            redundantCancellation: 'true',
            autoCancelledRedundantFor: upgradedSubscription.id,
            cancelled_for_customer_at: Math.floor(Date.now() / 1000),
          },
        });

        await this.subscriptionManager.cancel(redundantSubscription.id, {
          prorate: true,
        });
      }
    } catch (error) {
      Sentry.captureException(error, {
        extra: {
          customerId: customerId,
          fromPriceId: fromPriceId,
          sp2: false,
        },
      });
    }

    return upgradedSubscription;
  }
}
