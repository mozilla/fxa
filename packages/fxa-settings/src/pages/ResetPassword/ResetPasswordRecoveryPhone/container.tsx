/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { RouteComponentProps, useLocation } from '@reach/router';
import ResetPasswordRecoveryPhone from '.';
import { getHandledError } from '../../../lib/error-utils';
import {
  ResetPasswordRecoveryPhoneContainerProps,
} from './interfaces';

const ResetPasswordRecoveryPhoneContainer = ({
  integration,
}: ResetPasswordRecoveryPhoneContainerProps & RouteComponentProps) => {
  const lastFourPhoneDigits = '1234'

  const handleSuccess = async () => {

    try {
      // TODO Emit glean metric

      // TODO Handle navigation to set password page
    } catch (error) {
      throw error;
    }
  };

  const verifyCode = async (otpCode: string) => {

    try {
      // TODO Verify the OTP code

      // Set passwordForgotToken and handle success
      await handleSuccess();
      return;
    } catch (err) {
      const { error: handledError } = getHandledError(err);
      // TODO Handle specific error cases
      return handledError;
    }
  };

  const resendCode = async () => {
    try {
      // TODO Resend the code
      return;
    } catch (err) {
      const { error: handledError } = getHandledError(err);
      // TODO Handle specific error cases
      return handledError;
    }
  };

  return (
    <ResetPasswordRecoveryPhone
      {...{
        lastFourPhoneDigits,
        verifyCode,
        resendCode,
      }}
    />
  );
};

export default ResetPasswordRecoveryPhoneContainer;
