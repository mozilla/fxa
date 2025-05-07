/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { RouteComponentProps, useLocation } from '@reach/router';
import { useNavigateWithQuery } from '../../lib/hooks/useNavigateWithQuery';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';
import { useCallback, useEffect, useState, useRef } from 'react';
import InlineTotpSetup from '.';
import { MozServices } from '../../lib/types';
import { Integration, isOAuthIntegration, useSession } from '../../models';
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
import { QueryParams } from '../..';
import { queryParamsToMetricsContext } from '../../lib/metrics';
import GleanMetrics from '../../lib/glean';

export const InlineTotpSetupContainer = ({
  isSignedIn,
  integration,
  serviceName,
  flowQueryParams,
}: {
  isSignedIn: boolean;
  integration: Integration;
  serviceName: MozServices;
  flowQueryParams: QueryParams;
} & RouteComponentProps) => {
  const [totp, setTotp] = useState<TotpToken>();
  const [sessionVerified, setSessionVerified] = useState<boolean | undefined>(
    undefined
  );
  const location = useLocation() as ReturnType<typeof useLocation> & {
    state: SigninLocationState;
  };
  const navigateWithQuery = useNavigateWithQuery();
  const session = useSession();
  const metricsContext = queryParamsToMetricsContext(
    flowQueryParams as unknown as Record<string, string>
  );
  const isTotpCreating = useRef(false);

  const [createTotp] = useMutation<{ createTotp: TotpToken }>(
    CREATE_TOTP_MUTATION
  );

  const { data: totpStatus, loading: totpStatusLoading } =
    useQuery<TotpStatusResponse>(GET_TOTP_STATUS);

  const signinState = getSigninState(location.state);

  const navTo = useCallback(
    (
      uri:
        | '/signup'
        | '/signin_token_code'
        | '/signin_totp_code'
        | '/inline_recovery_setup',
      state?: SigninLocationState | SigninRecoveryLocationState
    ) => {
      navigateWithQuery(uri, { state });
    },
    [navigateWithQuery]
  );

  // Determine if the session is verified
  useEffect(() => {
    if (sessionVerified !== undefined) {
      return;
    }
    (async () => {
      // The user is navigated to this page by the web application in response to
      // a sign-in attempt.  But let's do some sanity checks.
      const verified = await session.isSessionVerified();
      setSessionVerified(verified);
    })();
  }, [session, sessionVerified, setSessionVerified]);

  // Determine if a totp needs to be setup, and if so trigger setup.
  useEffect(() => {
    if (
      totp !== undefined ||
      totpStatus?.account?.totp.verified === true ||
      isTotpCreating.current
    ) {
      return;
    }
    (async () => {
      isTotpCreating.current = true;
      const totpResp = await createTotp({
        variables: {
          input: {
            metricsContext,
          },
        },
      });
      setTotp(totpResp.data?.createTotp);
    })();
  }, [createTotp, metricsContext, totpStatus, totpStatusLoading, totp]);

  // Once state has settled, determine if user should be directed to another page
  useEffect(() => {
    if (!isSignedIn || !signinState) {
      navTo('/signup');
    } else if (sessionVerified === false) {
      navTo('/signin_token_code', signinState ? signinState : undefined);
    } else if (
      totpStatusLoading === false &&
      totpStatus?.account?.totp.verified
    ) {
      navTo('/signin_totp_code', signinState ? signinState : undefined);
    }
  }, [
    sessionVerified,
    totpStatus,
    totpStatusLoading,
    isSignedIn,
    signinState,
    navTo,
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
        GleanMetrics.accountPref.twoStepAuthQrCodeSuccess();
        navTo(
          '/inline_recovery_setup',
          Object.keys(state).length > 0 ? state : undefined
        );
      } catch (error) {
        throw AuthUiErrors.INVALID_TOTP_CODE;
      }
    },
    [navTo, totp, signinState]
  );

  if (!isSignedIn || !signinState) {
    return <LoadingSpinner fullScreen />;
  }

  if (
    !isSignedIn ||
    !signinState ||
    totpStatusLoading === true ||
    totp === undefined ||
    sessionVerified === undefined
  ) {
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
