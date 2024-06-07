/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { RouteComponentProps, useLocation } from '@reach/router';
import { useNavigateWithQuery as useNavigate } from '../../../lib/hooks/useNavigateWithQuery';
import SigninTokenCode from '.';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';
import { hardNavigate } from 'fxa-react/lib/utils';
import { Integration, useAuthClient } from '../../../models';
import { useFinishOAuthFlowHandler } from '../../../lib/oauth/hooks';
import { SigninLocationState } from '../interfaces';
import { getSigninState } from '../utils';
import OAuthDataError from '../../../components/OAuthDataError';
import { useEffect, useState } from 'react';

// The email with token code (verifyLoginCodeEmail) is sent on `/signin`
// submission if conditions are met.

const SigninTokenCodeContainer = ({
  integration,
}: {
  integration: Integration;
} & RouteComponentProps) => {
  const navigate = useNavigate();
  const location = useLocation() as ReturnType<typeof useLocation> & {
    state?: SigninLocationState;
  };

  const signinState = getSigninState(location.state);

  const authClient = useAuthClient();
  const { finishOAuthFlowHandler, oAuthDataError } = useFinishOAuthFlowHandler(
    authClient,
    integration
  );

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

  if (!signinState || !signinState.sessionToken) {
    hardNavigate('/', {}, true);
    return <LoadingSpinner fullScreen />;
  }

  // redirect if there is 2FA is set up for the account,
  // but the session is not TOTP verified
  if (totpVerified) {
    navigate('/signin_totp_code');
    return <LoadingSpinner fullScreen />;
  }

  if (oAuthDataError) {
    return <OAuthDataError error={oAuthDataError} />;
  }

  return (
    <SigninTokenCode
      {...{
        finishOAuthFlowHandler,
        integration,
        signinState,
      }}
    />
  );
};

export default SigninTokenCodeContainer;
