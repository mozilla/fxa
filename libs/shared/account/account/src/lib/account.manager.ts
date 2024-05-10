/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { v4 as uuidv4 } from 'uuid';
import { Inject, Injectable } from '@nestjs/common';

import type { AccountDatabase } from '@fxa/shared/db/mysql/account';
import { AccountDbProvider } from '@fxa/shared/db/mysql/account';

import { createAccount, getAccounts } from './account.repository';
import { normalizeEmail, randomBytesAsync } from './account.util';
import { uuidTransformer } from '@fxa/shared/db/mysql/core';

@Injectable()
export class AccountManager {
  constructor(@Inject(AccountDbProvider) private db: AccountDatabase) {}

  async createAccountStub(
    email: string,
    verifierVersion: number,
    locale: string
  ) {
    const [emailCode, authSalt, kA, wrapWrapKb] = await Promise.all([
      randomBytesAsync(16),
      randomBytesAsync(32),
      randomBytesAsync(32),
      randomBytesAsync(32),
    ]);
    const uid = uuidv4({}, Buffer.alloc(16));
    await createAccount(this.db, {
      uid,
      email,
      emailCode,
      normalizedEmail: normalizeEmail(email),
      verifierVersion,
      kA,
      wrapWrapKb,
      verifyHash: Buffer.alloc(32),
      authSalt,
      verifierSetAt: 0,
      createdAt: Date.now(),
      locale,
      atLeast18AtReg: null,
    });
    return uid.toString('hex');
  }

  async getAccounts(uids: string[]) {
    const bufferUids = uids.map((uid) => uuidTransformer.to(uid));
    return getAccounts(this.db, bufferUids);
  }
}
