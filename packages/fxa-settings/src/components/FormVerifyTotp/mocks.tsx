/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useCallback, useState } from 'react';
import AppLayout from '../AppLayout';
import FormVerifyTotp, { FormVerifyTotpProps } from '.';

export const Subject = ({
  codeLength = 6,
  success = true,
  initialErrorMessage = '',
}: Partial<FormVerifyTotpProps> & {
  success?: Boolean;
  initialErrorMessage?: string;
}) => {
  const localizedInputGroupLabel = `Enter ${codeLength.toString()}-digit code`;
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
          errorMessage,
          localizedInputGroupLabel,
          localizedSubmitButtonText,
          setErrorMessage,
          verifyCode,
        }}
      />
    </AppLayout>
  );
};

export default Subject;
