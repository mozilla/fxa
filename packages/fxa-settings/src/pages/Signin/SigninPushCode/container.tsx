/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { RouteComponentProps, useLocation } from '@reach/router';
import SigninPushCode from '.';
import { MozServices } from '../../../lib/types';
import { getSigninState, handleNavigation } from '../utils';
import { SigninLocationState } from '../interfaces';
import {
  Integration,
  isWebIntegration,
  useAuthClient,
  useSensitiveDataClient,
} from '../../../models';
import { useFinishOAuthFlowHandler } from '../../../lib/oauth/hooks';
import { hardNavigate } from 'fxa-react/lib/utils';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';
import OAuthDataError from '../../../components/OAuthDataError';
import { useWebRedirect } from '../../../lib/hooks/useWebRedirect';
import { useEffect, useState } from 'react';
import { useNavigateWithQuery as useNavigate } from '../../../lib/hooks/useNavigateWithQuery';
import { SensitiveData } from '../../../lib/sensitive-data-client';
import { useCheckReactEmailFirst } from '../../../lib/hooks';

export type SigninPushCodeContainerProps = {
  integration: Integration;
  serviceName: MozServices;
};

export const SigninPushCodeContainer = ({
  integration,
  serviceName,
}: SigninPushCodeContainerProps & RouteComponentProps) => {
  const authClient = useAuthClient();
  const navigate = useNavigate();
  const shouldUseReactEmailFirst = useCheckReactEmailFirst();
  const { finishOAuthFlowHandler, oAuthDataError } = useFinishOAuthFlowHandler(
    authClient,
    integration
  );
  // TODO: FXA-9177, likely use Apollo cache here instead of location state
  const location = useLocation() as ReturnType<typeof useLocation> & {
    state: SigninLocationState;
  };
  const signinState = getSigninState(location.state);
  const sensitiveDataClient = useSensitiveDataClient();
  const { unwrapBKey } =
    sensitiveDataClient.getDataType(SensitiveData.Key.Auth) || {};

  const webRedirectCheck = useWebRedirect(integration.data.redirectTo);

  const redirectTo =
    isWebIntegration(integration) && webRedirectCheck?.isValid
      ? integration.data.redirectTo
      : '';

  const [totpVerified, setTotpVerified] = useState<boolean>(false);
  useEffect(() => {
    if (!signinState || !signinState.sessionToken) {
      // case handled after the useEffect
      return;
    }
    const getTotpStatus = async () => {
      const { verified } = await authClient.checkTotpTokenExists(
        signinState.sessionToken
      );
      setTotpVerified(verified);
    };
    getTotpStatus();
  }, [authClient, signinState]);

  if (oAuthDataError) {
    return <OAuthDataError error={oAuthDataError} />;
  }

  if (!signinState) {
    if (shouldUseReactEmailFirst) {
      navigate('/');
    } else {
      hardNavigate('/', {}, true);
    }
    return <LoadingSpinner fullScreen />;
  }

  // redirect if there is 2FA is set up for the account,
  // but the session is not TOTP verified
  if (totpVerified) {
    navigate('/signin_totp_code', {
      state: signinState,
    });
    return <LoadingSpinner fullScreen />;
  }

  const onCodeVerified = async () => {
    const navigationOptions = {
      email: signinState.email,
      signinData: { ...signinState, verified: true },
      unwrapBKey,
      integration,
      finishOAuthFlowHandler,
      queryParams: location.search,
      redirectTo,
    };
    await handleNavigation(navigationOptions);
  };

  const sendLoginPushNotification = async () => {
    try {
      const response = await authClient.sessionStatus(signinState.sessionToken);
      if (response.state !== 'verified') {
        await authClient.sendLoginPushRequest(signinState.sessionToken);
      }
      if (response.state === 'verified') {
        await onCodeVerified();
      }
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  };

  const pollSessionStatus = async () => {
    try {
      const response = await authClient.sessionStatus(signinState.sessionToken);
      if (response.state === 'verified') {
        await onCodeVerified();
      }
    } catch (error) {
      console.error('Error fetching session status:', error);
    }
  };

  return (
    <SigninPushCode
      {...{
        signinState,
        serviceName,
        sendLoginPushNotification,
        pollSessionStatus,
      }}
    />
  );
};

export default SigninPushCodeContainer;
