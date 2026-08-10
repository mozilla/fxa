/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useLocation } from 'react-router';
import { useNavigateWithQuery } from '../../lib/hooks';
import { useCallback, useEffect, useState, useRef } from 'react';
import InlineTotpSetup from '.';
import { MfaReason, MozServices, TotpInfo } from '../../lib/types';
import AppLayout from '../../components/AppLayout';
import { Integration, useSession, useAuthClient } from '../../models';
import { AuthUiErrors } from '../../lib/auth-errors/auth-errors';
import { getSigninState } from '../Signin/utils';
import { SigninLocationState } from '../Signin/interfaces';
import { SigninRecoveryLocationState } from '../InlineRecoverySetupFlow/interfaces';
import { QueryParams } from '../..';
import { queryParamsToMetricsContext } from '../../lib/metrics';
import GleanMetrics from '../../lib/glean';
import * as Sentry from '@sentry/browser';
import { MfaGuardCore } from '../../components/Settings/MfaGuard';
import { JwtTokenCache } from '../../lib/cache';
import { clearMfaAndJwtCacheOnInvalidJwt } from '../../lib/mfa-guard-utils';

type MetricsContext = ReturnType<typeof queryParamsToMetricsContext>;

type NavTo = (
  uri:
    | '/'
    | '/signin_token_code'
    | '/signin_totp_code'
    | '/inline_recovery_setup',
  state?: SigninLocationState | SigninRecoveryLocationState
) => void;

/**
 * Runs the actual TOTP enrolment. Rendered as a child of `MfaGuardCore`, so a
 * `mfa:2fa` JWT is already cached and the enrolment calls use the JWT-guarded
 * `/mfa/totp/*` routes (FXA-14311).
 */
const InlineTotpEnrolment = ({
  sessionToken,
  signinState,
  serviceName,
  integration,
  metricsContext,
  navTo,
}: {
  sessionToken: string;
  signinState: SigninLocationState;
  serviceName: MozServices;
  integration: Integration;
  metricsContext: MetricsContext;
  navTo: NavTo;
}) => {
  const authClient = useAuthClient();
  const [totp, setTotp] = useState<TotpInfo>();
  const isTotpCreating = useRef(false);

  // Trigger TOTP setup once the guard has provided the JWT.
  useEffect(() => {
    if (totp !== undefined || isTotpCreating.current) {
      return;
    }
    (async () => {
      isTotpCreating.current = true;
      try {
        const jwt = JwtTokenCache.getToken(sessionToken, '2fa');
        const totpResp = await authClient.createTotpTokenWithJwt(jwt, {
          metricsContext,
        });
        setTotp(totpResp);
      } catch (error) {
        // The short-lived mfa:2fa JWT can expire mid-flow. On a stale/invalid
        // JWT, drop it so MfaGuardCore re-prompts for a fresh email OTP rather
        // than bouncing the user out. Keyed on the guard's `sessionToken`, not
        // the global one, since this flow supplies its own.
        if (clearMfaAndJwtCacheOnInvalidJwt(error, '2fa', sessionToken)) {
          isTotpCreating.current = false;
          return;
        }
        Sentry.captureException(error);
        navTo('/');
      }
    })();
  }, [authClient, metricsContext, navTo, totp, sessionToken]);

  const verifyCodeHandler = useCallback(
    async (code: string) => {
      try {
        const jwt = JwtTokenCache.getToken(sessionToken, '2fa');
        await authClient.verifyTotpSetupCodeWithJwt(jwt, code, {
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
        // A stale/expired MFA JWT surfaces here as an invalid-JWT error, not a
        // bad code. Clearing it drops the cached token so MfaGuardCore
        // re-prompts for a fresh email OTP; genuine verification failures fall
        // through to INVALID_TOTP_CODE. (The thrown value is not user-visible —
        // the parent collapses any rejection into a generic error.)
        if (clearMfaAndJwtCacheOnInvalidJwt(error, '2fa', sessionToken)) {
          throw error;
        }
        // TODO: handle this error better
        // auth-server may return more specific errors (including throttling)
        throw AuthUiErrors.INVALID_TOTP_CODE;
      }
    },
    [authClient, navTo, totp, signinState, sessionToken, metricsContext]
  );

  if (totp === undefined) {
    return <AppLayout loading />;
  }

  return (
    <InlineTotpSetup
      {...{ totp, serviceName, verifyCodeHandler, integration }}
      signedInWithPasskey={!!signinState.isPasskeySession}
    />
  );
};

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
}) => {
  const [sessionVerified, setSessionVerified] = useState<boolean | undefined>(
    undefined
  );
  const [totpStatus, setTotpStatus] = useState<
    { exists: boolean; verified: boolean } | undefined
  >(undefined);
  const [totpStatusLoading, setTotpStatusLoading] = useState(true);

  const location = useLocation() as ReturnType<typeof useLocation> & {
    state: SigninLocationState;
  };
  const navigateWithQuery = useNavigateWithQuery();
  const session = useSession();
  const authClient = useAuthClient();
  const metricsContext = queryParamsToMetricsContext(
    flowQueryParams as unknown as Record<string, string>
  );
  const isTotpStatusChecked = useRef(false);

  const signinState = getSigninState(location.state);

  const navTo: NavTo = useCallback(
    (uri, state) => {
      navigateWithQuery(uri, { state });
    },
    [navigateWithQuery]
  );

  useEffect(() => {
    if (isTotpStatusChecked.current || !signinState?.sessionToken) {
      return;
    }
    isTotpStatusChecked.current = true;

    (async () => {
      try {
        const status = await authClient.checkTotpTokenExists(
          signinState.sessionToken
        );
        setTotpStatus(status);
      } catch (error) {
        // If there's an error checking TOTP status, assume it doesn't exist
        setTotpStatus({ exists: false, verified: false });
      } finally {
        setTotpStatusLoading(false);
      }
    })();
  }, [authClient, signinState?.sessionToken]);

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

  // Once state has settled, determine if user should be directed to another page
  useEffect(() => {
    if (!isSignedIn || !signinState) {
      navTo('/');
      return;
    }
    if (totpStatus?.verified) {
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

  if (!isSignedIn || !signinState) {
    return <AppLayout loading />;
  }

  // Still resolving sanity checks, or a redirect effect above is about to fire.
  if (
    totpStatusLoading ||
    sessionVerified === undefined ||
    totpStatus?.verified ||
    sessionVerified === false
  ) {
    return <AppLayout loading />;
  }

  // Gate enrolment behind an MFA email-OTP so a hijacked session cannot silently
  // add a second factor (FXA-14311).
  return (
    <MfaGuardCore
      requiredScope="2fa"
      reason={MfaReason.createTotp}
      email={signinState.email}
      sessionToken={signinState.sessionToken}
      onDismiss={() => navTo('/')}
      onSessionInvalid={() => navigateWithQuery('/signin')}
      onFatalError={() => navTo('/')}
    >
      <InlineTotpEnrolment
        sessionToken={signinState.sessionToken}
        signinState={signinState}
        serviceName={serviceName}
        integration={integration}
        metricsContext={metricsContext}
        navTo={navTo}
      />
    </MfaGuardCore>
  );
};

export default InlineTotpSetupContainer;
