/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  AccountDatabase,
  AccountDbProvider,
} from '@fxa/shared/db/mysql/account';
import { Inject, Injectable } from '@nestjs/common';
import {
  deleteRecoveryCodes,
  getRecoveryCodes,
} from './backup-code.repository';

@Injectable()
export class BackupCodeManager {
  constructor(
    @Inject(AccountDbProvider) private readonly db: AccountDatabase
  ) {}

  /**
   * Gets the count of recover codes for a given uid.
   *
   * @param uid - The uid in hexadecimal string format.
   * @returns An object containing whether the user has backup codes and the count of backup codes.
   */
  async getCountForUserId(
    uid: string
  ): Promise<{ hasBackupCodes: boolean; count: number }> {
    const recoveryCodes = await getRecoveryCodes(
      this.db,
      Buffer.from(uid, 'hex')
    );

    return {
      hasBackupCodes: recoveryCodes.length > 0,
      count: recoveryCodes.length,
    };
  }

  /**
   * Removes recover codes for a given uid.
   *
   * @param uid - The uid in hexadecimal string format.
   * @returns True if one or more codes were removed
   */
  async deleteRecoveryCodes(uid: string) {
    const success = await deleteRecoveryCodes(this.db, Buffer.from(uid, 'hex'));
    return success;
  }
}
