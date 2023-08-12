/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { AccountDatabase, CartState } from '@fxa/shared/db/mysql/account';
import { uuidTransformer } from '@fxa/shared/db/mysql/core';
import { Logger } from '@fxa/shared/log';

import { CartNotFoundError } from './cart.error';
import { createCart, findCartById } from './cart.repository';
import { Cart as CartType, SetupCart } from './cart.types';

const DEFAULT_INTERVAL = 'monthly';

export class CartManager {
  constructor(private log: Logger, private db: AccountDatabase) {}

  public async setupCart(input: SetupCart): Promise<CartType> {
    const now = Date.now();
    const resultCart = await createCart(this.db, {
      ...input,
      uid: input.uid ? uuidTransformer.to(input.uid) : undefined,
      createdAt: now,
      updatedAt: now,
      state: CartState.START,
      interval: input.interval || DEFAULT_INTERVAL,
      amount: 0, // Hardcoded to 0 for now. TODO - Actual amount to be added in FXA-7521
      version: 1,
    });
    return {
      ...resultCart,
      id: uuidTransformer.from(resultCart.id),
      uid: resultCart.uid ? uuidTransformer.from(resultCart.uid) : undefined,
    };
  }

  public async fetchCartById(id: string): Promise<CartType> {
    const cart = await findCartById(this.db, uuidTransformer.to(id));
    if (!cart) {
      throw new CartNotFoundError();
    }
    return {
      ...cart,
      id: uuidTransformer.from(cart.id),
      uid: cart.uid ? uuidTransformer.from(cart.uid) : undefined,
    } as any;
  }
}
