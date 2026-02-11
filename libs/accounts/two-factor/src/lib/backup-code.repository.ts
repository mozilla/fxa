/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { AccountDatabase } from '@fxa/shared/db/mysql/account';

export async function getRecoveryCodes(db: AccountDatabase, uid: Buffer) {
  return await db
    .selectFrom('recoveryCodes')
    .where('uid', '=', uid)
    .selectAll()
    .execute();
}

export async function deleteRecoveryCodes(db: AccountDatabase, uid: Buffer) {
  const result = await db
    .deleteFrom('recoveryCodes')
    .where('uid', '=', uid)
    .executeTakeFirst();

  return result.numDeletedRows === BigInt(1);
}
