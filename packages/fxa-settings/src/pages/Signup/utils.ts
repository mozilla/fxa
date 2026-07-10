/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { AuthServerError } from 'fxa-auth-client/browser';
import {
  AuthUiErrorNos,
  AuthUiErrors,
} from '../../lib/auth-errors/auth-errors';
import { HandledError } from '../../lib/error-utils';

export const handleAuthClientError = (error: unknown) => {
  const authError = error as AuthServerError;
  const errno = authError?.errno;

  if (errno && AuthUiErrorNos[errno]) {
    if (errno === AuthUiErrors.THROTTLED.errno) {
      return {
        error: {
          message: AuthUiErrorNos[errno].message,
          errno,
          retryAfter: authError.retryAfter,
          retryAfterLocalized: authError.retryAfterLocalized,
        } as HandledError,
      };
    }
    return {
      error: {
        message: AuthUiErrorNos[errno].message,
        errno,
      } as HandledError,
    };
  }

  return { error: AuthUiErrors.UNEXPECTED_ERROR as HandledError };
};
