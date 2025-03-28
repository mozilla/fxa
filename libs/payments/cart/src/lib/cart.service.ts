/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Inject, Injectable } from '@nestjs/common';
import * as Sentry from '@sentry/node';
import assert from 'assert';
import assertNotNull from 'assert';
import { StatsD } from 'hot-shots';

import {
  CustomerManager,
  InvoiceManager,
  SubplatInterval,
  PromotionCodeManager,
  SubscriptionManager,
  InvoicePreview,
  PaymentMethodManager,
  CouponErrorExpired,
  CouponErrorGeneric,
  CouponErrorLimitReached,
  CustomerSessionManager,
  PaymentIntentManager,
  determinePaymentMethodType,
  retrieveSubscriptionItem,
  PromotionCodeCouldNotBeAttachedError,
  TaxAddress,
} from '@fxa/payments/customer';
import { EligibilityService } from '@fxa/payments/eligibility';
import {
  AccountCustomerManager,
  AccountCustomerNotFoundError,
  StripeCustomer,
  StripeSubscription,
} from '@fxa/payments/stripe';
import {
  ProductConfigError,
  ProductConfigurationManager,
} from '@fxa/shared/cms';
import { CurrencyManager } from '@fxa/payments/currency';
import { AccountManager } from '@fxa/shared/account/account';
import {
  CartEligibilityStatus,
  CartErrorReasonId,
  CartState,
} from '@fxa/shared/db/mysql/account';
import { SanitizeExceptions } from '@fxa/shared/error';
import { MozLoggerService } from '@fxa/shared/mozlog';
import { StatsDService } from '@fxa/shared/metrics/statsd';

import {
  CartError,
  CartInvalidCurrencyError,
  CartInvalidPromoCodeError,
  CartInvalidStateForActionError,
  CartNotUpdatedError,
  CartStateProcessingError,
  CartSubscriptionNotFoundError,
} from './cart.error';
import { CartManager } from './cart.manager';
import type {
  CartDTO,
  CheckoutCustomerData,
  FromPrice,
  GetNeedsInputResponse,
  NoInputNeededResponse,
  PaymentInfo,
  ResultCart,
  StripeHandleNextActionResponse,
  UpdateCart,
} from './cart.types';
import { NeedsInputType } from './cart.types';
import { handleEligibilityStatusMap } from './cart.utils';
import { CheckoutFailedError } from './checkout.error';
import { CheckoutService } from './checkout.service';

// TODO - Add flow to handle situations where currency is not found
const DEFAULT_CURRENCY = 'USD';

type Constructor<T> = new (...args: any[]) => T;
interface WrapWithCartCatchOptions {
  errorAllowList: Constructor<Error>[];
}

@Injectable()
export class CartService {
  constructor(
    private accountCustomerManager: AccountCustomerManager,
    private accountManager: AccountManager,
    private cartManager: CartManager,
    private checkoutService: CheckoutService,
    private currencyManager: CurrencyManager,
    private customerManager: CustomerManager,
    private customerSessionManager: CustomerSessionManager,
    private promotionCodeManager: PromotionCodeManager,
    private eligibilityService: EligibilityService,
    private invoiceManager: InvoiceManager,
    private log: MozLoggerService,
    private productConfigurationManager: ProductConfigurationManager,
    private subscriptionManager: SubscriptionManager,
    private paymentMethodManager: PaymentMethodManager,
    private paymentIntentManager: PaymentIntentManager,
    @Inject(StatsDService) private statsd: StatsD
  ) {
    this.log.setContext(CartService.name);
  }

