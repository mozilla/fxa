/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable } from '@nestjs/common';

import {
  CustomerManager,
  InvoiceManager,
  SubplatInterval,
  PromotionCodeManager,
  SubscriptionManager,
} from '@fxa/payments/customer';
import { EligibilityService } from '@fxa/payments/eligibility';
import {
  AccountCustomerManager,
  AccountCustomerNotFoundError,
  StripeCustomer,
} from '@fxa/payments/stripe';
import { ProductConfigurationManager } from '@fxa/shared/cms';
import { CurrencyManager } from '@fxa/payments/currency';
import { CartErrorReasonId, CartState } from '@fxa/shared/db/mysql/account';
import { GeoDBManager } from '@fxa/shared/geodb';

import { CartManager } from './cart.manager';
import {
  CheckoutCustomerData,
  PollCartResponse,
  ResultCart,
  UpdateCart,
  WithContextCart,
} from './cart.types';
import { handleEligibilityStatusMap } from './cart.utils';
import { CheckoutService } from './checkout.service';
import {
  CartError,
  CartInvalidCurrencyError,
  CartInvalidPromoCodeError,
  CartStateProcessingError,
  CartSubscriptionNotFoundError,
} from './cart.error';
import { AccountManager } from '@fxa/shared/account/account';

@Injectable()
export class CartService {
  constructor(
    private accountCustomerManager: AccountCustomerManager,
    private accountManager: AccountManager,
    private cartManager: CartManager,
    private checkoutService: CheckoutService,
    private currencyManager: CurrencyManager,
    private customerManager: CustomerManager,
    private promotionCodeManager: PromotionCodeManager,
    private eligibilityService: EligibilityService,
    private geodbManager: GeoDBManager,
    private invoiceManager: InvoiceManager,
    private productConfigurationManager: ProductConfigurationManager,
    private subscriptionManager: SubscriptionManager
  ) {}

  /**
   * Initialize a brand new cart
   * **Note**: This method is currently a placeholder. The arguments will likely change, and the internal implementation is far from complete.
   */
  async setupCart(args: {
    interval: SubplatInterval;
    offeringConfigId: string;
    experiment?: string;
    promoCode?: string;
    uid?: string;
    ip?: string;
  }): Promise<ResultCart> {
    // TODO:
    // - Fetch information about interval, offering, experiments from CMS
    // - Guess TaxAddress via maxmind client
    // - Check if user is eligible to subscribe to plan, else throw error
    // - Fetch stripeCustomerId if uid is passed and has a customer id
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

    const taxAddress = args.ip
      ? this.geodbManager.getTaxAddress(args.ip)
      : undefined;

    const price = await this.productConfigurationManager.retrieveStripePrice(
      args.offeringConfigId,
      args.interval
    );

    const fxaAccounts = args.uid
      ? await this.accountManager.getAccounts([args.uid])
      : undefined;
    const fxaAccount =
      fxaAccounts && fxaAccounts.length > 0 ? fxaAccounts[0] : undefined;

    const [upcomingInvoice, eligibility] = await Promise.all([
      this.invoiceManager.preview({
        priceId: price.id,
        customer: stripeCustomer,
        taxAddress: taxAddress,
        couponCode: args.promoCode,
      }),
      this.eligibilityService.checkEligibility(
        args.interval,
        args.offeringConfigId,
        accountCustomer?.stripeCustomerId
      ),
    ]);

    const cartEligibilityStatus = handleEligibilityStatusMap[eligibility];

    if (args.promoCode) {
      try {
        await this.promotionCodeManager.assertValidPromotionCodeNameForPrice(
          args.promoCode,
          price
        );
      } catch (e) {
        throw new CartInvalidPromoCodeError(args.promoCode);
      }
    }

    let currency: string | undefined;
    if (taxAddress?.countryCode) {
      currency = this.currencyManager.getCurrencyForCountry(
        taxAddress?.countryCode
      );
      if (!currency) {
        throw new CartInvalidCurrencyError(currency, taxAddress.countryCode);
      }
    }

    const cart = await this.cartManager.createCart({
      interval: args.interval,
      offeringConfigId: args.offeringConfigId,
      amount: upcomingInvoice.subtotal,
      uid: args.uid,
      email: fxaAccount?.email || undefined,
      stripeCustomerId: accountCustomer?.stripeCustomerId || undefined,
      experiment: args.experiment,
      taxAddress,
      currency,
      eligibilityStatus: cartEligibilityStatus,
      couponCode: args.promoCode,
    });

    return cart;
  }

