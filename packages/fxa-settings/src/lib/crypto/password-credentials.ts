/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  getCredentials,
  getCredentialsV2,
  getKeysV2,
} from 'fxa-auth-client/lib/crypto';
import { createSaltV2 } from 'fxa-auth-client/lib/salt';

/**
 * Derives credentials for a password that replaces any existing kB (signup,
 * reset without a recovery key). With v2 on, a fresh salt and random kB are
 * generated client-side and `v2Payload` carries both wrapped copies; with v2
 * off, `v2Payload` is empty and the server generates kB.
 */
export async function getNewPasswordCredentials(
  email: string,
  password: string,
  v2Enabled: boolean
) {
  const v1 = await getCredentials(email, password);
  if (!v2Enabled) {
    return { v1, v2: undefined, v2Payload: {} };
  }

  const v2 = await getCredentialsV2({ password, clientSalt: createSaltV2() });
  const { wrapKb, wrapKbVersion2 } = await getKeysV2({ v1, v2 });
  return {
    v1,
    v2,
    v2Payload: {
      wrapKb,
      wrapKbVersion2,
      authPWVersion2: v2.authPW,
      clientSalt: v2.clientSalt,
    },
  };
}
