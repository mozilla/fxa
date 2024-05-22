/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import { MozServices } from '../../../lib/types';
import { MOCK_EMAIL, MOCK_HEXSTRING_32, MOCK_UID } from '../../mocks';
import AccountRecoveryConfirmKey from '.';
import { LocationProvider } from '@reach/router';
import { AccountRecoveryConfirmKeyProps } from './interfaces';

const mockVerifyRecoveryKey = (key: string) => Promise.resolve();

export const Subject = ({
  serviceName = MozServices.Default,
  verifyRecoveryKey = mockVerifyRecoveryKey,
}: Partial<AccountRecoveryConfirmKeyProps>) => {
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const code = MOCK_HEXSTRING_32;
  const email = MOCK_EMAIL;
  const estimatedSyncDeviceCount = 2;
  const token = MOCK_HEXSTRING_32;
  const uid = MOCK_UID;

  return (
    <LocationProvider>
      <AccountRecoveryConfirmKey
        {...{
          code,
          email,
          errorMessage,
          estimatedSyncDeviceCount,
          isSubmitting,
          serviceName,
          setErrorMessage,
          setIsSubmitting,
          token,
          uid,
          verifyRecoveryKey,
        }}
      />
    </LocationProvider>
  );
};