  /**
   * Should be used to wrap any method that mutates an existing cart.
   * This transforms errors into a cart error reason ID and finalizes the cart with an error.
   */
  private async wrapWithCartCatch<T>(
    cartId: string,
    method: () => Promise<T>
  ): Promise<T>;
  private async wrapWithCartCatch<T>(
    cartId: string,
    options: WrapWithCartCatchOptions,
    method: () => Promise<T>
  ): Promise<T>;
  private async wrapWithCartCatch<T>(
    cartId: string,
    arg2: WrapWithCartCatchOptions | (() => Promise<T>),
    arg3?: () => Promise<T>
  ): Promise<T> {
    let options: WrapWithCartCatchOptions | undefined;
    let method: () => Promise<T>;
    if (typeof arg2 === 'function') {
      method = arg2;
    } else {
      options = arg2;
      method = arg3 as () => Promise<T>;
    }
    try {
      return await method();
    } catch (error) {
      // If the error is in the allowlist, rethrow it
      if (
        error instanceof Error &&
        options?.errorAllowList &&
        options.errorAllowList.some((ErrorClass) => error instanceof ErrorClass)
      ) {
        throw error;
      }

      let errorReasonId = CartErrorReasonId.Unknown;
      if (error instanceof CartNotUpdatedError) {
        errorReasonId = CartErrorReasonId.BASIC_ERROR;
      }

      // All unexpected/untyped errors should go to Sentry
      if (errorReasonId === CartErrorReasonId.Unknown) {
        Sentry.captureException(error, {
          extra: {
            cartId,
          },
        });
      }

      try {
        await this.cartManager.finishErrorCart(cartId, {
          errorReasonId,
        });

        const cart = await this.cartManager.fetchCartById(cartId);
        if (cart.stripeSubscriptionId) {
          const subscription = await this.subscriptionManager.retrieve(
            cart.stripeSubscriptionId
          );
          const invoice = subscription.latest_invoice
            ? await this.invoiceManager.retrieve(subscription.latest_invoice)
            : undefined;
          if (invoice) {
            switch (invoice.status) {
              case 'draft':
                await this.invoiceManager.delete(invoice.id);
                break;
              case 'open':
              case 'uncollectible':
                await this.invoiceManager.void(invoice.id);
                break;
              case 'paid':
                throw new CartError('Paid invoice found on failed cart', {
                  cartId,
                  stripeCustomerId: cart.stripeCustomerId,
                  invoiceId: invoice.id,
                });
            }
          }

          const paymentIntent =
            await this.subscriptionManager.getLatestPaymentIntent(subscription);
          if (paymentIntent?.status === 'succeeded') {
            throw new CartError('Paid payment intent found on failed cart', {
              cartId,
              stripeCustomerId: cart.stripeCustomerId,
              paymentIntentId: paymentIntent.id,
            });
          }
          try {
            if (paymentIntent) {
              await this.paymentIntentManager.cancel(paymentIntent.id);
            }
          } catch (e) {
            // swallow the error to allow cancellation of the subscription
            Sentry.captureException(e, {
              extra: {
                cartId,
              },
            });
          }

          if (cart.eligibilityStatus === CartEligibilityStatus.CREATE) {
            await this.subscriptionManager.cancel(cart.stripeSubscriptionId, {
              cancellation_details: {
                comment: 'Automatic Cancellation: Cart checkout failed.',
              },
            });
          } else {
            this.statsd.increment(
              'checkout_failure_subscription_not_cancelled'
            );

            this.log.info('checkout failed, subscription not canceled', {
              eligibility_status: cart.eligibilityStatus,
              offering_id: cart.offeringConfigId,
              interval: cart.interval,
            });
          }
        }
      } catch (e) {
        // All errors thrown during the cleanup process should go to Sentry
        Sentry.captureException(e, {
          extra: {
            cartId,
          },
        });
      }

      throw error;
    }
  }

