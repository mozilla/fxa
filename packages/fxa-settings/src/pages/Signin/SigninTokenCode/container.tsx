/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { RouteComponentProps, useLocation } from '@reach/router';
import { useNavigateWithQuery as useNavigate } from '../../../lib/hooks/useNavigateWithQuery';
import { TotpStatusResponse } from './interfaces';
import SigninTokenCode from '.';
import { useQuery } from '@apollo/client';
import { GET_TOTP_STATUS } from '../../../components/App/gql';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';
import { hardNavigate } from 'fxa-react/lib/utils';
import { Integration, useAuthClient } from '../../../models';
import { useFinishOAuthFlowHandler } from '../../../lib/oauth/hooks';
import { SigninLocationState } from '../interfaces';
import { getSigninState } from '../utils';
import OAuthDataError from '../../../components/OAuthDataError';

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

  // reads from cache if coming from /signin
  const { data: totpData, loading: totpLoading } =
    useQuery<TotpStatusResponse>(GET_TOTP_STATUS);

  if (!signinState) {
    hardNavigate('/', {}, true);
    return <LoadingSpinner fullScreen />;
  }

  if (totpLoading) {
    return <LoadingSpinner fullScreen />;
  }

  // redirect if there is 2FA is set up for the account,
  // but the session is not TOTP verified
  if (totpData?.account.totp.exists && !totpData?.account.totp.verified) {
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
