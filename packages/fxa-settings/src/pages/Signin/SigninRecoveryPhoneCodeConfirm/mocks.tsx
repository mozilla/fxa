/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import ConfirmRecoveryCode from '.';
import { MOCK_MASKED_PHONE_NUMBER } from '../../mocks';
import { LocationProvider } from '@reach/router';
import { SigninRecoveryPhoneCodeConfirmProps } from '.';

const mockVerifyCode = (code: string) => Promise.resolve();
const mockResendCode = () => Promise.resolve();

export const Subject = ({
  verifyCode = mockVerifyCode,
  resendCode = mockResendCode,
}: Partial<SigninRecoveryPhoneCodeConfirmProps>) => {
  const [errorMessage, setErrorMessage] = useState('');

  const clearBanners = () => {
    setErrorMessage('');
  };

  return (
    <LocationProvider>
      <ConfirmRecoveryCode
        maskedPhoneNumber={MOCK_MASKED_PHONE_NUMBER}
        {...{
          clearBanners,
          errorMessage,
          setErrorMessage,
          verifyCode,
          resendCode,
        }}
      />
    </LocationProvider>
  );
};
