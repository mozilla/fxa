/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useEffect, useState } from 'react';
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

  useEffect(() => {
    if (!locationState || !locationState.state.token) {
      return;
    }

    const fetchData = async () => {
      try {
        const { count } =
          await authClient.getRecoveryCodesExistWithPasswordForgotToken(
            locationState.state.token
          );
        count && setNumBackupCodes(count);

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
      } catch (err) {
        const handledError = getHandledError(err);
        setDataFetchError(handledError.error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    // excluding ftlMsgResolver as it is causing re-renders
    // but should be stable and not changing at runtime
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authClient, locationState]);

  const handlePhoneChoice = async () => {
    if (!locationState) {
      return;
    }
    try {
      await authClient.recoveryPhonePasswordResetSendCode(
        locationState.state.token
      );
      return;
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
  };

  if (!locationState || !locationState.state.token) {
    navigateWithQuery('/reset_password');
    return;
  }

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (dataFetchError) {
    if (dataFetchError.errno === AuthUiErrors.INVALID_TOKEN.errno) {
      navigateWithQuery('/reset_password');
      return;
    }
    // if there was another error fetching available recovery methods, go to backup authentication codes page
    navigateWithQuery('/confirm_backup_code_reset_password', {
      state: locationState.state,
      // ensure back button on reset_password_recovery_code page skips choice
      // page and returns to confirm_totp_reset_password
      replace: true,
    });
    return;
  }
  if (!phoneData.phoneNumber) {
    navigateWithQuery('/confirm_backup_code_reset_password', {
      state: locationState.state,
      // ensure back button on reset_password_recovery_code page skips choice
      // page and returns to confirm_totp_reset_password
      replace: true,
    });
    return;
  }
  if (!numBackupCodes || numBackupCodes === 0) {
    navigateWithQuery('/reset_password_recovery_phone', {
      state: {
        lastFourPhoneDigits: phoneData.lastFourPhoneDigits,
      },
      // ensure back button on signin_recovery_code page skips choice page and
      // returns to confirm_totp_reset_password
      replace: true,
    });
    return;
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
