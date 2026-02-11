/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import ConfirmBackupCodeResetPassword from '.';
import { LocationProvider } from '@reach/router';

export const Subject = ({
  verifyBackupCode = () => Promise.resolve(),
  errorMessage = '',
}) => {
  const [codeErrorMessage, setCodeErrorMessage] = useState(errorMessage);
  return (
    <LocationProvider>
      <ConfirmBackupCodeResetPassword
        {...{
          verifyBackupCode,
          codeErrorMessage,
          setCodeErrorMessage,
        }}
      />
    </LocationProvider>
  );
};
