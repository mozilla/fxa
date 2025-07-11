/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useState, useEffect, useRef, useCallback } from 'react';
import { RouteComponentProps, useLocation } from '@reach/router';
import SigninRecoveryChoice from '.';
import { useAuthClient, useFtlMsgResolver } from '../../../models';
import { useNavigateWithQuery } from '../../../lib/hooks/useNavigateWithQuery';
import { SigninLocationState } from '../interfaces';
import { getSigninState } from '../utils';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';
import { formatPhoneNumber } from '../../../lib/recovery-phone-utils';
import { getHandledError, HandledError } from '../../../lib/error-utils';

export const SigninRecoveryChoiceContainer = (_: RouteComponentProps) => {
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

  useEffect(() => {
    // Only run auto-send if only phone is available, phone exists, and not already attempted
    if (
      !autoSendAttempted &&
      numBackupCodes === 0 &&
      phoneData.phoneNumber &&
      signinState &&
      signinState.sessionToken
    ) {
      setAutoSendAttempted(true);
      autoSendInProgress.current = true;
      (async () => {
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
      })();
    }
  }, [
    autoSendAttempted,
    numBackupCodes,
    phoneData.phoneNumber,
    phoneData.lastFourPhoneDigits,
    signinState,
    navigateWithQuery,
    handlePhoneChoice,
  ]);

  // Redirect if no signinState or sessionToken
  useEffect(() => {
    if (!signinState || !signinState.sessionToken) {
      navigateWithQuery('/signin');
    }
  }, [signinState, signinState?.sessionToken, navigateWithQuery]);

  // Redirect if data fetch error
  useEffect(() => {
    if (dataFetchError) {
      if (dataFetchError.errno === AuthUiErrors.INVALID_TOKEN.errno) {
        navigateWithQuery('/signin');
      } else {
        navigateWithQuery('/signin_recovery_code', {
          state: { signinState },
          replace: true,
        });
      }
    }
  }, [dataFetchError, signinState, navigateWithQuery]);

  // Redirect if no phone
  useEffect(() => {
    if (
      !loading &&
      !phoneData.phoneNumber &&
      signinState &&
      signinState.sessionToken
    ) {
      navigateWithQuery('/signin_recovery_code', {
        state: { signinState },
        replace: true,
      });
    }
  }, [
    loading,
    phoneData.phoneNumber,
    signinState,
    signinState?.sessionToken,
    navigateWithQuery,
  ]);

  if (!signinState || !signinState.sessionToken) {
    return <LoadingSpinner fullScreen />;
  }

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!phoneData.phoneNumber) {
    return <LoadingSpinner fullScreen />;
  } else if (!numBackupCodes || numBackupCodes === 0) {
    // Don't do anything here; auto-send is handled in useEffect above
    return <LoadingSpinner fullScreen />;
  }

  return (
    <SigninRecoveryChoice
      maskedPhoneNumber={phoneData.maskedPhoneNumber}
      lastFourPhoneDigits={phoneData.lastFourPhoneDigits}
      {...{
        handlePhoneChoice,
        numBackupCodes,
        signinState,
      }}
    />
  );
};

export default SigninRecoveryChoiceContainer;
