/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { LocationProvider } from '@reach/router';
import ResetPasswordRecoveryPhone from '.';
import { ResetPasswordRecoveryPhoneProps } from './interfaces';
import { ResetPasswordIntegration } from '../interfaces';

const mockVerifyCodeSuccess = (code: string) => Promise.resolve();
const mockResendCodeSuccess = () => Promise.resolve();

const mockIntegration: ResetPasswordIntegration = {
  getCmsInfo: () => undefined,
};

export const Subject = ({
  verifyCode = mockVerifyCodeSuccess,
  resendCode = mockResendCodeSuccess,
  sendError,
  numBackupCodes = 0,
}: Partial<ResetPasswordRecoveryPhoneProps>) => {
  const lastFourPhoneDigits = '1234';

  return (
    <LocationProvider>
      <ResetPasswordRecoveryPhone
        {...{
          lastFourPhoneDigits,
          verifyCode,
          resendCode,
          sendError,
          numBackupCodes,
          locationState: {} as any,
          integration: mockIntegration,
        }}
      />
    </LocationProvider>
  );
};
