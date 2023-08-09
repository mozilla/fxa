/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { IntegrationType } from '../../../models';
import { MOCK_REDIRECT_URI, MOCK_SERVICE } from '../../mocks';
import { ConfirmResetPasswordOAuthIntegration } from './interfaces';

export const MOCK_PASSWORD_FORGOT_TOKEN = 'abc';

export function createMockConfirmResetPasswordOAuthIntegration(
  serviceName = MOCK_SERVICE
): ConfirmResetPasswordOAuthIntegration {
  return {
    type: IntegrationType.OAuth,
    getRedirectUri: () => MOCK_REDIRECT_URI,
    getService: () => serviceName,
  };
}
