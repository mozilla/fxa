/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import { MOCK_EMAIL, MOCK_HEXSTRING_32, MOCK_UID } from '../../mocks';
import AccountRecoveryConfirmKey from '.';
import { LocationProvider } from '@reach/router';
import { AccountRecoveryConfirmKeyProps } from './interfaces';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';

export const Subject = ({
  recoveryKeyHint = '',
  success = true,
  verifyRecoveryKey,
}: Partial<AccountRecoveryConfirmKeyProps> & { success?: boolean }) => {
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);
  const code = MOCK_HEXSTRING_32;
  const email = MOCK_EMAIL;
  const estimatedSyncDeviceCount = 2;
  const token = MOCK_HEXSTRING_32;
  const uid = MOCK_UID;
  const mockVerifyRecoveryKey = success
    ? () => Promise.resolve()
    : () => {
        setErrorMessage(AuthUiErrors.INVALID_RECOVERY_KEY.message);
        return Promise.resolve();
      };

  return (
    <LocationProvider>
      <AccountRecoveryConfirmKey
        verifyRecoveryKey={verifyRecoveryKey || mockVerifyRecoveryKey}
        {...{
          code,
          email,
          errorMessage,
          estimatedSyncDeviceCount,
          recoveryKeyHint,
          isSubmitDisabled,
          setErrorMessage,
          setIsSubmitDisabled,
          token,
          uid,
        }}
      />
    </LocationProvider>
  );
};
