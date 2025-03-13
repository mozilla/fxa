/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { uuidTransformer, aggregateNameValuePairs } from '../../transformers';
import { Account, AccountOptions } from './account';
import { AccountCustomers } from './account-customers';
import { AccountResetToken } from './account-reset-token';
import { BaseAuthModel } from './base-auth';
import { BaseToken } from './base-token';
import { Device } from './device';
import { Email } from './email';
import { EmailBounce } from './email-bounce';
import { KeyFetchToken } from './key-fetch-token';
import { PasswordChangeToken } from './password-change-token';
import { PasswordForgotToken } from './password-forgot-token';
import { LinkedAccount } from './linked-account';
import { RecoveryKey } from './recovery-key';
import { SessionToken } from './session-token';
import { TotpToken } from './totp-token';
import { PayPalBillingAgreements } from './paypal-ba';
import { EmailType } from './email-type';
import { SentEmail } from './sent-email';
import { SecurityEvent } from './security-event';
import { PruneTokens } from './prune-tokens';
import { RelyingParty } from './relying-party';
import { SignInCodes } from './sign-in-codes';
import { UnblockCodes } from './unblock-codes';
import { RecoveryCodes } from './recovery-codes';
import { RecoveryPhones } from './recovery-phones';

export type PayPalBillingAgreementStatusType =
  | 'Pending'
  | 'Active'
  | 'Suspended'
  | 'Cancelled'
  | 'Expired';

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
 * Fetch the FxA user id and primary email for a customer by Stripe customer id.
 */
export async function getUidAndEmailByStripeCustomerId(
  customerId: string
): Promise<{ uid: string | null; email: string | null }> {
  const accounts = Account.tableName;
  const accountCustomers = AccountCustomers.tableName;
  const result = await Account.query()
    .select(`${accounts}.uid`, `${accounts}.email`)
    .join(`${accountCustomers}`, `${accountCustomers}.uid`, `${accounts}.uid`)
    .where({
      [`${accountCustomers}.stripeCustomerId`]: customerId,
    })
    .limit(1)
    .first();
  if (!result) {
    return { uid: null, email: null };
  }
  return result;
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
 * Get the PayPal Billing Agreements by billing agreement id
 *
 * @param billingAgreementId
 */
export async function getPayPalBAByBAId(
  billingAgreementId: string
): Promise<PayPalBillingAgreements | undefined> {
  return PayPalBillingAgreements.query().findOne({ billingAgreementId });
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

export type { AccountOptions };

export {
  Account,
  AccountCustomers,
  AccountResetToken,
  BaseAuthModel,
  BaseToken,
  Device,
  Email,
  EmailBounce,
  EmailType,
  KeyFetchToken,
  PasswordChangeToken,
  PasswordForgotToken,
  PayPalBillingAgreements,
  PruneTokens,
  LinkedAccount,
  RecoveryKey,
  SecurityEvent,
  SentEmail,
  SessionToken,
  TotpToken,
  RelyingParty,
  SignInCodes,
  UnblockCodes,
  RecoveryCodes,
  RecoveryPhones,
};
