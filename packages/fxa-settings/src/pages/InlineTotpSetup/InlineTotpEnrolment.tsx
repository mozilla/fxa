/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { RelierCmsInfo, useAuthClient, useFtlMsgResolver } from '../../models';
import { CardLoadingSpinner } from '../../components/CardLoadingSpinner';
import FlowSetup2faApp from '../../components/Settings/FlowSetup2faApp';
import { TotpInfo } from '../../lib/types';
import { SigninLocationState } from '../Signin/interfaces';
import { JwtTokenCache } from '../../lib/cache';
import { useMfaErrorHandler } from '../../lib/hooks';
import GleanMetrics from '../../lib/glean';
import * as Sentry from '@sentry/browser';
import { MetricsContext, NavTo } from './interfaces';

// Includes the later recovery-method and backup-code steps.
const numberOfSteps = 4;

// Runs behind MfaGuardCore: the cached mfa:2fa JWT gates createTotp/verify (FXA-14311).
export const InlineTotpEnrolment = ({
  sessionToken,
  signinState,
  metricsContext,
  navTo,
  currentStep,
  onBackButtonClick,
  cmsInfo,
}: {
  sessionToken: string;
  signinState: SigninLocationState;
  metricsContext: MetricsContext;
  navTo: NavTo;
  currentStep: number;
  onBackButtonClick: () => void;
  cmsInfo?: RelierCmsInfo;
}) => {
  const authClient = useAuthClient();
  const ftlMsgResolver = useFtlMsgResolver();
  // Clears the guard's JWT on a stale-token error so it re-prompts; returns true
  // when it handled the error.
  const handleMfaError = useMfaErrorHandler();
  const [totp, setTotp] = useState<TotpInfo>();
  const isTotpCreating = useRef(false);

  const localizedPageTitle = ftlMsgResolver.getMsg(
    'inline-totp-setup-page-title',
    'Two-step authentication'
  );

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
        // A stale JWT re-prompts the guard rather than bouncing the user out.
        if (handleMfaError(error)) {
          isTotpCreating.current = false;
          return;
        }
        Sentry.captureException(error);
        navTo('/');
      }
    })();
  }, [authClient, metricsContext, navTo, totp, sessionToken, handleMfaError]);

  const verifyCode = useCallback(
    async (code: string): Promise<{ error?: boolean }> => {
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
        return {};
      } catch (error) {
        // A stale JWT re-prompts the guard, so don't surface a bad-code error.
        if (handleMfaError(error)) {
          return {};
        }
        return { error: true };
      }
    },
    [
      authClient,
      navTo,
      totp,
      signinState,
      sessionToken,
      metricsContext,
      handleMfaError,
    ]
  );

  if (totp === undefined) {
    return <CardLoadingSpinner />;
  }

  return (
    <FlowSetup2faApp
      localizedPageTitle={localizedPageTitle}
      showProgressBar
      currentStep={currentStep}
      numberOfSteps={numberOfSteps}
      totpInfo={totp}
      verifyCode={verifyCode}
      onBackButtonClick={onBackButtonClick}
      cmsInfo={cmsInfo}
    />
  );
};

export default InlineTotpEnrolment;
