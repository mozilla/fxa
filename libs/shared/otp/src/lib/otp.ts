/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { timingSafeEqual, randomInt } from 'crypto';

export interface OtpStorage {
  del: (key: string) => Promise<null>;
  get: (key: string) => Promise<string | null>;
  set: (key: string, value: string) => Promise<null>;
}

type OtpManagerOptions = {
  kind: string;
  digits: number;
};

/** Manages creation and storage of otp codes. */
export class OtpManager {
  kind: OtpManagerOptions['kind'];
  digits: number;
  max: number;
  storage: OtpStorage;

  constructor(options: OtpManagerOptions, storage: OtpStorage) {
    this.kind = options.kind;
    this.digits = Math.max(options.digits, 6);
    this.max = Math.pow(10, this.digits);
    this.storage = storage;
  }

  private getStorageKey(key: string) {
    return `otp:${this.kind}:${key}`;
  }

  /**
   * Generates an otp code. Note that the calling code will be responsible for storing the code.
   * @returns An otpCode
   */
  public async generateCode() {
    const randInt = await new Promise((resolve, reject) => {
      randomInt(0, this.max, (err, value) => {
        if (err) reject(err);
        resolve(value);
      });
    });
    return String(randInt).padStart(this.digits, '0');
  }

  /**
   * Creates and stores an otp code.
   * @param key A unique key for the code
   * @returns An otp code
   */
  async create(key: string) {
    const storageKey = this.getStorageKey(key);
    const code = await this.generateCode();
    await this.storage.set(storageKey, code);
    return code;
  }

  /**
   * Validates a previously created code.
   * @param key The key
   * @param code  The code's value
   * @returns True if code is valid
   */
  async isValid(key: string, code: string) {
    const storedVal = await this.storage.get(this.getStorageKey(key));

    if (!storedVal) {
      return false;
    }

    return timingSafeEqual(Buffer.from(code), Buffer.from(String(storedVal)));
  }

  /**
   * Removes a code from the store
   * @param key Key to fetch code.
   * @returns null upon deletion
   */
  async delete(key: string) {
    return await this.storage.del(this.getStorageKey(key));
  }
}
