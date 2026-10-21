/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import AuthClient, { generateRecoveryKey } from 'fxa-auth-client/browser';

type RecoveryKeyAuthClient = Pick<
  AuthClient,
  | 'accountEmails'
  | 'sessionReauth'
  | 'sessionReauthWithAuthPW'
  | 'accountKeys'
  | 'createRecoveryKey'
  | 'createRecoveryKeyWithJwt'
>;

type ReauthCredentials =
  | { password: string }
  | { email: string; authPW: string; unwrapBKey: string };

/**
 * Reauthenticates for a fresh keyFetchToken, then creates a recovery key for
 * `uid`. Writes with `mfaJwt` when given, otherwise with `sessionToken`.
 */
export async function createRecoveryKeyWithReauth(
  authClient: RecoveryKeyAuthClient,
  {
    uid,
    sessionToken,
    credentials,
    replaceKey = false,
    mfaJwt,
  }: {
    uid: string;
    sessionToken: string;
    credentials: ReauthCredentials;
    replaceKey?: boolean;
    mfaJwt?: string;
  }
): Promise<Uint8Array> {
  const { keyFetchToken, unwrapBKey } = await reauthForKeys(
    authClient,
    sessionToken,
    credentials
  );
  const keys = await authClient.accountKeys(keyFetchToken, unwrapBKey);
  const { recoveryKey, recoveryKeyId, recoveryData } =
    await generateRecoveryKey(uid, keys);

  await (mfaJwt
    ? authClient.createRecoveryKeyWithJwt(
        mfaJwt,
        recoveryKeyId,
        recoveryData,
        true,
        replaceKey
      )
    : authClient.createRecoveryKey(
        sessionToken,
        recoveryKeyId,
        recoveryData,
        true,
        replaceKey
      ));
  return recoveryKey;
}

async function reauthForKeys(
  authClient: RecoveryKeyAuthClient,
  sessionToken: string,
  credentials: ReauthCredentials
) {
  const options = { keys: true, reason: 'recovery_key' };
  const { keyFetchToken, unwrapBKey } =
    'password' in credentials
      ? await authClient.sessionReauth(
          sessionToken,
          await authClient.accountEmails(sessionToken),
          credentials.password,
          options
        )
      : {
          ...(await authClient.sessionReauthWithAuthPW(
            sessionToken,
            { primary: credentials.email },
            credentials.authPW,
            options
          )),
          unwrapBKey: credentials.unwrapBKey,
        };

  if (!keyFetchToken || !unwrapBKey) {
    throw new Error('Reauth returned no keyFetchToken or unwrapBKey');
  }
  return { keyFetchToken, unwrapBKey };
}
