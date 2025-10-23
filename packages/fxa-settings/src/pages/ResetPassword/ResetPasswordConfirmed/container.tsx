/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { RouteComponentProps } from '@reach/router';

import { hardNavigate } from 'fxa-react/lib/utils';
import { useState } from 'react';
import ResetPasswordConfirmed from '.';
import OAuthDataError from '../../../components/OAuthDataError';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';
import { currentAccount } from '../../../lib/cache';
import GleanMetrics from '../../../lib/glean';
import { useNavigateWithQuery } from '../../../lib/hooks/useNavigateWithQuery';
import { AuthError } from '../../../lib/oauth';
import { useFinishOAuthFlowHandler } from '../../../lib/oauth/hooks';
import { SensitiveData } from '../../../lib/sensitive-data-client';
import { MozServices } from '../../../lib/types';
import {
  Integration,
  isOAuthIntegration,
  useAuthClient,
  useSensitiveDataClient,
} from '../../../models';

const ResetPasswordConfirmedContainer = ({
  integration,
  serviceName,
}: {
  integration: Integration;
  serviceName: MozServices;
} & RouteComponentProps) => {
  const authClient = useAuthClient();
  const { finishOAuthFlowHandler, oAuthDataError } = useFinishOAuthFlowHandler(
    authClient,
    integration
  );
  const navigateWithQuery = useNavigateWithQuery();
  const sensitiveDataClient = useSensitiveDataClient();
  const [errorMessage, setErrorMessage] = useState('');
  const { uid, sessionToken, email, verified } = currentAccount() || {};
  const { keyFetchToken, unwrapBKey } =
    sensitiveDataClient.getDataType(SensitiveData.Key.AccountReset) || {};

  // If we have lost the required bits for OAuth handling, we have to start again.
  if (!uid || !sessionToken) {
    navigateWithQuery('/signin', { replace: true });
    return;
  }

  const handleOAuthRedirectError = (error: AuthError) => {
    if (
      error.errno === AuthUiErrors.TOTP_REQUIRED.errno ||
      error.errno === AuthUiErrors.INSUFFICIENT_ACR_VALUES.errno
    ) {
      navigateWithQuery(`/inline_totp_setup`, {
        state: {
          email,
          uid,
          sessionToken,
          verified,
          keyFetchToken,
          unwrapBKey,
        },
      });
    } else {
      GleanMetrics.login.error({ event: { reason: error.message } });
      setErrorMessage(error.message);
    }
  };

  const getOauthRedirect = async () => {
    const { error, redirect } = await finishOAuthFlowHandler(
      uid,
      sessionToken,
      keyFetchToken,
      unwrapBKey
    );

    return { redirect, error };
  };

  const continueWithVerifiedSession = async () => {
    if (isOAuthIntegration(integration)) {
      const { redirect, error } = await getOauthRedirect();
      if (error) {
        handleOAuthRedirectError(error);
        return;
      }
      if (redirect) {
        hardNavigate(redirect);
        return;
      }
    }
    navigateWithQuery(`/settings`);
  };

  if (oAuthDataError) {
    return <OAuthDataError error={oAuthDataError} />;
  }

  if (!verified) {
    navigateWithQuery('/');
    return;
  }

  return (
    <ResetPasswordConfirmed
      continueHandler={continueWithVerifiedSession}
      {...{ errorMessage, serviceName }}
    />
  );
};

export default ResetPasswordConfirmedContainer;
