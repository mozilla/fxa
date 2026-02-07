/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
} from 'react';

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
  MfaOtpRequestCache,
  sessionToken as getSessionToken,
} from '../../../lib/cache';
import { MfaReason, MfaScope } from '../../../lib/types';
import { ERRNO } from '@fxa/accounts/errors';
import { useNavigate } from '@reach/router';
import * as Sentry from '@sentry/react';
import { getLocalizedErrorMessage } from '../../../lib/error-utils';
import GleanMetrics from '../../../lib/glean';
import { clearMfaAndJwtCacheOnInvalidJwt } from '../../../lib/mfa-guard-utils';

export const MfaContext = createContext<MfaScope | undefined>(undefined);

/**
 * Hook to handle MFA-related errors in child components.
 * The returned function returns true if the error was handled, false otherwise.
 */
export const useMfaErrorHandler = () => {
  const scope = useContext(MfaContext);

  if (!scope) {
    throw new Error('useMfaErrorHandler must be used within an MfaGuard');
  }

  // Memoize to prevent unnecessary re-renders
  return useCallback(
    (error: unknown) => {
      return clearMfaAndJwtCacheOnInvalidJwt(error, scope);
    },
    [scope]
  );
};

/**
 * This is a guard component designed to wrap around components that perform
 * security-sensitive actions. It blocks access to the child components until
 * a JWT is obtained through an OTP code exchange.
 */
export const MfaGuard = ({
  children,
  requiredScope,
  onDismissCallback = async () => {},
  debounceIntervalMs = 3000,
  reason,
}: {
  children: ReactNode;
  requiredScope: MfaScope;
  onDismissCallback?: () => Promise<void>;
  debounceIntervalMs?: number;
  reason: MfaReason;
}) => {
  const config = useConfig();
  const [localizedErrorBannerMessage, setLocalizedErrorBannerMessage] =
    useState<string | undefined>(undefined);

  const [resendCodeLoading, setResendCodeLoading] = useState(false);
  const [showResendSuccessBanner, setShowResendSuccessBanner] = useState(false);

  const resetStates = useCallback(() => {
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
    onDismissCallback().then(() => {
      resetStates();
      navigate('/settings');
    });
  }, [navigate, resetStates, onDismissCallback]);

  // If no session token exists, kick them to sign-in
  if (!sessionToken) {
    throw new Error('Invalid state. Missing sessionToken');
  }

  // jwtState should always return
  if (!jwtState) {
    throw new Error('Invalid state. Missing jwt cache.');
  }

  const debounce = useCallback(
    (limitInMs: number) => {
      const lastRequest = MfaOtpRequestCache.get(sessionToken, requiredScope);
      return lastRequest != null && Date.now() - lastRequest < limitInMs;
    },
    [sessionToken, requiredScope]
  );

  // Modal Setup
  useEffect(() => {
    (async () => {
      // To avoid requesting multiple OTPs on mount
      if (JwtTokenCache.hasToken(sessionToken, requiredScope)) {
        return;
      }

      // Avoid bombarding the user with emails just because they open
      // the dialog
      const limitInMs = config.mfa.otp.expiresInMinutes * 60 * 1000;
      if (debounce(limitInMs)) {
        return;
      }

      try {
        MfaOtpRequestCache.set(sessionToken, requiredScope);
        await authClient.mfaRequestOtp(sessionToken, requiredScope);
      } catch (err) {
        MfaOtpRequestCache.remove(sessionToken, requiredScope);

        // If session token is invalid (destroyed/expired), redirect to signin
        if (err?.errno === ERRNO.INVALID_TOKEN) {
          navigate('/signin');
          return;
        }

        if (err.code === 429) {
          setShowResendSuccessBanner(false);
          setLocalizedErrorBannerMessage(
            getLocalizedErrorMessage(ftlMsgResolver, err)
          );
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
    alertBar,
    ftlMsgResolver,
    onDismiss,
    config.mfa.otp.expiresInMinutes,
    debounce,
    navigate,
  ]);

  const onSubmitOtp = async (code: string) => {
    try {
      const result = await authClient.mfaOtpVerify(
        sessionToken,
        code,
        requiredScope
      );
      GleanMetrics.accountPref.mfaGuardSubmitSuccess({
        event: { reason },
      });
      JwtTokenCache.setToken(sessionToken, requiredScope, result.accessToken);
      resetStates();
    } catch (err) {
      setShowResendSuccessBanner(false);
      setLocalizedErrorBannerMessage(
        getLocalizedErrorMessage(ftlMsgResolver, err)
      );
    }
  };

  const handleResendCode = async () => {
    // Stop users from hammering the resend button...
    if (debounce(debounceIntervalMs)) {
      return;
    }

    setResendCodeLoading(true);
    try {
      MfaOtpRequestCache.set(sessionToken, requiredScope);
      await authClient.mfaRequestOtp(sessionToken, requiredScope);
      setLocalizedErrorBannerMessage(undefined);
      setShowResendSuccessBanner(true);
    } catch (err) {
      MfaOtpRequestCache.remove(sessionToken, requiredScope);
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
        reason,
      }}
    >
      <p>Re-verify Account!</p>
    </Modal>
  );

  // If we don't have a JWT, we need to open the modal to prompt for it.
  if (!JwtTokenCache.hasToken(sessionToken, requiredScope)) {
    return getModal();
  }

  // Provide the scope via context so child components can use useMfaErrorHandler
  return (
    <MfaContext.Provider value={requiredScope}>
      {children}
    </MfaContext.Provider>
  );
};
