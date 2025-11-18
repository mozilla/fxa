/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { RouteComponentProps, useLocation } from '@reach/router';
import { useNavigateWithQuery } from '../../lib/hooks/useNavigateWithQuery';
import { useCallback, useEffect, useState, useRef } from 'react';
import InlineTotpSetup from '.';
import { MozServices, TotpInfo } from '../../lib/types';
import AppLayout from '../../components/AppLayout';
import { Integration, useSession, useAuthClient } from '../../models';
import { AuthUiErrors } from '../../lib/auth-errors/auth-errors';
import { useMutation, useQuery } from '@apollo/client';
import { CREATE_TOTP_MUTATION } from './gql';
import { getSigninState } from '../Signin/utils';
import { SigninLocationState } from '../Signin/interfaces';
import { GET_TOTP_STATUS } from '../../components/App/gql';
import { TotpStatusResponse } from '../Signin/SigninTokenCode/interfaces';
import { SigninRecoveryLocationState } from '../InlineRecoverySetupFlow/interfaces';
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
  const [totp, setTotp] = useState<TotpInfo>();
  const [sessionVerified, setSessionVerified] = useState<boolean | undefined>(
    undefined
  );
  const location = useLocation() as ReturnType<typeof useLocation> & {
    state: SigninLocationState;
  };
  const navigateWithQuery = useNavigateWithQuery();
  const session = useSession();
  const authClient = useAuthClient();
  const metricsContext = queryParamsToMetricsContext(
    flowQueryParams as unknown as Record<string, string>
  );
  const isTotpCreating = useRef(false);

  const [createTotp] = useMutation<{ createTotp: TotpInfo }>(
    CREATE_TOTP_MUTATION
  );

  const { data: totpStatus, loading: totpStatusLoading } =
    useQuery<TotpStatusResponse>(GET_TOTP_STATUS, {
      // Use fetchPolicy: 'network-only' to bypass Apollo cache so this reflects the
      // current account state, not possibly cached data from another signed-in account.
      fetchPolicy: 'network-only',
    });

  const signinState = getSigninState(location.state);

  const navTo = useCallback(
    (
      uri:
        | '/'
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
      navTo('/');
      return;
    }
    if (totpStatus?.account?.totp.verified) {
      navTo('/signin_totp_code', signinState ? signinState : undefined);
      return;
    }
    if (sessionVerified === false) {
      (async () => {
        // The `/signin_token_code` does not automatically send a verification code, so we need to do it manually
        // before redirecting to the page
        await session.sendVerificationCode();
        navTo('/signin_token_code', signinState ? signinState : undefined);
      })();
      return;
    }
  }, [
    sessionVerified,
    totpStatus,
    totpStatusLoading,
    isSignedIn,
    signinState,
    session,
    navTo,
    navigateWithQuery,
  ]);

  const verifyCodeHandler = useCallback(
    async (code: string) => {
      try {
        await authClient.verifyTotpSetupCode(signinState!.sessionToken, code, {
          metricsContext,
        });

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
        // TODO: handle this error better
        // auth-server may return more specific errors (including throttling)
        throw AuthUiErrors.INVALID_TOTP_CODE;
      }
    },
    [authClient, navTo, totp, signinState, metricsContext]
  );

  if (!isSignedIn || !signinState) {
    return <AppLayout loading />;
  }

  if (
    !isSignedIn ||
    !signinState ||
    totpStatusLoading === true ||
    totp === undefined ||
    sessionVerified === undefined
  ) {
    return <AppLayout loading />;
  }

  return (
    <InlineTotpSetup
      {...{ totp, serviceName, verifyCodeHandler, integration }}
    />
  );
};

export default InlineTotpSetupContainer;
