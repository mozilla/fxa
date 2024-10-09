/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import ConfirmTotpResetPassword from '.';
import { LocationProvider } from '@reach/router';

export const Subject = ({
  verifyCode = () => Promise.resolve(),
  verifyRecoveryCode = () => Promise.resolve(),
  codeErrorMessage = '',
  setCodeErrorMessage = () => Promise.resolve(),
}) => {
  return (
    <LocationProvider>
      <ConfirmTotpResetPassword
        {...{
          verifyCode,
          verifyRecoveryCode,
          codeErrorMessage,
          setCodeErrorMessage,
        }}
      />
    </LocationProvider>
  );
};
