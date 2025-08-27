/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useQuery } from '@apollo/client';
import { RouteComponentProps, useLocation } from '@reach/router';
import { useNavigateWithQuery } from '../../lib/hooks/useNavigateWithQuery';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';
import { useCallback, useEffect, useState } from 'react';
import { AuthUiErrors } from '../../lib/auth-errors/auth-errors';
import {
  FinishOAuthFlowHandlerResult,
  useFinishOAuthFlowHandler,
  useOAuthKeysCheck,
} from '../../lib/oauth/hooks';
import { MozServices } from '../../lib/types';
import {
  Integration,
  isOAuthIntegration,
  useAuthClient,
  useSensitiveDataClient,
} from '../../models';
import InlineRecoverySetup from './index';
import { hardNavigate } from 'fxa-react/lib/utils';
import { SigninRecoveryLocationState } from './interfaces';
import { TotpStatusResponse } from '../Signin/SigninTokenCode/interfaces';
import { GET_TOTP_STATUS } from '../../components/App/gql';
import OAuthDataError from '../../components/OAuthDataError';
import { SensitiveData } from '../../lib/sensitive-data-client';

export const InlineRecoverySetupContainer = ({
  isSignedIn,
  integration,
  serviceName,
}: {
  isSignedIn: boolean;
  integration: Integration;
  serviceName: MozServices;
} & RouteComponentProps) => {
  const navigateWithQuery = useNavigateWithQuery();

  const authClient = useAuthClient();
  const { finishOAuthFlowHandler, oAuthDataError } = useFinishOAuthFlowHandler(
    authClient,
    integration
  );

  const location = useLocation() as ReturnType<typeof useLocation> & {
    state?: SigninRecoveryLocationState;
  };
  const signinRecoveryLocationState = location.state;
  const { totp, ...signinLocationState } = signinRecoveryLocationState || {};
  const sensitiveDataClient = useSensitiveDataClient();
  const { keyFetchToken, unwrapBKey } =
    sensitiveDataClient.getDataType(SensitiveData.Key.Auth) || {};

  const { oAuthKeysCheckError } = useOAuthKeysCheck(
    integration,
    keyFetchToken,
    unwrapBKey
  );

  const [recoveryCodes, setRecoveryCodes] = useState<string[]>();
  const [oAuthError, setOAuthError] =
    useState<FinishOAuthFlowHandlerResult['error']>();

  const { data: totpStatus, loading: totpStatusLoading } =
    useQuery<TotpStatusResponse>(GET_TOTP_STATUS, {
      // Use fetchPolicy: 'network-only' to bypass Apollo cache so this reflects the
      // current account state, not possibly cached data from another signed-in account.
      fetchPolicy: 'network-only',
    });

  const verifyTotpHandler = useCallback(async () => {
    // Server-side verification only; do not generate codes client-side here
    try {
      await authClient.completeTotpSetup(
        signinRecoveryLocationState!.sessionToken,
        { service: serviceName }
      );
      return true;
    } catch (e) {
      throw AuthUiErrors.INVALID_TOTP_CODE;
    }
  }, [authClient, signinRecoveryLocationState, serviceName]);

  const successfulSetupHandler = useCallback(async () => {
    // When this is called, we know signinRecoveryLocationState exists.
    const { redirect, error } = await finishOAuthFlowHandler(
      signinRecoveryLocationState!.uid,
      signinRecoveryLocationState!.sessionToken,
      keyFetchToken,
      unwrapBKey
    );
    if (error) {
      setOAuthError(error);
      return;
    }
    hardNavigate(redirect);
  }, [
    signinRecoveryLocationState,
    finishOAuthFlowHandler,
    keyFetchToken,
    unwrapBKey,
  ]);

  const cancelSetupHandler = useCallback(() => {
    const error = AuthUiErrors.TOTP_REQUIRED;

    if (isOAuthIntegration(integration) && integration.returnOnError()) {
      const url = integration.getRedirectWithErrorUrl(error);
      hardNavigate(url);
      return;
    }

    throw error;
  }, [integration]);

  useEffect(() => {
    setRecoveryCodes(totp?.recoveryCodes);
  }, [totp]);

  // Some basic sanity checks
  if (!isSignedIn || !signinRecoveryLocationState?.email || !totp) {
    navigateWithQuery('/signup');
    return <LoadingSpinner fullScreen />;
  }

  // we only care about "verified" here, not "exists"
  // because "exists" only tells us that totp setup was started.
  // Prior to using Redis during setup, tokens were directly stored in the database,
  // but may never be marked as enabled/verified if setup is aborted or unsuccessful.
  if (totpStatus?.account?.totp.verified) {
    navigateWithQuery('/signin_totp_code', {
      state: signinLocationState,
    });
    return <LoadingSpinner fullScreen />;
  }

  // !recoveryCodes check should happen after checking !totp
  if (!recoveryCodes || totpStatusLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (oAuthDataError) {
    return <OAuthDataError error={oAuthDataError} />;
  }
  // Note that we don't currently need this check on this page right now since AMO is the only
  // RP requiring 2FA and it doesn't require keys. However it's here for consistency.
  if (oAuthKeysCheckError) {
    return <OAuthDataError error={oAuthKeysCheckError} />;
  }

  return (
    <InlineRecoverySetup
      {...{
        oAuthError,
        recoveryCodes,
        serviceName,
        cancelSetupHandler,
        verifyTotpHandler,
        successfulSetupHandler,
        email: signinRecoveryLocationState.email,
        integration,
      }}
    />
  );
};

export default InlineRecoverySetupContainer;
