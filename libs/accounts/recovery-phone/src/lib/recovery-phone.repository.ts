/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { AccountDatabase } from '@fxa/shared/db/mysql/account';
import { RecoveryPhone } from './recovery-phone.types';

export async function getConfirmedPhoneNumber(
  db: AccountDatabase,
  uid: Buffer
): Promise<
  { uid: Buffer; phoneNumber: string; nationalFormat?: string } | undefined
> {
  const row = await db
    .selectFrom('recoveryPhones')
    .where('uid', '=', uid)
    .select(['uid', 'phoneNumber', 'lookupData'])
    .executeTakeFirst();

  if (!row) {
    return undefined;
  }
  const { uid: userId, phoneNumber, lookupData } = row;
  const nationalFormat = (lookupData as { nationalFormat?: string })
    ?.nationalFormat;

  return {
    uid: userId,
    phoneNumber,
    nationalFormat,
  };
}

export async function registerPhoneNumber(
  db: AccountDatabase,
  recoveryPhone: RecoveryPhone
): Promise<void> {
  await db.insertInto('recoveryPhones').values(recoveryPhone).execute();
}

/**
 * Updates a recoveryPhones record with the new data. The original `createdAt` is not preserved.
 *
 * @returns The number of rows updated
 */
export async function replacePhoneNumber(
  db: AccountDatabase,
  recoveryPhone: RecoveryPhone
): Promise<number> {
  const result = await db
    .updateTable('recoveryPhones')
    .where('uid', '=', recoveryPhone.uid)
    .set(recoveryPhone)
    .execute();

  return result.length;
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

export async function getCountByPhoneNumber(
  db: AccountDatabase,
  phoneNumber: string
): Promise<number> {
  const result = await db
    .selectFrom('recoveryPhones')
    .where('phoneNumber', '=', phoneNumber)
    .select('uid')
    .execute();

  return result.length;
}
