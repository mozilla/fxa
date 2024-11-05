/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  AccountDatabase,
  AccountDbProvider,
} from '@fxa/shared/db/mysql/account';
import { Inject, Injectable } from '@nestjs/common';
import { registerPhoneNumber } from './recovery-phone.repository';
import {
  RecoveryNumberAlreadyExistsError,
  RecoveryNumberInvalidFormatError,
} from './recovery-phone.errors';

@Injectable()
export class RecoveryPhoneManager {
  constructor(
    @Inject(AccountDbProvider) private readonly db: AccountDatabase
  ) {}

  private isE164Format(phoneNumber: string) {
    const e164Regex = /^\+?[1-9]\d{1,14}$/;
    return e164Regex.test(phoneNumber);
  }

  /**
   * Register a phone number for account recovery.
   *
   * @throws {RecoveryNumberAlreadyExistsError} if the phone number is already registered.
   * @param uid
   * @param phoneNumber Phone number in E.164 format.
   */
  async registerPhoneNumber(uid: string, phoneNumber: string): Promise<any> {
    if (!this.isE164Format(phoneNumber)) {
      throw new RecoveryNumberInvalidFormatError(uid, phoneNumber);
    }

    const uidBuffer = Buffer.from(uid, 'hex');

    // TODO: Perform phone number validation here via https://www.twilio.com/docs/lookup/v2-api#making-a-request
    const lookupData = {};

    const now = Date.now();
    try {
      return await registerPhoneNumber(this.db, {
        uid: uidBuffer,
        phoneNumber,
        createdAt: now,
        lastConfirmed: now,
        lookupData: JSON.stringify(lookupData),
      });
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        throw new RecoveryNumberAlreadyExistsError(uid, phoneNumber);
      }
      throw err;
    }
  }
}
