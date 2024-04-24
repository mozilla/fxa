/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import {
  AccountDatabase,
  PaypalCustomerUpdate,
  NewPaypalCustomer,
} from '@fxa/shared/db/mysql/account';

import {
  PaypalCustomerManagerError,
  PaypalCustomerNotUpdatedError,
} from './paypalCustomer.error';

/**
 * Creates a paypalCustomer in the database.
 *
 * @returns The created paypalCustomer or throws an error if the paypalCustomer if it couldn't be created
 */
export async function createPaypalCustomer(
  db: AccountDatabase,
  paypalCustomer: NewPaypalCustomer
) {
  await db
    .insertInto('paypalCustomers')
    .values(paypalCustomer)
    .executeTakeFirstOrThrow();
  return fetchPaypalCustomer(
    db,
    paypalCustomer.uid,
    paypalCustomer.billingAgreementId
  );
}

/**
 * Fetch paypalCustomer from the database by PK (uid & billingAgrementId).
 *
 * @returns Fetched paypalCustomer or throws an error if that paypalCustomer does not exist
 */
export async function fetchPaypalCustomer(
  db: AccountDatabase,
  uid: Buffer,
  billingAgreementId: string
) {
  return db
    .selectFrom('paypalCustomers')
    .where('uid', '=', uid)
    .where('billingAgreementId', '=', billingAgreementId)
    .selectAll()
    .executeTakeFirstOrThrow();
}

/**
 * Fetch paypalCustomers from the database by uid.
 *
 * @returns Fetched paypalCustomers
 */
export async function fetchPaypalCustomersByUid(
  db: AccountDatabase,
  uid: Buffer
) {
  return db
    .selectFrom('paypalCustomers')
    .where('uid', '=', uid)
    .orderBy('createdAt', 'desc')
    .selectAll()
    .execute();
}

/**
 * Fetch paypalCustomers from the database by billingAgreementId.
 *
 * @returns Fetched paypalCustomers
 */
export async function fetchPaypalCustomersByBillingAgreementId(
  db: AccountDatabase,
  billingAgreementId: string
) {
  return db
    .selectFrom('paypalCustomers')
    .where('billingAgreementId', '=', billingAgreementId)
    .selectAll()
    .execute();
}

/**
 * Update a paypalCustomer in the database with a given updated values.
 *
 * Note that the paypalCustomer passed in is not representative of the database after
 * this function is called. If the updated paypalCustomer is needed, it should be fetched
 * from the database again.
 *
 * @returns true if the paypalCustomer was updated, false if the update failed
 */
export async function updatePaypalCustomer(
  db: AccountDatabase,
  uid: Buffer,
  billingAgreementId: string,
  update: Omit<PaypalCustomerUpdate, 'uid'>
): Promise<boolean> {
  // Re-build properties for type-safety (Typescript allows wider type to be applied to narrower object type)
  const _update: Omit<PaypalCustomerUpdate, 'uid'> = {};
  if (update.billingAgreementId !== undefined)
    _update.billingAgreementId = update.billingAgreementId;
  if (update.status !== undefined) _update.status = update.status;
  if (update.endedAt !== undefined) _update.endedAt = update.endedAt;
  if (update.createdAt !== undefined) _update.createdAt = update.createdAt;
  if (Object.values(_update).length === 0) {
    throw new PaypalCustomerManagerError(
      'Must provide at least one update param',
      {
        info: {
          uid,
          billingAgreementId,
        },
      }
    );
  }

  const updatedRows = await db
    .updateTable('paypalCustomers')
    .set(_update)
    .where('uid', '=', uid)
    .where('billingAgreementId', '=', billingAgreementId)
    .executeTakeFirst();
  if (updatedRows.numUpdatedRows === BigInt(0)) {
    throw new PaypalCustomerNotUpdatedError(
      uid.toString(),
      update.billingAgreementId
    );
  }
  return true;
}

/**
 * Delete a paypalCustomer from the database.
 *
 * @returns True if the paypalCustomer was deleted, false otherwise
 */
export async function deletePaypalCustomer(
  db: AccountDatabase,
  uid: Buffer,
  billingAgreementId: string
): Promise<boolean> {
  return (
    (
      await db
        .deleteFrom('paypalCustomers')
        .where('uid', '=', uid)
        .where('billingAgreementId', '=', billingAgreementId)
        .executeTakeFirstOrThrow()
    ).numDeletedRows === BigInt(1)
  );
}

/**
 * Delete paypalCustomers from the database by uid.
 *
 * @returns Number of deleted paypalCustomers
 */
export async function deletePaypalCustomersByUid(
  db: AccountDatabase,
  uid: Buffer
): Promise<bigint> {
  return (
    await db
      .deleteFrom('paypalCustomers')
      .where('uid', '=', uid)
      .executeTakeFirstOrThrow()
  ).numDeletedRows;
}
