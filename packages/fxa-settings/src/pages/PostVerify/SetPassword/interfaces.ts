/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { syncEngineConfigs } from '../../../lib/sync-engines';
import { HandledError } from '../../../lib/error-utils';
import { PasskeyFallbackSurface } from '../../../lib/passkeys/signin-flow';
import { Integration } from '../../../models';

export interface SetPasswordFormData {
  email: string;
  newPassword: string;
  confirmPassword: string;
}

export interface CreatePasswordHandlerError {
  error: HandledError | null;
}

export type CreatePasswordHandler = (
  newPassword: string
) => Promise<CreatePasswordHandlerError>;

export type PostVerifySetPasswordIntegration = Pick<Integration, 'getCmsInfo'>;

/**
 * How the user got to the create-password page. Determines which Glean
 * `reason` extra fires under the `post_verify_set_password.*` category and
 * which info copy renders above the form.
 */
export type PasswordCreationReason = 'third_party_auth' | 'otp' | 'passkey';

export interface SetPasswordProps {
  email: string;
  createPasswordHandler: CreatePasswordHandler;
  offeredSyncEngineConfigs?: typeof syncEngineConfigs;
  integration?: PostVerifySetPasswordIntegration;
  passwordCreationReason?: PasswordCreationReason;
}

export interface SetPasswordLocationState {
  passwordCreationReason?: PasswordCreationReason;
  /**
   * Only set when `passwordCreationReason === 'passkey'`. The originating
   * passkey sign-in surface (`emailfirst` covers both the email-first page
   * and the passwordless OTP code page; `login` covers the signin/login
   * page). Used to fire `passkey.auth_success` with the correct
   * `<surface>_createdpassword` reason after the new Sync password is set.
   */
  passkeySurface?: PasskeyFallbackSurface;
}
