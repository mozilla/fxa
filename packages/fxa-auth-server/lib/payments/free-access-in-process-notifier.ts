/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { AppError as error } from '@fxa/accounts/errors';
import type { FreeAccessNotifier } from '@fxa/free-access-program';
import type { ProfileClient } from '@fxa/profile/client';

import type { AuthLogger, AuthRequest } from '../types';

export interface AccountLookupDb {
  accountRecord(email: string): Promise<{ uid: string }>;
}

export class FreeAccessInProcessNotifier implements FreeAccessNotifier {
  constructor(
    private db: AccountLookupDb,
    private profileClient: ProfileClient,
    private log: AuthLogger
  ) {}

  async notifyEmailChanged(email: string): Promise<void> {
    let uid: string;
    try {
      const account = await this.db.accountRecord(email);
      uid = account.uid;
    } catch (err) {
      // Free-access lists may include not-yet-registered accounts.
      if ((err as { errno?: number })?.errno === error.ERRNO.ACCOUNT_UNKNOWN) {
        return;
      }
      throw err;
    }

    await this.profileClient.deleteCache(uid);
    await this.log.notifyAttachedServices(
      'profileDataChange',
      {} as AuthRequest,
      {
        uid,
        ts: Date.now() / 1000,
      }
    );
  }
}
