/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { RouteComponentProps } from '@reach/router';
import React, { useState } from 'react';
import { useAuthClient, useFtlMsgResolver } from '../../../models';

import { ResetPasswordContainerProps } from './interfaces';
import { queryParamsToMetricsContext } from '../../../lib/metrics';
import ResetPassword from '.';
import { useNavigateWithQuery } from '../../../lib/hooks/useNavigateWithQuery';
import { getLocalizedErrorMessage } from '../../../lib/error-utils';

const ResetPasswordContainer = ({
  flowQueryParams = {},
  serviceName,
}: ResetPasswordContainerProps & RouteComponentProps) => {
  const authClient = useAuthClient();
  const ftlMsgResolver = useFtlMsgResolver();
  const navigate = useNavigateWithQuery();

  const [errorMessage, setErrorMessage] = useState<string>('');

  let localizedErrorMessage = '';

  console.log(
    queryParamsToMetricsContext(
      flowQueryParams as unknown as Record<string, string>
    )
  );

  const requestResetPasswordCode = async (email: string) => {
    const metricsContext = queryParamsToMetricsContext(
      flowQueryParams as unknown as Record<string, string>
    );
    const options = {
      metricsContext,
    };
    try {
      await authClient.passwordForgotSendOtp(email, options);
      navigate('/confirm_reset_password', {
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