  /**
   * Initialize a brand new cart
   * **Note**: This method is currently a placeholder. The arguments will likely change, and the internal implementation is far from complete.
   */
  @SanitizeExceptions({
    allowlist: [CartInvalidPromoCodeError, ProductConfigError],
  })
  async setupCart(args: {
    interval: SubplatInterval;
    offeringConfigId: string;
    taxAddress: TaxAddress;
    experiment?: string;
    promoCode?: string;
    uid?: string;
  }): Promise<ResultCart> {
    let accountCustomer;
    if (args.uid) {
      accountCustomer = await this.accountCustomerManager
        .getAccountCustomerByUid(args.uid)
        .catch((error) => {
          if (!(error instanceof AccountCustomerNotFoundError)) {
            throw error;
          }
        });
    }

    const stripeCustomerId = accountCustomer?.stripeCustomerId;
    const stripeCustomer = stripeCustomerId
      ? await this.customerManager.retrieve(stripeCustomerId)
      : undefined;

    const price = await this.productConfigurationManager.retrieveStripePrice(
      args.offeringConfigId,
      args.interval
    );

    const currency = this.currencyManager.getCurrencyForCountry(
      args.taxAddress.countryCode
    );
    if (!currency) {
      throw new CartInvalidCurrencyError(
        currency,
        args.taxAddress.countryCode,
        undefined
      );
    }

    const [upcomingInvoice, eligibility] = await Promise.all([
      this.invoiceManager.previewUpcoming({
        priceId: price.id,
        currency,
        customer: stripeCustomer,
        taxAddress: args.taxAddress,
        couponCode: args.promoCode,
      }),
      this.eligibilityService.checkEligibility(
        args.interval,
        args.offeringConfigId,
        accountCustomer?.stripeCustomerId
      ),
    ]);

    const cartEligibilityStatus =
      handleEligibilityStatusMap[eligibility.subscriptionEligibilityResult];

    if (args.promoCode) {
      try {
        await this.promotionCodeManager.assertValidPromotionCodeNameForPrice(
          args.promoCode,
          price,
          currency
        );
      } catch (e) {
        throw new CartInvalidPromoCodeError(args.promoCode);
      }
    }

    const cart = await this.cartManager.createCart({
      interval: args.interval,
      offeringConfigId: args.offeringConfigId,
      amount: upcomingInvoice.subtotal,
      uid: args.uid,
      stripeCustomerId: accountCustomer?.stripeCustomerId || undefined,
      experiment: args.experiment,
      taxAddress: args.taxAddress,
      currency,
      eligibilityStatus: cartEligibilityStatus,
      couponCode: args.promoCode,
    });

    if (cartEligibilityStatus === CartEligibilityStatus.INVALID) {
      await this.finalizeCartWithError(
        cart.id,
        CartErrorReasonId.CartEligibilityStatusInvalid
      );
    }

    if (cartEligibilityStatus === CartEligibilityStatus.DOWNGRADE) {
      await this.finalizeCartWithError(
        cart.id,
        CartErrorReasonId.CartEligibilityStatusDowngrade
      );
    }

    return cart;
  }

  /**
   * Create a new cart with the contents of an existing cart, in the initial state.
   */
  @SanitizeExceptions()
  async restartCart(cartId: string): Promise<ResultCart> {
    return this.wrapWithCartCatch(cartId, async () => {
      const oldCart = await this.cartManager.fetchCartById(cartId);

      if (oldCart.couponCode) {
        try {
          const price =
            await this.productConfigurationManager.retrieveStripePrice(
              oldCart.offeringConfigId,
              oldCart.interval as SubplatInterval
            );

          await this.promotionCodeManager.assertValidPromotionCodeNameForPrice(
            oldCart.couponCode,
            price,
            oldCart.currency || DEFAULT_CURRENCY
          );
        } catch (e) {
          throw new CartInvalidPromoCodeError(oldCart.couponCode);
        }
      }

      const accountCustomer = oldCart.uid
        ? await this.accountCustomerManager
            .getAccountCustomerByUid(oldCart.uid)
            .catch((error) => {
              if (!(error instanceof AccountCustomerNotFoundError)) {
                throw error;
              }
            })
        : undefined;

      if (!(oldCart.taxAddress && oldCart.currency)) {
        throw new CartError(
          'Cart must have a tax address and currency to restart',
          {
            cartId: oldCart.id,
            taxAddress: oldCart.taxAddress,
            currency: oldCart.currency,
          }
        );
      }

      return await this.cartManager.createCart({
        uid: oldCart.uid,
        interval: oldCart.interval,
        offeringConfigId: oldCart.offeringConfigId,
        experiment: oldCart.experiment || undefined,
        taxAddress: oldCart.taxAddress,
        currency: oldCart.currency,
        couponCode: oldCart.couponCode || undefined,
        stripeCustomerId: accountCustomer?.stripeCustomerId || undefined,
        amount: oldCart.amount,
        eligibilityStatus: oldCart.eligibilityStatus,
      });
    });
  }

  @SanitizeExceptions()
  async checkoutCartWithStripe(
    cartId: string,
    version: number,
    confirmationTokenId: string,
    customerData: CheckoutCustomerData
  ) {
    return this.wrapWithCartCatch(cartId, async () => {
      let updatedCart: ResultCart | null = null;
      try {
        //Ensure that the cart version matches the value passed in from FE
        await this.cartManager.fetchAndValidateCartVersion(cartId, version);

        await this.cartManager.setProcessingCart(cartId);

        // Ensure we have a positive lock on the processing cart
        updatedCart = await this.cartManager.fetchAndValidateCartVersion(
          cartId,
          version + 1
        );
      } catch (e) {
        throw new CartStateProcessingError(cartId, e);
      }

      // Intentionally non-blocking
      this.wrapWithCartCatch(cartId, async () => {
        await this.checkoutService.payWithStripe(
          updatedCart,
          confirmationTokenId,
          customerData
        );
      });
    });
  }

