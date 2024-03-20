/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { RouteComponentProps, useLocation, useNavigate } from '@reach/router';
import { TotpStatusResponse } from './interfaces';
import SigninTokenCode from '.';
import { useQuery } from '@apollo/client';
import { GET_TOTP_STATUS } from '../../../components/App/gql';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';
import { hardNavigateToContentServer } from 'fxa-react/lib/utils';
import { Integration, useAuthClient } from '../../../models';
import { useFinishOAuthFlowHandler } from '../../../lib/oauth/hooks';
import AppLayout from '../../../components/AppLayout';
import CardHeader from '../../../components/CardHeader';
import { SigninLocationState } from '../interfaces';
import { getStoredAccountInfo } from '../utils';

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

  const signinState =
    location.state && Object.keys(location.state).length > 0
      ? location.state
      : getStoredAccountInfo();

  const authClient = useAuthClient();
  const { finishOAuthFlowHandler, oAuthDataError } = useFinishOAuthFlowHandler(
    authClient,
    integration
  );

  // reads from cache if coming from /signin
  const { data: totpData, loading: totpLoading } =
    useQuery<TotpStatusResponse>(GET_TOTP_STATUS);

  if (Object.keys(signinState).length < 1) {
    hardNavigateToContentServer(`/${location.search || ''}`);
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

  // TODO: UX for this, FXA-8106
  if (oAuthDataError) {
    return (
      <AppLayout>
        <CardHeader
          headingText="Unexpected error"
          headingTextFtlId="auth-error-999"
        />
      </AppLayout>
    );
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
