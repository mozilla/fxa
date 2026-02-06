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
  type SubscriptionEligibilityResult,
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
  SetupIntentManager,
  type TaxAddress,
  PaymentMethodManager,
  SubPlatPaymentMethodType,
} from '@fxa/payments/customer';
import {
  AccountCustomerManager,
  StripeSubscription,
  StripeCustomer,
  StripePromotionCode,
  type StripePaymentIntent,
  type StripeSetupIntent,
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
  CartUidNotFoundError,
  CartNoTaxAddressError,
  PrepayCartCurrencyNotFoundError,
  CartUidMismatchError,
} from './cart.error';
import { CartManager } from './cart.manager';
import { ResultCart } from './cart.types';
import {
  handleEligibilityStatusMap,
  convertStripePaymentMethodTypeToSubPlat,
} from './cart.utils';
import type {
  PrePayStepsResult,
  SubscriptionAttributionParams,
} from './checkout.types';
import assert from 'assert';
import {
  InvalidInvoiceStateCheckoutError,
  InvalidIntentStateError,
  LatestInvoiceNotFoundOnSubscriptionError,
  PaymentMethodUpdateFailedError,
  UpgradeForSubscriptionNotFoundError,
  DetermineCheckoutAmountCustomerRequiredError,
  DetermineCheckoutAmountSubscriptionRequiredError,
  PayWithStripeLatestInvoiceNotFoundOnSubscriptionError,
  PayWithPaypalNullCurrencyError,
  PayWithStripeNullCurrencyError,
  UpgradeSubscriptionNullCurrencyError,
} from './checkout.error';
import { isPaymentIntentId } from './util/isPaymentIntentId';
import { isPaymentIntent } from './util/isPaymentIntent';
import { throwIntentFailedError } from './util/throwIntentFailedError';
import type { AsyncLocalStorage } from 'async_hooks';
import { AsyncLocalStorageCart } from './cart-als.provider';
import type { CartStore } from './cart-als.types';
import {
  type CommonMetrics,
  PaymentsGleanService,
} from '@fxa/payments/metrics';
import { isCancelInterstitialOffer } from './util/isCancelInterstitialOffer';

@Injectable()
export class CheckoutService {
  constructor(
    private accountCustomerManager: AccountCustomerManager,
    private accountManager: AccountManager,
    @Inject(AsyncLocalStorageCart)
    private cartAsyncLocalStorage: AsyncLocalStorage<CartStore>,
    private cartManager: CartManager,
    private customerManager: CustomerManager,
    private eligibilityService: EligibilityService,
    private invoiceManager: InvoiceManager,
    private notifierService: NotifierService,
    private paymentIntentManager: PaymentIntentManager,
    private setupIntentManager: SetupIntentManager,
    private paypalBillingAgreementManager: PaypalBillingAgreementManager,
    private paypalCustomerManager: PaypalCustomerManager,
    private priceManager: PriceManager,
    private productConfigurationManager: ProductConfigurationManager,
    private profileClient: ProfileClient,
    private promotionCodeManager: PromotionCodeManager,
    private subscriptionManager: SubscriptionManager,
    private paymentMethodManager: PaymentMethodManager,
    private gleanService: PaymentsGleanService,
    @Inject(StatsDService) private statsd: StatsD
  ) {}

