/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable } from '@nestjs/common';

import { EligibilityService } from '@fxa/payments/eligibility';
import {
  AccountCustomerManager,
  AccountCustomerNotFoundError,
  CustomerManager,
  InvoiceManager,
  StripeCustomer,
  SubplatInterval,
  TaxAddress,
} from '@fxa/payments/stripe';
import { ContentfulService } from '@fxa/shared/contentful';
import { CartErrorReasonId, CartState } from '@fxa/shared/db/mysql/account';
import { GeoDBManager } from '@fxa/shared/geodb';

import { CartManager } from './cart.manager';
import {
  CheckoutCustomerData,
  ResultCart,
  UpdateCart,
  WithUpcomingInvoiceCart,
} from './cart.types';
import { handleEligibilityStatusMap } from './cart.utils';
import { CheckoutService } from './checkout.service';

@Injectable()
export class CartService {
  constructor(
    private cartManager: CartManager,
    private accountCustomerManager: AccountCustomerManager,
    private eligibilityService: EligibilityService,
    private geodbManager: GeoDBManager,
    private checkoutService: CheckoutService,
    private contentfulService: ContentfulService,
    private customerManager: CustomerManager,
    private invoiceManager: InvoiceManager
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
    // - Fetch information about interval, offering, experiments from Contentful
    // - Guess TaxAddress via maxmind client
    // - Check if user is eligible to subscribe to plan, else throw error
    // - Fetch stripeCustomerId if uid is passed and has a customer id
    let accountCustomer;
    if (args.uid) {
      try {
        accountCustomer =
          await this.accountCustomerManager.getAccountCustomerByUid(args.uid);
      } catch (error) {
        if (!(error instanceof AccountCustomerNotFoundError)) {
          throw error;
        }
      }
    }

    const stripeCustomerId = accountCustomer?.stripeCustomerId;
    const stripeCustomer = stripeCustomerId
      ? await this.customerManager.retrieve(stripeCustomerId)
      : undefined;

    const taxAddress = args.ip
      ? this.geodbManager.getTaxAddress(args.ip)
      : undefined;

    const priceId = await this.contentfulService.retrieveStripePlanId(
      args.offeringConfigId,
      args.interval
    );

    const upcomingInvoice = await this.invoiceManager.preview({
      priceId: priceId,
      customer: stripeCustomer,
      taxAddress: taxAddress,
    });

    const eligibility = await this.eligibilityService.checkEligibility(
      args.interval,
      args.offeringConfigId,
      accountCustomer?.stripeCustomerId
    );

    const cartEligibilityStatus = handleEligibilityStatusMap[eligibility];

    const cart = await this.cartManager.createCart({
      interval: args.interval,
      offeringConfigId: args.offeringConfigId,
      amount: upcomingInvoice.subtotal,
      uid: args.uid,
      stripeCustomerId: accountCustomer?.stripeCustomerId || undefined,
      experiment: args.experiment,
      taxAddress,
      eligibilityStatus: cartEligibilityStatus,
    });

    return cart;
  }

  /**
   * Create a new cart with the contents of an existing cart, in the initial state.
   */
  async restartCart(cartId: string): Promise<ResultCart> {
    const oldCart = await this.cartManager.fetchCartById(cartId);

    const newCart = this.cartManager.createCart({
      uid: oldCart.uid,
      interval: oldCart.interval,
      offeringConfigId: oldCart.offeringConfigId,
      experiment: oldCart.experiment || undefined,
      taxAddress: (oldCart.taxAddress as unknown as TaxAddress) || undefined, // TODO: Fix the typings for taxAddress
      couponCode: oldCart.couponCode || undefined,
      stripeCustomerId: oldCart.stripeCustomerId || undefined,
      email: oldCart.email || undefined,
      amount: oldCart.amount,
      eligibilityStatus: oldCart.eligibilityStatus,
    });

    return newCart;
  }

  async checkoutCartWithStripe(
    cartId: string,
    version: number,
    paymentMethodId: string,
    customerData: CheckoutCustomerData
  ) {
    try {
      const cart = await this.cartManager.fetchCartById(cartId);

      await this.checkoutService.payWithStripe(
        cart,
        paymentMethodId,
        customerData
      );

      await this.cartManager.finishCart(cartId, version, {});
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
    try {
      const cart = await this.cartManager.fetchCartById(cartId);

      this.checkoutService.payWithPaypal(cart, customerData, token);

      await this.cartManager.finishCart(cartId, version, {});
    } catch (e) {
      // TODO: Handle errors and provide an associated reason for failure
      await this.cartManager.finishErrorCart(cartId, {
        errorReasonId: CartErrorReasonId.Unknown,
      });
    }
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
   * Update a cart in the database by ID or with an existing cart reference
   */
  async updateCart(
    cartId: string,
    version: number,
    cartDetails: UpdateCart
  ): Promise<void> {
    await this.cartManager.updateFreshCart(cartId, version, cartDetails);
  }

  /**
   * Fetch a cart from the database by ID
   */
  async getCart(cartId: string): Promise<WithUpcomingInvoiceCart> {
    const cart = await this.cartManager.fetchCartById(cartId);

    const priceId = await this.contentfulService.retrieveStripePlanId(
      cart.offeringConfigId,
      cart.interval as SubplatInterval
    );

    let customer: StripeCustomer | undefined;
    if (cart.stripeCustomerId) {
      customer = await this.customerManager.retrieve(cart.stripeCustomerId);
    }

    const invoicePreview = await this.invoiceManager.preview({
      priceId,
      customer,
      taxAddress: cart.taxAddress as unknown as TaxAddress, // TODO: Fix the typings for taxAddress
    });

    return {
      ...cart,
      invoicePreview,
    };
  }
}
