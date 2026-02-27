/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useEffect, useState, useCallback, useRef } from 'react';
import { RouteComponentProps, useLocation } from '@reach/router';
import ResetPasswordRecoveryChoice from '.';
import { useNavigateWithQuery } from '../../../lib/hooks/useNavigateWithQuery';
import {
  AuthUiErrorNos,
  AuthUiErrors,
} from '../../../lib/auth-errors/auth-errors';
import { CompleteResetPasswordLocationState } from '../CompleteResetPassword/interfaces';
import { getHandledError, HandledError } from '../../../lib/error-utils';
import { useAuthClient, useFtlMsgResolver } from '../../../models';
import { formatPhoneNumber } from '../../../lib/recovery-phone-utils';
import AppLayout from '../../../components/AppLayout';

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
        const { count } = await authClient.getRecoveryCodesExist(
          locationState.state.token,
          locationState.state.kind
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
          await authClient.recoveryPhoneGet(
            locationState.state.token,
            locationState.state.kind
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
        locationState.state.token,
        locationState.state.kind
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

  const redirectToResetPassword = useCallback(() => {
    navigateWithQuery('/reset_password');
  }, [navigateWithQuery]);

  const redirectToBackupCodes = useCallback(() => {
    navigateWithQuery('/confirm_backup_code_reset_password', {
      state: locationState.state,
      replace: true,
    });
  }, [navigateWithQuery, locationState]);

  const handleDataFetchError = useCallback(() => {
    if (dataFetchError?.errno === AuthUiErrors.INVALID_TOKEN.errno) {
      redirectToResetPassword();
    } else {
      // If there was another error fetching available recovery methods, go to backup authentication codes page
      redirectToBackupCodes();
    }
  }, [dataFetchError, redirectToResetPassword, redirectToBackupCodes]);

  const autoSendPhoneCode = useCallback(async () => {
    setAutoSendAttempted(true);
    autoSendInProgress.current = true;

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
  }, [
    handlePhoneChoice,
    navigateWithQuery,
    locationState,
    phoneData.lastFourPhoneDigits,
    numBackupCodes,
  ]);

  // Handle all navigation logic in a single effect with clear priority order
  useEffect(() => {
    // Priority 1: Missing locationState or token
    if (!locationState || !locationState.state.token) {
      redirectToResetPassword();
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
      redirectToBackupCodes();
      return;
    }

    // Priority 5: Auto-send SMS if only phone is available (no backup codes)
    if (!autoSendAttempted && numBackupCodes === 0) {
      autoSendPhoneCode();
      return;
    }
  }, [
    locationState,
    dataFetchError,
    loading,
    phoneData.phoneNumber,
    autoSendAttempted,
    numBackupCodes,
    redirectToResetPassword,
    handleDataFetchError,
    redirectToBackupCodes,
    autoSendPhoneCode,
  ]);

  if (!locationState || !locationState.state.token) {
    return <AppLayout loading />;
  }

  if (loading) {
    return <AppLayout loading />;
  }

  if (!phoneData.phoneNumber) {
    return <AppLayout loading />;
  } else if (!numBackupCodes || numBackupCodes === 0) {
    // Don't do anything here; auto-send is handled in useEffect above
    return <AppLayout loading />;
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
