/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  AccountDatabase,
  AccountDbProvider,
} from '@fxa/shared/db/mysql/account';
import { Inject, Injectable } from '@nestjs/common';
import {
  getConfirmedPhoneNumber,
  hasRecoveryCodes,
  registerPhoneNumber,
  removePhoneNumber,
} from './recovery-phone.repository';
import {
  RecoveryNumberAlreadyExistsError,
  RecoveryNumberInvalidFormatError,
  RecoveryNumberNotExistsError,
} from './recovery-phone.errors';
import { Redis } from 'ioredis';
import { PhoneNumberInstance } from 'twilio/lib/rest/lookups/v2/phoneNumber';

const RECORD_EXPIRATION_SECONDS = 10 * 60;

/**
 *
 */
export type PhoneNumberLookupData = ReturnType<
  typeof PhoneNumberInstance.prototype.toJSON
>;

@Injectable()
export class RecoveryPhoneManager {
  private readonly redisPrefix = 'sms-attempt';

  constructor(
    @Inject(AccountDbProvider) private readonly db: AccountDatabase,
    @Inject('RecoveryPhoneRedis') private readonly redisClient: Redis
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
  async registerPhoneNumber(
    uid: string,
    phoneNumber: string,
    lookupData: PhoneNumberLookupData
  ): Promise<any> {
    if (!this.isE164Format(phoneNumber)) {
      throw new RecoveryNumberInvalidFormatError(uid, phoneNumber);
    }
    const uidBuffer = Buffer.from(uid, 'hex');
    const now = Date.now();
    try {
      await registerPhoneNumber(this.db, {
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
   * Get the confirmed phone number for a user.
   *
   * @param uid
   */
  async getConfirmedPhoneNumber(
    uid: string
  ): Promise<{ uid: Buffer; phoneNumber: string }> {
    const uidBuffer = Buffer.from(uid, 'hex');
    const result = await getConfirmedPhoneNumber(this.db, uidBuffer);
    if (!result) {
      throw new RecoveryNumberNotExistsError(uid);
    }
    return result;
  }

  /**
   * Remove account phone number.
   *
   * @param uid
   */
  async removePhoneNumber(uid: string): Promise<boolean> {
    const uidBuffer = Buffer.from(uid, 'hex');
    const removed = await removePhoneNumber(this.db, uidBuffer);

    if (!removed) {
      throw new RecoveryNumberNotExistsError(uid);
    }

    return true;
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
    lookupData?: PhoneNumberLookupData
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

  /**
   * Returns redis keys for all unconfirmed phone numbers for a user.
   *
   * @param uid
   */
  async getAllUnconfirmed(uid: string): Promise<string[]> {
    const redisKey = `${this.redisPrefix}:${uid}:*`;
    return await this.redisClient.keys(redisKey);
  }

  /**
   * Removes a code from redis. Once a code is validated, it's good to proactively remove it from the database
   * so it cannot be used again.
   * @param uid The user's unique identifier
   * @param code The SMS code associated with this user
   * @returns
   */
  async removeCode(uid: string, code: string) {
    const redisKey = `${this.redisPrefix}:${uid}:${code}`;
    const count = await this.redisClient.del(redisKey);
    return count > 0;
  }

  /**
   * Check if a user has recovery codes. Recovery codes are required
   * to set up a recovery phone.
   *
   * @param uid The user's unique identifier
   */
  async hasRecoveryCodes(uid: string): Promise<boolean> {
    return hasRecoveryCodes(this.db, Buffer.from(uid, 'hex'));
  }
}
