import { MutationFunction } from '@apollo/client';
import {
  CredentialStatus,
  CredentialStatusResponse,
  GetAccountKeysResponse,
  PasswordChangeFinishResponse,
  PasswordChangeStartResponse,
} from '../pages/Signin/interfaces';
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

export type V1Credentials = {
  authPW: string;
  unwrapBKey: string;
};

export type V2Credentials = V1Credentials & {
  clientSalt: string;
};

/**
 * Convenience function for attempting an upgrade and catching any errors that might happen.
 * Note that this will manually report GQL errors to Sentry.
 */
export async function tryFinalizeUpgrade(
  sessionId: string,
  sensitiveDataClient: SensitiveDataClient,
  stage: string,
  gqlCredentialStatus: MutationFunction<CredentialStatusResponse>,
  gqlGetWrappedKeys: MutationFunction<GetAccountKeysResponse>,
  gqlPasswordChangeStart: MutationFunction<PasswordChangeStartResponse>,
  gqlPasswordChangeFinish: MutationFunction<PasswordChangeFinishResponse>
) {
  try {
    if (sensitiveDataClient.KeyStretchUpgradeData) {
      const upgradeClient = new GqlKeyStretchUpgrade(
        stage,
        gqlCredentialStatus,
        gqlGetWrappedKeys,
        gqlPasswordChangeStart,
        gqlPasswordChangeFinish
      );

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
    // Note that the upgradeClient reports errors to sentry.
  } finally {
    // Clear out the state. No reason to keep trying this...
    // Note that the upgradeClient will report issues to Sentry.
    sensitiveDataClient.KeyStretchUpgradeData = undefined;
  }
  return false;
}

/**
 * Handles upgrade process for key stretching
 */
export class GqlKeyStretchUpgrade {
  constructor(
    private readonly stage: string,
    private readonly gqlCredentialStatus: MutationFunction<CredentialStatusResponse>,
    private readonly gqlGetWrappedKeys: MutationFunction<GetAccountKeysResponse>,
    private readonly gqlPasswordChangeStart: MutationFunction<PasswordChangeStartResponse>,
    private readonly gqlPasswordChangeFinish: MutationFunction<PasswordChangeFinishResponse>
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
    let result1 = await this.startUpgrade(email, v1Credentials);

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
      const result = await this.gqlCredentialStatus({
        variables: {
          input: email,
        },
      });
      return result.data?.credentialStatus;
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

  private async startUpgrade(email: string, v1Credentials: V1Credentials) {
    try {
      const response = await this.gqlPasswordChangeStart({
        variables: {
          input: {
            email: email,
            oldAuthPW: v1Credentials.authPW,
          },
        },
      });
      const passwordChangeToken =
        response.data?.passwordChangeStart?.passwordChangeToken || '';
      const keyFetchToken =
        response.data?.passwordChangeStart?.keyFetchToken || '';
      return {
        keyFetchToken,
        passwordChangeToken,
      };
    } catch (error) {
      // If the user enters the wrong password, they will see an invalid password error.
      // Otherwise something has going wrong and we should show a general error.
      Sentry.captureMessage(
        `Failure to finish v2 key-stretching upgrade. Could not start password change during ${this.stage}`,
        {
          tags: {
            errno: getHandledError(error).error.errno,
          },
        }
      );
    }
    return undefined;
  }

  private async getWrappedKeys(keyFetchToken: string) {
    try {
      const keysResponse = await this.gqlGetWrappedKeys({
        variables: {
          input: keyFetchToken,
        },
      });
      const wrapKB = keysResponse.data?.wrappedAccountKeys.wrapKB || '';
      return {
        wrapKB,
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

      const input = {
        passwordChangeToken: passwordChangeToken,
        authPW: v1Credentials.authPW,
        wrapKb: keys.wrapKb,
        authPWVersion2: v2Credentials.authPW,
        wrapKbVersion2: keys.wrapKbVersion2,
        clientSalt: v2Credentials.clientSalt,
        sessionToken: credentials.id,
      };

      await this.gqlPasswordChangeFinish({
        variables: {
          input,
        },
      });
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
