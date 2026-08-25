/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useLocation } from 'react-router';
import { useNavigateWithQuery } from '../../lib/hooks';
import { useCallback, useEffect, useState, useRef } from 'react';
import InlineTotpSetup from '.';
import InlineTotpEnrolment from './InlineTotpEnrolment';
import { MfaReason, MozServices } from '../../lib/types';
import AppLayout from '../../components/AppLayout';
import { Integration, useSession, useAuthClient } from '../../models';
import { MfaGuardCore } from '../../components/Settings/MfaGuard';
import { getSigninState } from '../Signin/utils';
import { SigninLocationState } from '../Signin/interfaces';
import { QueryParams } from '../..';
import { queryParamsToMetricsContext } from '../../lib/metrics';
import { NavTo } from './interfaces';

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

  const [currentStep, setCurrentStep] = useState<number>(0);
  const navigateBackward = useCallback(() => {
    setCurrentStep((step) => Math.max(0, step - 1));
  }, []);

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

  // Gate enrolment behind an MFA email-OTP so a hijacked session can't silently
  // add a second factor. Wraps only step 1, so the intro shows no OTP (FXA-14311).
  const enrolment = (
    <MfaGuardCore
      requiredScope="2fa"
      reason={MfaReason.createTotp}
      email={signinState.email}
      sessionToken={signinState.sessionToken}
      onDismiss={() => setCurrentStep(0)}
      onSessionInvalid={() => navigateWithQuery('/signin')}
      onFatalError={() => navigateWithQuery('/signin')}
    >
      <InlineTotpEnrolment
        sessionToken={signinState.sessionToken}
        signinState={signinState}
        metricsContext={metricsContext}
        navTo={navTo}
        currentStep={currentStep}
        onBackButtonClick={navigateBackward}
        cmsInfo={integration?.getCmsInfo?.()}
      />
    </MfaGuardCore>
  );

  return (
    <InlineTotpSetup
      currentStep={currentStep}
      onContinue={() => setCurrentStep(1)}
      serviceName={serviceName}
      integration={integration}
      signedInWithPasskey={!!signinState.isPasskeySession}
      enrolment={enrolment}
    />
  );
};

export default InlineTotpSetupContainer;
