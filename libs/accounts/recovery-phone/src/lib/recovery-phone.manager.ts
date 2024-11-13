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
import { Redis } from 'ioredis';

const RECORD_EXPIRATION_SECONDS = 10 * 60;

@Injectable()
export class RecoveryPhoneManager {
  private readonly redisPrefix = 'sms-attempt';

  constructor(
    @Inject(AccountDbProvider) private readonly db: AccountDatabase,
    @Inject('Redis') private readonly redisClient: Redis
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

  /**
   * Store phone number data and SMS code for a user.
   *
   * @param uid The user's unique identifier
   * @param code The SMS code to associate with this UID
   * @param phoneNumber The phone number to store
   * @param isSetup Flag indicating if this SMS is to set up a number or verify an existing one
   * @param lookupData Optional lookup data for the phone number
   */
  async storeUnconfirmed(
    uid: string,
    code: string,
    phoneNumber: string,
    isSetup: boolean,
    lookupData?: Record<string, any>
  ): Promise<void> {
    const redisKey = `${this.redisPrefix}:${uid}:${code}`;
    const data = {
      phoneNumber,
      isSetup,
      lookupData: lookupData ? JSON.stringify(lookupData) : null,
    };

    await this.redisClient.set(
      redisKey,
      JSON.stringify(data),
      'EX',
      RECORD_EXPIRATION_SECONDS
    );
  }

  /**
   * Retrieve phone number data for a user using uid and sms code.
   *
   * @param uid The user's unique identifier
   * @param code The SMS code associated with this user
   * @returns The stored phone number data if found, or null if not found
   */
  async getUnconfirmed(
    uid: string,
    code: string
  ): Promise<{
    phoneNumber: string;
    isSetup: boolean;
    lookupData: Record<string, any> | null;
  } | null> {
    const redisKey = `${this.redisPrefix}:${uid}:${code}`;
    const data = await this.redisClient.get(redisKey);

    if (!data) {
      return null;
    }

    return JSON.parse(data);
  }
}
