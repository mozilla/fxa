/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Inject, Injectable, Logger } from '@nestjs/common';
import type { LoggerService } from '@nestjs/common';
import * as Sentry from '@sentry/node';
import assert from 'assert';
import assertNotNull from 'assert';
import { StatsD } from 'hot-shots';

import {
  CustomerManager,
  CouponErrorCannotRedeem,
  InvoiceManager,
  SubplatInterval,
  PromotionCodeManager,
  SubscriptionManager,
  InvoicePreview,
  PaymentMethodManager,
  CustomerSessionManager,
  PaymentIntentManager,
  determinePaymentMethodType,
  retrieveSubscriptionItem,
  TaxAddress,
  PriceManager,
  getSubplatInterval,
  SetupIntentManager,
  PromotionCodeError,
} from '@fxa/payments/customer';
import {
  EligibilityService,
  EligibilityStatus,
} from '@fxa/payments/eligibility';
import {
  AccountCustomerManager,
  AccountCustomerNotFoundError,
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
import { StatsDService } from '@fxa/shared/metrics/statsd';

import {
  PaidInvoiceOnFailedCartError,
  CartIntentNotFoundError,
  PaidPaymentIntendOnFailedCartError,
  SuccessfulIntentMissingPaymentMethodCartError,
  FinalizeWithoutUidCartError,
  TaxAndCurrencyRequiredCartError,
  UpdateStripeProcessingCartError,
  UpdatePayPalProcessingCartError,
  CartSetupInvalidPromoCodeError,
  CartRestartInvalidPromoCodeError,
  CartCouldNotRetrievePriceForCurrencyWhenAttemptingToGetCartCartError,
  GetCartSubscriptionIdCartError,
  SetupCartCurrencyNotFoundError,
  UpdateCartCurrencyNotFoundError,
  FinalizeWithoutSubscriptionIdCartError,
  FinalizeWithoutSubscriptionCartError,
  InvalidPromoCodeCartError,
  CartVersionMismatchError,
  CartInvalidStateForActionError,
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
  SetupCart,
  StripeHandleNextActionResponse,
  UpdateCart,
  UpdateCartInput,
} from './cart.types';
import { NeedsInputType } from './cart.types';
import { handleEligibilityStatusMap } from './cart.utils';
import { SubmitNeedsInputFailedError } from './checkout.error';
import { CheckoutService } from './checkout.service';
import { resolveErrorInstance } from './util/resolveErrorInstance';
import { isPaymentIntentId } from './util/isPaymentIntentId';
import { isPaymentIntent } from './util/isPaymentIntent';
import { throwIntentFailedError } from './util/throwIntentFailedError';
import type { SubscriptionAttributionParams } from './checkout.types';
import { handleException } from 'libs/shared/error/src/lib/sanitizeExceptionsDecorator';
import type { AsyncLocalStorage } from 'async_hooks';
import { AsyncLocalStorageCart } from './cart-als.provider';
import type { CartStore } from './cart-als.types';

type Constructor<T> = new (...args: any[]) => T;
interface WrapWithCartCatchOptions {
  errorAllowList: Constructor<Error>[];
}

const IGNORED_EXPECTED_ERRORS_STATSD = new Set([
  'PromotionCodePriceNotValidError',
  'PromotionCodeNotFoundError',
  'CouponErrorInvalidCode',
]);

@Injectable()
export class CartService {
  constructor(
    private accountCustomerManager: AccountCustomerManager,
    private accountManager: AccountManager,
    @Inject(AsyncLocalStorageCart)
    private asyncLocalStorage: AsyncLocalStorage<CartStore>,
    private cartManager: CartManager,
    private checkoutService: CheckoutService,
    private currencyManager: CurrencyManager,
    private customerManager: CustomerManager,
    private customerSessionManager: CustomerSessionManager,
    private eligibilityService: EligibilityService,
    private invoiceManager: InvoiceManager,
    @Inject(Logger) private log: LoggerService,
    private paymentMethodManager: PaymentMethodManager,
    private paymentIntentManager: PaymentIntentManager,
    private setupIntentManager: SetupIntentManager,
    private priceManager: PriceManager,
    private productConfigurationManager: ProductConfigurationManager,
    private promotionCodeManager: PromotionCodeManager,
    private subscriptionManager: SubscriptionManager,
    @Inject(StatsDService) private statsd: StatsD
  ) {}

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

      if (error.name && IGNORED_EXPECTED_ERRORS_STATSD.has(error.name)) {
        this.statsd.increment('checkout_failure_ignored_error', {
          errorName: error.name,
        });
      }
      const errorReasonId = resolveErrorInstance(error);

      this.statsd.increment('checkout_failure_unexpected', {
        errorReasonId,
      });

      try {
        await this.cartManager.finishErrorCart(cartId, {
          errorReasonId,
        });

        const cart = await this.cartManager.fetchCartById(cartId);
        const store = this.asyncLocalStorage.getStore();
        const subscriptionId =
          cart.stripeSubscriptionId || store?.checkout.subscriptionId;

        if (subscriptionId) {
          const subscription =
            await this.subscriptionManager.retrieve(subscriptionId);
          const invoice = subscription.latest_invoice
            ? await this.invoiceManager.retrieve(subscription.latest_invoice)
            : undefined;
          if (invoice) {
            switch (invoice.status) {
              case 'draft':
                await this.invoiceManager.safeFinalizeWithoutAutoAdvance(
                  invoice.id
                );
                await this.invoiceManager.void(invoice.id);
                break;
              case 'open':
              case 'uncollectible':
                await this.invoiceManager.void(invoice.id);
                break;
              case 'paid':
                const paidInvoiceError = new PaidInvoiceOnFailedCartError(
                  cartId,
                  invoice.id,
                  error,
                  cart.stripeCustomerId ?? undefined
                );
                this.log.error(paidInvoiceError);

                // swallow the error to allow cancellation of the subscription only when payment total is 0
                if (invoice.total !== 0) {
                  this.statsd.increment('non_zero_paid_invoice_on_failed_cart');
                  Sentry.captureException(paidInvoiceError, {
                    extra: {
                      cartId,
                    },
                  });
                  throw paidInvoiceError;
                }
            }
          }

          if (cart.stripeIntentId) {
            const intent = isPaymentIntentId(cart.stripeIntentId)
              ? await this.paymentIntentManager.retrieve(cart.stripeIntentId)
              : await this.setupIntentManager.retrieve(cart.stripeIntentId);
            if (intent?.status === 'succeeded') {
              throw new PaidPaymentIntendOnFailedCartError(
                cartId,
                intent.id,
                cart.stripeCustomerId ?? undefined
              );
            }

            if (!isPaymentIntentId(cart.stripeIntentId)) {
              try {
                await this.setupIntentManager.cancel(intent.id, intent.status);
              } catch (e) {
                // swallow the error to allow cancellation of the subscription
                this.log.error(e);
                Sentry.captureException(e, {
                  extra: {
                    cartId,
                  },
                });
              }
            }
          }

          if (cart.eligibilityStatus === CartEligibilityStatus.CREATE) {
            await this.subscriptionManager.cancel(subscriptionId, {
              cancellation_details: {
                comment: 'Automatic Cancellation: Cart checkout failed.',
              },
            });
          } else {
            this.statsd.increment(
              'checkout_failure_subscription_not_cancelled'
            );

            this.log.log(
              'cartService.wrapWithCartCatch.subscriptionNotCancelled',
              {
                eligibilityStatus: cart.eligibilityStatus,
                offeringId: cart.offeringConfigId,
                interval: cart.interval,
              }
            );
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

  @SanitizeExceptions()
  async getCoupon(args: {
    cartId: string;
    version: number;
  }): Promise<{ couponCode: string | null }> {
    const cart = await this.cartManager.fetchAndValidateCartVersion(
      args.cartId,
      args.version
    );

    return {
      couponCode: cart.couponCode,
    };
  }

  /**
   * Initialize a brand new cart
   * **Note**: This method is currently a placeholder. The arguments will likely change, and the internal implementation is far from complete.
   */
  @SanitizeExceptions({
    allowlist: [
      CouponErrorCannotRedeem,
      InvalidPromoCodeCartError,
      ProductConfigError,
    ],
  })
  async setupCart(args: {
    interval: SubplatInterval;
    offeringConfigId: string;
    taxAddress: TaxAddress;
    experiment?: string;
    promoCode?: string;
    uid?: string;
  }): Promise<ResultCart> {
    const currency = this.currencyManager.getCurrencyForCountry(
      args.taxAddress.countryCode
    );
    if (!currency) {
      throw new SetupCartCurrencyNotFoundError(
        currency,
        args.taxAddress.countryCode
      );
    }

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

    const customerPromise = accountCustomer?.stripeCustomerId
      ? await this.customerManager.retrieve(accountCustomer?.stripeCustomerId)
      : undefined;

    const [customer, price, eligibility] = await Promise.all([
      customerPromise,
      this.productConfigurationManager.retrieveStripePrice(
        args.offeringConfigId,
        args.interval
      ),
      this.eligibilityService.checkEligibility(
        args.interval,
        args.offeringConfigId,
        args.uid,
        accountCustomer?.stripeCustomerId
      ),
    ]);

    const cartEligibilityStatus =
      handleEligibilityStatusMap[eligibility.subscriptionEligibilityResult];

    let couponCode = args.promoCode;
    const checkoutAmount = await this.checkoutService.determineCheckoutAmount({
      eligibility,
      priceId: price.id,
      currency,
      taxAddress: args.taxAddress,
      customer,
    });
    if (cartEligibilityStatus === CartEligibilityStatus.UPGRADE) {
      // Coupons are currently not supported by upgrades
      couponCode = undefined;
    } else {
      if (couponCode) {
        try {
          await this.promotionCodeManager.assertValidForPriceAndCustomer(
            couponCode,
            price,
            currency,
            customer,
            args.taxAddress
          );
        } catch (error) {
          throw new CartSetupInvalidPromoCodeError(
            couponCode,
            args.offeringConfigId,
            error
          );
        }
      }
    }

    const createCartParams: SetupCart = {
      interval: args.interval,
      offeringConfigId: args.offeringConfigId,
      amount: checkoutAmount,
      uid: args.uid,
      stripeCustomerId: accountCustomer?.stripeCustomerId || undefined,
      experiment: args.experiment,
      taxAddress: args.taxAddress,
      currency,
      eligibilityStatus: cartEligibilityStatus,
      couponCode,
    };

    if (eligibility.subscriptionEligibilityResult === EligibilityStatus.SAME) {
      return this.cartManager.createErrorCart(
        createCartParams,
        CartErrorReasonId.CART_ELIGIBILITY_STATUS_SAME
      );
    }

    if (cartEligibilityStatus === CartEligibilityStatus.INVALID) {
      return this.cartManager.createErrorCart(
        createCartParams,
        CartErrorReasonId.CART_ELIGIBILITY_STATUS_INVALID
      );
    }

    if (cartEligibilityStatus === CartEligibilityStatus.DOWNGRADE) {
      return this.cartManager.createErrorCart(
        createCartParams,
        CartErrorReasonId.CART_ELIGIBILITY_STATUS_DOWNGRADE
      );
    }

    if (cartEligibilityStatus === CartEligibilityStatus.BLOCKED_IAP) {
      return this.cartManager.createErrorCart(
        createCartParams,
        CartErrorReasonId.IAP_BLOCKED_CONTACT_SUPPORT
      );
    }
    return this.cartManager.createCart(createCartParams);
  }

  /**
   * Create a new cart with the contents of an existing cart, in the initial state.
   */
  @SanitizeExceptions({ allowlist: [InvalidPromoCodeCartError] })
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
            oldCart.currency
          );
        } catch (error) {
          throw new CartRestartInvalidPromoCodeError(
            oldCart.couponCode,
            oldCart.offeringConfigId,
            error,
            cartId
          );
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
        throw new TaxAndCurrencyRequiredCartError(
          oldCart.id,
          oldCart.taxAddress ?? undefined,
          oldCart.currency
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
    customerData: CheckoutCustomerData,
    attribution: SubscriptionAttributionParams,
    sessionUid?: string
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
      } catch (error) {
        throw new UpdateStripeProcessingCartError(cartId, error);
      }

      this.asyncLocalStorage.run(
        { checkout: { subscriptionId: undefined } },
        () => {
          // Intentionally non-blocking
          this.wrapWithCartCatch(cartId, async () => {
            await this.checkoutService.payWithStripe(
              updatedCart,
              confirmationTokenId,
              customerData,
              attribution,
              sessionUid
            );
          }).catch((error) => {
            handleException({
              error,
              className: 'CartService',
              methodName: 'checkoutCartWithStripe',
              allowlist: [],
              logger: this.log as Logger,
              statsd: this.statsd,
            });
          });
        }
      );
    });
  }

  @SanitizeExceptions()
  async checkoutCartWithPaypal(
    cartId: string,
    version: number,
    customerData: CheckoutCustomerData,
    attribution: SubscriptionAttributionParams,
    sessionUid?: string,
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
      } catch (error) {
        throw new UpdatePayPalProcessingCartError(cartId, error);
      }

      this.asyncLocalStorage.run(
        { checkout: { subscriptionId: undefined } },
        () => {
          // Intentionally non-blocking
          this.wrapWithCartCatch(cartId, async () => {
            await this.checkoutService.payWithPaypal(
              updatedCart,
              customerData,
              attribution,
              sessionUid,
              token
            );
          }).catch((error) => {
            handleException({
              error,
              className: 'CartService',
              methodName: 'checkoutCartWithPaypal',
              allowlist: [],
              logger: this.log as Logger,
              statsd: this.statsd,
            });
          });
        }
      );
    });
  }

  @SanitizeExceptions()
  async finalizeProcessingCart(cartId: string): Promise<void> {
    return this.wrapWithCartCatch(cartId, async () => {
      const cart = await this.cartManager.fetchCartById(cartId);

      if (!cart.uid) {
        throw new FinalizeWithoutUidCartError(cartId);
      }

      if (!cart.stripeSubscriptionId) {
        throw new FinalizeWithoutSubscriptionIdCartError(cartId);
      }
      const subscription = await this.subscriptionManager.retrieve(
        cart.stripeSubscriptionId
      );
      if (!subscription) {
        throw new FinalizeWithoutSubscriptionCartError(
          cartId,
          cart.stripeSubscriptionId
        );
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
    errorReasonId: CartErrorReasonId | string
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
      PromotionCodeError,
      CartVersionMismatchError,
      CartInvalidStateForActionError,
    ],
  })
  async updateCart(
    cartId: string,
    version: number,
    cartDetailsInput: UpdateCartInput
  ): Promise<ResultCart> {
    return this.wrapWithCartCatch(
      cartId,
      {
        errorAllowList: [
          PromotionCodeError,
          CartVersionMismatchError,
          CartInvalidStateForActionError,
        ],
      },
      async () => {
        const oldCart = await this.cartManager.fetchCartById(cartId);
        const cartDetails: UpdateCart = {
          ...cartDetailsInput,
        };

        if (cartDetailsInput.taxAddress?.countryCode) {
          cartDetails.currency = this.currencyManager.getCurrencyForCountry(
            cartDetailsInput.taxAddress?.countryCode
          );
          if (!cartDetails.currency) {
            throw new UpdateCartCurrencyNotFoundError(
              cartDetails.currency,
              cartDetailsInput.taxAddress.countryCode,
              cartId
            );
          }

          if (cartDetails.currency !== oldCart.currency) {
            const price =
              await this.productConfigurationManager.retrieveStripePrice(
                oldCart.offeringConfigId,
                oldCart.interval as SubplatInterval
              );

            const upcomingInvoice = await this.invoiceManager.previewUpcoming({
              priceId: price.id,
              currency: cartDetails.currency,
              taxAddress: cartDetailsInput.taxAddress,
              couponCode: cartDetailsInput.couponCode,
            });
            cartDetails.amount = upcomingInvoice.subtotal;
            // If the currency has changed, and the cart already has a coupon code, and
            // no new coupon is being added, then the coupon code needs to revalidated.
            // If the code is invalid, then update the cart with an empty coupon code.
            if (!!oldCart.couponCode && !cartDetailsInput.couponCode) {
              try {
                const customer = oldCart?.stripeCustomerId
                  ? await this.customerManager.retrieve(
                      oldCart.stripeCustomerId
                    )
                  : undefined;

                await this.promotionCodeManager.assertValidForPriceAndCustomer(
                  oldCart.couponCode,
                  price,
                  cartDetails.currency,
                  customer
                );
              } catch (error) {
                cartDetails.couponCode = null;
              }
            }
          }
        }

        if (cartDetailsInput?.couponCode) {
          const price =
            await this.productConfigurationManager.retrieveStripePrice(
              oldCart.offeringConfigId,
              oldCart.interval as SubplatInterval
            );

          const customer = oldCart?.stripeCustomerId
            ? await this.customerManager.retrieve(oldCart.stripeCustomerId)
            : undefined;

          await this.promotionCodeManager.assertValidForPriceAndCustomer(
            cartDetailsInput.couponCode,
            price,
            cartDetails.currency || oldCart.currency,
            customer
          );
        }

        await this.cartManager.updateFreshCart(cartId, version, cartDetails);

        return this.cartManager.fetchCartById(cartId);
      }
    );
  }

  /**
   * Fetch a cart from the database by ID
   */
  @SanitizeExceptions()
  async getCartState(cartId: string): Promise<{ state: CartState }> {
    const cart = await this.cartManager.fetchCartById(cartId);

    return {
      state: cart.state,
    };
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
    const [
      price,
      metricsOptedOut,
      eligibility,
      customer,
      subscriptions,
      customerSession,
    ] = await Promise.all([
      this.productConfigurationManager.retrieveStripePrice(
        cart.offeringConfigId,
        cart.interval as SubplatInterval
      ),
      this.metricsOptedOut(cart.uid),
      this.eligibilityService.checkEligibility(
        cart.interval as SubplatInterval,
        cart.offeringConfigId,
        cart.uid,
        cart.stripeCustomerId
      ),
      cart.stripeCustomerId
        ? this.customerManager.retrieve(cart.stripeCustomerId)
        : undefined,
      cart.stripeCustomerId
        ? this.subscriptionManager.listForCustomer(cart.stripeCustomerId)
        : undefined,
      cart.stripeCustomerId
        ? this.customerSessionManager.createCheckoutSession(cart.stripeCustomerId)
        : undefined,
    ]);
    const cartEligibilityStatus =
      handleEligibilityStatusMap[eligibility.subscriptionEligibilityResult];
    const { unitAmountForCurrency: offeringPrice } =
      await this.priceManager.retrievePricingForCurrency(
        price.id,
        cart.currency
      );
    if (!offeringPrice) {
      throw new CartCouldNotRetrievePriceForCurrencyWhenAttemptingToGetCartCartError(
        cart.id,
        cart.interval,
        cart.offeringConfigId,
        cart.currency,
        price.id
      );
    }

    let upcomingInvoicePreview: InvoicePreview | undefined;
    if (
      cartEligibilityStatus === CartEligibilityStatus.UPGRADE &&
      cart.state !== CartState.FAIL
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
      const paymentMethod = await this.paymentMethodManager.retrieve(
        paymentMethodType.paymentMethodId
      );
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
    if (
      customer &&
      cart.stripeSubscriptionId &&
      subscriptions &&
      cart.state !== CartState.FAIL
    ) {
      const subscription =
        subscriptions.find(
          (subscription) => subscription.id === cart.stripeSubscriptionId
        ) ||
        (await this.subscriptionManager.retrieve(cart.stripeSubscriptionId));

      // fetch latest payment info from subscription
      assert(
        subscription?.latest_invoice,
        new GetCartSubscriptionIdCartError(cartId)
      );
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
        offeringPrice,
        upcomingInvoicePreview,
        metricsOptedOut,
        latestInvoicePreview,
        paymentInfo,
        hasActiveSubscriptions: !!subscriptions?.length,
      };
    }

    let fromPrice: FromPrice | undefined;
    if (cartEligibilityStatus === CartEligibilityStatus.UPGRADE) {
      assert('fromPrice' in eligibility, 'fromPrice not present for upgrade');

      const { price: priceForCurrency, unitAmountForCurrency } =
        await this.priceManager.retrievePricingForCurrency(
          eligibility.fromPrice.id,
          cart.currency
        );
      assertNotNull(unitAmountForCurrency);
      assertNotNull(priceForCurrency.recurring);

      const interval = getSubplatInterval(
        priceForCurrency.recurring.interval,
        priceForCurrency.recurring.interval_count
      );
      assert(interval, 'Interval not found but is required');

      fromPrice = {
        currency: cart.currency,
        interval,
        unitAmount: unitAmountForCurrency,
      };
    }

    return {
      ...cart,
      state: cart.state,
      upcomingInvoicePreview,
      latestInvoicePreview,
      metricsOptedOut,
      paymentInfo,
      offeringPrice,
      fromOfferingConfigId:
        'fromOfferingConfigId' in eligibility
          ? eligibility.fromOfferingConfigId
          : undefined,
      fromPrice: 'fromPrice' in eligibility ? fromPrice : undefined,
      hasActiveSubscriptions: !!subscriptions?.length,
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
    return this.wrapWithCartCatch(cartId, async () => {
      const cart = await this.cartManager.fetchCartById(cartId);

      if (!cart.stripeIntentId) {
        throw new CartIntentNotFoundError(cartId);
      }

      const intent = isPaymentIntentId(cart.stripeIntentId)
        ? await this.paymentIntentManager.retrieve(cart.stripeIntentId)
        : await this.setupIntentManager.retrieve(cart.stripeIntentId);

      if (intent.status === 'requires_action') {
        return {
          inputType: NeedsInputType.StripeHandleNextAction,
          data: { clientSecret: intent.client_secret },
        } as StripeHandleNextActionResponse;
      } else {
        await this.cartManager.setProcessingCart(cartId);
        return {
          inputType: NeedsInputType.NotRequired,
        } as NoInputNeededResponse;
      }
    });
  }

  @SanitizeExceptions()
  async submitNeedsInput(cartId: string) {
    return this.wrapWithCartCatch(cartId, async () => {
      const cart = await this.cartManager.fetchCartById(cartId);
      assert(cart.stripeCustomerId, 'Cart must have a stripeCustomerId');
      assert(
        cart.stripeSubscriptionId,
        'Cart must have a stripeSubscriptionId'
      );
      assert(cart.uid, 'Cart must have a uid');

      if (!cart.stripeIntentId) {
        throw new CartIntentNotFoundError(cartId);
      }

      const intent = isPaymentIntentId(cart.stripeIntentId)
        ? await this.paymentIntentManager.retrieve(cart.stripeIntentId)
        : await this.setupIntentManager.retrieve(cart.stripeIntentId);

      if (intent.status === 'succeeded') {
        if (intent.payment_method) {
          await this.customerManager.update(cart.stripeCustomerId, {
            invoice_settings: {
              default_payment_method: intent.payment_method,
            },
          });
        } else {
          throw new SuccessfulIntentMissingPaymentMethodCartError(
            cartId,
            intent.id
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
        throw new SubmitNeedsInputFailedError(cartId);
      }
    });
  }
}
