/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { isAllowed } from 'fxa-shared/configuration/convict-format-allow-list';
import {
  BaseIntegrationData,
  useConfig,
  useFtlMsgResolver,
} from '../../../models';
import { useLocation } from '@reach/router';
import { AuthUiErrors } from '../../auth-errors/auth-errors';
import { getErrorFtlId } from '../../error-utils';

/*
 * Check if the integration contains a valid `redirectTo` based on
 * a whitelist maintained in the config.
 *
 * At the time of writing, this is only valid for web integrations.
 * OAuth integrations should check against clientInfo.redirectUri.
 */
export function useWebRedirect(redirectTo: BaseIntegrationData['redirectTo']) {
  const config = useConfig();
  const location = useLocation();
  const ftlMsgResolver = useFtlMsgResolver();

  const isValid = () =>
    redirectTo
      ? isAllowed(redirectTo, location.href, config.redirectAllowlist)
      : false;

  const getLocalizedErrorMessage = () =>
    ftlMsgResolver.getMsg(
      getErrorFtlId(AuthUiErrors.INVALID_REDIRECT_TO),
      AuthUiErrors.INVALID_REDIRECT_TO.message
    );

  return {
    isValid,
    getLocalizedErrorMessage,
  };
}
