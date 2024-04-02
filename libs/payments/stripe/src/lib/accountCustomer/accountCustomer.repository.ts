/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  AccountCustomerUpdate,
  AccountDatabase,
  NewAccountCustomer,
} from '@fxa/shared/db/mysql/account';

import {
  AccountCustomerManagerError,
  AccountCustomerNotUpdatedError,
} from './accountCustomer.error';

export async function createAccountCustomer(
  db: AccountDatabase,
  accountCustomer: NewAccountCustomer
) {
  await db
    .insertInto('accountCustomers')
    .values(accountCustomer)
    .executeTakeFirstOrThrow();
  return getAccountCustomerByUid(db, accountCustomer.uid);
}

/**
 * Locate an accountCustomer record by fxa uid
 * @returns AccountCustomer | undefined
 */
export async function getAccountCustomerByUid(
  db: AccountDatabase,
  uid: Buffer
) {
  return db
    .selectFrom('accountCustomers')
    .where('uid', '=', uid)
    .selectAll()
    .executeTakeFirstOrThrow();
}

/**
 * Attempts to update an accountCustomer record by fxa user id
 * Returns the number of affected rows
 *
 * @returns number of affected rows
 */
export async function updateAccountCustomer(
  db: AccountDatabase,
  uid: Buffer,
  update: Omit<AccountCustomerUpdate, 'uid'>
): Promise<boolean> {
  // Re-build properties for type-safety (Typescript allows wider type to be applied to narrower object type)
  const _update: Omit<AccountCustomerUpdate, 'uid'> = {};
  _update.stripeCustomerId = update.stripeCustomerId;
  _update.createdAt = update.createdAt;
  _update.updatedAt = update.updatedAt;
  if (Object.values(_update).length === 0) {
    throw new AccountCustomerManagerError(
      'Must provide at least one update param',
      {
        info: {
          uid,
        },
      }
    );
  }
  const updatedRows = await db
    .updateTable('accountCustomers')
    .set(_update)
    .where('uid', '=', uid)
    .executeTakeFirst();
  if (updatedRows.numUpdatedRows === BigInt(0)) {
    throw new AccountCustomerNotUpdatedError(uid.toString());
  }
  return true;
}

/**
 * Attempts to delete an accountCustomer record by fxa user id
 * @returns True if the accountCustomer was deleted, false otherwise
 */
export async function deleteAccountCustomer(
  db: AccountDatabase,
  uid: Buffer
): Promise<boolean> {
  return (
    (
      await db
        .deleteFrom('accountCustomers')
        .where('uid', '=', uid)
        .executeTakeFirstOrThrow()
    ).numDeletedRows === BigInt(1)
  );
}
