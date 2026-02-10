/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { syncEngineConfigs } from '../../../lib/sync-engines';
import { HandledError } from '../../../lib/error-utils';
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

export interface SetPasswordProps {
  email: string;
  createPasswordHandler: CreatePasswordHandler;
  offeredSyncEngineConfigs?: typeof syncEngineConfigs;
  integration?: Integration;
  isPasswordlessFlow?: boolean;
}

export interface SetPasswordLocationState {
  isPasswordlessFlow?: boolean;
}
