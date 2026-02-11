/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useCallback, useState } from 'react';
import AppLayout from '../AppLayout';
import FormVerifyTotp from '.';
import { FormVerifyTotpProps } from './interfaces';

export const Subject = ({
  codeLength = 6,
  codeType = 'numeric',
  success = true,
  initialErrorMessage = '',
}: Partial<FormVerifyTotpProps> & {
  success?: Boolean;
  initialErrorMessage?: string;
}) => {
  const localizedInputLabel = `Enter ${codeLength.toString()}-digit code`;
  const localizedSubmitButtonText = 'Submit';
  const [errorMessage, setErrorMessage] = useState(initialErrorMessage);

  const mockVerifyCodeSuccess = useCallback(
    (code: string) => alert(`Mock code submission with code ${code}`),
    []
  );

  const mockVerifyCodeFail = useCallback(
    (code: string) => setErrorMessage('Something went wrong'),
    []
  );

  const verifyCode = success ? mockVerifyCodeSuccess : mockVerifyCodeFail;

  return (
    <AppLayout>
      <FormVerifyTotp
        {...{
          codeLength,
          codeType,
          errorMessage,
          localizedInputLabel,
          localizedSubmitButtonText,
          setErrorMessage,
          verifyCode,
        }}
      />
    </AppLayout>
  );
};

export default Subject;