  @SanitizeExceptions()
  async checkoutCartWithPaypal(
    cartId: string,
    version: number,
    customerData: CheckoutCustomerData,
    token?: string
  ) {
    return this.wrapWithCartCatch(cartId, async () => {
      let updatedCart: ResultCart | null = null;
      try {
        //Ensure that the cart version matches the value passed in from FE
        await this.cartManager.fetchAndValidateCartVersion(cartId, version);

        await this.cartManager.setProcessingCart(cartId);

        // Ensure we have a positive lock on the processing cart
        updatedCart = await this.cartManager.fetchAndValidateCartVersion(
          cartId,
          version + 1
        );
      } catch (e) {
        throw new CartStateProcessingError(cartId, e);
      }

      // Intentionally non-blocking
      this.wrapWithCartCatch(cartId, async () => {
        await this.checkoutService.payWithPaypal(
          updatedCart,
          customerData,
          token
        );
      });
    });
  }

  @SanitizeExceptions()
  async finalizeProcessingCart(cartId: string): Promise<void> {
    return this.wrapWithCartCatch(cartId, async () => {
      const cart = await this.cartManager.fetchCartById(cartId);

      if (!cart.uid) {
        throw new CartError('Cart must have a uid to finalize', { cartId });
      }

      if (!cart.stripeSubscriptionId) {
        throw new CartSubscriptionNotFoundError(cartId);
      }
      const subscription = await this.subscriptionManager.retrieve(
        cart.stripeSubscriptionId
      );
      if (!subscription) {
        throw new CartSubscriptionNotFoundError(cartId);
      }
      await this.checkoutService.postPaySteps({
        cart,
        version: cart.version,
        subscription,
        uid: cart.uid,
        paymentProvider:
          this.subscriptionManager.getPaymentProvider(subscription),
      });
    });
  }

  /**
   * Update a cart in the database by ID or with an existing cart reference
   * **Note**: This method is currently a placeholder. The arguments will likely change, and the internal implementation is far from complete.
   */
  @SanitizeExceptions()
  async finalizeCartWithError(
    cartId: string,
    errorReasonId: CartErrorReasonId
  ): Promise<void> {
    try {
      await this.cartManager.finishErrorCart(cartId, {
        errorReasonId,
      });
    } catch (e) {
      const cart = await this.cartManager.fetchCartById(cartId);
      if (cart.state !== CartState.FAIL) {
        throw e;
      }
    }
  }

  /**
   * Update a cart in the database by ID or with an existing cart reference
   */
  @SanitizeExceptions({
    allowlist: [
      CouponErrorExpired,
      CouponErrorGeneric,
      CouponErrorLimitReached,
    ],
  })
  async updateCart(cartId: string, version: number, cartDetails: UpdateCart) {
    return this.wrapWithCartCatch(
      cartId,
      { errorAllowList: [PromotionCodeCouldNotBeAttachedError] },
      async () => {
        const oldCart = await this.cartManager.fetchCartById(cartId);
        if (cartDetails?.couponCode) {
          const price =
            await this.productConfigurationManager.retrieveStripePrice(
              oldCart.offeringConfigId,
              oldCart.interval as SubplatInterval
            );

          await this.promotionCodeManager.assertValidPromotionCodeNameForPrice(
            cartDetails.couponCode,
            price,
            cartDetails.currency || DEFAULT_CURRENCY
          );
        }

        if (cartDetails.taxAddress?.countryCode) {
          cartDetails.currency = this.currencyManager.getCurrencyForCountry(
            cartDetails.taxAddress?.countryCode
          );
          if (!cartDetails.currency) {
            throw new CartInvalidCurrencyError(
              cartDetails.currency,
              cartDetails.taxAddress.countryCode
            );
          }
        }

        await this.cartManager.updateFreshCart(cartId, version, cartDetails);
      }
    );
  }

