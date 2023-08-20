/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import {
  AccountDatabase,
  CartUpdate,
  NewCart,
} from '@fxa/shared/db/mysql/account';

import { ResultCart } from './cart.types';
import { CartNotUpdatedError } from './cart.error';

/**
 * Creates a cart in the database.
 *
 * @returns The created cart or throws an error if the cart if it couldn't be created
 */
export async function createCart(db: AccountDatabase, cart: NewCart) {
  await db.insertInto('carts').values(cart).executeTakeFirstOrThrow();
  return fetchCartById(db, cart.id);
}

/**
 * Fetch a cart from the database by id.
 *
 * @returns Fetched cart or throws an error if the cart does not exist
 */
export async function fetchCartById(db: AccountDatabase, id: Buffer) {
  return db
    .selectFrom('carts')
    .where('id', '=', id)
    .selectAll()
    .executeTakeFirstOrThrow();
}

/**
 * Update a cart in the database with a given update.
 *
 * This implementation manages the version and enforces optimistic locking
 * using the version field. If the version of the cart in the database does
 * not match the version of the cart passed in, then the update will fail.
 *
 * Note that the cart passed in is not representative of the database after
 * this function is called. If the updated cart is needed, it should be fetched
 * from the database again.
 *
 * @returns true if the cart was updated, false if the update failed
 */
export async function updateCart(
  db: AccountDatabase,
  cart: ResultCart,
  update: Omit<CartUpdate, 'id' | 'version'>
): Promise<boolean> {
  const updatedRows = await db
    .updateTable('carts')
    .set({
      ...update,
      version: cart.version + 1,
    })
    .where('id', '=', Buffer.from(cart.id, 'hex'))
    .where('version', '=', cart.version)
    .executeTakeFirst();
  if (updatedRows.numUpdatedRows === BigInt(0)) {
    throw new CartNotUpdatedError(cart.id);
  }
  return true;
}

/**
 * Delete a cart from the database.
 *
 * Note that this delete requires the version of the cart to match, updates
 * that happen between the fetch and the delete will cause the delete to fail.
 *
 * @returns True if the cart was deleted, false otherwise
 */
export async function deleteCart(
  db: AccountDatabase,
  cart: ResultCart
): Promise<boolean> {
  return (
    (
      await db
        .deleteFrom('carts')
        .where('id', '=', Buffer.from(cart.id, 'hex'))
        .where('version', '=', cart.version)
        .executeTakeFirstOrThrow()
    ).numDeletedRows === BigInt(1)
  );
}
