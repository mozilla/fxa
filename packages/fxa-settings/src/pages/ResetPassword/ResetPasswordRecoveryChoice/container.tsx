/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useEffect, useState, useCallback, useRef } from 'react';
import { RouteComponentProps, useLocation } from '@reach/router';
import ResetPasswordRecoveryChoice from '.';
import { useNavigateWithQuery } from '../../../lib/hooks/useNavigateWithQuery';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';
import {
  AuthUiErrorNos,
  AuthUiErrors,
} from '../../../lib/auth-errors/auth-errors';
import { CompleteResetPasswordLocationState } from '../CompleteResetPassword/interfaces';
import { getHandledError, HandledError } from '../../../lib/error-utils';
import { useAuthClient, useFtlMsgResolver } from '../../../models';
import { formatPhoneNumber } from '../../../lib/recovery-phone-utils';

export const ResetPasswordRecoveryChoiceContainer = (
  _: RouteComponentProps
) => {
  const authClient = useAuthClient();
  const locationState = useLocation() as ReturnType<typeof useLocation> & {
    state: CompleteResetPasswordLocationState;
  };
  const navigateWithQuery = useNavigateWithQuery();
  const ftlMsgResolver = useFtlMsgResolver();

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
    if (!locationState || !locationState.state.token) {
      return;
    }

    const fetchData = async () => {
      let backupCodesSuccess = false;
      let phoneSuccess = false;

      // Fetch backup codes
      try {
        const { count } =
          await authClient.getRecoveryCodesExistWithPasswordForgotToken(
            locationState.state.token
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
          await authClient.recoveryPhoneGetWithPasswordForgotToken(
            locationState.state.token
          );

        if (phoneNumber) {
          const { maskedPhoneNumber, lastFourPhoneDigits } = formatPhoneNumber({
            phoneNumber,
            nationalFormat: nationalFormat ?? null,
            ftlMsgResolver,
          });
          setPhoneData({
            phoneNumber,
            nationalFormat: nationalFormat ?? '',
            maskedPhoneNumber,
            lastFourPhoneDigits,
          });
        }
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
  }, [authClient, locationState]);

  // handlePhoneChoice should return an AuthUiError if sending fails, undefined if succeeds
  const handlePhoneChoice = useCallback(async () => {
    if (!locationState || !locationState.state.token) {
      return AuthUiErrors.UNEXPECTED_ERROR;
    }
    try {
      await authClient.recoveryPhonePasswordResetSendCode(
        locationState.state.token
      );
      return undefined;
    } catch (err) {
      if (err.errno && AuthUiErrorNos[err.errno]) {
        if (err.errno === AuthUiErrors.INVALID_TOKEN.errno) {
          navigateWithQuery('/reset_password');
          return;
        }
        return err;
      }
      return AuthUiErrors.UNEXPECTED_ERROR;
    }
  }, [authClient, locationState, navigateWithQuery]);

  // Auto send code and navigate if only phone available (0 backup codes)
  useEffect(() => {
    if (
      !autoSendAttempted &&
      numBackupCodes === 0 &&
      phoneData.phoneNumber &&
      locationState &&
      locationState.state.token
    ) {
      setAutoSendAttempted(true);
      autoSendInProgress.current = true;
      (async () => {
        const error = await handlePhoneChoice();
        navigateWithQuery('/reset_password_recovery_phone', {
          state: {
            ...locationState.state,
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
    locationState,
    navigateWithQuery,
    handlePhoneChoice,
  ]);

  // Redirect if no locationState or token
  useEffect(() => {
    if (!locationState || !locationState.state.token) {
      navigateWithQuery('/reset_password');
    }
  }, [locationState, locationState?.state?.token, navigateWithQuery]);

  // Redirect if data fetch error
  useEffect(() => {
    if (dataFetchError) {
      if (dataFetchError.errno === AuthUiErrors.INVALID_TOKEN.errno) {
        navigateWithQuery('/reset_password');
      } else {
        // if there was another error fetching available recovery methods, go to backup authentication codes page
        navigateWithQuery('/confirm_backup_code_reset_password', {
          state: locationState.state,
          replace: true,
        });
      }
    }
  }, [dataFetchError, locationState, navigateWithQuery]);

  // Redirect if no phone
  useEffect(() => {
    if (
      !loading &&
      !phoneData.phoneNumber &&
      locationState &&
      locationState.state.token
    ) {
      navigateWithQuery('/confirm_backup_code_reset_password', {
        state: locationState.state,
        replace: true,
      });
    }
  }, [
    loading,
    phoneData.phoneNumber,
    locationState,
    locationState?.state?.token,
    navigateWithQuery,
  ]);

  if (!locationState || !locationState.state.token) {
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
    <ResetPasswordRecoveryChoice
      maskedPhoneNumber={phoneData.maskedPhoneNumber}
      lastFourPhoneDigits={phoneData.lastFourPhoneDigits}
      {...{
        handlePhoneChoice,
        numBackupCodes,
        completeResetPasswordLocationState: locationState.state,
      }}
    />
  );
};

export default ResetPasswordRecoveryChoiceContainer;