  /**
   * Create a new cart with the contents of an existing cart, in the initial state.
   */
  async restartCart(cartId: string): Promise<ResultCart> {
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
          price
        );
      } catch (e) {
        throw new CartInvalidPromoCodeError(oldCart.couponCode);
      }
    }

    return await this.cartManager.createCart({
      uid: oldCart.uid,
      interval: oldCart.interval,
      offeringConfigId: oldCart.offeringConfigId,
      experiment: oldCart.experiment || undefined,
      taxAddress: oldCart.taxAddress || undefined,
      currency: oldCart.currency || undefined,
      couponCode: oldCart.couponCode || undefined,
      stripeCustomerId: oldCart.stripeCustomerId || undefined,
      email: oldCart.email || undefined,
      amount: oldCart.amount,
      eligibilityStatus: oldCart.eligibilityStatus,
    });
  }

  async checkoutCartWithStripe(
    cartId: string,
    version: number,
    paymentMethodId: string,
    customerData: CheckoutCustomerData
  ) {
    try {
      const cart = await this.cartManager.fetchCartById(cartId);

      const paymentIntent = await this.checkoutService.payWithStripe(
        cart,
        paymentMethodId,
        customerData
      );

      const updatedCart = await this.cartManager.fetchCartById(cartId);

      if (paymentIntent.status === 'succeeded') {
        await this.cartManager.finishCart(cartId, updatedCart.version, {});
      }
    } catch (e) {
      // TODO: Handle errors and provide an associated reason for failure
      await this.cartManager.finishErrorCart(cartId, {
        errorReasonId: CartErrorReasonId.Unknown,
      });
    }
  }

  async checkoutCartWithPaypal(
    cartId: string,
    version: number,
    customerData: CheckoutCustomerData,
    token?: string
  ) {
    let updatedCart: ResultCart | null = null;
    try {
      //Ensure that the cart version matches the value passed in from FE
      const cart = await this.cartManager.fetchAndValidateCartVersion(
        cartId,
        version
      );

      await this.cartManager.setProcessingCart(cartId);
      updatedCart = {
        ...cart,
        version: cart.version + 1,
      };
    } catch (e) {
      throw new CartStateProcessingError(cartId, e);
    }

    // Intentionally left out of try/catch block to so that the rest of the logic
    // is non-blocking and can be handled asynchronously.
    this.checkoutService
      .payWithPaypal(updatedCart, customerData, token)
      .catch(async () => {
        // TODO: Handle errors and provide an associated reason for failure
        await this.cartManager.finishErrorCart(cartId, {
          errorReasonId: CartErrorReasonId.Unknown,
        });
      });
  }

  /**
   * return the cart state, and the stripe client secret if the cart has a
   * stripe paymentIntent with `requires_action` actions for the client to handle
   */
  async pollCart(cartId: string): Promise<PollCartResponse> {
    const cart = await this.cartManager.fetchCartById(cartId);

    // respect cart state set elsewhere
    if (cart.state === CartState.FAIL || cart.state === CartState.SUCCESS) {
      return { cartState: cart.state };
    }

    if (!cart.stripeSubscriptionId) {
      return { cartState: cart.state };
    }

    const subscription = await this.subscriptionManager.retrieve(
      cart.stripeSubscriptionId
    );
    if (!subscription) {
      return { cartState: cart.state };
    }

    // PayPal payment method collection
    if (subscription.collection_method === 'send_invoice') {
      return { cartState: cart.state };
    }

    // Stripe payment method collection
    const paymentIntent =
      await this.subscriptionManager.processStripeSubscription(subscription);

    if (paymentIntent.status === 'requires_action') {
      return {
        cartState: cart.state,
        stripeClientSecret: paymentIntent.client_secret ?? undefined,
      };
    }

    return { cartState: cart.state };
  }

  async finalizeProcessingCart(cartId: string): Promise<void> {
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
    await this.checkoutService.postPaySteps(
      cart,
      cart.version,
      subscription,
      cart.uid
    );
  }

  /**
   * Update a cart in the database by ID or with an existing cart reference
   * **Note**: This method is currently a placeholder. The arguments will likely change, and the internal implementation is far from complete.
   */
  async finalizeCartWithError(
    cartId: string,
    errorReasonId: CartErrorReasonId
  ): Promise<void> {
    try {
      await this.cartManager.finishErrorCart(cartId, {
        errorReasonId,
      });
    } catch (e) {
      // TODO: Handle errors and provide an associated reason for failure
      // Check if cart is already in fail state. If so, log the error but
      // continue as normal.
      const cart = await this.cartManager.fetchCartById(cartId);
      if (cart.state !== CartState.FAIL) {
        throw e;
      }
    }
  }

  /**
   * Update a cart to be in the processing state
   */
  async setCartProcessing(cartId: string): Promise<void> {
    await this.cartManager.setProcessingCart(cartId);
  }

  /**
   * Update a cart in the database by ID or with an existing cart reference
   */
  async updateCart(cartId: string, version: number, cartDetails: UpdateCart) {
    const oldCart = await this.cartManager.fetchCartById(cartId);
    if (cartDetails?.couponCode) {
      const price = await this.productConfigurationManager.retrieveStripePrice(
        oldCart.offeringConfigId,
        oldCart.interval as SubplatInterval
      );

      await this.promotionCodeManager.assertValidPromotionCodeNameForPrice(
        cartDetails.couponCode,
        price
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

  /**
   * Fetch a cart from the database by ID
   */
  async getCart(cartId: string): Promise<WithContextCart> {
    const cart = await this.cartManager.fetchCartById(cartId);

    const [price, metricsOptedOut] = await Promise.all([
      this.productConfigurationManager.retrieveStripePrice(
        cart.offeringConfigId,
        cart.interval as SubplatInterval
      ),
      this.metricsOptedOut(cart.uid),
    ]);

    let customer: StripeCustomer | undefined;
    if (cart.stripeCustomerId) {
      customer = await this.customerManager.retrieve(cart.stripeCustomerId);
    }

    const invoicePreview = await this.invoiceManager.preview({
      priceId: price.id,
      customer,
      taxAddress: cart.taxAddress || undefined,
      couponCode: cart.couponCode || undefined,
    });

    return {
      ...cart,
      invoicePreview,
      metricsOptedOut,
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
}
