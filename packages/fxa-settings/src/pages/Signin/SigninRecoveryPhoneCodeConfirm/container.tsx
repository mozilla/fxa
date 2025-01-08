/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import { RouteComponentProps } from '@reach/router';
import ConfirmRecoveryCode from '.';
import { ResendStatus } from '../../../lib/types';

const ConfirmRecoveryCodeContainer = (_: RouteComponentProps) => {
  const [errorMessage, setErrorMessage] = useState('');
  const [resendErrorMessage, setResendErrorMessage] = useState('');
  const [resendStatus, setResendStatus] = useState<ResendStatus>(
    ResendStatus.none
  );

  const verifyCode = async (otpCode: string) => {};
  const resendCode = async () => {};

  const clearBanners = () => {
    setErrorMessage('');
    setResendErrorMessage('');
    setResendStatus(ResendStatus.none);
  };

  // TODO: get from api
  const maskedPhoneNumber = '••••••1234}';

  return (
    <ConfirmRecoveryCode
      {...{
        clearBanners,
        maskedPhoneNumber,
        errorMessage,
        resendErrorMessage,
        setErrorMessage,
        verifyCode,
        resendCode,
      }}
    />
  );
};

export default ConfirmRecoveryCodeContainer;
