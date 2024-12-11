/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { RouteComponentProps, useLocation } from '@reach/router';

import { useNavigateWithQuery } from '../../../lib/hooks/useNavigateWithQuery';
import ResetPasswordConfirmed from '.';
import { MozServices } from '../../../lib/types';
import {
  Integration,
  isOAuthIntegration,
  useAuthClient,
  useSensitiveDataClient,
} from '../../../models';
import { useFinishOAuthFlowHandler } from '../../../lib/oauth/hooks';
import OAuthDataError from '../../../components/OAuthDataError';
import { hardNavigate } from 'fxa-react/lib/utils';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';
import { AuthError } from '../../../lib/oauth';
import { useState } from 'react';
import GleanMetrics from '../../../lib/glean';
import { SensitiveData } from '../../../lib/sensitive-data-client';
import { currentAccount } from '../../../lib/cache';

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
  const location = useLocation();
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
    hardNavigate(`/${location.search}`);
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
