/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { HandledError } from '../../../lib/error-utils';
import { syncEngineConfigs } from '../../../lib/sync-engines';
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
}
