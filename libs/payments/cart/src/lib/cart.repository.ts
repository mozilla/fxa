/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import {
  AccountDatabase,
  CartState,
  CartUpdate,
  NewCart,
} from '@fxa/shared/db/mysql/account';

import { ResultCart } from './cart.types';
import { CartNotUpdatedError, CartProcessingConflictError } from './cart.error';

/**
 * How long a cart may remain in the processing state before it is considered
 * stale. A cart that has been processing for longer than this is treated as
 * hung/stuck, so a user is not permanently blocked from using checkout.
 */
export const CART_PROCESSING_STALE_TIMEOUT_MS = 15 * 60 * 1000;

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
 * Fetch carts from the database by account uid.
 *
 * @returns Fetched carts or an empty array if no carts exist
 */
export async function fetchCartsByUid(db: AccountDatabase, uid: Buffer) {
  return db.selectFrom('carts').where('uid', '=', uid).selectAll().execute();
}

/**
 * Update a cart in the database with a given update.
 *
 * This implementation manages the version and enforces optimistic locking
 * using the version field. If the version of the cart in the database does
 * not match the version passed in, then the update will fail.
 *
 * Note that the cart passed in is not representative of the database after
 * this function is called. If the updated cart is needed, it should be fetched
 * from the database again.
 *
 * @returns true if the cart was updated, false if the update failed
 */
export async function updateCart(
  db: AccountDatabase,
  cartId: Buffer,
  version: number,
  update: Omit<CartUpdate, 'id' | 'version'>
): Promise<boolean> {
  const updatedRows = await db
    .updateTable('carts')
    .set({
      ...update,
      version: version + 1,
    })
    .where('id', '=', cartId)
    .where('version', '=', version)
    .executeTakeFirst();
  if (updatedRows.numUpdatedRows === BigInt(0)) {
    throw new CartNotUpdatedError(cartId.toString());
  }
  return true;
}

/**
 * Transition a cart to the processing state, enforcing that at most one cart
 * per account (uid) is in the processing state at a given time.
 *
 * A cart that has been processing for longer than CART_PROCESSING_STALE_TIMEOUT_MS
 * is considered hung and does not block a new checkout.
 */
export async function setCartProcessing(
  db: AccountDatabase,
  cartId: Buffer,
  uid: Buffer | undefined,
  version: number
): Promise<boolean> {
  const now = Date.now();
  return db
    .transaction()
    .setIsolationLevel('repeatable read')
    .execute(async (trx) => {
      if (uid) {
        const carts = await trx
          .selectFrom('carts')
          .select(['id', 'state', 'updatedAt'])
          .where('uid', '=', uid)
          .forUpdate()
          .execute();

        const conflictingCart = carts.find(
          (cart) =>
            !cart.id.equals(cartId) &&
            cart.state === CartState.PROCESSING &&
            cart.updatedAt > now - CART_PROCESSING_STALE_TIMEOUT_MS
        );

        if (conflictingCart) {
          throw new CartProcessingConflictError(
            cartId.toString('hex'),
            uid.toString('hex'),
            conflictingCart.id.toString('hex')
          );
        }

        const cartIsProcessing = carts.find(
          (cart) =>
            cart.id.equals(cartId) &&
            cart.state === CartState.PROCESSING &&
            cart.updatedAt > now - CART_PROCESSING_STALE_TIMEOUT_MS
        );

        if (cartIsProcessing) {
          throw new CartProcessingConflictError(
            cartId.toString('hex'),
            uid.toString('hex'),
            cartId.toString('hex')
          );
        }
      }

      const updatedRows = await trx
        .updateTable('carts')
        .set({
          state: CartState.PROCESSING,
          updatedAt: now,
          version: version + 1,
        })
        .where('id', '=', cartId)
        .where('version', '=', version)
        .executeTakeFirst();

      if (updatedRows.numUpdatedRows === BigInt(0)) {
        throw new CartNotUpdatedError(cartId.toString('hex'));
      }

      return true;
    });
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
