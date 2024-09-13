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
const mockResendCode = () => Promise.resolve();

export const Subject = ({
  resendStatus = ResendStatus.none,
  resendErrorMessage = '',
  resendCode = mockResendCode,
  verifyCode = mockVerifyCode,
}: Partial<ConfirmResetPasswordProps>) => {
  const email = MOCK_EMAIL;
  const [errorMessage, setErrorMessage] = useState('');

  return (
    <LocationProvider>
      <ConfirmResetPassword
        {...{
          email,
          errorMessage,
          setErrorMessage,
          resendCode,
          resendStatus,
          resendErrorMessage,
          verifyCode,
        }}
      />
    </LocationProvider>
  );
};
