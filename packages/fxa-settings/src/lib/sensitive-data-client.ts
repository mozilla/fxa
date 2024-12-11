/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { V1Credentials, V2Credentials } from './gql-key-stretch-upgrade';

export namespace SensitiveData {
  /**
   * The keys for the various kinds of data that can be inserted into a `SensitiveData` object.
   *
   * @see SensitiveDataClient for implementations.
   */
  export enum Key {
    Auth = 'auth',
    AccountReset = 'accountResetData',
    NewRecoveryKey = 'newRecoveryKeyData',
    Password = 'password',
    KeyStretchUpgrade = 'keyStretchUpgrade'
  }

  /**
   * A data type for the various data added through the {@link SensitiveDataClient}.
   *
   * N.B. Use a non-nullable type if the values are derived from a hook during initialization.
   *
   * @see SensitiveDataClient for implementations.
   */
  export type DataMap = {
    auth?: AuthData;
    accountResetData?: AccountResetData;
    newRecoveryKeyData?: NewRecoveryKeyData;
    password?: Password;
    keyStretchUpgrade?: KeyStretchUpgradeData;
  };

  /**
   * Data inserted for the key {@link Key.Auth}.
   */
  export type AuthData = {
    emailForAuth?: string;
    authPW?: string;
    keyFetchToken?: hexstring;
    unwrapBKey?: hexstring;
  };

  /**
   * Data insert for the key {@link Key.Password}.
   */
  export type Password = {
    plainTextPassword: string;
  };

  /**
   * Data inserted for the key {@link Key.AccountReset}.
   */
  export type AccountResetData = {
    keyFetchToken: string;
    unwrapBKey: hexstring;
  };

  /**
   * Data inserted for the key {@link Key.NewRecoveryKey}.
   */
  export type NewRecoveryKeyData = {
    recoveryKey: Uint8Array;
  };

  /**
   * Data inserted for the key {@link Key.KeyStretchUpgrade}.
   */
  export type KeyStretchUpgradeData = {
    email: string;
    v1Credentials: V1Credentials;
    v2Credentials: V2Credentials;
  };
}

/**
 * A client that holds data which should never be persisted.
 *
 * N.B. This data only lives in memory and will always be lost after the document is unloaded. Avoid nullable data where possible.
 *
 * @class SensitiveDataClient
 */
export class SensitiveDataClient {
  /**
   * @deprecated
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
   * Object to store sensitive data.
   *
   * @private
   */
  private newSensitiveData: {
    [key in keyof SensitiveData.DataMap]: SensitiveData.DataMap[key];
  };

  /**
   * Create an instance.
   *
   * @constructor
   */
  constructor() {
    this.sensitiveData = {};
    this.newSensitiveData = {};
  }

  /**
   * @deprecated Use {@link setDataType} instead.
   */
  setData(key: string, value: any): void {
    this.sensitiveData[key] = value;
  }

  /**
   * Set data in the sensitiveData object.
   *
   * @param {SensitiveDataKey} key - The key under which the data should be stored.
   * @param value - The data to be stored. See {SensitiveData}.
   */
  setDataType<T extends SensitiveData.Key>(
    key: T,
    value?: SensitiveData.DataMap[T]
  ): void {
    this.newSensitiveData[key] = value;
  }

  /**
   * @deprecated Use {@link getDataType} instead.
   */
  getData(key: string): any {
    return this.sensitiveData[key];
  }

  /**
   * Get data from the sensitiveData object.
   *
   * @param {SensitiveDataKey} key - The key under which the data is stored.
   * @returns The corresponding value to the key in the sensitive data object.
   */
  getDataType<T extends SensitiveData.Key>(key: T): SensitiveData.DataMap[T] {
    return this.newSensitiveData[key];
  }
}
