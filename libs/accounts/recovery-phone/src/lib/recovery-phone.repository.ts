/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { AccountDatabase } from '@fxa/shared/db/mysql/account';
import { RecoveryPhone } from './recovery-phone.types';

export async function getConfirmedPhoneNumber(
  db: AccountDatabase,
  uid: Buffer
) {
  return db
    .selectFrom('recoveryPhones')
    .where('uid', '=', uid)
    .selectAll()
    .executeTakeFirst();
}

export async function registerPhoneNumber(
  db: AccountDatabase,
  recoveryPhone: RecoveryPhone
) {
  return await db.insertInto('recoveryPhones').values(recoveryPhone).execute();
}

export async function removePhoneNumber(db: AccountDatabase, uid: Buffer) {
  const result = await db
    .deleteFrom('recoveryPhones')
    .where('uid', '=', uid)
    .executeTakeFirstOrThrow();

  return result.numDeletedRows === BigInt(1);
}
