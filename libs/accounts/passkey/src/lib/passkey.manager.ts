/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Inject, Injectable } from '@nestjs/common';
import {
  AccountDatabase,
  AccountDbProvider,
} from '@fxa/shared/db/mysql/account';

/**
 * PasskeyManager - Data access layer for passkey database operations.
 *
 * Orchestrates repository calls and adds business logic for passkey storage.
 * See passkey.repository.ts for pure SQL query functions.
 */
@Injectable()
export class PasskeyManager {
  constructor(
    @Inject(AccountDbProvider) private readonly db: AccountDatabase
  ) {}

  // TODO: Implement the methods such as findByUid, findByCredentialId, create, updateLastUsed, delete, etc.
}