  /**
   * Reload the customer data to reflect a change.
   * NOTE: This is currently duplicated in subscriptionManagement.service.ts
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
    sessionUid?: string
  ): Promise<PrePayStepsResult> {
    const taxAddress = cart.taxAddress;
    if (!taxAddress) {
      throw new CartNoTaxAddressError(cart.id);
    }

    let version = cart.version;

    if (!cart.currency) {
      throw new PrepayCartCurrencyNotFoundError(
        cart.currency || undefined,
        taxAddress.countryCode,
        cart.id
      );
    }

    const uid = cart.uid;
    if (!uid) {
      throw new CartUidNotFoundError(cart.id);
    }

    if (cart.uid !== sessionUid) {
      throw new CartUidMismatchError(cart.uid, sessionUid);
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

    const checkoutAmount = await this.determineCheckoutAmount({
      eligibility,
      customer,
      priceId: price.id,
      currency: cart.currency,
      taxAddress,
    });
    if (checkoutAmount !== cart.amount) {
      throw new CartTotalMismatchError(cart.id, cart.amount, checkoutAmount);
    }

    // check if customer already has subscription to price and cancel if they do
    await this.subscriptionManager.cancelIncompleteSubscriptionsToPrice(
      stripeCustomerId,
      price.id
    );

    const enableAutomaticTax = this.customerManager.isTaxEligible(customer);

    let promotionCode: StripePromotionCode | undefined;
    if (cart.couponCode) {
      await this.promotionCodeManager.assertValidPromotionCodeNameForPrice(
        cart.couponCode,
        price,
        cart.currency
      );

      promotionCode = await this.promotionCodeManager.retrieveByName(
        cart.couponCode
      );
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
    paymentForm: SubPlatPaymentMethodType;
    isCancelInterstitialOffer: boolean;
    requestArgs?: CommonMetrics;
  }) {
    const { cart, version, subscription, uid, paymentProvider, paymentForm } =
      args;
    const { customer: customerId, currency } = subscription;

    await this.customerManager.setTaxId(customerId, currency);

    await this.customerChanged(uid);

    if (cart.couponCode) {
      await this.subscriptionManager.update(subscription.id, {
        metadata: {
          [STRIPE_SUBSCRIPTION_METADATA.SubscriptionPromotionCode]:
            cart.couponCode,
        },
      });
    }

    await this.cartManager.finishCart(cart.id, version, {});

    if (args.isCancelInterstitialOffer && args.requestArgs) {
      this.gleanService.recordGenericSubManageEvent({
        eventName: 'recordCancelInterstitialOfferRedeemed',
        uid,
        subscriptionId: subscription.id,
        commonMetrics: args.requestArgs,
      });
    }

    this.statsd.increment('subscription_success', {
      payment_provider: paymentProvider,
      payment_form: paymentForm,
      offering_id: cart.offeringConfigId,
      interval: cart.interval,
    });
  }

  async payWithStripe(
    cart: ResultCart,
    confirmationTokenId: string,
    attribution: SubscriptionAttributionParams,
    requestArgs: CommonMetrics,
    sessionUid?: string
  ) {
    const {
      uid,
      customer,
      enableAutomaticTax,
      promotionCode,
      version,
      price,
      eligibility,
    } = await this.prePaySteps(cart, sessionUid);

    this.statsd.increment('stripe_subscription', {
      payment_provider: 'stripe',
    });

    const { unitAmountForCurrency } =
      await this.priceManager.retrievePricingForCurrency(
        price.id,
        cart.currency
      );
    assertNotNull(
      unitAmountForCurrency,
      new PayWithStripeNullCurrencyError(cart.id, price.id)
    );

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
                [STRIPE_SUBSCRIPTION_METADATA.UtmCampaign]:
                  attribution.utm_campaign,
                [STRIPE_SUBSCRIPTION_METADATA.UtmContent]:
                  attribution.utm_content,
                [STRIPE_SUBSCRIPTION_METADATA.UtmMedium]:
                  attribution.utm_medium,
                [STRIPE_SUBSCRIPTION_METADATA.UtmSource]:
                  attribution.utm_source,
                [STRIPE_SUBSCRIPTION_METADATA.UtmTerm]: attribution.utm_term,
                [STRIPE_SUBSCRIPTION_METADATA.SessionFlowId]:
                  attribution.session_flow_id,
                [STRIPE_SUBSCRIPTION_METADATA.SessionEntrypoint]:
                  attribution.session_entrypoint,
                [STRIPE_SUBSCRIPTION_METADATA.SessionEntrypointExperiment]:
                  attribution.session_entrypoint_experiment,
                [STRIPE_SUBSCRIPTION_METADATA.SessionEntrypointVariation]:
                  attribution.session_entrypoint_variation,
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
            eligibility.redundantOverlaps || [],
            attribution
          );

    // Write the subscription ID to the async local storage
    // so that it can be used in situations where it hasn't been
    // added to the cart yet.
    // Currently used by wrapWithCartCatch
    const store = this.cartAsyncLocalStorage.getStore();
    if (store) {
      store.checkout.subscriptionId = subscription.id;
    }

    // Get payment/setup intent for subscription
    let intent: StripePaymentIntent | StripeSetupIntent | undefined;
    try {
      assert(
        subscription.latest_invoice,
        new PayWithStripeLatestInvoiceNotFoundOnSubscriptionError(
          cart.id,
          subscription.id
        )
      );
      const invoice = await this.invoiceManager.retrieve(
        subscription.latest_invoice
      );

      if (invoice.payment_intent && invoice.amount_due !== 0) {
        intent = await this.paymentIntentManager.confirm(
          invoice.payment_intent,
          {
            confirmation_token: confirmationTokenId,
            off_session: false,
          }
        );
      } else {
        intent = await this.setupIntentManager.createAndConfirm(
          customer.id,
          confirmationTokenId
        );

        this.statsd.increment('checkout_stripe_payment_setupintent_status', {
          status: intent.status,
        });
      }
    } catch (error) {
      if (error?.payment_intent) {
        intent = error.payment_intent;
      } else if (error?.setup_intent) {
        intent = error.setup_intent;
      }

      if (!intent) {
        // At least update the cart with the subscription ID before throwing
        await this.cartManager.updateFreshCart(cart.id, version, {
          stripeSubscriptionId: subscription.id,
        });
        throw error;
      }
    }

    await this.cartManager.updateFreshCart(cart.id, version, {
      stripeSubscriptionId: subscription.id,
      stripeIntentId: intent.id,
    });

    const updatedVersion = version + 1;

    if (intent) {
      if (intent.status === 'requires_action') {
        await this.cartManager.setNeedsInputCart(cart.id);
        return;
      } else if (intent.status === 'succeeded') {
        if (intent.payment_method) {
          await this.customerManager.update(customer.id, {
            invoice_settings: {
              default_payment_method: intent.payment_method,
            },
          });
        } else {
          throw new PaymentMethodUpdateFailedError(cart.id, customer.id);
        }
        const paymentMethod = await this.paymentMethodManager.retrieve(
          intent.payment_method
        );
        const paymentForm =
          convertStripePaymentMethodTypeToSubPlat(paymentMethod);

        await this.postPaySteps({
          cart,
          version: updatedVersion,
          subscription,
          uid,
          paymentProvider: 'stripe',
          paymentForm,
          isCancelInterstitialOffer: isCancelInterstitialOffer(
            eligibility.subscriptionEligibilityResult,
            attribution.session_entrypoint
          ),
          requestArgs,
        });
      } else if (intent.status === 'requires_payment_method') {
        const errorCode = isPaymentIntent(intent)
          ? intent.last_payment_error?.code
          : intent.last_setup_error?.code;
        const declineCode = isPaymentIntent(intent)
          ? intent.last_payment_error?.decline_code
          : intent.last_setup_error?.decline_code;

        throwIntentFailedError(
          errorCode,
          declineCode,
          cart.id,
          intent.id,
          isPaymentIntentId(intent.id) ? 'PaymentIntent' : 'SetupIntent'
        );
      } else {
        throw new InvalidIntentStateError(
          cart.id,
          intent.id,
          intent.status,
          isPaymentIntentId(intent.id) ? 'PaymentIntent' : 'SetupIntent'
        );
      }
    }
  }

  async payWithPaypal(
    cart: ResultCart,
    attribution: SubscriptionAttributionParams,
    requestArgs: CommonMetrics,
    sessionUid?: string,
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
    } = await this.prePaySteps(cart, sessionUid);

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
    assertNotNull(
      unitAmountForCurrency,
      new PayWithPaypalNullCurrencyError(cart.id, price.id)
    );

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
                [STRIPE_SUBSCRIPTION_METADATA.UtmCampaign]:
                  attribution.utm_campaign,
                [STRIPE_SUBSCRIPTION_METADATA.UtmContent]:
                  attribution.utm_content,
                [STRIPE_SUBSCRIPTION_METADATA.UtmMedium]:
                  attribution.utm_medium,
                [STRIPE_SUBSCRIPTION_METADATA.UtmSource]:
                  attribution.utm_source,
                [STRIPE_SUBSCRIPTION_METADATA.UtmTerm]: attribution.utm_term,
                [STRIPE_SUBSCRIPTION_METADATA.SessionFlowId]:
                  attribution.session_flow_id,
                [STRIPE_SUBSCRIPTION_METADATA.SessionEntrypoint]:
                  attribution.session_entrypoint,
                [STRIPE_SUBSCRIPTION_METADATA.SessionEntrypointExperiment]:
                  attribution.session_entrypoint_experiment,
                [STRIPE_SUBSCRIPTION_METADATA.SessionEntrypointVariation]:
                  attribution.session_entrypoint_variation,
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
            eligibility.redundantOverlaps || [],
            attribution
          );

    // Write the subscription ID to the async local storage
    // so that it can be used in situations where it hasn't been
    // added to the cart yet.
    // Currently used by wrapWithCartCatch
    const store = this.cartAsyncLocalStorage.getStore();
    if (store) {
      store.checkout.subscriptionId = subscription.id;
    }

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
      throw new LatestInvoiceNotFoundOnSubscriptionError(
        cart.id,
        subscription.id
      );
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
        paymentForm: SubPlatPaymentMethodType.PayPal,
        isCancelInterstitialOffer: isCancelInterstitialOffer(
          eligibility.subscriptionEligibilityResult,
          attribution.session_entrypoint
        ),
        requestArgs,
      });
    } else {
      throw new InvalidInvoiceStateCheckoutError(
        cart.id,
        processedInvoice.id,
        processedInvoice.status ?? undefined
      );
    }
  }

  async upgradeSubscription(
    customerId: string,
    toPriceId: string,
    fromPriceId: string,
    cart: ResultCart,
    redundantOverlaps: SubscriptionEligibilityUpgradeDowngradeResult[],
    attribution: SubscriptionAttributionParams
  ) {
    const upgradeSubscription =
      await this.subscriptionManager.retrieveForCustomerAndPrice(
        customerId,
        fromPriceId
      );

    if (!upgradeSubscription) {
      throw new UpgradeForSubscriptionNotFoundError(
        cart.id,
        customerId,
        fromPriceId,
        toPriceId
      );
    }

    const upgradeSubscriptionItem =
      retrieveSubscriptionItem(upgradeSubscription);

    const { unitAmountForCurrency } =
      await this.priceManager.retrievePricingForCurrency(
        toPriceId,
        cart.currency
      );
    assertNotNull(
      unitAmountForCurrency,
      new UpgradeSubscriptionNullCurrencyError(cart.id, toPriceId)
    );

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
          [STRIPE_SUBSCRIPTION_METADATA.UtmCampaign]: attribution.utm_campaign,
          [STRIPE_SUBSCRIPTION_METADATA.UtmContent]: attribution.utm_content,
          [STRIPE_SUBSCRIPTION_METADATA.UtmMedium]: attribution.utm_medium,
          [STRIPE_SUBSCRIPTION_METADATA.UtmSource]: attribution.utm_source,
          [STRIPE_SUBSCRIPTION_METADATA.UtmTerm]: attribution.utm_term,
          [STRIPE_SUBSCRIPTION_METADATA.SessionFlowId]:
            attribution.session_flow_id,
          [STRIPE_SUBSCRIPTION_METADATA.SessionEntrypoint]:
            attribution.session_entrypoint,
          [STRIPE_SUBSCRIPTION_METADATA.SessionEntrypointExperiment]:
            attribution.session_entrypoint_experiment,
          [STRIPE_SUBSCRIPTION_METADATA.SessionEntrypointVariation]:
            attribution.session_entrypoint_variation,
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
            [STRIPE_SUBSCRIPTION_METADATA.RedundantCancellation]: 'true',
            [STRIPE_SUBSCRIPTION_METADATA.AutoCancelledRedundantFor]:
              upgradedSubscription.id,
            [STRIPE_SUBSCRIPTION_METADATA.CancelledForCustomerAt]: Math.floor(
              Date.now() / 1000
            ),
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

  async determineCheckoutAmount({
    eligibility,
    customer,
    priceId,
    currency,
    taxAddress,
  }: {
    eligibility: SubscriptionEligibilityResult;
    priceId: string;
    currency: string;
    taxAddress: TaxAddress;
    customer?: StripeCustomer;
  }) {
    if (
      eligibility.subscriptionEligibilityResult === EligibilityStatus.UPGRADE
    ) {
      assert(
        customer,
        new DetermineCheckoutAmountCustomerRequiredError(
          priceId,
          currency,
          taxAddress
        )
      );
      const fromSubscription =
        await this.subscriptionManager.retrieveForCustomerAndPrice(
          customer.id,
          eligibility.fromPrice.id
        );
      assert(
        fromSubscription,
        new DetermineCheckoutAmountSubscriptionRequiredError(
          customer.id,
          eligibility.fromPrice.id
        )
      );
      const fromSubscriptionItem = retrieveSubscriptionItem(fromSubscription);
      const upcomingInvoice =
        await this.invoiceManager.previewUpcomingForUpgrade({
          priceId,
          customer,
          fromSubscriptionItem,
        });
      return upcomingInvoice.subtotal;
    } else {
      const upcomingInvoice = await this.invoiceManager.previewUpcoming({
        priceId,
        currency,
        customer,
        taxAddress,
      });
      return upcomingInvoice.subtotal;
    }
  }
}
