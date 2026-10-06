/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { HandledError } from '../../../lib/error-utils';

export interface ForcePasswordChangeFormData {
  email: string;
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export type ChangePasswordHandler = (
  oldPassword: string,
  newPassword: string
) => Promise<{ error: HandledError | null }>;

export interface ForcePasswordChangeProps {
  email: string;
  changePasswordHandler: ChangePasswordHandler;
}
