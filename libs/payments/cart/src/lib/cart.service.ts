/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable } from '@nestjs/common';
import { CartManager } from './cart.manager';
import { ResultCart, TaxAddress, UpdateCart } from './cart.types';
import { CartErrorReasonId, CartState } from '@fxa/shared/db/mysql/account';
import { AccountCustomerManager } from '@fxa/payments/stripe';
import { GeoDBManager } from '@fxa/shared/geodb';

@Injectable()
export class CartService {
  constructor(
    private cartManager: CartManager,
    private accountCustomerManager: AccountCustomerManager,
    private geodbManager: GeoDBManager
  ) {}

  /**
   * Initialize a brand new cart
   * **Note**: This method is currently a placeholder. The arguments will likely change, and the internal implementation is far from complete.
   */
  async setupCart(args: {
    interval: string;
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
    // - Fetch invoice preview total from Stripe for `amount`
    // - Fetch stripeCustomerId if uid is passed and has a customer id
    const stripeCustomerId = args.uid
      ? await this.accountCustomerManager.getStripeCustomerIdByUid(args.uid)
      : undefined;

    const taxAddress = args.ip
      ? this.geodbManager.getTaxAddress(args.ip)
      : undefined;

    const cart = await this.cartManager.createCart({
      interval: args.interval,
      offeringConfigId: args.offeringConfigId,
      amount: 0,
      uid: args.uid,
      stripeCustomerId: stripeCustomerId || undefined,
      experiment: args.experiment,
      taxAddress,
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
    });

    return newCart;
  }

  /**
   * Update a cart in the database by ID or with an existing cart reference
   * **Note**: This method is currently a placeholder. The arguments will likely change, and the internal implementation is far from complete.
   */
  async checkoutCart(cartId: string, version: number): Promise<void> {
    try {
      // TODO:
      // - Check if customer exists, create via stripe manager if not
      // - Check if customer is eligible for product in cart
      // - Check if amount to be charged matches amount in cart
      await this.cartManager.finishCart(cartId, version, {});
    } catch (e) {
      // TODO: Handle errors and provide an associated reason for failure
      await this.cartManager.finishErrorCart(cartId, version, {
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
    version: number,
    errorReasonId: CartErrorReasonId
  ): Promise<void> {
    try {
      await this.cartManager.finishErrorCart(cartId, version, {
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
  getCart(cartId: string): Promise<ResultCart> {
    return this.cartManager.fetchCartById(cartId);
  }
}
