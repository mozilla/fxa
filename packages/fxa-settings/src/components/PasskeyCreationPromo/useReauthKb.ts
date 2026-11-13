/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useState } from 'react';
import { hexToUint8 } from 'fxa-auth-client/lib/utils';
import { sessionToken } from '../../lib/cache';
import { passwordlessSyncEnabled } from '../../lib/passkeys/should-show-passkey-signin';
import { useAuthClient, useConfig, useSensitiveDataClient } from '../../models';

/**
 * Returns a function that reauthenticates the session with the password from
 * this sign-in and derives `kB`, or undefined when no password is held (an
 * email code, a third-party sign-in, or a reload). Storing a wrap requires
 * that reauth: the server only accepts a session whose password was confirmed
 * after it was created.
 */
export function useReauthKb(): (() => Promise<Uint8Array>) | undefined {
  const authClient = useAuthClient();
  const config = useConfig();
  const sensitiveDataClient = useSensitiveDataClient();
  const [auth] = useState(() => sensitiveDataClient.AuthData);
  const { authPW, unwrapBKey, emailForAuth } = auth ?? {};

  if (
    !authPW ||
    !unwrapBKey ||
    !emailForAuth ||
    !passwordlessSyncEnabled(config)
  ) {
    return undefined;
  }

  return async () => {
    const session = sessionToken();
    if (!session) throw new Error('No session to reauthenticate');
    const { keyFetchToken } = await authClient.sessionReauthWithAuthPW(
      session,
      { primary: emailForAuth },
      authPW,
      { keys: true, reason: 'passkey_wrap' }
    );
    if (!keyFetchToken) throw new Error('Reauth returned no keyFetchToken');
    const { kB } = await authClient.accountKeys(keyFetchToken, unwrapBKey);
    return hexToUint8(kB);
  };
}
