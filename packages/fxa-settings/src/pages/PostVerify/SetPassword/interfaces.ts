/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { HandledError } from '../../../lib/error-utils';
import { OAuthIntegration } from './../../../models/integrations/oauth-native-integration';

export type SetPasswordIntegration = Pick<OAuthIntegration, 'type' | 'isSync'>;

export interface SetPasswordFormData {
  email: string;
  newPassword: string;
  confirmPassword: string;
}

export interface CreatePasswordHandlerError {
  error: HandledError | null;
}

export type CreatePasswordHandler = (
  email: string,
  sessionToken: string,
  newPassword: string
) => Promise<CreatePasswordHandlerError>;

export interface SetPasswordProps {
  email: string;
  sessionToken: string;
  uid: string;
  createPasswordHandler: CreatePasswordHandler;
  keyFetchToken: string;
  unwrapBKey: string;
  integration: SetPasswordIntegration;
}
