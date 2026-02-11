/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { FtlMsgResolver } from 'fxa-react/lib/utils';
import { AuthUiErrors } from '../../lib/auth-errors/auth-errors';
import { interpolate, getLocalizedErrorMessage } from '../../lib/error-utils';
import { AuthError } from '../../lib/oauth';

export function getLocalizedEmailValidationErrorMessage(
  error: AuthError,
  ftlMsgResolver: FtlMsgResolver,
  email?: string
): string {
  if (error.errno === AuthUiErrors.INVALID_EMAIL_DOMAIN.errno) {
    const [, domain] = email ? email.split('@') : [''];
    return ftlMsgResolver.getMsg(
      'auth-error-1064',
      interpolate(AuthUiErrors.INVALID_EMAIL_DOMAIN.message, { domain }),
      { domain }
    );
  }
  return getLocalizedErrorMessage(ftlMsgResolver, error);
}
