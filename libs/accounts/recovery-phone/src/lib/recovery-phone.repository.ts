/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { AccountDatabase, JsonValue } from '@fxa/shared/db/mysql/account';
import { RecoveryPhone } from './recovery-phone.types';

// Temporary helper function? Types are all over the place for lookupData,
// should just be a JSON object or string that we parse into JSON?
function isLookupDataObject(
  val: JsonValue
): val is { nationalFormat?: string } {
  return (
    typeof val === 'object' &&
    !Array.isArray(val) &&
    val?.['nationalFormat'] !== undefined
  );
}

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
  const nationalFormat = isLookupDataObject(lookupData)
    ? lookupData?.nationalFormat
    : undefined;

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

export async function removePhoneNumber(
  db: AccountDatabase,
  uid: Buffer
): Promise<boolean> {
  const result = await db
    .deleteFrom('recoveryPhones')
    .where('uid', '=', uid)
    .executeTakeFirstOrThrow();

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
