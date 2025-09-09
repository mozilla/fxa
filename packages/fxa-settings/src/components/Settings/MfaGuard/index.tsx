/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, {
  ReactNode,
  useEffect,
  useState,
  useSyncExternalStore,
} from 'react';
import { useErrorHandler } from 'react-error-boundary';

import { useAccount, useAuthClient, useFtlMsgResolver } from '../../../models';
import Modal from '../ModalMfaProtected';
import {
  JwtTokenCache,
  sessionToken as getSessionToken,
} from '../../../lib/cache';
import { MfaScope } from '../../../lib/types';
import { useNavigate } from '@reach/router';
import { MfaErrorBoundary } from './error-boundary';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';
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

  // Whether the modal to enter the OTP code is displayed
  const [showModal, setShowModal] = useState(false);

  const [localizedErrorBannerMessage, setLocalizedErrorBannerMessage] =
    useState<string | undefined>(undefined);

  // Track modal and OTP request state
  const [modalState, setModalState] = useState({
    isVisible: false,
    otpRequested: false,
    isDismissing: false,
  });

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
    const requestOtpIfNeeded = async () => {
      // If we already have a valid JWT token, hide modal
      if (JwtTokenCache.hasToken(sessionToken, requiredScope)) {
        console.log('info2 JWT exists in cache, hiding modal.');
        setModalState(prev => ({ ...prev, isVisible: false }));
        setShowModal(false);
        return;
      }

      // If we've already requested OTP or modal is showing/dismissing, don't request again
      if (modalState.otpRequested || modalState.isVisible || modalState.isDismissing) {
        console.log('info2 OTP already requested or modal active, skipping.');
        return;
      }

      console.log('info2 Requesting OTP for scope:', requiredScope);
      setModalState(prev => ({
        ...prev,
        otpRequested: true,
        isDismissing: false,
      }));

      try {
        await authClient.mfaRequestOtp(sessionToken, requiredScope);
        setModalState(prev => ({ ...prev, isVisible: true }));
        setShowModal(true);
      } catch (err) {
        // TODO: FXA-12329 - There might be some errors to handle inline like rate-limiting.
        handleError(err);
      }
    };

    requestOtpIfNeeded();
  }, [jwtState, sessionToken, requiredScope, modalState, authClient, handleError]);

  const onSubmitOtp = async (code: string) => {
    // Prevent submission if modal is being dismissed
    if (modalState.isDismissing) {
      console.log('info2 Preventing OTP submission - modal is being dismissed');
      return;
    }

    try {
      const result = await authClient.mfaOtpVerify(
        sessionToken,
        code,
        requiredScope
      );
      JwtTokenCache.setToken(sessionToken, requiredScope, result.accessToken);
      // Reset modal state since verification succeeded
      setModalState(prev => ({
        ...prev,
        otpRequested: false,
        isDismissing: false,
      }));
    } catch (err) {
      if (err.errno === AuthUiErrors.INVALID_EXPIRED_OTP_CODE.errno) {
        setLocalizedErrorBannerMessage(
          getLocalizedErrorMessage(ftlMsgResolver, err)
        );
        return;
      }

      // TODO: FXA-12329 - There might be some errors to handle inline like rate-limiting.
      handleError(err);
    }
  };

  const handleResendCode = async () => {
    try {
      await authClient.mfaRequestOtp(sessionToken, requiredScope);
    } catch (err) {
      handleError(err);
    }
  };

  const onDismiss = () => {
    // Set dismissing flag to prevent form submission and update modal state
    setModalState(prev => ({
      ...prev,
      isVisible: false,
      isDismissing: true,
      otpRequested: false, // Reset so it can be requested again later
    }));
    setShowModal(false);
    clearErrorMessage();
    // TODO: set showResendSuccessBanner to false
    navigate('/settings');
  };

  const clearErrorMessage = () => {
    setLocalizedErrorBannerMessage(undefined);
  };

  const email = account.email;
  const expirationTime = 5; // TODO get from config
  const resendCodeLoading = false; // TODO handle state change while calls are in flight.
  const showResendSuccessBanner = true; // TODO handle request banner.

  const getModal = () => (
    <Modal
      {...{
        email,
        expirationTime,
        onSubmit: onSubmitOtp,
        onDismiss,
        handleResendCode,
        clearErrorMessage,
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
  if (showModal || missingJwt) {
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
      {showModal || missingJwt ? getModal() : <>{children}</>}
    </MfaErrorBoundary>
  );
};
