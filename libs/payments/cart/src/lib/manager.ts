/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Cart, CartState } from '../../../../shared/db/mysql/account/src';
import {
  generateFxAUuid,
  uuidTransformer,
} from '../../../../shared/db/mysql/core/src';
import { Logger } from '../../../../shared/log/src';
import { Cart as CartType, UpdateCartInput } from '../gql';
import { InvoiceFactory, SetupCart } from '../';

const DEFAULT_INTERVAL = 'monthly';

// TODO - Adopt error library developed as part of FXA-7656
export enum ERRORS {
  CART_NOT_FOUND = 'Cart not found for id',
}

export class CartManager {
  private log: Logger;
  constructor(log: Logger) {
    this.log = log;
  }

  public async setupCart(input: SetupCart): Promise<CartType | null> {
    const currentDate = Date.now();
    const cart = await Cart.query().insert({
      ...input,
      id: generateFxAUuid(),
      state: CartState.START,
      interval: input.interval || DEFAULT_INTERVAL,
      amount: 0, // Hardcoded to 0 for now. TODO - Actual amount to be added in FXA-7521
      createdAt: currentDate,
      updatedAt: currentDate,
    });

    return {
      ...cart,
      nextInvoice: InvoiceFactory(), // Temporary
    };
  }

  public async restartCart(cartId: string): Promise<CartType | null> {
    const id = uuidTransformer.to(cartId);
    const cart = await Cart.query()
      .where('id', id)
      .first()
      .throwIfNotFound({ message: ERRORS.CART_NOT_FOUND });

    // Patch and fetch instance
    // Use update if you update the whole row with all its columns. Otherwise, using the patch method is recommended.
    // https://vincit.github.io/objection.js/api/query-builder/mutate-methods.html#update
    await cart
      .$query()
      .patchAndFetch({ state: CartState.START, updatedAt: Date.now() });

    // Patch changes to the DB
    await Cart.query().patch(cart).where('id', id);

    return {
      ...cart,
      nextInvoice: InvoiceFactory(), // Temporary
    };
  }

  public async checkoutCart(cartId: string): Promise<CartType | null> {
    const id = uuidTransformer.to(cartId);
    const cart = await Cart.query()
      .where('id', id)
      .first()
      .throwIfNotFound({ message: ERRORS.CART_NOT_FOUND });
    // Patch and fetch instance
    // Use update if you update the whole row with all its columns. Otherwise, using the patch method is recommended.
    // https://vincit.github.io/objection.js/api/query-builder/mutate-methods.html#update
    await cart
      .$query()
      .patchAndFetch({ state: CartState.PROCESSING, updatedAt: Date.now() });

    // Patch changes to the DB
    await Cart.query().patch(cart).where('id', id);

    return {
      ...cart,
      nextInvoice: InvoiceFactory(), // Temporary
    };
  }

  public async updateCart(input: UpdateCartInput): Promise<CartType | null> {
    const { id: cartId, ...rest } = input;
    const id = uuidTransformer.to(cartId);

    const cart = await Cart.query()
      .where('id', id)
      .first()
      .throwIfNotFound({ message: ERRORS.CART_NOT_FOUND });
    // Patch and fetch instance
    // Use update if you update the whole row with all its columns. Otherwise, using the patch method is recommended.
    // https://vincit.github.io/objection.js/api/query-builder/mutate-methods.html#update
    await cart.$query().patchAndFetch({
      ...rest,
      updatedAt: Date.now(),
    });

    // Patch changes to the DB
    await Cart.query().patch(cart).where('id', id);

    return {
      ...cart,
      nextInvoice: InvoiceFactory(), // Temporary
    };
  }
}