  /**
   * Fetch a cart from the database by ID
   */
  @SanitizeExceptions()
  async getCart(cartId: string): Promise<CartDTO> {
    const cart = (await this.cartManager.fetchCartById(
      cartId
    )) as ResultCart & { taxAddress: TaxAddress; currency: string };

    assert(cart.taxAddress !== null, 'Cart must have a tax address');
    assert(cart.currency !== null, 'Cart must have a currency');

    const [price, metricsOptedOut] = await Promise.all([
      this.productConfigurationManager.retrieveStripePrice(
        cart.offeringConfigId,
        cart.interval as SubplatInterval
      ),
      this.metricsOptedOut(cart.uid),
    ]);

    let customer: StripeCustomer | undefined;
    let subscriptions: StripeSubscription[] = [];
    if (cart.stripeCustomerId) {
      [customer, subscriptions] = await Promise.all([
        this.customerManager.retrieve(cart.stripeCustomerId),
        this.subscriptionManager.listForCustomer(cart.stripeCustomerId),
      ]);
    }

    const eligibility = await this.eligibilityService.checkEligibility(
      cart.interval as SubplatInterval,
      cart.offeringConfigId,
      cart.stripeCustomerId
    );

    const cartEligibilityStatus =
      handleEligibilityStatusMap[eligibility.subscriptionEligibilityResult];

    let upcomingInvoicePreview: InvoicePreview | undefined;
    if (
      cartEligibilityStatus === CartEligibilityStatus.UPGRADE &&
      cart.state === CartState.START
    ) {
      assert(
        'fromPrice' in eligibility,
        'fromPrice not present for upgrade cart'
      );
      assert(customer, 'Customer is required for upgrade');
      const fromSubscription =
        await this.subscriptionManager.retrieveForCustomerAndPrice(
          customer.id,
          eligibility.fromPrice.id
        );
      assert(fromSubscription, 'Subscription required');
      const fromSubscriptionItem = retrieveSubscriptionItem(fromSubscription);
      upcomingInvoicePreview =
        await this.invoiceManager.previewUpcomingForUpgrade({
          priceId: price.id,
          customer,
          fromSubscriptionItem,
        });
    } else {
      upcomingInvoicePreview = await this.invoiceManager.previewUpcoming({
        priceId: price.id,
        currency: cart.currency,
        customer,
        taxAddress: cart.taxAddress,
        couponCode: cart.couponCode || undefined,
      });
    }

    let paymentInfo: PaymentInfo | undefined;
    const paymentMethodType = determinePaymentMethodType(
      customer,
      subscriptions
    );
    if (paymentMethodType?.type === 'stripe') {
      const paymentMethodPromise = this.paymentMethodManager.retrieve(
        paymentMethodType.paymentMethodId
      );
      const customerSessionPromise = cart.stripeCustomerId
        ? this.customerSessionManager.create(cart.stripeCustomerId)
        : undefined;
      const [paymentMethod, customerSession] = await Promise.all([
        paymentMethodPromise,
        customerSessionPromise,
      ]);
      paymentInfo = {
        type: paymentMethod.type,
        last4: paymentMethod.card?.last4,
        brand: paymentMethod.card?.brand,
        customerSessionClientSecret: customerSession?.client_secret,
      };
    } else if (paymentMethodType?.type === 'external_paypal') {
      paymentInfo = {
        type: 'external_paypal',
      };
    }

    // Cart latest invoice data
    let latestInvoicePreview: InvoicePreview | undefined;
    if (customer && cart.stripeSubscriptionId) {
      const subscription = subscriptions.find(
        (subscription) => subscription.id === cart.stripeSubscriptionId
      );
      // fetch latest payment info from subscription
      assert(subscription?.latest_invoice, 'Subscription not found');
      latestInvoicePreview = await this.invoiceManager.preview(
        subscription.latest_invoice
      );
    }

    if (cart.state === CartState.SUCCESS) {
      assert(
        latestInvoicePreview,
        'latestInvoicePreview not present for success cart'
      );
      assert(paymentInfo, 'paymentInfo not present for success cart');

      return {
        ...cart,
        state: CartState.SUCCESS,
        upcomingInvoicePreview,
        metricsOptedOut,
        latestInvoicePreview,
        paymentInfo,
      };
    }

    let fromPrice: FromPrice | undefined;
    if (cartEligibilityStatus === CartEligibilityStatus.UPGRADE) {
      assert('fromPrice' in eligibility, 'fromPrice not present for upgrade');
      assertNotNull(eligibility.fromPrice.unit_amount);
      assertNotNull(eligibility.fromPrice.recurring);
      fromPrice = {
        currency: eligibility.fromPrice.currency,
        interval: eligibility.fromPrice.recurring.interval,
        listAmount: eligibility.fromPrice.unit_amount,
      };
    }

    return {
      ...cart,
      state: cart.state,
      upcomingInvoicePreview,
      latestInvoicePreview,
      metricsOptedOut,
      paymentInfo,
      fromOfferingConfigId:
        'fromOfferingConfigId' in eligibility
          ? eligibility.fromOfferingConfigId
          : undefined,
      fromPrice: 'fromPrice' in eligibility ? fromPrice : undefined,
    };
  }

