/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { AccountDatabase, NewAccount } from '@fxa/shared/db/mysql/account';

import {
  AccountAlreadyExistsError,
  AccountNotCreatedError,
} from './account.error';

/**
 * Creates an account in the database, verifying that the email is not already
 * in use.
 */
export function createAccount(db: AccountDatabase, account: NewAccount) {
  return db.transaction().execute(async (trx) => {
    // Check to see if the email is already in use
    const emailExists = await trx
      .selectFrom('emails')
      .select('email')
      .where('normalizedEmail', '=', account.normalizedEmail)
      .executeTakeFirst();

    if (emailExists) {
      throw new AccountAlreadyExistsError(account.email);
    }

    // Proceed to create the account and email record
    const accountResult = await trx
      .insertInto('accounts')
      .values({
        ...account,
        verifierSetAt: account.verifierSetAt ?? Date.now(), // allow 0 to indicate no-password-set
      })
      .executeTakeFirst();

    if (!accountResult.numInsertedOrUpdatedRows) {
      throw new AccountNotCreatedError(
        account.email,
        new Error('Failed to insert account record')
      );
    }
    const emailResult = await trx
      .insertInto('emails')
      .values({
        email: account.email,
        normalizedEmail: account.normalizedEmail,
        uid: account.uid,
        isVerified: account.emailVerified,
        emailCode: account.emailCode,
        isPrimary: 1,
        createdAt: account.createdAt,
      })
      .executeTakeFirst();
    if (!emailResult.numInsertedOrUpdatedRows) {
      throw new AccountNotCreatedError(
        account.email,
        new Error('Failed to insert email record')
      );
    }
    return true;
  });
}

/**
 * Get accounts for array of uids
 */
export function getAccounts(db: AccountDatabase, uids: Buffer[]) {
  return db
    .selectFrom('accounts')
    .selectAll()
    .where('uid', 'in', uids)
    .execute();
}

/** See session_token.js in auth server for master list. */
export enum VerificationMethods {
  email = 0,
  email2fa = 1,
  totp2fa = 2,
  recoveryCode = 3,
  sms2fa = 4,
}

/**
 * Marks account session as verified
 * @param db Database instance
 * @param uid Users id
 * @param sessionTokenId User's session id
 * @param verificationMethod, See VerificationMethods
 */
export async function verifyAccountSession(
  db: AccountDatabase,
  uid: Buffer,
  sessionTokenId: Buffer,
  verificationMethod: VerificationMethods
): Promise<boolean> {
  // It appears that Date.now() results in the number 'format' as UNIX_TIMESTAMP(NOW(3)) * 1000 used
  // by the stored procedure.
  const now = Date.now();

  // Ported from session-token.ts -> verify

  return await db.transaction().execute(async (trx) => {
    await trx
      .updateTable('accounts')
      .set({
        profileChangedAt: now,
      })
      .where('uid', '=', uid)
      .executeTakeFirstOrThrow();

    // Equivalent of 'verifyTokensWithMethod_3' sproc
    await trx
      .updateTable('sessionTokens')
      .set({
        verifiedAt: now,
        verificationMethod: verificationMethod,
      })
      .where('tokenId', '=', sessionTokenId)
      .executeTakeFirstOrThrow();

    // next locate corresponding unverified session tokens
    const token = await trx
      .selectFrom('sessionTokens')
      .innerJoin(
        'unverifiedTokens',
        'unverifiedTokens.tokenId',
        'sessionTokens.tokenId'
      )
      .select(['unverifiedTokens.tokenVerificationId as tokenVerificationId'])
      .where('sessionTokens.tokenId', '=', sessionTokenId)
      .executeTakeFirst();

    if (token) {
      // next mark token as verified. Equivalent to 'verifyToken_3' sproc
      await trx
        .updateTable('securityEvents')
        .set({
          verified: 1,
        })
        .where('uid', '=', uid)
        .where('tokenVerificationId', '=', token.tokenVerificationId)
        .executeTakeFirstOrThrow();
      await trx
        .deleteFrom('unverifiedTokens')
        .where('uid', '=', uid)
        .where('tokenVerificationId', '=', token.tokenVerificationId)
        .executeTakeFirstOrThrow();
    }

    return true;
  });
}
