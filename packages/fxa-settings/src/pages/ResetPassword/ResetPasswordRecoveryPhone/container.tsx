/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { RouteComponentProps, useLocation } from '@reach/router';
import ResetPasswordRecoveryPhone from '.';
import { getHandledError } from '../../../lib/error-utils';
import { useNavigateWithQuery } from '../../../lib/hooks/useNavigateWithQuery';
import { useAuthClient } from '../../../models';
import { ResetPasswordRecoveryPhoneLocationState } from './interfaces';

const ResetPasswordRecoveryPhoneContainer = (_: RouteComponentProps) => {
  const authClient = useAuthClient();
  const navigateWithQuery = useNavigateWithQuery();

  const locationState = useLocation() as ReturnType<typeof useLocation> & {
    state: ResetPasswordRecoveryPhoneLocationState;
  };

  const {
    lastFourPhoneDigits = '',
    sendError,
    numBackupCodes,
  } = locationState.state;

  const handleSuccess = async () => {
    try {
      navigateWithQuery('/complete_reset_password', {
        state: locationState.state,
        replace: true,
      });
    } catch (error) {
      throw error;
    }
  };

  const verifyCode = async (otpCode: string) => {
    try {
      await authClient.recoveryPhoneResetPasswordConfirm(
        locationState.state.token,
        otpCode
      );

      await handleSuccess();
      return;
    } catch (err) {
      const { error: handledError } = getHandledError(err);
      return handledError;
    }
  };

  const resendCode = async () => {
    try {
      await authClient.recoveryPhonePasswordResetSendCode(
        locationState.state.token
      );
      return;
    } catch (err) {
      const { error: handledError } = getHandledError(err);
      return handledError;
    }
  };

  return (
    <ResetPasswordRecoveryPhone
      {...{
        lastFourPhoneDigits,
        verifyCode,
        resendCode,
        sendError,
        numBackupCodes,
        location: locationState,
      }}
    />
  );
};

export default ResetPasswordRecoveryPhoneContainer;
