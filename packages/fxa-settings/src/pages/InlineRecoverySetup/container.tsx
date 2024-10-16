/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useMutation, useQuery } from '@apollo/client';
import { RouteComponentProps, useLocation } from '@reach/router';
import { useNavigateWithQuery as useNavigate } from '../../lib/hooks/useNavigateWithQuery';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';
import { useCallback, useEffect, useState } from 'react';
import { AuthUiErrors } from '../../lib/auth-errors/auth-errors';
import {
  FinishOAuthFlowHandlerResult,
  useFinishOAuthFlowHandler,
} from '../../lib/oauth/hooks';
import { getCode } from '../../lib/totp';
import { MozServices } from '../../lib/types';
import { OAuthIntegration, useAuthClient } from '../../models';
import { VERIFY_TOTP_MUTATION } from './gql';
import InlineRecoverySetup from './index';
import { hardNavigate } from 'fxa-react/lib/utils';
import { SigninRecoveryLocationState } from './interfaces';
import { TotpStatusResponse } from '../Signin/SigninTokenCode/interfaces';
import { GET_TOTP_STATUS } from '../../components/App/gql';
import OAuthDataError from '../../components/OAuthDataError';

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
  const [oAuthError, setOAuthError] =
    useState<FinishOAuthFlowHandlerResult['error']>();

  const { data: totpStatus, loading: totpStatusLoading } =
    useQuery<TotpStatusResponse>(GET_TOTP_STATUS);

  const verifyTotpHandler = useCallback(async () => {
    const code = await getCode(totp!.secret);
    const service = integration.getService();
    const clientId = integration.getClientId();

    const isBrowserClient = service === 'sync' || service === 'relay';

    const result = await verifyTotp({
      variables: {
        input: {
          code,
          ...(isBrowserClient ? { service } : { service: clientId }),
        },
      },
    });
    return result.data!.verifyTotp.success;
  }, [integration, totp, verifyTotp]);

  const successfulSetupHandler = useCallback(async () => {
    // When this is called, we know signinRecoveryLocationState exists.
    const { redirect, error } = await finishOAuthFlowHandler(
      signinRecoveryLocationState!.uid,
      signinRecoveryLocationState!.sessionToken,
      signinRecoveryLocationState!.keyFetchToken,
      signinRecoveryLocationState!.unwrapBKey
    );
    if (error) {
      setOAuthError(error);
      return;
    }
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

  if (oAuthDataError) {
    return <OAuthDataError error={oAuthDataError} />;
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
      }}
    />
  );
};

export default InlineRecoverySetupContainer;
