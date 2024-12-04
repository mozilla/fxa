/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { V1Credentials, V2Credentials } from './gql-key-stretch-upgrade';

export const AUTH_DATA_KEY = 'auth';

export type SensitiveDataClientData = {
  [AUTH_DATA_KEY]: {
    emailForAuth?: string;
    authPW?: string;
    keyFetchToken?: hexstring;
    unwrapBKey?: hexstring;
  };
};

export type SensitiveDataClientAuthKeys = Pick<
  SensitiveDataClientData[typeof AUTH_DATA_KEY],
  'keyFetchToken' | 'unwrapBKey'
>;

/**
 * Class representing a client for handling sensitive data.
 *
 * @class
 */
export class SensitiveDataClient {
  /**
   * Object to store sensitive data.
   * @private
   */
  private sensitiveData: { [key: string]: object } = {};

  // TODO: Fast follow, use this pattern instead for simpler and better type safety.
  public KeyStretchUpgradeData:
    | {
        email: string;
        v1Credentials: V1Credentials;
        v2Credentials: V2Credentials;
      }
    | undefined;

  /**
   * Create a SensitiveDataClient.
   * @constructor
   */
  constructor() {
    this.sensitiveData = {};
  }

  /**
   * Set data in the sensitiveData object.
   * @param {string} key - The key under which the data should be stored.
   * @param {any} value - The data to be stored.
   */
  setData(key: string, value: any): void {
    this.sensitiveData[key] = value;
  }

  /**
   * Get data from the sensitiveData object.
   * @param {string} key - The key under which the data is stored.
   * @return {any} The data stored under the provided key.
   */
  getData(key: string): any {
    return this.sensitiveData[key];
  }
}
