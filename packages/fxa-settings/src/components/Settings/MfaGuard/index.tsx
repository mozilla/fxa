/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, {
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { useErrorHandler } from 'react-error-boundary';

import {
  useAccount,
  useAlertBar,
  useAuthClient,
  useConfig,
  useFtlMsgResolver,
} from '../../../models';
import Modal from '../ModalMfaProtected';
import {
  JwtTokenCache,
  sessionToken as getSessionToken,
} from '../../../lib/cache';
import { MfaScope } from '../../../lib/types';
import { useNavigate } from '@reach/router';
import * as Sentry from '@sentry/react';
import { MfaErrorBoundary } from './error-boundary';
import { getLocalizedErrorMessage } from '../../../lib/error-utils';

/**
 * This is a guard component designed to wrap around components that perform
 * security-sensitive actions. It blocks access to the child components until
 * a JWT is obtained through an OTP code exchange.
 */
export const MfaGuard = ({
  children,
  requiredScope,
}: {
  children: ReactNode;
  requiredScope: MfaScope;
}) => {
  // Let errors be handled by error boundaries in async contexts
  const handleError = useErrorHandler();

  const config = useConfig();

  const hasSentConfirmationCode = useRef(false);

  const [localizedErrorBannerMessage, setLocalizedErrorBannerMessage] =
    useState<string | undefined>(undefined);

  const [resendCodeLoading, setResendCodeLoading] = useState(false);
  const [showResendSuccessBanner, setShowResendSuccessBanner] = useState(false);

  const resetStates = useCallback(() => {
    hasSentConfirmationCode.current = false;
    setLocalizedErrorBannerMessage(undefined);
    setShowResendSuccessBanner(false);
  }, []);

  // Reactive state: if the store state changes, a re-render is triggered
  const jwtState = useSyncExternalStore(
    JwtTokenCache.subscribe,
    JwtTokenCache.getSnapshot
  );
  const account = useAccount();
  const authClient = useAuthClient();
  const navigate = useNavigate();
  const sessionToken = getSessionToken();

  const ftlMsgResolver = useFtlMsgResolver();

  const alertBar = useAlertBar();

  const onDismiss = useCallback(() => {
    resetStates();
    navigate('/settings');
  }, [navigate, resetStates]);

  // If no session token exists, kick them to sign-in
  if (!sessionToken) {
    throw new Error('Invalid state. Missing sessionToken');
  }

  // jwtState should always return
  if (!jwtState) {
    throw new Error('Invalid state. Missing jwt cache.');
  }

  // Modal Setup
  useEffect(() => {
    (async () => {
      // To avoid requesting multiple OTPs on mount
      if (
        hasSentConfirmationCode.current ||
        JwtTokenCache.hasToken(sessionToken, requiredScope)
      ) {
        return;
      }
      try {
        hasSentConfirmationCode.current = true;
        await authClient.mfaRequestOtp(sessionToken, requiredScope);
      } catch (err) {
        hasSentConfirmationCode.current = false;
        if (err.code === 401) {
          handleError(err);
          return;
        }
        Sentry.captureException(err);
        alertBar.error(getLocalizedErrorMessage(ftlMsgResolver, err));
        onDismiss();
      }
    })();
  }, [
    jwtState,
    sessionToken,
    requiredScope,
    authClient,
    handleError,
    alertBar,
    ftlMsgResolver,
    onDismiss,
  ]);

  const onSubmitOtp = async (code: string) => {
    try {
      const result = await authClient.mfaOtpVerify(
        sessionToken,
        code,
        requiredScope
      );
      JwtTokenCache.setToken(sessionToken, requiredScope, result.accessToken);
      resetStates();
    } catch (err) {
      if (err.code === 401) {
        handleError(err);
        return;
      }
      setShowResendSuccessBanner(false);
      setLocalizedErrorBannerMessage(
        getLocalizedErrorMessage(ftlMsgResolver, err)
      );
    }
  };

  const handleResendCode = async () => {
    setResendCodeLoading(true);
    try {
      await authClient.mfaRequestOtp(sessionToken, requiredScope);
      setLocalizedErrorBannerMessage(undefined);
      setShowResendSuccessBanner(true);
    } catch (err) {
      setShowResendSuccessBanner(false);
      if (err.code === 401) {
        handleError(err);
        return;
      }
      setShowResendSuccessBanner(false);
      setLocalizedErrorBannerMessage(
        getLocalizedErrorMessage(ftlMsgResolver, err)
      );
    } finally {
      setResendCodeLoading(false);
    }
  };

  const email = account.email;
  const expirationTime = config.mfa.otp.expiresInMinutes;

  const getModal = () => (
    <Modal
      {...{
        email,
        expirationTime,
        onSubmit: onSubmitOtp,
        onDismiss,
        handleResendCode,
        clearErrorMessage: () => setLocalizedErrorBannerMessage(undefined),
        resendCodeLoading,
        showResendSuccessBanner,
        localizedErrorBannerMessage,
      }}
    >
      <p>Re-verify Account!</p>
    </Modal>
  );

  // If we don't have a JWT, we need to open the modal to prompt for it.
  // Note: I'm torn on whether we should render the child components or not. It seems
  // like a waste since the user can't interact with them anyway.
  const missingJwt = !JwtTokenCache.hasToken(sessionToken, requiredScope);
  if (missingJwt) {
    return getModal();
  }

  // Otherwise, wrap the children in our error boundary and render them.
  // If an invalid JWT error is encountered, the MfaErrorBoundary will
  // destroy the current JWT for us, and the modal should be displayed again.
  const jwt = JwtTokenCache.hasToken(sessionToken, requiredScope)
    ? JwtTokenCache.getToken(sessionToken, requiredScope)
    : '';
  return (
    <MfaErrorBoundary
      sessionToken={sessionToken}
      requiredScope={requiredScope}
      jwt={jwt}
      fallback={getModal()}
    >
      {missingJwt ? getModal() : <>{children}</>}
    </MfaErrorBoundary>
  );
};
