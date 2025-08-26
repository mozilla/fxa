/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useState, useEffect, useRef, useCallback } from 'react';
import { RouteComponentProps, useLocation } from '@reach/router';
import SigninRecoveryChoice from '.';
import { Integration, useAuthClient, useFtlMsgResolver } from '../../../models';
import { useNavigateWithQuery } from '../../../lib/hooks/useNavigateWithQuery';
import { SigninLocationState } from '../interfaces';
import { getSigninState } from '../utils';
// import LoadingSpinner from 'fxa-react/components/LoadingSpinner';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';
import { formatPhoneNumber } from '../../../lib/recovery-phone-utils';
import { getHandledError, HandledError } from '../../../lib/error-utils';
import CmsLoadingSpinner from '../../../components/CmsLoadingSpinner';
import { useCms } from '../../../models/contexts/CmsContext';

export const SigninRecoveryChoiceContainer = ({
  integration,
}: {
  integration: Integration;
} & RouteComponentProps) => {
  const authClient = useAuthClient();
  const location = useLocation() as ReturnType<typeof useLocation> & {
    state: SigninLocationState;
  };
  const navigateWithQuery = useNavigateWithQuery();
  const ftlMsgResolver = useFtlMsgResolver();
  const signinState = getSigninState(location.state);

  const [numBackupCodes, setNumBackupCodes] = useState<number>(0);
  const [phoneData, setPhoneData] = useState({
    phoneNumber: '',
    nationalFormat: '',
    maskedPhoneNumber: '',
    lastFourPhoneDigits: '',
  });
  const [loading, setLoading] = useState(true);
  const [dataFetchError, setDataFetchError] = useState<HandledError>();
  const [autoSendAttempted, setAutoSendAttempted] = useState(false);
  const autoSendInProgress = useRef(false);

  useEffect(() => {
    if (!signinState || !signinState.sessionToken) {
      return;
    }

    const fetchData = async () => {
      let backupCodesSuccess = false;
      let phoneSuccess = false;

      // Fetch backup codes
      try {
        const { count } = await authClient.getRecoveryCodesExist(
          signinState.sessionToken
        );
        count && setNumBackupCodes(count);
        backupCodesSuccess = true;
      } catch (err) {
        const handledError = getHandledError(err);
        // Critical errors should stop everything
        if (handledError.error.errno === AuthUiErrors.INVALID_TOKEN.errno) {
          setDataFetchError(handledError.error);
          setLoading(false);
          return;
        }
        // Non-critical errors - continue trying phone
      }

      // Fetch phone data
      try {
        const { phoneNumber, nationalFormat } =
          await authClient.recoveryPhoneGet(signinState.sessionToken);

        const { maskedPhoneNumber, lastFourPhoneDigits } = formatPhoneNumber({
          phoneNumber,
          nationalFormat,
          ftlMsgResolver,
        });
        setPhoneData({
          phoneNumber,
          nationalFormat,
          maskedPhoneNumber,
          lastFourPhoneDigits,
        });
        phoneSuccess = true;
      } catch (err) {
        const handledError = getHandledError(err);
        // Critical errors should stop everything
        if (handledError.error.errno === AuthUiErrors.INVALID_TOKEN.errno) {
          setDataFetchError(handledError.error);
          setLoading(false);
          return;
        }
        // Non-critical errors - continue
      }

      // Only set error if BOTH APIs failed
      if (!backupCodesSuccess && !phoneSuccess) {
        setDataFetchError({
          errno: 999,
          message: 'Failed to fetch recovery methods',
        });
      }

      setLoading(false);
    };
    fetchData();
    // excluding ftlMsgResolver as it is causing re-renders
    // but should be stable and not changing at runtime
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authClient, signinState]);

  // handlePhoneChoice should return an AuthUiError if sending fails, undefined if succeeds
  const handlePhoneChoice = useCallback(async () => {
    if (!signinState || !signinState.sessionToken) {
      return AuthUiErrors.UNEXPECTED_ERROR;
    }
    try {
      await authClient.recoveryPhoneSigninSendCode(signinState.sessionToken);
      return undefined;
    } catch (err) {
      if (err && typeof err === 'object' && 'errno' in err) {
        if (err.errno === AuthUiErrors.INVALID_TOKEN.errno) {
          navigateWithQuery('/signin');
          return;
        }
        return err;
      }
      return AuthUiErrors.UNEXPECTED_ERROR;
    }
  }, [authClient, signinState, navigateWithQuery]);

  const redirectToSignin = useCallback(() => {
    navigateWithQuery('/signin');
  }, [navigateWithQuery]);

  const redirectToRecoveryCode = useCallback(() => {
    navigateWithQuery('/signin_recovery_code', {
      state: { signinState },
      replace: true,
    });
  }, [navigateWithQuery, signinState]);

  const handleDataFetchError = useCallback(() => {
    if (dataFetchError?.errno === AuthUiErrors.INVALID_TOKEN.errno) {
      redirectToSignin();
    } else {
      redirectToRecoveryCode();
    }
  }, [dataFetchError, redirectToSignin, redirectToRecoveryCode]);

  const autoSendPhoneCode = useCallback(async () => {
    setAutoSendAttempted(true);
    autoSendInProgress.current = true;

    const error = await handlePhoneChoice();
    // Always navigate, but pass error flag if send failed
    navigateWithQuery('/signin_recovery_phone', {
      state: {
        signinState,
        lastFourPhoneDigits: phoneData.lastFourPhoneDigits,
        sendError: error,
        numBackupCodes,
      },
      replace: true,
    });
    autoSendInProgress.current = false;
  }, [
    handlePhoneChoice,
    navigateWithQuery,
    signinState,
    phoneData.lastFourPhoneDigits,
    numBackupCodes,
  ]);

  // Handle all navigation logic in a single effect with clear priority order
  useEffect(() => {
    // Priority 1: Missing signinState or sessionToken
    if (!signinState || !signinState.sessionToken) {
      redirectToSignin();
      return;
    }

    // Priority 2: Data fetch error
    if (dataFetchError) {
      handleDataFetchError();
      return;
    }

    // Priority 3: Still loading - don't make any navigation decisions yet
    if (loading) {
      return;
    }

    // Priority 4: No phone available
    if (!phoneData.phoneNumber) {
      redirectToRecoveryCode();
      return;
    }

    // Priority 5: Auto-send SMS if only phone is available (no backup codes)
    if (!autoSendAttempted && numBackupCodes === 0) {
      autoSendPhoneCode();
      return;
    }
  }, [
    signinState,
    dataFetchError,
    loading,
    phoneData.phoneNumber,
    autoSendAttempted,
    numBackupCodes,
    redirectToSignin,
    handleDataFetchError,
    redirectToRecoveryCode,
    autoSendPhoneCode,
  ]);

  const { backgroundColor } = useCms();

  const loadingProps = {
    backgroundColor,
    fullScreen: true,
  };
  if (!signinState || !signinState.sessionToken) {
    return <CmsLoadingSpinner {...loadingProps} />;
  }

  if (loading) {
    return <CmsLoadingSpinner {...loadingProps} />;
  }

  if (!phoneData.phoneNumber) {
    return <CmsLoadingSpinner {...loadingProps} />;
  } else if (!numBackupCodes || numBackupCodes === 0) {
    // Don't do anything here; auto-send is handled in useEffect above
    return <CmsLoadingSpinner {...loadingProps} />;
  }

  return (
    <SigninRecoveryChoice
      maskedPhoneNumber={phoneData.maskedPhoneNumber}
      lastFourPhoneDigits={phoneData.lastFourPhoneDigits}
      {...{
        handlePhoneChoice,
        numBackupCodes,
        signinState,
        integration,
      }}
    />
  );
};

export default SigninRecoveryChoiceContainer;
