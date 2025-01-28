/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { LocationProvider } from '@reach/router';
import SigninRecoveryPhone from '.';
import { SigninRecoveryPhoneProps } from './interfaces';

const mockVerifyCodeSuccess = (code: string) => Promise.resolve();
const mockResendCodeSuccess = () => Promise.resolve();

export const Subject = ({
  verifyCode = mockVerifyCodeSuccess,
  resendCode = mockResendCodeSuccess,
}: Partial<SigninRecoveryPhoneProps>) => {
  const lastFourPhoneDigits = '1234';

  return (
    <LocationProvider>
      <SigninRecoveryPhone
        {...{
          lastFourPhoneDigits,
          verifyCode,
          resendCode,
        }}
      />
    </LocationProvider>
  );
};
