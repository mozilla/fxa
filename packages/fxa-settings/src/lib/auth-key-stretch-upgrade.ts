/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import AuthClient from 'fxa-auth-client/browser';
import * as Sentry from '@sentry/browser';
import {
  getCredentials,
  getCredentialsV2,
  getKeysV2,
  unwrapKB,
} from 'fxa-auth-client/lib/crypto';
import { createSaltV2 } from 'fxa-auth-client/lib/salt';
import { deriveHawkCredentials } from 'fxa-auth-client/lib/hawk';
import { getHandledError } from './error-utils';
import { SensitiveDataClient } from './sensitive-data-client';
import { ERRNO } from '@fxa/accounts/errors';

export type V1Credentials = {
  authPW: string;
  unwrapBKey: string;
};

export type V2Credentials = V1Credentials & {
  clientSalt: string;
};

export interface CredentialStatus {
  upgradeNeeded: boolean;
  currentVersion?: 'v1' | 'v2';
  clientSalt?: string;
}

/**
 * Convenience function for attempting an upgrade and catching any errors that might happen.
 */
export async function tryFinalizeUpgrade(
  sessionId: string,
  sensitiveDataClient: SensitiveDataClient,
  stage: string,
  authClient: AuthClient
) {
  try {
    if (sensitiveDataClient.KeyStretchUpgradeData) {
      const upgradeClient = new AuthKeyStretchUpgrade(stage, authClient);

      await upgradeClient.upgrade(
        sensitiveDataClient.KeyStretchUpgradeData.email,
        sensitiveDataClient.KeyStretchUpgradeData.v1Credentials,
        sensitiveDataClient.KeyStretchUpgradeData.v2Credentials,
        sessionId
      );
      return true;
    }
  } catch (error) {
    // NO-OP Don't let a key stretching upgrade issue prevent sign in.
  } finally {
    sensitiveDataClient.KeyStretchUpgradeData = undefined;
  }
  return false;
}

/**
 * Handles upgrade process for key stretching using auth-client directly
 */
export class AuthKeyStretchUpgrade {
  constructor(
    private readonly stage: string,
    private readonly authClient: AuthClient
  ) {}

  async getCredentials(
    email: string,
    password: string,
    v2Enabled: boolean
  ): Promise<{
    v1Credentials: V1Credentials;
    v2Credentials?: V2Credentials;
    credentialStatus?: CredentialStatus;
  }> {
    const v1Credentials = await getCredentials(email, password);
    if (v2Enabled) {
      const credentialStatus = await this.getCredentialsStatus(email);
      if (credentialStatus) {
        const v2Credentials = await getCredentialsV2({
          password,
          clientSalt: credentialStatus?.clientSalt || createSaltV2(),
        });
        return {
          credentialStatus,
          v1Credentials,
          v2Credentials,
        };
      }
    }
    return {
      v1Credentials,
    };
  }

  async upgrade(
    email: string,
    v1Credentials: V1Credentials,
    v2Credentials: V2Credentials,
    sessionToken: string
  ): Promise<boolean> {
    let result1 = await this.startUpgrade(email, v1Credentials, sessionToken);

    if (result1?.keyFetchToken && result1?.passwordChangeToken) {
      const result2 = await this.getWrappedKeys(result1.keyFetchToken);
      if (result2?.wrapKB) {
        await this.finishUpgrade(
          result2?.wrapKB,
          result1.passwordChangeToken,
          v1Credentials,
          v2Credentials,
          sessionToken
        );
        return true;
      }
    }
    return false;
  }

  private async getCredentialsStatus(
    email: string
  ): Promise<CredentialStatus | undefined> {
    try {
      const result = await this.authClient.getCredentialStatusV2(email);
      return {
        upgradeNeeded: result.upgradeNeeded,
        currentVersion: result.currentVersion,
        clientSalt: result.clientSalt,
      };
    } catch (error) {
      Sentry.captureMessage(
        `Failure to finish v2 key-stretching upgrade. Could not get credential status during ${this.stage}`,
        {
          tags: {
            errno: getHandledError(error).error.errno,
          },
        }
      );
    }
    return undefined;
  }

  private async startUpgrade(
    email: string,
    v1Credentials: V1Credentials,
    sessionToken: string
  ) {
    try {
      const response = await this.authClient.passwordChangeStartWithAuthPW(
        email,
        v1Credentials.authPW,
        sessionToken
      );
      return {
        keyFetchToken: response.keyFetchToken || '',
        passwordChangeToken: response.passwordChangeToken || '',
      };
    } catch (error) {
      const errno = getHandledError(error).error.errno;

      if (errno === ERRNO.ACCOUNT_UNVERIFIED) {
        console.info('Account not verified. Try upgrade later.');
      } else if (errno === ERRNO.SESSION_UNVERIFIED) {
        console.info('Session not verified. Try upgrade later.');
      } else {
        console.info('Unexpected errno. Try upgrade later.', errno);
      }

      Sentry.captureMessage(
        `Failure to finish v2 key-stretching upgrade. Could not start password change during ${this.stage}`,
        {
          tags: {
            errno,
          },
        }
      );
    }
    return undefined;
  }

  private async getWrappedKeys(keyFetchToken: string) {
    try {
      const response = await this.authClient.wrappedAccountKeys(keyFetchToken);
      return {
        wrapKB: response.wrapKB || '',
      };
    } catch (error) {
      Sentry.captureMessage(
        `Failure to finish v2 key-stretching upgrade. Could not get wrapped keys during ${this.stage}`,
        {
          tags: {
            errno: getHandledError(error).error.errno,
          },
        }
      );
    }
    return undefined;
  }

  private async finishUpgrade(
    wrapKb: string,
    passwordChangeToken: string,
    v1Credentials: V1Credentials,
    v2Credentials: V2Credentials,
    sessionToken: string
  ): Promise<void> {
    const kB = unwrapKB(wrapKb, v1Credentials.unwrapBKey);
    const keys = await getKeysV2({
      kB,
      v1: v1Credentials,
      v2: v2Credentials,
    });
    try {
      const credentials = await deriveHawkCredentials(
        sessionToken,
        'sessionToken'
      );

      await this.authClient.passwordChangeFinish(
        passwordChangeToken,
        {
          authPW: v1Credentials.authPW,
          wrapKb: keys.wrapKb,
          authPWVersion2: v2Credentials.authPW,
          wrapKbVersion2: keys.wrapKbVersion2,
          clientSalt: v2Credentials.clientSalt,
          sessionToken: credentials.id,
        },
        { keys: false }
      );
    } catch (error) {
      Sentry.captureMessage(
        `Failure to finish v2 key-stretching upgrade. Could not finish password change during ${this.stage}`,
        {
          tags: {
            errno: getHandledError(error).error.errno,
          },
        }
      );
    }
  }
}
