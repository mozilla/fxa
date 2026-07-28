/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import { useAuthClient, useConfig, useFtlMsgResolver } from '../../../models';

import { ResetPasswordContainerProps } from './interfaces';
import { queryParamsToMetricsContext } from '../../../lib/metrics';
import ResetPassword from '.';
import { useNavigateWithQuery } from '../../../lib/hooks/useNavigateWithQuery';
import { getLocalizedErrorMessage } from '../../../lib/error-utils';
import { shouldShowPasskeyResetOption } from '../../../lib/passkeys';

const ResetPasswordContainer = ({
  flowQueryParams = {},
  integration,
  serviceName,
  setCurrentSplitLayout,
}: ResetPasswordContainerProps) => {
  const authClient = useAuthClient();
  const config = useConfig();
  const ftlMsgResolver = useFtlMsgResolver();
  const navigateWithQuery = useNavigateWithQuery();

  // The account isn't known yet at reset entry, so the passkey footer is shown
  // unconditionally when the feature is on — except for an active Sync sign-in,
  // where a passkey can't recover Sync data in Phase 1.
  const showPasskeyOption = shouldShowPasskeyResetOption(config, {
    serviceRequiresKeys: integration.isSync(),
  });

  const [errorMessage, setErrorMessage] = useState<string>('');

  let localizedErrorMessage = '';

  const requestResetPasswordCode = async (email: string) => {
    const metricsContext = queryParamsToMetricsContext(
      flowQueryParams as unknown as Record<string, string>
    );
    const options = {
      metricsContext,
    };
    try {
      await authClient.passwordForgotSendOtp(email, options);
      navigateWithQuery('/confirm_reset_password', {
        state: { email, metricsContext },
      });
    } catch (err) {
      localizedErrorMessage = getLocalizedErrorMessage(ftlMsgResolver, err);
      setErrorMessage(localizedErrorMessage);
    }
  };

  return (
    <ResetPassword
      {...{
        errorMessage,
        requestResetPasswordCode,
        serviceName,
        setErrorMessage,
        setCurrentSplitLayout,
        showPasskeyOption,
      }}
    />
  );
};

export default ResetPasswordContainer;
