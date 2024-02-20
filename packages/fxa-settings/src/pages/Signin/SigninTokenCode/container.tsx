/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { RouteComponentProps, useLocation, useNavigate } from '@reach/router';
import {
  SigninTokenCodeIntegration,
  TotpResponse,
  SigninLocationState,
} from './interfaces';
import SigninTokenCode from '.';
import { useQuery } from '@apollo/client';
import { GET_TOTP_STATUS } from '../../../components/App/gql';
import { currentAccount } from '../../../lib/cache';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';
import { hardNavigateToContentServer } from 'fxa-react/lib/utils';

// The email with token code (verifyLoginCodeEmail) is sent on `/signin`
// submission if conditions are met.

const SigninTokenCodeContainer = ({
  integration,
}: {
  integration: SigninTokenCodeIntegration;
} & RouteComponentProps) => {
  const navigate = useNavigate();
  const location = useLocation() as ReturnType<typeof useLocation> & {
    state?: SigninLocationState;
  };
  // TODO: We may want to store "verificationReason" in local apollo
  // cache instead of passing it via location state, depending on
  // if we reference it in another spot or two and if we need
  // some action to happen dependent on it that should occur
  // without first reaching /signin.
  const { email: emailFromLocationState, verificationReason } =
    location.state || {};
  // read from localStorage if email isn't provided via router state
  const email = emailFromLocationState
    ? emailFromLocationState
    : currentAccount()?.email;

  // reads from cache if coming from /signin
  const { data: totpData, loading: totpLoading } =
    useQuery<TotpResponse>(GET_TOTP_STATUS);

  if (!email) {
    hardNavigateToContentServer('/');
    return <LoadingSpinner fullScreen />;
  }
  if (totpLoading) {
    return <LoadingSpinner fullScreen />;
  }
  if (totpData?.account.totp.verified) {
    navigate('/signin_totp_code');
    return <LoadingSpinner fullScreen />;
  }

  return <SigninTokenCode {...{ email, integration, verificationReason }} />;
};

export default SigninTokenCodeContainer;
