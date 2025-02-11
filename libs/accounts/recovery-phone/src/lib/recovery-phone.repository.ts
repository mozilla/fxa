/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { AccountDatabase } from '@fxa/shared/db/mysql/account';
import { RecoveryPhone } from './recovery-phone.types';

export async function getConfirmedPhoneNumber(
  db: AccountDatabase,
  uid: Buffer
): Promise<{ uid: Buffer; phoneNumber: string } | undefined> {
  return db
    .selectFrom('recoveryPhones')
    .where('uid', '=', uid)
    .select(['uid', 'phoneNumber'])
    .executeTakeFirst();
}

export async function registerPhoneNumber(
  db: AccountDatabase,
  recoveryPhone: RecoveryPhone
): Promise<void> {
  await db.insertInto('recoveryPhones').values(recoveryPhone).execute();
}

export async function removePhoneNumber(
  db: AccountDatabase,
  uid: Buffer
): Promise<boolean> {
  const result = await db
    .deleteFrom('recoveryPhones')
    .where('uid', '=', uid)
    // TBD: Didn't seem like handled an error coming off this call, so
    // removed the orThrow...
    .executeTakeFirst();

  return result.numDeletedRows === BigInt(1);
}

export async function hasRecoveryCodes(
  db: AccountDatabase,
  uid: Buffer
): Promise<boolean> {
  const result = await db
    .selectFrom('recoveryCodes')
    .where('uid', '=', uid)
    .select('uid')
    .execute();

  return result.length > 0;
}
