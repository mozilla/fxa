/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import AuthClient from 'fxa-auth-client';

/// mock localStorage state to allow MfaGuard to work in stories
export function initLocalAccount() {
  const uid = 'abc123';
  const accounts = {
    [uid]: {
      uid,
      sessionToken: 'sessionToken',
      email: 'user@example.com',
      verified: true,
      lastLogin: Date.now(),
    },
  };
  window.localStorage.setItem(
    `__fxa_storage.accounts`,
    JSON.stringify(accounts)
  );
  window.localStorage.setItem(
    `__fxa_storage.currentAccountUid`,
    JSON.stringify(uid)
  );
}

/// mock AuthClient to allow MfaGuard to work in stories
export const mockAuthClient = {
  mfaRequestOtp: async (st: string, sc: string) => {
    return undefined;
  },
  mfaOtpVerify: async (st: string, code: string, sc: string) => {
    return { accessToken: 'storybook-jwt' } as any;
  },
} as unknown as AuthClient;
