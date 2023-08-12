/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { v4 as uuidv4 } from 'uuid';

import {
  AccountDatabase,
  CartUpdate,
  NewCart,
} from '@fxa/shared/db/mysql/account';

import { CartNotCreatedError, CartNotUpdatedError } from './cart.error';

export async function createCart(
  db: AccountDatabase,
  newCart: Omit<NewCart, 'id'>
) {
  const currentDate = Date.now();
  const cart = {
    ...newCart,
    id: Buffer.from(uuidv4({}, Buffer.alloc(16))),
    createdAt: currentDate,
    updatedAt: currentDate,
  };
  const result = await db.insertInto('carts').values(cart).executeTakeFirst();
  if (result.numInsertedOrUpdatedRows !== BigInt(1)) {
    throw new CartNotCreatedError();
  }
  return cart;
}

export async function findCartById(db: AccountDatabase, id: Buffer) {
  return db
    .selectFrom('carts')
    .where('id', '=', id)
    .selectAll()
    .executeTakeFirst();
}

export async function updateCartByIdAndVersion(
  db: AccountDatabase,
  id: Buffer,
  version: number,
  cart: Omit<CartUpdate, 'id' | 'version'>
) {
  const updateResult = await db
    .updateTable('carts')
    .set({ ...cart, updatedAt: Date.now(), version: version + 1 })
    .where('id', '=', id)
    .where('version', '=', version)
    .executeTakeFirst();
  if (updateResult.numChangedRows !== BigInt(1)) {
    throw new CartNotUpdatedError();
  }
}
