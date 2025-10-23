/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useMutation } from '@apollo/client';
import { RouteComponentProps, useLocation } from '@reach/router';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';
import { useEffect, useState } from 'react';
import SigninTokenCode from '.';
import OAuthDataError from '../../../components/OAuthDataError';
import { tryFinalizeUpgrade } from '../../../lib/gql-key-stretch-upgrade';
import { useNavigateWithQuery } from '../../../lib/hooks/useNavigateWithQuery';
import {
  useFinishOAuthFlowHandler,
  useOAuthKeysCheck,
} from '../../../lib/oauth/hooks';
import { SensitiveData } from '../../../lib/sensitive-data-client';
import {
  Integration,
  useAuthClient,
  useSensitiveDataClient,
} from '../../../models';
import {
  CREDENTIAL_STATUS_MUTATION,
  GET_ACCOUNT_KEYS_MUTATION,
  PASSWORD_CHANGE_FINISH_MUTATION,
  PASSWORD_CHANGE_START_MUTATION,
} from '../gql';
import {
  CredentialStatusResponse,
  GetAccountKeysResponse,
  PasswordChangeFinishResponse,
  PasswordChangeStartResponse,
  SigninLocationState,
} from '../interfaces';
import { getSigninState } from '../utils';

// The email with token code (verifyLoginCodeEmail) is sent on `/signin`
// submission if conditions are met.

const SigninTokenCodeContainer = ({
  integration,
}: {
  integration: Integration;
} & RouteComponentProps) => {
  const navigateWithQuery = useNavigateWithQuery();
  const location = useLocation() as ReturnType<typeof useLocation> & {
    state?: SigninLocationState;
  };

  const signinState = getSigninState(location.state);
  const sensitiveDataClient = useSensitiveDataClient();
  const { keyFetchToken, unwrapBKey } =
    sensitiveDataClient.getDataType(SensitiveData.Key.Auth) || {};

  const authClient = useAuthClient();
  const { finishOAuthFlowHandler, oAuthDataError } = useFinishOAuthFlowHandler(
    authClient,
    integration
  );
  const { oAuthKeysCheckError } = useOAuthKeysCheck(
    integration,
    keyFetchToken,
    unwrapBKey
  );

  const [passwordChangeStart] = useMutation<PasswordChangeStartResponse>(
    PASSWORD_CHANGE_START_MUTATION
  );
  const [credentialStatus] = useMutation<CredentialStatusResponse>(
    CREDENTIAL_STATUS_MUTATION
  );
  const [getWrappedKeys] = useMutation<GetAccountKeysResponse>(
    GET_ACCOUNT_KEYS_MUTATION
  );
  const [passwordChangeFinish] = useMutation<PasswordChangeFinishResponse>(
    PASSWORD_CHANGE_FINISH_MUTATION
  );

  const [totpVerified, setTotpVerified] = useState<boolean>(false);
  useEffect(() => {
    if (!signinState || !signinState.sessionToken) {
      // case handled after the useEffect
      return;
    }
    const getTotpStatus = async () => {
      // We only care about "verified" here, not "exists"
      // because "exists" only tells us that totp setup was started.
      // Prior to using Redis during setup, tokens were directly stored in the database,
      // but may never be marked as enabled/verified if setup is aborted or unsuccessful.
      const { verified } = await authClient.checkTotpTokenExists(
        signinState.sessionToken
      );
      setTotpVerified(verified);
    };
    getTotpStatus();
  }, [authClient, signinState]);

  if (!signinState || !signinState.sessionToken) {
    navigateWithQuery('/');
    return <LoadingSpinner fullScreen />;
  }

  // redirect if there is 2FA is set up for the account,
  // but the session is not TOTP verified
  if (totpVerified) {
    navigateWithQuery('/signin_totp_code', {
      state: signinState,
    });
    return <LoadingSpinner fullScreen />;
  }

  if (oAuthDataError) {
    return <OAuthDataError error={oAuthDataError} />;
  }
  if (oAuthKeysCheckError) {
    return <OAuthDataError error={oAuthKeysCheckError} />;
  }

  const onSessionVerified = async (sessionId: string) => {
    // This will attempt to complete any blocked key stretching upgrades
    await tryFinalizeUpgrade(
      sessionId,
      sensitiveDataClient,
      'signin-token-code',
      credentialStatus,
      getWrappedKeys,
      passwordChangeStart,
      passwordChangeFinish
    );
  };

  return (
    <SigninTokenCode
      {...{
        finishOAuthFlowHandler,
        integration,
        signinState,
        keyFetchToken,
        unwrapBKey,
        onSessionVerified,
      }}
    />
  );
};

export default SigninTokenCodeContainer;