  async metricsOptedOut(accountId?: string): Promise<boolean> {
    if (accountId) {
      const accountResp = await this.accountManager.getAccounts([accountId]);
      return accountResp && accountResp.length > 0
        ? accountResp[0].metricsOptOutAt !== null
        : false;
    } else {
      return false;
    }
  }

  @SanitizeExceptions()
  async getNeedsInput(cartId: string): Promise<GetNeedsInputResponse> {
    const cart = await this.cartManager.fetchCartById(cartId);

    if (cart.state !== CartState.NEEDS_INPUT) {
      throw new CartInvalidStateForActionError(
        cartId,
        cart.state,
        'getNeedsInput'
      );
    }

    if (!cart.stripeSubscriptionId) {
      throw new CartSubscriptionNotFoundError(cartId);
    }

    const subscription = await this.subscriptionManager.retrieve(
      cart.stripeSubscriptionId
    );
    if (!subscription) {
      throw new CartSubscriptionNotFoundError(cartId);
    }

    const paymentIntent = await this.subscriptionManager.getLatestPaymentIntent(
      subscription
    );
    if (!paymentIntent) {
      throw new CartError('no payment intent found for cart subscription', {
        cartId,
        subscription: subscription.id,
      });
    }

    if (paymentIntent.status === 'requires_action') {
      return {
        inputType: NeedsInputType.StripeHandleNextAction,
        data: { clientSecret: paymentIntent.client_secret },
      } as StripeHandleNextActionResponse;
    } else {
      await this.cartManager.setProcessingCart(cartId);
      return { inputType: NeedsInputType.NotRequired } as NoInputNeededResponse;
    }
  }

  @SanitizeExceptions({ allowlist: [CheckoutFailedError] })
  async submitNeedsInput(cartId: string) {
    return this.wrapWithCartCatch(cartId, async () => {
      const cart = await this.cartManager.fetchCartById(cartId);
      assert(cart.stripeCustomerId, 'Cart must have a stripeCustomerId');
      assert(
        cart.stripeSubscriptionId,
        'Cart must have a stripeSubscriptionId'
      );
      assert(cart.uid, 'Cart must have a uid');

      if (cart.state !== CartState.NEEDS_INPUT) {
        throw new CartInvalidStateForActionError(
          cartId,
          cart.state,
          'submitNeedsInput'
        );
      }

      const subscription = await this.subscriptionManager.retrieve(
        cart.stripeSubscriptionId
      );
      const paymentIntent =
        await this.subscriptionManager.getLatestPaymentIntent(subscription);

      const customer = await this.customerManager.retrieve(
        cart.stripeCustomerId
      );

      if (paymentIntent && paymentIntent.status === 'succeeded') {
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
        const subscription = await this.subscriptionManager.retrieve(
          cart.stripeSubscriptionId
        );
        await this.checkoutService.postPaySteps({
          cart,
          version: cart.version,
          subscription,
          uid: cart.uid,
          paymentProvider:
            this.subscriptionManager.getPaymentProvider(subscription),
        });
      } else {
        const promises: Promise<any>[] = [
          this.finalizeCartWithError(cartId, CartErrorReasonId.Unknown),
        ];
        if (cart.stripeSubscriptionId) {
          promises.push(
            this.subscriptionManager.cancel(cart.stripeSubscriptionId)
          );
        }
        await Promise.all([promises]);
        throw new CheckoutFailedError(`Payment failed for cart ${cartId}`);
      }
    });
  }
}
