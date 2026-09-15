/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { DecryptedRecoveryKeyData } from 'fxa-auth-client/lib/recoveryKey';
import { V1Credentials, V2Credentials } from './auth-key-stretch-upgrade';

export namespace SensitiveData {
  export type AuthData = {
    emailForAuth?: string;
    authPW?: string;
    keyFetchToken?: hexstring;
    unwrapBKey?: hexstring;
  };

  export type Password = {
    plainTextPassword: string;
  };

  export type AccountResetData = {
    keyFetchToken: string;
    unwrapBKey: hexstring;
  };

  export type NewRecoveryKeyData = {
    recoveryKey: Uint8Array;
  };

  export type DecryptedRecoveryKey = Pick<DecryptedRecoveryKeyData, 'kB'>;
}

/**
 * A client that holds data which should never be persisted.
 *
 * N.B. This data only lives in memory and will always be lost after the document is unloaded. Avoid nullable data where possible.
 *
 * @class SensitiveDataClient
 */
export class SensitiveDataClient {
  public KeyStretchUpgradeData:
    | {
        // Important! This is the original email used during account creation.
        email: string;
        v1Credentials: V1Credentials;
        v2Credentials: V2Credentials;
      }
    | undefined;

  public AuthData: SensitiveData.AuthData | undefined;

  public AccountResetData: SensitiveData.AccountResetData | undefined;

  public NewRecoveryKeyData: SensitiveData.NewRecoveryKeyData | undefined;

  public Password: SensitiveData.Password | undefined;

  public DecryptedRecoveryKeyData:
    | SensitiveData.DecryptedRecoveryKey
    | undefined;
}
