/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { uuidTransformer } from '../../transformers';
import { Account } from './account';
import { AccountCustomers } from './account-customers';
import { AuthBaseModel } from './auth-base';
import { SessionToken } from './session-token';
import { PayPalBillingAgreements } from './paypal-ba';

export type AccountOptions = {
  include?: 'emails'[];
};

export type PayPalBillingAgreementStatusType =
  | 'Pending'
  | 'Active'
  | 'Suspended'
  | 'Cancelled'
  | 'Expired';

export async function sessionTokenData(
  tokenId: string
): Promise<SessionToken | undefined> {
  let tokenBuffer: Buffer;
  try {
    tokenBuffer = uuidTransformer.to(tokenId);
  } catch (err) {
    return;
  }
  const knex = Account.knex();
  const [result] = await knex.raw('Call sessionWithDevice_18(?)', tokenBuffer);
  const rowPacket = result.shift();
  if (result.length === 0) {
    return;
  }
  return SessionToken.fromDatabaseRow(rowPacket[0]);
}

export async function accountExists(uid: string) {
  let uidBuffer;
  try {
    uidBuffer = uuidTransformer.to(uid);
  } catch (err) {
    return false;
  }
  const account = await Account.query().findOne({ uid: uidBuffer });
  return account ? true : false;
}

export function accountByUid(uid: string, options?: AccountOptions) {
  let uidBuffer;
  try {
    uidBuffer = uuidTransformer.to(uid);
  } catch (err) {
    return;
  }

  let query = Account.query();
  if (options?.include?.includes('emails')) {
    query = query
      .withGraphJoined('emails')
      .where({ 'accounts.uid': uidBuffer });
  } else {
    query = query.where({ uid: uidBuffer });
  }
  return query.first();
}

export async function createAccountCustomer(
  uid: string,
  stripeCustomerId: string
) {
  // This has the side effect of performing the model jsonSchema validation.
  // Doing this explicitly since we'll use knex.raw() later.
  AccountCustomers.fromJson({ uid, stripeCustomerId });

  const knex = AccountCustomers.knex();
  const now = Date.now();
  const uidBuffer = uuidTransformer.to(uid);

  await knex(
    knex.raw('?? (??, ??, ??, ??)', [
      'accountCustomers',
      'uid',
      'stripeCustomerId',
      'createdAt',
      'updatedAt',
    ])
  ).insert(
    knex.raw(
      'SELECT ?, ?, ?, ? FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `accountCustomers` WHERE `uid` = ?)',
      [uidBuffer, stripeCustomerId, now, now, uidBuffer]
    )
  );
  return getAccountCustomerByUid(uid);
}

/**
 * Locate an accountCustomer record by fxa uid
 * @param uid
 * @returns AccountCustomer | undefined
 */
export async function getAccountCustomerByUid(uid: string) {
  const uidBuffer = uuidTransformer.to(uid);
  return AccountCustomers.query().findOne({ uid: uidBuffer });
}

/**
 * Attempts to update an accountCustomer record by fxa user id
 * Returns the number of affected rows
 *
 * @param uid
 * @param stripeCustomerId
 * @returns number of affected rows
 */
export async function updateAccountCustomer(
  uid: string,
  stripeCustomerId: string
) {
  const uidBuffer = uuidTransformer.to(uid);
  return AccountCustomers.query()
    .patch({ stripeCustomerId: stripeCustomerId })
    .where({ uid: uidBuffer });
}

/**
 * Attempts to delete an accountCustomer record by fxa user id
 * Returns the number of affected rows
 *
 * @param uid
 * @returns number of affected rows
 */
export async function deleteAccountCustomer(uid: string) {
  const uidBuffer = uuidTransformer.to(uid);
  return AccountCustomers.query().delete().where({ uid: uidBuffer });
}

/**
 * Get all the PayPal Billing Agreements by uid
 *
 * @param uid
 */
export async function getAllPayPalBAByUid(
  uid: string
): Promise<PayPalBillingAgreements[]> {
  const uidBuffer = uuidTransformer.to(uid);
  return PayPalBillingAgreements.query()
    .where({ uid: uidBuffer })
    .orderBy('createdAt', 'DESC');
}

/**
 * Create a PayPal Billing Agreement record for a user by uid.
 * @param uid
 * @param billingAgreementId
 * @param status
 */
export async function createPayPalBA(
  uid: string,
  billingAgreementId: string,
  status: string
): Promise<PayPalBillingAgreements> {
  return PayPalBillingAgreements.query().insertAndFetch({
    uid,
    billingAgreementId,
    status,
  });
}

/**
 * Update a PayPal Billing Agreement for a user by uid/billingAgreementId.
 *
 * @param uid
 * @param billingAgreementId
 * @param status
 * @param endedAt
 */
export async function updatePayPalBA(
  uid: string,
  billingAgreementId: string,
  status: PayPalBillingAgreementStatusType,
  endedAt?: number
): Promise<number> {
  const uidBuffer = uuidTransformer.to(uid);
  return PayPalBillingAgreements.query()
    .patch({
      status,
      endedAt,
    })
    .where({ uid: uidBuffer, billingAgreementId });
}

/**
 * Deletes all billing agreements for a user by uid.
 *
 * @param uid
 * @param billingAgreementId
 */
export async function deleteAllPayPalBAs(uid: string) {
  const uidBuffer = uuidTransformer.to(uid);
  return PayPalBillingAgreements.query().delete().where({ uid: uidBuffer });
}

// TODO: Find a better home for this.
/**
 * Type machinery to filter an Objection model class down to its direct
 * properties. This is useful for restricting input to object properties
 * of an Objection Model.
 */
type NonFunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends Function ? never : K;
}[keyof T];
type NonFunctionProperties<T> = Pick<T, NonFunctionPropertyNames<T>>;
type ObjectionModelProperties<T> = Omit<
  NonFunctionProperties<T>,
  'QueryBuilderType'
>;

type Accountish = Partial<ObjectionModelProperties<Account>>;

export function batchAccountUpdate(uids: Buffer[], updateFields: Accountish) {
  return Account.query().whereIn('uid', uids).update(updateFields);
}

export { Account, AccountCustomers, AuthBaseModel, PayPalBillingAgreements };
