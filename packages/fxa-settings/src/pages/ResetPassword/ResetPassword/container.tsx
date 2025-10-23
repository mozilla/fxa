/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { RouteComponentProps } from '@reach/router';
import { useState } from 'react';
import { useAuthClient, useFtlMsgResolver } from '../../../models';

import ResetPassword from '.';
import { getLocalizedErrorMessage } from '../../../lib/error-utils';
import { useNavigateWithQuery } from '../../../lib/hooks/useNavigateWithQuery';
import { queryParamsToMetricsContext } from '../../../lib/metrics';
import { ResetPasswordContainerProps } from './interfaces';

const ResetPasswordContainer = ({
  flowQueryParams = {},
  serviceName,
}: ResetPasswordContainerProps & RouteComponentProps) => {
  const authClient = useAuthClient();
  const ftlMsgResolver = useFtlMsgResolver();
  const navigateWithQuery = useNavigateWithQuery();

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
      }}
    />
  );
};

export default ResetPasswordContainer;
