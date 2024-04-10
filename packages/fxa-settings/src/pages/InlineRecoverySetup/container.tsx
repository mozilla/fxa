/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useMutation, useQuery } from '@apollo/client';
import { RouteComponentProps, useLocation, useNavigate } from '@reach/router';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';
import { useCallback, useEffect, useState } from 'react';
import AppLayout from '../../components/AppLayout';
import CardHeader from '../../components/CardHeader';
import { AuthUiErrors } from '../../lib/auth-errors/auth-errors';
import { useFinishOAuthFlowHandler } from '../../lib/oauth/hooks';
import { getCode } from '../../lib/totp';
import { MozServices } from '../../lib/types';
import { OAuthIntegration, useAuthClient } from '../../models';
import { VERIFY_TOTP_MUTATION } from './gql';
import InlineRecoverySetup from './index';
import { hardNavigate } from 'fxa-react/lib/utils';
import { SigninRecoveryLocationState } from './interfaces';
import { TotpStatusResponse } from '../Signin/SigninTokenCode/interfaces';
import { GET_TOTP_STATUS } from '../../components/App/gql';

export const InlineRecoverySetupContainer = ({
  isSignedIn,
  integration,
  serviceName,
}: {
  isSignedIn: boolean;
  integration: OAuthIntegration;
  serviceName: MozServices;
} & RouteComponentProps) => {
  const navigate = useNavigate();

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

  const [recoveryCodes, setRecoveryCodes] = useState<string[]>();
  const [verifyTotp] = useMutation<{ verifyTotp: { success: boolean } }>(
    VERIFY_TOTP_MUTATION
  );

  const { data: totpStatus, loading: totpStatusLoading } =
    useQuery<TotpStatusResponse>(GET_TOTP_STATUS);

  const verifyTotpHandler = useCallback(async () => {
    const code = await getCode(totp!.secret);
    const result = await verifyTotp({
      variables: { input: { code, service: serviceName } },
    });
    return result.data!.verifyTotp.success;
  }, [serviceName, totp, verifyTotp]);

  const successfulSetupHandler = useCallback(async () => {
    // When this is called, we know signinRecoveryLocationState exists.
    const { redirect } = await finishOAuthFlowHandler(
      signinRecoveryLocationState!.uid,
      signinRecoveryLocationState!.sessionToken,
      signinRecoveryLocationState!.keyFetchToken,
      signinRecoveryLocationState!.unwrapBKey
    );
    hardNavigate(redirect);
  }, [signinRecoveryLocationState, finishOAuthFlowHandler]);

  const cancelSetupHandler = useCallback(() => {
    const error = AuthUiErrors.TOTP_REQUIRED;

    if (integration.returnOnError()) {
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
    navigate(`/signup${location.search}`);
    return <LoadingSpinner fullScreen />;
  }

  if (totpStatus?.account.totp.verified) {
    navigate(`/signin_totp_code${location.search}`, {
      state: signinLocationState,
    });
    return <LoadingSpinner fullScreen />;
  }

  // !recoveryCodes check should happen after checking !totp
  if (!recoveryCodes || totpStatusLoading) {
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
    <InlineRecoverySetup
      {...{
        recoveryCodes,
        serviceName,
        cancelSetupHandler,
        verifyTotpHandler,
        successfulSetupHandler,
        email: signinRecoveryLocationState.email,
      }}
    />
  );
};

export default InlineRecoverySetupContainer;
