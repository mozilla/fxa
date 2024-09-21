/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import ConfirmResetPassword from '.';
import { MOCK_EMAIL } from '../../mocks';
import { LocationProvider } from '@reach/router';
import { ResendStatus } from '../../../lib/types';
import { ConfirmResetPasswordProps } from './interfaces';

const mockVerifyCode = (code: string) => Promise.resolve();

export const Subject = ({
  resendCode,
  resendErrorMessage = '',
  resendStatus = ResendStatus.none,
  resendSuccess = true,
  verifyCode = mockVerifyCode,
}: Partial<ConfirmResetPasswordProps> & { resendSuccess?: boolean }) => {
  const email = MOCK_EMAIL;
  const [errorMessage, setErrorMessage] = useState('');
  const [codeResendErrorMessage, setResendErrorMessage] =
    useState(resendErrorMessage);
  const [codeResendStatus, setResendStatus] = useState(resendStatus);

  const clearBanners = () => {
    setErrorMessage('');
    setResendStatus(ResendStatus.none);
    setResendErrorMessage('');
  };

  const mockResendCodeSuccess = () => {
    clearBanners();
    setResendStatus(ResendStatus.sent);
    return Promise.resolve();
  };

  const mockResendCodeError = () => {
    clearBanners();
    setResendStatus(ResendStatus.error);
    setResendErrorMessage('Resend error');
    return Promise.resolve();
  };

  const mockResendCode = resendSuccess
    ? () => mockResendCodeSuccess()
    : () => mockResendCodeError();

  return (
    <LocationProvider>
      <ConfirmResetPassword
        resendCode={resendCode || mockResendCode}
        resendErrorMessage={codeResendErrorMessage}
        resendStatus={codeResendStatus}
        {...{
          clearBanners,
          email,
          errorMessage,
          setErrorMessage,
          verifyCode,
        }}
      />
    </LocationProvider>
  );
};
