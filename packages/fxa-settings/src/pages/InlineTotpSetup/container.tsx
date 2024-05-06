/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { RouteComponentProps, useLocation } from '@reach/router';
import { useNavigateWithQuery as useNavigate } from '../../lib/hooks/useNavigateWithQuery';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';
import { useCallback, useEffect, useState } from 'react';
import InlineTotpSetup from '.';
import { MozServices } from '../../lib/types';
import { OAuthIntegration, useSession } from '../../models';
import { AuthUiErrors } from '../../lib/auth-errors/auth-errors';
import { checkCode } from '../../lib/totp';
import { useMutation, useQuery } from '@apollo/client';
import { CREATE_TOTP_MUTATION } from './gql';
import { getSigninState } from '../Signin/utils';
import { SigninLocationState, TotpToken } from '../Signin/interfaces';
import { GET_TOTP_STATUS } from '../../components/App/gql';
import { TotpStatusResponse } from '../Signin/SigninTokenCode/interfaces';
import { SigninRecoveryLocationState } from '../InlineRecoverySetup/interfaces';
import { hardNavigate } from 'fxa-react/lib/utils';

export const InlineTotpSetupContainer = ({
  isSignedIn,
  integration,
  serviceName,
}: {
  isSignedIn: boolean;
  integration: OAuthIntegration;
  serviceName: MozServices;
} & RouteComponentProps) => {
  const [totp, setTotp] = useState<TotpToken>();
  const location = useLocation() as ReturnType<typeof useLocation> & {
    state: SigninLocationState;
  };
  const navigate = useNavigate();
  const session = useSession();

  const [createTotp] = useMutation<{ createTotp: TotpToken }>(
    CREATE_TOTP_MUTATION
  );

  const { data: totpStatus, loading: totpStatusLoading } =
    useQuery<TotpStatusResponse>(GET_TOTP_STATUS);

  const signinState = getSigninState(location.state);

  const navTo = useCallback(
    (
      uri:
        | 'signup'
        | 'signin_token_code'
        | 'signin_totp_code'
        | 'inline_recovery_setup',
      state?: SigninLocationState | SigninRecoveryLocationState
    ) => {
      navigate(`/${uri}${location.search}`, { state });
    },
    [location, navigate]
  );

  const cancelSetupHandler = useCallback(() => {
    const error = AuthUiErrors.TOTP_REQUIRED;

    if (integration.returnOnError()) {
      const url = integration.getRedirectWithErrorUrl(error);
      hardNavigate(url);
      return;
    }

    throw error;
  }, [integration]);

  const verifyCodeHandler = useCallback(
    async (code: string) => {
      try {
        const isValid = await checkCode(totp!.secret, code);

        if (!isValid) {
          throw AuthUiErrors.INVALID_TOTP_CODE;
        }

        const state = {
          ...Object.assign({}, signinState),
          ...(totp ? { totp } : {}),
        };
        navTo(
          'inline_recovery_setup',
          Object.keys(state).length > 0 ? state : undefined
        );
      } catch (error) {
        throw AuthUiErrors.INVALID_TOTP_CODE;
      }
    },
    [navTo, totp, signinState]
  );

  useEffect(() => {
    (async () => {
      try {
        // The user is navigated to this page by the web application in response to
        // a sign-in attempt.  But let's do some sanity checks.
        const sessionVerified = await session.isSessionVerified();
        if (!sessionVerified) {
          navTo('signin_token_code', signinState ? signinState : undefined);
        }

        if (totpStatus?.account.totp.verified) {
          navTo('signin_totp_code', signinState ? signinState : undefined);
        }

        const totpResp = await createTotp({ variables: { input: {} } });

        setTotp(totpResp.data?.createTotp);
      } catch (_) {
        navTo('signup');
      }
    })();
  }, [
    isSignedIn,
    signinState,
    session,
    navTo,
    createTotp,
    totpStatus?.account.totp.verified,
  ]);

  if (totpStatusLoading || !totp) {
    return <LoadingSpinner fullScreen />;
  }

  if (!isSignedIn || !signinState) {
    navTo('signup');
    return <LoadingSpinner fullScreen />;
  }

  return (
    <InlineTotpSetup
      {...{ totp, serviceName, cancelSetupHandler, verifyCodeHandler }}
      email={signinState.email}
    />
  );
};

export default InlineTotpSetupContainer;
