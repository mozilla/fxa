/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import ConfirmBackupCodeResetPassword from '.';
import { MemoryRouter } from 'react-router';
import { ResetPasswordIntegration } from '../interfaces';

const mockIntegration: ResetPasswordIntegration = {
  getCmsInfo: () => undefined,
  isSync: () => false,
};

export const Subject = ({
  verifyBackupCode = () => Promise.resolve(),
  errorMessage = '',
  email = 'test@example.com',
  showPasskeyOption = false,
}) => {
  const [codeErrorMessage, setCodeErrorMessage] = useState(errorMessage);
  return (
    <MemoryRouter>
      <ConfirmBackupCodeResetPassword
        {...{
          verifyBackupCode,
          codeErrorMessage,
          setCodeErrorMessage,
          integration: mockIntegration,
          email,
          showPasskeyOption,
        }}
      />
    </MemoryRouter>
  );
};
