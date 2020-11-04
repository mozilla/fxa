/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { AuthServerError } from 'fxa-auth-client/browser';

export type AuthUiError = AuthServerError;

const ERRORS = {
  PASSWORDS_MUST_BE_DIFFERENT: {
    errno: 1008,
    message: 'Your new password must be different',
  },
};

type ErrorKey = keyof typeof ERRORS;
type ErrorVal = { errno: number; message: string };

export const AuthUiErrors: { [key in ErrorKey]: AuthUiError } = (Object.entries(
  ERRORS
) as [[ErrorKey, ErrorVal]]).reduce(
  (acc: { [key in ErrorKey]: AuthUiError }, [k, v]) => {
    const e = new Error(v.message) as AuthUiError;
    e.errno = v.errno;
    acc[k] = e;
    return acc;
  },
  {} as Record<ErrorKey, AuthUiError>
);

export const AuthUiErrorNumbers: {
  [key in ErrorKey]: number;
} = (Object.entries(ERRORS) as [[ErrorKey, ErrorVal]]).reduce(
  (acc: { [key in ErrorKey]: number }, [k, v]) => {
    acc[k] = v.errno;
    return acc;
  },
  {} as Record<ErrorKey, number>
);

(() => {
  const errnos: number[] = [];
  for (const x of Object.values(ERRORS)) {
    if (errnos.includes(x.errno)) {
      console.warn(`${x.errno} is a duplicate auth error number.`);
      continue;
    }
    errnos.push(x.errno);
  }
})();
