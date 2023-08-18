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
