/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { DecryptedRecoveryKeyData } from 'fxa-auth-client/lib/recoveryKey';
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
    DecryptedRecoveryKey = 'decryptedRecoveryKeyData',
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
    decryptedRecoveryKeyData?: Pick<DecryptedRecoveryKeyData, 'kB'>;
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
}

/**
 * A client that holds data which should never be persisted.
 *
 * N.B. This data only lives in memory and will always be lost after the document is unloaded. Avoid nullable data where possible.
 *
 * @class SensitiveDataClient
 */
export class SensitiveDataClient {
  // TODO(FXA-10929): Fast follow, use this pattern instead for simpler and better type safety.
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
  private sensitiveData: {
    [key in keyof SensitiveData.DataMap]: SensitiveData.DataMap[key];
  };

  /**
   * Create an instance.
   *
   * @constructor
   */
  constructor() {
    this.sensitiveData = {};
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
    this.sensitiveData[key] = value;
  }

  /**
   * Get data from the sensitiveData object.
   *
   * @param {SensitiveDataKey} key - The key under which the data is stored.
   * @returns The corresponding value to the key in the sensitive data object.
   */
  getDataType<T extends SensitiveData.Key>(key: T): SensitiveData.DataMap[T] {
    return this.sensitiveData[key];
  }
}
