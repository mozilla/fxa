/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { timingSafeEqual, randomInt } from 'crypto';

type OtpStorage = {
  del: (key: string) => unknown;
  get: (key: string) => unknown;
  set: (key: string, value: string) => unknown;
};

type OtpManagerOptions = {
  kind: string;
  digits: number;
};

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

  private async getCode() {
    const randInt = await new Promise((resolve, reject) => {
      randomInt(0, this.max, (err, value) => {
        if (err) reject(err);
        resolve(value);
      });
    });
    return String(randInt).padStart(this.digits, '0');
  }

  async create(key: string) {
    const storageKey = this.getStorageKey(key);
    const code = await this.getCode();
    await this.storage.set(storageKey, code);
    return code;
  }

  async isValid(key: string, code: string) {
    const storedVal = await this.storage.get(this.getStorageKey(key));

    if (!storedVal) {
      return false;
    }

    return timingSafeEqual(Buffer.from(code), Buffer.from(String(storedVal)));
  }

  async delete(key: string) {
    return await this.storage.del(this.getStorageKey(key));
  }
}
