/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { syncEngineConfigs } from '../../../lib/sync-engines';
import { HandledError } from '../../../lib/error-utils';
import { PasskeyMetricsSurface } from '../../../lib/passkeys/signin-flow';
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
  /**
   * Glean `reason` for the funnel events, composed by the container. Defaults
   * to `passwordCreationReason`; the passkey flow passes a surface-tagged
   * value (e.g. `signin_passkey`).
   */
  gleanReason?: string;
}

export interface SetPasswordLocationState {
  passwordCreationReason?: PasswordCreationReason;
  /**
   * Originating passkey sign-in surface; set only for `passwordCreationReason
   * === 'passkey'`. Tags the `post_verify_set_password.*` and
   * `passkey.auth_success` reasons with the surface.
   */
  passkeySurface?: PasskeyMetricsSurface;
}
